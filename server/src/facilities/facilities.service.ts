import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFacilityDto, UpdateFacilityDto, FacilityQueryDto } from './dto/facility.dto';
import { createPaginationMeta } from '../common/dto/pagination.dto';
import { FacilityStatus, UserRole, User, Prisma } from 'prisma/client';

@Injectable()
export class FacilitiesService {
  constructor(private prisma: PrismaService) {}

  async create(createFacilityDto: CreateFacilityDto, ownerId: string) {
    const { photoUrls, ...facilityData } = createFacilityDto;

    const facility = await this.prisma.facility.create({
      data: {
        ...facilityData,
        amenities: facilityData.amenities as Prisma.InputJsonValue,
        ownerId,
        status: FacilityStatus.PENDING_APPROVAL,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Create photo records if photoUrls provided
    if (photoUrls && photoUrls.length > 0) {
      await this.prisma.photo.createMany({
        data: photoUrls.map((url) => ({
          url,
          facilityId: facility.id,
        })),
      });
    }

    return facility;
  }

  async findAll(query: FacilityQueryDto, currentUser?: User) {
    const { page = 1, limit = 20, q, sort, status, ownerId, sportType, minPrice, maxPrice, ratingMin, include } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.FacilityWhereInput = {};

    if (!currentUser || currentUser.role === UserRole.USER) {
      where.status = FacilityStatus.APPROVED;
    } else if (currentUser.role === UserRole.OWNER) {
      where.ownerId = currentUser.id;
      if (status) {
        where.status = status;
      }
    } else if (currentUser.role === UserRole.ADMIN) {
      if (status) {
        where.status = status;
      }
    }

    if (ownerId && currentUser?.role === UserRole.ADMIN) {
      where.ownerId = ownerId;
    }

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
      const courtsFilter: Prisma.CourtWhereInput = {};

      if (sportType) {
        const sportTypes = sportType.split(',').map((type) => type.trim());
        courtsFilter.OR = sportTypes.map((type) => ({
          sportType: { contains: type, mode: 'insensitive' },
        }));
      }

      if (minPrice || maxPrice) {
        courtsFilter.pricePerHour = {
          ...(minPrice && { gte: minPrice }),
          ...(maxPrice && { lte: maxPrice }),
        };
      }

      where.courts = {
        some: courtsFilter,
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
    const sortedFacilities = this.sortEnrichedFacilities(enrichedFacilities, sort);
    const meta = createPaginationMeta(total, page, limit);
    return { data: sortedFacilities, meta };
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

    const { photoUrls, ...facilityData } = updateFacilityDto;

    const updatedFacility = await this.prisma.facility.update({
      where: { id },
      data: facilityData as Prisma.FacilityUpdateInput,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Update photos if photoUrls provided
    if (photoUrls !== undefined) {
      // Delete existing facility photos
      await this.prisma.photo.deleteMany({
        where: { facilityId: id },
      });

      // Create new photos if any provided
      if (photoUrls.length > 0) {
        await this.prisma.photo.createMany({
          data: photoUrls.map((url) => ({
            url,
            facilityId: id,
          })),
        });
      }
    }

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
    await this.prisma.facility.delete({
      where: { id },
    });

    return { message: 'Facility deleted successfully' };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async enrichFacilities(facilities: any[]) {
    const enriched = await Promise.all(
      facilities.map(async (facility) => {
        // Get courts data with counts
        const courts = await this.prisma.court.findMany({
          where: { facilityId: facility.id, isActive: true },
          select: {
            id: true,
            name: true,
            sportType: true,
            pricePerHour: true,
            isActive: true,
          },
        });

        // Get photos
        const photos = await this.prisma.photo.findMany({
          where: { facilityId: facility.id },
          select: { id: true, url: true, caption: true },
        });

        // Get review count and average rating
        const reviewStats = await this.prisma.review.aggregate({
          where: {
            facilityId: facility.id,
            isApproved: true,
          },
          _count: { id: true },
          _avg: { rating: true },
        });

        // Get booking count
        const bookingCount = await this.prisma.booking.count({
          where: { facilityId: facility.id },
        });

        const startingPrice = courts.length > 0 ? Math.min(...courts.map((c) => c.pricePerHour)) : null;
        const sportTypes = [...new Set(courts.map((c) => c.sportType))];

        // Merge counts from includes or calculate them
        const courtsCount = facility._count?.courts || courts.length;
        const reviewsCount = facility._count?.reviews || reviewStats._count.id;
        const bookingsCount = facility._count?.bookings || bookingCount;
        const avgRating = facility.avgRating || reviewStats._avg.rating;

        return {
          ...facility,
          startingPrice,
          sportTypes,
          courtsCount,
          reviewsCount,
          bookingsCount,
          avgRating,
          photoUrls: photos.map((p) => p.url),
          // Add courts and photos if not already included
          ...(facility.courts ? {} : { courts }),
          ...(facility.photos ? {} : { photos }),
        };
      }),
    );

    return enriched;
  }

  private buildOrderBy(sort?: string) {
    if (!sort) return { createdAt: 'desc' as const };

    const [field, direction = 'asc'] = sort.split(',');

    // Handle computed fields that need special sorting logic
    switch (field) {
      case 'avgRating':
        // These will be sorted in memory after enrichment
        return { createdAt: 'desc' as const };
      case 'courtsCount':
        // These will be sorted in memory after enrichment
        return { createdAt: 'desc' as const };
      case 'startingPrice':
        // These will be sorted in memory after enrichment
        return { createdAt: 'desc' as const };
      default:
        return { [field]: direction as 'asc' | 'desc' };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sortEnrichedFacilities(facilities: Record<string, any>[], sort?: string): Record<string, any>[] {
    if (!sort) return facilities;

    const [field, direction = 'asc'] = sort.split(',');

    // Only sort computed fields here, others are handled by database
    if (['avgRating', 'courtsCount', 'startingPrice'].includes(field)) {
      return facilities.sort((a, b) => {
        const aValue = a[field] || 0;
        const bValue = b[field] || 0;

        if (direction === 'desc') {
          return bValue - aValue;
        }
        return aValue - bValue;
      });
    }

    return facilities;
  }
}
