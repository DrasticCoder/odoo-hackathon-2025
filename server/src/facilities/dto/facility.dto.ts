import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, Min, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { FacilityStatus } from 'prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class CreateFacilityDto {
  @ApiProperty({ description: 'Facility name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Facility description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Facility full address' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'Short location description', required: false })
  @IsOptional()
  @IsString()
  shortLocation?: string;

  @ApiProperty({ description: 'Facility amenities as JSON object', required: false })
  @IsOptional()
  @IsObject()
  amenities?: Record<string, unknown>;

  @ApiProperty({ description: 'About the facility', required: false })
  @IsOptional()
  @IsString()
  about?: string;
}

export class UpdateFacilityDto {
  @ApiProperty({ description: 'Facility name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Facility description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Facility full address', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Short location description', required: false })
  @IsOptional()
  @IsString()
  shortLocation?: string;

  @ApiProperty({ description: 'Facility amenities as JSON object', required: false })
  @IsOptional()
  @IsObject()
  amenities?: Record<string, unknown>;

  @ApiProperty({ description: 'About the facility', required: false })
  @IsOptional()
  @IsString()
  about?: string;

  @ApiProperty({ description: 'Facility status (Admin only)', enum: FacilityStatus, required: false })
  @IsOptional()
  @IsEnum(FacilityStatus)
  status?: FacilityStatus;
}

export class FacilityQueryDto extends PaginationQueryDto {
  @ApiProperty({ description: 'Filter by status', enum: FacilityStatus, required: false })
  @IsOptional()
  @IsEnum(FacilityStatus)
  status?: FacilityStatus;

  @ApiProperty({ description: 'Filter by owner ID', required: false })
  @IsOptional()
  @IsString()
  ownerId?: string;

  @ApiProperty({ description: 'Filter by sport type', required: false })
  @IsOptional()
  @IsString()
  sportType?: string;

  @ApiProperty({ description: 'Minimum price per hour', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({ description: 'Maximum price per hour', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({ description: 'Minimum rating', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  ratingMin?: number;

  @ApiProperty({ description: 'Include related data', required: false })
  @IsOptional()
  @IsString()
  include?: string;
}

export class FacilityResponseDto {
  @ApiProperty({ description: 'Facility ID' })
  id: string;

  @ApiProperty({ description: 'Owner ID' })
  ownerId: string;

  @ApiProperty({ description: 'Facility name' })
  name: string;

  @ApiProperty({ description: 'Facility description' })
  description: string | null;

  @ApiProperty({ description: 'Facility full address' })
  address: string;

  @ApiProperty({ description: 'Short location description' })
  shortLocation: string | null;

  @ApiProperty({ description: 'Facility status', enum: FacilityStatus })
  status: FacilityStatus;

  @ApiProperty({ description: 'Facility amenities' })
  amenities: Record<string, unknown> | null;

  @ApiProperty({ description: 'About the facility' })
  about: string | null;

  @ApiProperty({ description: 'Average rating' })
  avgRating: number | null;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  @ApiProperty({ description: 'Owner information', required: false })
  owner?: {
    id: string;
    name: string;
    email: string;
  };

  @ApiProperty({ description: 'Courts information', required: false })
  courts?: Array<{
    id: string;
    name: string;
    sportType: string;
    pricePerHour: number;
    isActive: boolean;
  }>;

  @ApiProperty({ description: 'Photos', required: false })
  photos?: Array<{
    id: string;
    url: string;
    caption: string | null;
  }>;

  @ApiProperty({ description: 'Reviews count', required: false })
  reviewsCount?: number;

  @ApiProperty({ description: 'Courts count', required: false })
  courtsCount?: number;

  @ApiProperty({ description: 'Starting price (minimum court price)', required: false })
  startingPrice?: number;

  @ApiProperty({ description: 'Available sport types', required: false })
  sportTypes?: string[];
}

export class ApproveFacilityDto {
  @ApiProperty({ description: 'Admin comment', required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}
