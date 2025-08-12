import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import {
  CreateReviewDto,
  UpdateReviewDto,
  ReviewQueryDto,
  ReviewResponseDto,
  ApproveReviewDto,
  ReviewStatsDto,
} from './dto/review.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole, User } from 'prisma/client';

@ApiTags('Reviews')
@Controller('api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({ status: 201, description: 'Review created successfully', type: ReviewResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid booking or already reviewed' })
  @ApiResponse({ status: 404, description: 'Facility or booking not found' })
  create(@Body() createReviewDto: CreateReviewDto, @CurrentUser() currentUser: User) {
    return this.reviewsService.create(createReviewDto, currentUser);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all reviews with search and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Reviews retrieved successfully',
    type: PaginatedResponseDto<ReviewResponseDto>,
  })
  findAll(@Query() query: ReviewQueryDto, @CurrentUser() currentUser?: User) {
    return this.reviewsService.findAll(query, currentUser);
  }

  @Get('owner')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get reviews for owner facilities' })
  @ApiResponse({
    status: 200,
    description: 'Owner reviews retrieved successfully',
    type: PaginatedResponseDto<ReviewResponseDto>,
  })
  findOwnerReviews(@Query() query: ReviewQueryDto, @CurrentUser() currentUser: User) {
    return this.reviewsService.findOwnerReviews(query, currentUser);
  }

  @Get('stats')
  @Public()
  @ApiOperation({ summary: 'Get review statistics' })
  @ApiResponse({ status: 200, description: 'Review statistics retrieved successfully', type: ReviewStatsDto })
  getStats(@Query('facilityId') facilityId?: string) {
    return this.reviewsService.getStats(facilityId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get review by ID' })
  @ApiResponse({ status: 200, description: 'Review found', type: ReviewResponseDto })
  @ApiResponse({ status: 404, description: 'Review not found' })
  findOne(@Param('id') id: string, @Query('include') include?: string) {
    return this.reviewsService.findOne(id, include);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update review (author only)' })
  @ApiResponse({ status: 200, description: 'Review updated successfully', type: ReviewResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only update own reviews' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto, @CurrentUser() currentUser: User) {
    return this.reviewsService.update(id, updateReviewDto, currentUser);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve review (Admin only)' })
  @ApiResponse({ status: 200, description: 'Review approved successfully', type: ReviewResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 400, description: 'Review is already approved' })
  approve(@Param('id') id: string, @Body() approveDto: ApproveReviewDto, @CurrentUser() currentUser: User) {
    return this.reviewsService.approve(id, currentUser.id, approveDto.comment);
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject review (Admin only)' })
  @ApiResponse({ status: 200, description: 'Review rejected successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 400, description: 'Cannot reject an approved review' })
  reject(@Param('id') id: string, @Body() rejectDto: ApproveReviewDto, @CurrentUser() currentUser: User) {
    return this.reviewsService.reject(id, currentUser.id, rejectDto.comment);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete review (author or admin)' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only delete own reviews' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  remove(@Param('id') id: string, @CurrentUser() currentUser: User) {
    return this.reviewsService.remove(id, currentUser);
  }
}
