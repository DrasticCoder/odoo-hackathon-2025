import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class CreateReviewDto {
  @ApiProperty({ description: 'Facility ID' })
  @IsString()
  facilityId: string;

  @ApiProperty({ description: 'Booking ID to validate booking status' })
  @IsString()
  bookingId: string;

  @ApiProperty({ description: 'Rating from 1 to 5', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: 'Review comment', required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class UpdateReviewDto {
  @ApiProperty({ description: 'Rating from 1 to 5', minimum: 1, maximum: 5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({ description: 'Review comment', required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class ReviewQueryDto extends PaginationQueryDto {
  @ApiProperty({ description: 'Filter by facility ID', required: false })
  @IsOptional()
  @IsString()
  facilityId?: string;

  @ApiProperty({ description: 'Filter by user ID', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ description: 'Filter by minimum rating', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  minRating?: number;

  @ApiProperty({ description: 'Filter by maximum rating', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  maxRating?: number;

  @ApiProperty({ description: 'Filter by approval status (Admin only)', required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isApproved?: boolean;

  @ApiProperty({ description: 'Include related data', required: false })
  @IsOptional()
  @IsString()
  include?: string;
}

export class ReviewResponseDto {
  @ApiProperty({ description: 'Review ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Facility ID' })
  facilityId: string;

  @ApiProperty({ description: 'Booking ID' })
  bookingId: string | null;

  @ApiProperty({ description: 'Rating from 1 to 5' })
  rating: number;

  @ApiProperty({ description: 'Review comment' })
  comment: string | null;

  @ApiProperty({ description: 'Whether the review is approved' })
  isApproved: boolean;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'User information', required: false })
  user?: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };

  @ApiProperty({ description: 'Facility information', required: false })
  facility?: {
    id: string;
    name: string;
    shortLocation: string | null;
    avgRating: number | null;
  };
}

export class ApproveReviewDto {
  @ApiProperty({ description: 'Admin comment', required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class ReviewStatsDto {
  @ApiProperty({ description: 'Total reviews' })
  totalReviews: number;

  @ApiProperty({ description: 'Approved reviews' })
  approvedReviews: number;

  @ApiProperty({ description: 'Pending reviews' })
  pendingReviews: number;

  @ApiProperty({ description: 'Average rating' })
  averageRating: number;

  @ApiProperty({ description: 'Rating distribution' })
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
