import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { BookingStatus } from 'prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class CreateBookingDto {
  @ApiProperty({ description: 'Court ID' })
  @IsUUID()
  courtId: string;

  @ApiProperty({ description: 'Booking start datetime (ISO 8601)' })
  @IsDateString()
  startDatetime: string;

  @ApiProperty({ description: 'Booking end datetime (ISO 8601)' })
  @IsDateString()
  endDatetime: string;

  @ApiProperty({ description: 'Payment method', required: false })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiProperty({ description: 'User ID (optional, will use current user if not provided)', required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

export class UpdateBookingDto {
  @ApiProperty({ description: 'Booking start datetime (ISO 8601)', required: false })
  @IsOptional()
  @IsDateString()
  startDatetime?: string;

  @ApiProperty({ description: 'Booking end datetime (ISO 8601)', required: false })
  @IsOptional()
  @IsDateString()
  endDatetime?: string;

  @ApiProperty({ description: 'Booking status', enum: BookingStatus, required: false })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiProperty({ description: 'Transaction reference', required: false })
  @IsOptional()
  @IsString()
  txnReference?: string;
}

export class BookingQueryDto extends PaginationQueryDto {
  @ApiProperty({ description: 'Filter by status', enum: BookingStatus, required: false })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiProperty({ description: 'Filter by user ID', required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ description: 'Filter by facility ID', required: false })
  @IsOptional()
  @IsUUID()
  facilityId?: string;

  @ApiProperty({ description: 'Filter by court ID', required: false })
  @IsOptional()
  @IsUUID()
  courtId?: string;

  @ApiProperty({ description: 'Filter by start date (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'Filter by end date (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Include related data', required: false })
  @IsOptional()
  @IsString()
  include?: string;
}

export class BookingResponseDto {
  @ApiProperty({ description: 'Booking ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Court ID' })
  courtId: string;

  @ApiProperty({ description: 'Facility ID' })
  facilityId: string;

  @ApiProperty({ description: 'Booking start datetime' })
  startDatetime: Date;

  @ApiProperty({ description: 'Booking end datetime' })
  endDatetime: Date;

  @ApiProperty({ description: 'Total price' })
  totalPrice: number;

  @ApiProperty({ description: 'Booking status', enum: BookingStatus })
  status: BookingStatus;

  @ApiProperty({ description: 'Transaction reference' })
  txnReference: string | null;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  @ApiProperty({ description: 'User information', required: false })
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };

  @ApiProperty({ description: 'Court information', required: false })
  court?: {
    id: string;
    name: string;
    sportType: string;
    pricePerHour: number;
  };

  @ApiProperty({ description: 'Facility information', required: false })
  facility?: {
    id: string;
    name: string;
    shortLocation: string | null;
  };
}

export class PaymentDto {
  @ApiProperty({ description: 'Payment method' })
  @IsString()
  paymentMethod: string;

  @ApiProperty({ description: 'Payment token or reference', required: false })
  @IsOptional()
  @IsString()
  paymentToken?: string;
}

export class CancelBookingDto {
  @ApiProperty({ description: 'Cancellation reason', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class BookingStatsDto {
  @ApiProperty({ description: 'Total bookings' })
  totalBookings: number;

  @ApiProperty({ description: 'Confirmed bookings' })
  confirmedBookings: number;

  @ApiProperty({ description: 'Cancelled bookings' })
  cancelledBookings: number;

  @ApiProperty({ description: 'Total revenue' })
  totalRevenue: number;

  @ApiProperty({ description: 'Average booking value' })
  averageBookingValue: number;

  @ApiProperty({ description: 'Monthly booking counts for the last 12 months', type: [Object] })
  monthlyBookings?: { month: string; bookings: number }[];
}
