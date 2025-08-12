import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, Min, IsObject, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export enum CourtStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export class CreateCourtDto {
  @ApiProperty({ description: 'Court name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Sport type (e.g., BADMINTON, TENNIS, FOOTBALL)' })
  @IsString()
  sportType: string;

  @ApiProperty({ description: 'Price per hour' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pricePerHour: number;

  @ApiProperty({ description: 'Operating hours as JSON object', required: false })
  @IsOptional()
  @IsObject()
  operatingHours?: Record<string, unknown>;
}

export class UpdateCourtDto {
  @ApiProperty({ description: 'Court name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Sport type', required: false })
  @IsOptional()
  @IsString()
  sportType?: string;

  @ApiProperty({ description: 'Price per hour', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pricePerHour?: number;

  @ApiProperty({ description: 'Court active status', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Operating hours as JSON object', required: false })
  @IsOptional()
  @IsObject()
  operatingHours?: Record<string, unknown>;
}

export class CourtQueryDto extends PaginationQueryDto {
  @ApiProperty({ description: 'Filter by facility ID', required: false })
  @IsOptional()
  @IsString()
  facilityId?: string;

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

  @ApiProperty({ description: 'Filter by active status', required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Filter by approval status', required: false, enum: CourtStatus })
  @IsOptional()
  @IsEnum(CourtStatus)
  status?: CourtStatus;

  @ApiProperty({ description: 'Include related data', required: false })
  @IsOptional()
  @IsString()
  include?: string;
}

export class CourtResponseDto {
  @ApiProperty({ description: 'Court ID' })
  id: string;

  @ApiProperty({ description: 'Facility ID' })
  facilityId: string;

  @ApiProperty({ description: 'Court name' })
  name: string;

  @ApiProperty({ description: 'Sport type' })
  sportType: string;

  @ApiProperty({ description: 'Price per hour' })
  pricePerHour: number;

  @ApiProperty({ description: 'Court active status' })
  isActive: boolean;

  @ApiProperty({ description: 'Court approval status', enum: CourtStatus })
  status: CourtStatus;

  @ApiProperty({ description: 'Operating hours' })
  operatingHours: Record<string, unknown> | null;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  @ApiProperty({ description: 'Facility information', required: false })
  facility?: {
    id: string;
    name: string;
    shortLocation: string | null;
    ownerId: string;
  };

  @ApiProperty({ description: 'Availability slots', required: false })
  availability?: Array<{
    id: string;
    start: Date;
    end: Date;
    isBlocked: boolean;
    reason: string | null;
  }>;

  @ApiProperty({ description: 'Photos', required: false })
  photos?: Array<{
    id: string;
    url: string;
    caption: string | null;
  }>;

  @ApiProperty({ description: 'Booking count', required: false })
  bookingsCount?: number;
}

export class CreateAvailabilitySlotDto {
  @ApiProperty({ description: 'Start datetime (ISO 8601)' })
  @IsString()
  start: string;

  @ApiProperty({ description: 'End datetime (ISO 8601)' })
  @IsString()
  end: string;

  @ApiProperty({ description: 'Whether this slot is blocked', required: false })
  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;

  @ApiProperty({ description: 'Reason for blocking (if blocked)', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class AvailabilityQueryDto {
  @ApiProperty({ description: 'Start date for availability check (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ description: 'End date for availability check (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({ description: 'Include blocked slots', required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeBlocked?: boolean;
}

export class AvailabilitySlotResponseDto {
  @ApiProperty({ description: 'Slot ID' })
  id: string;

  @ApiProperty({ description: 'Court ID' })
  courtId: string;

  @ApiProperty({ description: 'Start datetime' })
  start: Date;

  @ApiProperty({ description: 'End datetime' })
  end: Date;

  @ApiProperty({ description: 'Whether this slot is blocked' })
  isBlocked: boolean;

  @ApiProperty({ description: 'Reason for blocking' })
  reason: string | null;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}
