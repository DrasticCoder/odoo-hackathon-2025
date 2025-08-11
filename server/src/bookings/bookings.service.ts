import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto, UpdateBookingDto, BookingQueryDto, PaymentDto } from './dto/booking.dto';
import { createPaginationMeta } from '../common/dto/pagination.dto';
import { BookingStatus, UserRole } from 'prisma/client';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(createBookingDto: CreateBookingDto, currentUserId: string) {
    const { courtId, startDatetime, endDatetime, paymentMethod, userId } = createBookingDto;
    const bookingUserId = userId || currentUserId;

    const start = new Date(startDatetime);
    const end = new Date(endDatetime);

    if (start >= end) {
      throw new BadRequestException('Start time must be before end time');
    }

    if (start <= new Date()) {
      throw new BadRequestException('Cannot book in the past');
    }

    return await this.prisma.$transaction(async (tx) => {
      const court = await tx.court.findUnique({
        where: { id: courtId },
        include: { facility: true },
      });

      if (!court || !court.isActive) {
        throw new BadRequestException('Court is not available');
      }

      if (court.facility.status !== 'APPROVED') {
        throw new BadRequestException('Facility is not approved');
      }

      const blockedSlot = await tx.availabilitySlot.findFirst({
        where: {
          courtId,
          isBlocked: true,
          AND: [{ start: { lte: end } }, { end: { gte: start } }],
        },
      });

      if (blockedSlot) {
        throw new ConflictException(`Court is blocked: ${blockedSlot.reason || 'Maintenance'}`);
      }

      const overlappingBooking = await tx.booking.findFirst({
        where: {
          courtId,
          status: { notIn: [BookingStatus.CANCELLED, BookingStatus.FAILED] },
          AND: [{ startDatetime: { lt: end } }, { endDatetime: { gt: start } }],
        },
      });

      if (overlappingBooking) {
        throw new ConflictException('Time slot is already booked');
      }

      const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      const totalPrice = durationHours * court.pricePerHour;

      const booking = await tx.booking.create({
        data: {
          userId: bookingUserId,
          courtId,
          facilityId: court.facilityId,
          startDatetime: start,
          endDatetime: end,
          totalPrice,
          status: BookingStatus.PENDING,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          court: {
            select: { id: true, name: true, sportType: true, pricePerHour: true },
          },
          facility: {
            select: { id: true, name: true, shortLocation: true },
          },
        },
      });

      if (paymentMethod) {
        const paymentSuccess = await this.simulatePayment(paymentMethod, totalPrice);

        if (paymentSuccess) {
          await tx.booking.update({
            where: { id: booking.id },
            data: {
              status: BookingStatus.CONFIRMED,
              txnReference: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            },
          });
          booking.status = BookingStatus.CONFIRMED;
        } else {
          await tx.booking.update({
            where: { id: booking.id },
            data: { status: BookingStatus.FAILED },
          });
          throw new BadRequestException('Payment failed');
        }
      }

      return booking;
    });
  }

  async findAll(query: BookingQueryDto, currentUser: any) {
    const { page = 1, limit = 20, q, sort, status, userId, facilityId, courtId, startDate, endDate, include } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (currentUser.role === UserRole.USER) {
      where.userId = currentUser.id;
    } else if (currentUser.role === UserRole.OWNER) {
      where.facility = { ownerId: currentUser.id };
    }

    if (status) where.status = status;
    if (userId && currentUser.role !== UserRole.USER) where.userId = userId;
    if (facilityId) where.facilityId = facilityId;
    if (courtId) where.courtId = courtId;

    if (startDate || endDate) {
      where.AND = where.AND || [];
      if (startDate) {
        where.AND.push({ startDatetime: { gte: new Date(startDate) } });
      }
      if (endDate) {
        where.AND.push({ endDatetime: { lte: new Date(endDate + 'T23:59:59.999Z') } });
      }
    }

    if (q) {
      where.OR = [
        { facility: { name: { contains: q, mode: 'insensitive' } } },
        { court: { name: { contains: q, mode: 'insensitive' } } },
        { user: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const includeOptions: any = {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      court: {
        select: { id: true, name: true, sportType: true, pricePerHour: true },
      },
      facility: {
        select: { id: true, name: true, shortLocation: true },
      },
    };

    const orderBy = this.buildOrderBy(sort);

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: orderBy as any,
        include: includeOptions,
      }),
      this.prisma.booking.count({ where }),
    ]);

    const meta = createPaginationMeta(total, page, limit);
    return { data: bookings, meta };
  }

  async findOne(id: string, currentUser: any) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        court: {
          select: { id: true, name: true, sportType: true, pricePerHour: true },
        },
        facility: {
          select: { id: true, name: true, shortLocation: true, ownerId: true },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (currentUser.role === UserRole.USER && booking.userId !== currentUser.id) {
      throw new ForbiddenException('You can only view your own bookings');
    }

    if (currentUser.role === UserRole.OWNER && booking.facility.ownerId !== currentUser.id) {
      throw new ForbiddenException('You can only view bookings for your facilities');
    }

    return booking;
  }

  async update(id: string, updateBookingDto: UpdateBookingDto, currentUser: any) {
    const booking = await this.findOne(id, currentUser);

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Can only update pending bookings');
    }

    if (currentUser.role === UserRole.USER && booking.userId !== currentUser.id) {
      throw new ForbiddenException('You can only update your own bookings');
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: updateBookingDto,
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        court: {
          select: { id: true, name: true, sportType: true, pricePerHour: true },
        },
        facility: {
          select: { id: true, name: true, shortLocation: true },
        },
      },
    });

    return updatedBooking;
  }

  async pay(id: string, paymentDto: PaymentDto, currentUser: any) {
    const booking = await this.findOne(id, currentUser);

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Booking is not pending payment');
    }

    if (currentUser.role === UserRole.USER && booking.userId !== currentUser.id) {
      throw new ForbiddenException('You can only pay for your own bookings');
    }

    const paymentSuccess = await this.simulatePayment(paymentDto.paymentMethod, booking.totalPrice);

    const status = paymentSuccess ? BookingStatus.CONFIRMED : BookingStatus.FAILED;
    const txnReference = paymentSuccess ? `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null;

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: { status, txnReference },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        court: {
          select: { id: true, name: true, sportType: true, pricePerHour: true },
        },
        facility: {
          select: { id: true, name: true, shortLocation: true },
        },
      },
    });

    if (!paymentSuccess) {
      throw new BadRequestException('Payment failed');
    }

    return updatedBooking;
  }

  async cancel(id: string, reason: string, currentUser: any) {
    const booking = await this.findOne(id, currentUser);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed booking');
    }

    if (booking.startDatetime <= new Date()) {
      throw new BadRequestException('Cannot cancel past bookings');
    }

    if (currentUser.role === UserRole.USER && booking.userId !== currentUser.id) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        court: {
          select: { id: true, name: true, sportType: true, pricePerHour: true },
        },
        facility: {
          select: { id: true, name: true, shortLocation: true },
        },
      },
    });

    // TODO: haandle refund logic here

    return updatedBooking;
  }

  async getStats(currentUser: any, facilityId?: string) {
    const where: any = {};

    if (currentUser.role === UserRole.USER) {
      where.userId = currentUser.id;
    } else if (currentUser.role === UserRole.OWNER) {
      where.facility = { ownerId: currentUser.id };
    }

    if (facilityId) {
      where.facilityId = facilityId;
    }

    const [totalBookings, confirmedBookings, cancelledBookings, revenueResult] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.count({ where: { ...where, status: BookingStatus.CONFIRMED } }),
      this.prisma.booking.count({ where: { ...where, status: BookingStatus.CANCELLED } }),
      this.prisma.booking.aggregate({
        where: { ...where, status: BookingStatus.CONFIRMED },
        _sum: { totalPrice: true },
        _avg: { totalPrice: true },
      }),
    ]);

    return {
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      totalRevenue: revenueResult._sum.totalPrice || 0,
      averageBookingValue: revenueResult._avg.totalPrice || 0,
    };
  }

  // TODO: add payment processing- satharva
  private async simulatePayment(paymentMethod: string, amount: number): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return Math.random() > 0.05;
  }

  private buildOrderBy(sort?: string) {
    if (!sort) return { createdAt: 'desc' };

    const [field, direction = 'asc'] = sort.split(',');
    return { [field]: direction };
  }
}
