import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCourtDto,
  UpdateCourtDto,
  CourtQueryDto,
  CreateAvailabilitySlotDto,
  AvailabilityQueryDto,
} from './dto/court.dto';
import { createPaginationMeta } from '../common/dto/pagination.dto';
import { UserRole, Prisma } from 'prisma/client';

@Injectable()
export class CourtsService {
  constructor(private prisma: PrismaService) {}

  async create(facilityId: string, createCourtDto: CreateCourtDto, currentUser: any) {
    const facility = await this.prisma.facility.findUnique({
      where: { id: facilityId },
    });

    if (!facility) {
      throw new NotFoundException('Facility not found');
    }

    if (currentUser.role !== UserRole.ADMIN && facility.ownerId !== currentUser.id) {
      throw new ForbiddenException('You can only create courts for your own facilities');
    }

    const court = await this.prisma.court.create({
      data: {
        ...createCourtDto,
        facilityId,
      },
      include: {
        facility: {
          select: { id: true, name: true, shortLocation: true, ownerId: true },
        },
      },
    });

    return court;
  }

  async findAll(query: CourtQueryDto) {
    const { page = 1, limit = 20, q, sort, facilityId, sportType, minPrice, maxPrice, isActive, include } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.CourtWhereInput = {};

    if (facilityId) where.facilityId = facilityId;
    if (sportType) where.sportType = { contains: sportType, mode: 'insensitive' };
    if (minPrice) where.pricePerHour = { ...((where.pricePerHour as object) || {}), gte: minPrice };
    if (maxPrice) where.pricePerHour = { ...((where.pricePerHour as object) || {}), lte: maxPrice };
    if (isActive !== undefined) where.isActive = isActive;

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { sportType: { contains: q, mode: 'insensitive' } },
        { facility: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const includeOptions: Prisma.CourtInclude = {
      facility: {
        select: { id: true, name: true, shortLocation: true, ownerId: true },
      },
    };

    if (include) {
      const includeFields = include.split(',');
      if (includeFields.includes('photos')) {
        includeOptions.photos = {
          select: { id: true, url: true, caption: true },
        };
      }
      if (includeFields.includes('availability')) {
        includeOptions.availability = {
          where: {
            start: { gte: new Date() },
          },
          orderBy: { start: 'asc' },
          take: 10,
        };
      }
      if (includeFields.includes('counts')) {
        includeOptions._count = {
          select: { bookings: true, availability: true },
        };
      }
    }

    const orderBy = this.buildOrderBy(sort);

    const [courts, total] = await Promise.all([
      this.prisma.court.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: includeOptions,
      }),
      this.prisma.court.count({ where }),
    ]);

