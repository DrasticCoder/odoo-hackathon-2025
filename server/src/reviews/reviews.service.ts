import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto, UpdateReviewDto, ReviewQueryDto, ReviewResponseDto, ReviewStatsDto } from './dto/review.dto';
import { User, UserRole, BookingStatus } from 'prisma/client';
import { PaginatedResponseDto, createPaginationMeta } from '../common/dto/pagination.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(createReviewDto: CreateReviewDto, currentUser: User): Promise<ReviewResponseDto> {
    const { facilityId, bookingId, rating, comment } = createReviewDto;

    // Check if facility exists
    const facility = await this.prisma.facility.findUnique({
      where: { id: facilityId },
    });

    if (!facility) {
      throw new NotFoundException('Facility not found');
    }

    // Check if booking exists and belongs to the user
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: currentUser.id,
        facilityId: facilityId,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found or does not belong to you');
    }

    // Check if user has already reviewed this facility for this booking
    const existingReview = await this.prisma.review.findFirst({
      where: {
        userId: currentUser.id,
        facilityId: facilityId,
        bookingId: bookingId,
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this facility for this booking');
    }

    // Determine if review should be auto-approved based on booking status
    const autoApprove = booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.COMPLETED;

    // Create the review
    const review = await this.prisma.review.create({
      data: {
        userId: currentUser.id,
        facilityId,
        bookingId,
        rating,
        comment,
        isApproved: autoApprove,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        facility: {
          select: {
            id: true,
            name: true,
            shortLocation: true,
            avgRating: true,
          },
        },
      },
    });

    // Update facility average rating if review is approved
    if (autoApprove) {
      await this.updateFacilityRating(facilityId);
    }

    return review;
  }

  async findAll(query: ReviewQueryDto, currentUser?: User): Promise<PaginatedResponseDto<ReviewResponseDto>> {
    const {
      page = 1,
      limit = 10,
      q: search,
      sort,
      facilityId,
      userId,
      minRating,
      maxRating,
      isApproved,
      include,
    } = query;

    const skip = (page - 1) * limit;

    // Parse sort parameter
    let sortBy = 'createdAt';
    let sortOrder: 'asc' | 'desc' = 'desc';
    if (sort) {
      const [field, direction] = sort.split(',');
      if (field) sortBy = field;
      if (direction === 'asc' || direction === 'desc') sortOrder = direction;
    }

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};

    if (facilityId) {
      where.facilityId = facilityId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (minRating !== undefined) {
      where.rating = { ...where.rating, gte: minRating };
    }

    if (maxRating !== undefined) {
      where.rating = { ...where.rating, lte: maxRating };
    }

    // Only allow filtering by approval status for admins
    if (isApproved !== undefined) {
      if (currentUser?.role === UserRole.ADMIN) {
        where.isApproved = isApproved;
      } else {
        // Non-admin users can only see approved reviews
        where.isApproved = true;
      }
    } else if (currentUser?.role !== UserRole.ADMIN) {
      // Default: non-admin users can only see approved reviews
      where.isApproved = true;
    }

    if (search) {
      where.OR = [
        { comment: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { facility: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Build include clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const includeClause: any = {};
    if (include?.includes('user')) {
      includeClause.user = {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      };
    }
    if (include?.includes('facility')) {
      includeClause.facility = {
        select: {
          id: true,
          name: true,
          shortLocation: true,
          avgRating: true,
        },
      };
    }

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: includeClause,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      data: reviews,
      meta: createPaginationMeta(total, page, limit),
    };
  }

  async findOwnerReviews(query: ReviewQueryDto, currentUser: User): Promise<PaginatedResponseDto<ReviewResponseDto>> {
    const { page = 1, limit = 10, q: search, sort, minRating, maxRating, isApproved } = query;

    const skip = (page - 1) * limit;

    // Parse sort parameter
    let sortBy = 'createdAt';
    let sortOrder: 'asc' | 'desc' = 'desc';
    if (sort) {
      const [field, direction] = sort.split(',');
      if (field) sortBy = field;
      if (direction === 'asc' || direction === 'desc') sortOrder = direction;
    }

    // Get owner facilities
    const ownerFacilities = await this.prisma.facility.findMany({
      where: { ownerId: currentUser.id },
      select: { id: true },
    });

    const facilityIds = ownerFacilities.map((f) => f.id);

    // Build where clause for owner's facilities
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {
      facilityId: { in: facilityIds },
      isApproved: true, // Only show approved reviews to owners
    };

    if (minRating !== undefined) {
      where.rating = { ...where.rating, gte: minRating };
    }

    if (maxRating !== undefined) {
      where.rating = { ...where.rating, lte: maxRating };
    }

    // Only admins can filter by approval status
    if (isApproved !== undefined && currentUser.role === UserRole.ADMIN) {
      where.isApproved = isApproved;
    }

    if (search) {
      where.OR = [
        { comment: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { facility: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Always include user and facility info for owner reviews
    const includeClause = {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      facility: {
        select: {
          id: true,
          name: true,
          shortLocation: true,
          avgRating: true,
        },
      },
    };

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: includeClause,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      data: reviews,
      meta: createPaginationMeta(total, page, limit),
    };
  }

  async findOne(id: string, include?: string): Promise<ReviewResponseDto> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const includeClause: any = {};
    if (include?.includes('user')) {
      includeClause.user = {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      };
    }
    if (include?.includes('facility')) {
      includeClause.facility = {
        select: {
          id: true,
          name: true,
          shortLocation: true,
          avgRating: true,
        },
      };
    }

    const review = await this.prisma.review.findUnique({
      where: { id },
      include: includeClause,
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto, currentUser: User): Promise<ReviewResponseDto> {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Only the review author can update their review
    if (review.userId !== currentUser.id) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    // If review is already approved, updating it should make it pending again
    const wasApproved = review.isApproved;
    const shouldBePending = wasApproved && (updateReviewDto.rating || updateReviewDto.comment);

    const updatedReview = await this.prisma.review.update({
      where: { id },
      data: {
        ...updateReviewDto,
        ...(shouldBePending && { isApproved: false }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        facility: {
          select: {
            id: true,
            name: true,
            shortLocation: true,
            avgRating: true,
          },
        },
      },
    });

    // Update facility rating if review was previously approved
    if (wasApproved) {
      await this.updateFacilityRating(review.facilityId);
    }

    return updatedReview;
  }

  async approve(id: string, adminId: string, comment?: string): Promise<ReviewResponseDto> {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.isApproved) {
      throw new BadRequestException('Review is already approved');
    }

    const updatedReview = await this.prisma.review.update({
      where: { id },
      data: {
        isApproved: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        facility: {
          select: {
            id: true,
            name: true,
            shortLocation: true,
            avgRating: true,
          },
        },
      },
    });

    // Update facility average rating
    await this.updateFacilityRating(review.facilityId);

    // Log admin action
    await this.prisma.adminAction.create({
      data: {
        adminId,
        action: 'APPROVE_REVIEW',
        targetType: 'Review',
        targetId: id,
        comment,
      },
    });

    return updatedReview;
  }

  async reject(id: string, adminId: string, comment?: string): Promise<void> {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.isApproved) {
      throw new BadRequestException('Cannot reject an approved review');
    }

    // Delete the rejected review
    await this.prisma.review.delete({
      where: { id },
    });

    // Log admin action
    await this.prisma.adminAction.create({
      data: {
        adminId,
        action: 'REJECT_REVIEW',
        targetType: 'Review',
        targetId: id,
        comment,
      },
    });
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Only the review author or admin can delete the review
    if (review.userId !== currentUser.id && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    const wasApproved = review.isApproved;
    const facilityId = review.facilityId;

    await this.prisma.review.delete({
      where: { id },
    });

    // Update facility rating if review was approved
    if (wasApproved) {
      await this.updateFacilityRating(facilityId);
    }
  }

  async getStats(facilityId?: string): Promise<ReviewStatsDto> {
    const where = facilityId ? { facilityId, isApproved: true } : { isApproved: true };

    const [totalReviews, approvedReviews, pendingReviews, ratingStats] = await Promise.all([
      this.prisma.review.count(),
      this.prisma.review.count({ where }),
      this.prisma.review.count({ where: { isApproved: false } }),
      this.prisma.review.groupBy({
        by: ['rating'],
        where,
        _count: {
          rating: true,
        },
      }),
    ]);

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRatingSum = 0;

    ratingStats.forEach((stat) => {
      ratingDistribution[stat.rating as keyof typeof ratingDistribution] = stat._count.rating;
      totalRatingSum += stat.rating * stat._count.rating;
    });

    const averageRating = approvedReviews > 0 ? totalRatingSum / approvedReviews : 0;

    return {
      totalReviews,
      approvedReviews,
      pendingReviews,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      ratingDistribution,
    };
  }

  private async updateFacilityRating(facilityId: string): Promise<void> {
    const approvedReviews = await this.prisma.review.findMany({
      where: {
        facilityId,
        isApproved: true,
      },
      select: {
        rating: true,
      },
    });

    let avgRating: number | null = null;
    if (approvedReviews.length > 0) {
      const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0);
      avgRating = Math.round((totalRating / approvedReviews.length) * 10) / 10; // Round to 1 decimal place
    }

    await this.prisma.facility.update({
      where: { id: facilityId },
      data: { avgRating },
    });
  }
}
