import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFacilityDto, UpdateFacilityDto, FacilityQueryDto } from './dto/facility.dto';
import { createPaginationMeta } from '../common/dto/pagination.dto';
import { FacilityStatus, UserRole, User, Prisma } from 'prisma/client';

@Injectable()
export class FacilitiesService {
  constructor(private prisma: PrismaService) {}

  async create(createFacilityDto: CreateFacilityDto, ownerId: string) {
    const facility = await this.prisma.facility.create({
      data: {
        ...createFacilityDto,
        amenities: createFacilityDto.amenities as Prisma.InputJsonValue,
        ownerId,
        status: FacilityStatus.PENDING_APPROVAL,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return facility;
  }

  async findAll(query: FacilityQueryDto, currentUser?: User) {
    const { page = 1, limit = 20, q, sort, status, ownerId, sportType, minPrice, maxPrice, ratingMin, include } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.FacilityWhereInput = {};

    if (!currentUser || currentUser.role === UserRole.USER) {
      where.status = FacilityStatus.APPROVED;
    } else if (status) {
      where.status = status;
    } else if (currentUser.role === UserRole.OWNER) {
      where.ownerId = currentUser.id;
    }

    if (ownerId) where.ownerId = ownerId;
    if (ratingMin) where.avgRating = { gte: ratingMin };

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
        { shortLocation: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (sportType || minPrice || maxPrice) {
      where.courts = {
        some: {
          ...(sportType && { sportType: { contains: sportType, mode: 'insensitive' } }),
          ...(minPrice && { pricePerHour: { gte: minPrice } }),
          ...(maxPrice && { pricePerHour: { lte: maxPrice } }),
        },
      };
    }

    const includeOptions: Prisma.FacilityInclude = {};
    if (include) {
      const includeFields = include.split(',');
      if (includeFields.includes('owner')) {
        includeOptions.owner = {
          select: { id: true, name: true, email: true },
        };
      }
      if (includeFields.includes('courts')) {
        includeOptions.courts = {
          select: {
            id: true,
            name: true,
            sportType: true,
            pricePerHour: true,
            isActive: true,
          },
        };
      }
      if (includeFields.includes('photos')) {
        includeOptions.photos = {
          select: { id: true, url: true, caption: true },
        };
      }
      if (includeFields.includes('counts')) {
        includeOptions._count = {
          select: { courts: true, reviews: true, bookings: true },
        };
      }
    }

    const orderBy = this.buildOrderBy(sort);

    const [facilities, total] = await Promise.all([
      this.prisma.facility.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: includeOptions,
      }),
      this.prisma.facility.count({ where }),
    ]);

    const enrichedFacilities = await this.enrichFacilities(facilities);

    const meta = createPaginationMeta(total, page, limit);
    return { data: enrichedFacilities, meta };
  }

  async findOne(id: string, include?: string) {
    const includeOptions: Prisma.FacilityInclude = {
      owner: {
        select: { id: true, name: true, email: true },
      },
    };

    if (include) {
      const includeFields = include.split(',');
      if (includeFields.includes('courts')) {
        includeOptions.courts = {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            sportType: true,
            pricePerHour: true,
            operatingHours: true,
          },
        };
      }
      if (includeFields.includes('photos')) {
        includeOptions.photos = {
          select: { id: true, url: true, caption: true },
        };
      }
      if (includeFields.includes('reviews')) {
        includeOptions.reviews = {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        };
      }
    }

    const facility = await this.prisma.facility.findUnique({
      where: { id },
      include: includeOptions,
    });

    if (!facility) {
      throw new NotFoundException('Facility not found');
    }

    const enriched = await this.enrichFacilities([facility]);
    return enriched[0];
  }

  async update(id: string, updateFacilityDto: UpdateFacilityDto, currentUser: User) {
    const facility = await this.findOne(id);

    if (currentUser.role !== UserRole.ADMIN && facility.ownerId !== currentUser.id) {
      throw new ForbiddenException('You can only update your own facilities');
    }

    if (currentUser.role !== UserRole.ADMIN && updateFacilityDto.status) {
      delete updateFacilityDto.status;
    }

    const updatedFacility = await this.prisma.facility.update({
      where: { id },
      data: updateFacilityDto as Prisma.FacilityUpdateInput,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return updatedFacility;
  }

  async approve(id: string, adminId: string, comment?: string) {
    const facility = await this.findOne(id);

    if (facility.status !== FacilityStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Facility is not pending approval');
    }

    const updatedFacility = await this.prisma.facility.update({
      where: { id },
      data: { status: FacilityStatus.APPROVED },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await this.prisma.adminAction.create({
      data: {
        adminId,
        action: 'APPROVE_FACILITY',
        targetType: 'FACILITY',
        targetId: id,
        comment,
      },
    });

    return updatedFacility;
  }

  async reject(id: string, adminId: string, comment?: string) {
    const facility = await this.findOne(id);

    if (facility.status !== FacilityStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Facility is not pending approval');
    }

    const updatedFacility = await this.prisma.facility.update({
      where: { id },
      data: { status: FacilityStatus.REJECTED },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await this.prisma.adminAction.create({
      data: {
        adminId,
        action: 'REJECT_FACILITY',
        targetType: 'FACILITY',
        targetId: id,
        comment,
      },
    });

    return updatedFacility;
  }

  async remove(id: string, currentUser: User) {
    const facility = await this.findOne(id);
    if (currentUser.role !== UserRole.ADMIN && facility.ownerId !== currentUser.id) {
      throw new ForbiddenException('You can only delete your own facilities');
    }

    //TODO: soft del
    const updatedFacility = await this.prisma.facility.update({
      where: { id },
      data: { status: FacilityStatus.SUSPENDED },
    });

    return updatedFacility;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async enrichFacilities(facilities: any[]) {
    const enriched = await Promise.all(
      facilities.map(async (facility) => {
        const courts = await this.prisma.court.findMany({
          where: { facilityId: facility.id, isActive: true },
          select: { sportType: true, pricePerHour: true },
        });

        const startingPrice = courts.length > 0 ? Math.min(...courts.map((c) => c.pricePerHour)) : null;

        const sportTypes = [...new Set(courts.map((c) => c.sportType))];

        return {
          ...facility,
          startingPrice,
          sportTypes,
          courtsCount: courts.length,
        };
      }),
    );

    return enriched;
  }

  private buildOrderBy(sort?: string) {
    if (!sort) return { createdAt: 'desc' as const };

    const [field, direction = 'asc'] = sort.split(',');
    return { [field]: direction as 'asc' | 'desc' };
  }
}