    const meta = createPaginationMeta(total, page, limit);
    return { data: courts, meta };
  }

  async findOne(id: string, include?: string) {
    const includeOptions: Prisma.CourtInclude = {
      facility: {
        select: { id: true, name: true, shortLocation: true, ownerId: true },
      },
    };

    if (include) {
      const includeFields = include.split(',');
      if (includeFields.includes('photos')) {
        includeOptions.photos = {
          select: { id: true, url: true, caption: true },
        };
      }
      if (includeFields.includes('availability')) {
        includeOptions.availability = {
          where: {
            start: { gte: new Date() },
          },
          orderBy: { start: 'asc' },
        };
      }
      if (includeFields.includes('bookings')) {
        includeOptions.bookings = {
          where: {
            startDatetime: { gte: new Date() },
            status: { notIn: ['CANCELLED', 'FAILED'] },
          },
          orderBy: { startDatetime: 'asc' },
          take: 10,
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        };
      }
    }

    const court = await this.prisma.court.findUnique({
      where: { id },
      include: includeOptions,
    });

    if (!court) {
      throw new NotFoundException('Court not found');
    }

    return court;
  }

  async update(id: string, updateCourtDto: UpdateCourtDto, currentUser: any) {
    const court = await this.prisma.court.findUnique({
      where: { id },
      include: {
        facility: {
          select: { id: true, name: true, shortLocation: true, ownerId: true },
        },
      },
    });

    if (!court) {
      throw new NotFoundException('Court not found');
    }

    if (currentUser.role !== UserRole.ADMIN && court.facility.ownerId !== currentUser.id) {
      throw new ForbiddenException('You can only update courts for your own facilities');
    }

    const updatedCourt = await this.prisma.court.update({
      where: { id },
      data: updateCourtDto,
      include: {
        facility: {
          select: { id: true, name: true, shortLocation: true, ownerId: true },
        },
      },
    });

    return updatedCourt;
  }

  async remove(id: string, currentUser: any) {
    const court = await this.prisma.court.findUnique({
      where: { id },
      include: {
        facility: {
          select: { id: true, name: true, shortLocation: true, ownerId: true },
        },
      },
    });

    if (!court) {
      throw new NotFoundException('Court not found');
    }

    if (currentUser.role !== UserRole.ADMIN && court.facility.ownerId !== currentUser.id) {
      throw new ForbiddenException('You can only delete courts for your own facilities');
    }

    const activeBookings = await this.prisma.booking.count({
      where: {
        courtId: id,
        startDatetime: { gte: new Date() },
        status: { notIn: ['CANCELLED', 'FAILED'] },
      },
    });

    if (activeBookings > 0) {
      throw new BadRequestException('Cannot delete court with active bookings');
    }

    const updatedCourt = await this.prisma.court.update({
      where: { id },
      data: { isActive: false },
    });

    return updatedCourt;
  }

  async getAvailability(courtId: string, query: AvailabilityQueryDto) {
    const court = await this.prisma.court.findUnique({ where: { id: courtId } });
    if (!court) {
      throw new NotFoundException('Court not found');
    }

    const { startDate, endDate, includeBlocked = false } = query;

    const where: Prisma.AvailabilitySlotWhereInput = { courtId };

    if (startDate || endDate) {
      where.AND = [];
      if (startDate) {
        where.AND.push({ start: { gte: new Date(startDate) } });
      }
      if (endDate) {
        where.AND.push({ end: { lte: new Date(endDate + 'T23:59:59.999Z') } });
      }
    }

    if (!includeBlocked) {
      where.isBlocked = false;
    }

    const slots = await this.prisma.availabilitySlot.findMany({
      where,
      orderBy: { start: 'asc' },
    });

    return slots;
  }

  async createAvailabilitySlot(courtId: string, createSlotDto: CreateAvailabilitySlotDto, currentUser: any) {
    const court = await this.prisma.court.findUnique({
      where: { id: courtId },
      include: {
        facility: {
          select: { id: true, name: true, shortLocation: true, ownerId: true },
        },
      },
    });

    if (!court) {
      throw new NotFoundException('Court not found');
    }

    if (currentUser.role !== UserRole.ADMIN && court.facility.ownerId !== currentUser.id) {
      throw new ForbiddenException('You can only manage availability for your own courts');
    }

    const start = new Date(createSlotDto.start);
    const end = new Date(createSlotDto.end);

    if (start >= end) {
      throw new BadRequestException('Start time must be before end time');
    }

    const overlapping = await this.prisma.availabilitySlot.findFirst({
      where: {
        courtId,
        AND: [{ start: { lt: end } }, { end: { gt: start } }],
      },
    });

    if (overlapping) {
      throw new BadRequestException('Availability slot overlaps with existing slot');
    }

    const slot = await this.prisma.availabilitySlot.create({
      data: {
        courtId,
        start,
        end,
        isBlocked: createSlotDto.isBlocked || false,
        reason: createSlotDto.reason,
      },
    });

    return slot;
  }

  async updateAvailabilitySlot(slotId: string, updateData: Partial<CreateAvailabilitySlotDto>, currentUser: any) {
    const slot = await this.prisma.availabilitySlot.findUnique({
      where: { id: slotId },
      include: {
        court: {
          include: {
            facility: true,
          },
        },
      },
    });

    if (!slot) {
      throw new NotFoundException('Availability slot not found');
    }

    // TODO:check permission
    if (currentUser.role !== UserRole.ADMIN && slot.court.facility.ownerId !== currentUser.id) {
      throw new ForbiddenException('You can only manage availability for your own courts');
    }

    const updatedSlot = await this.prisma.availabilitySlot.update({
      where: { id: slotId },
      data: updateData,
    });

    return updatedSlot;
  }

  async deleteAvailabilitySlot(slotId: string, currentUser: any) {
    const slot = await this.prisma.availabilitySlot.findUnique({
      where: { id: slotId },
      include: {
        court: {
          include: {
            facility: true,
          },
        },
      },
    });

    if (!slot) {
      throw new NotFoundException('Availability slot not found');
    }

    if (currentUser.role !== UserRole.ADMIN && slot.court.facility.ownerId !== currentUser.id) {
      throw new ForbiddenException('You can only manage availability for your own courts');
    }

    await this.prisma.availabilitySlot.delete({
      where: { id: slotId },
    });

    return { message: 'Availability slot deleted successfully' };
  }

  private buildOrderBy(sort?: string) {
    if (!sort) return { createdAt: 'desc' as const };

    const [field, direction = 'asc'] = sort.split(',');
    return { [field]: direction as 'asc' | 'desc' };
  }
}
