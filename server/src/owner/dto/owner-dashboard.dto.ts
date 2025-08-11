import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class OwnerDashboardStatsDto {
  @ApiProperty({ description: 'Total bookings for owner facilities' })
  totalBookings: number;

  @ApiProperty({ description: 'Total active courts' })
  activeCourts: number;

  @ApiProperty({ description: 'Total earnings (simulated)' })
  totalEarnings: number;

  @ApiProperty({ description: 'Total facilities' })
  totalFacilities: number;

  @ApiProperty({ description: 'Pending bookings' })
  pendingBookings: number;

  @ApiProperty({ description: 'Confirmed bookings' })
  confirmedBookings: number;

  @ApiProperty({ description: 'Cancelled bookings' })
  cancelledBookings: number;

  @ApiProperty({ description: 'Average booking value' })
  averageBookingValue: number;

  @ApiProperty({ description: 'This month earnings' })
  thisMonthEarnings: number;

  @ApiProperty({ description: 'Last month earnings' })
  lastMonthEarnings: number;

  @ApiProperty({ description: 'Growth percentage' })
  growthPercentage: number;
}

export class BookingTrendDto {
  @ApiProperty({ description: 'Date or period label' })
  period: string;

  @ApiProperty({ description: 'Number of bookings' })
  bookings: number;

  @ApiProperty({ description: 'Total earnings for the period' })
  earnings: number;

  @ApiProperty({ description: 'Date of the period' })
  date: Date;
}

export class EarningsSummaryDto {
  @ApiProperty({ description: 'Facility name' })
  facilityName: string;

  @ApiProperty({ description: 'Total earnings' })
  earnings: number;

  @ApiProperty({ description: 'Number of bookings' })
  bookings: number;

  @ApiProperty({ description: 'Facility ID' })
  facilityId: string;
}

export class PeakHoursDto {
  @ApiProperty({ description: 'Hour of the day (0-23)' })
  hour: number;

  @ApiProperty({ description: 'Day of week (0-6, Sunday=0)' })
  dayOfWeek: number;

  @ApiProperty({ description: 'Number of bookings' })
  bookings: number;

  @ApiProperty({ description: 'Hour label (e.g., "9 AM")' })
  hourLabel: string;

  @ApiProperty({ description: 'Day label (e.g., "Monday")' })
  dayLabel: string;
}

export class DashboardQueryDto {
  @ApiProperty({ description: 'Start date for analytics (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date for analytics (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Period type (daily, weekly, monthly)', required: false })
  @IsOptional()
  @IsString()
  period?: 'daily' | 'weekly' | 'monthly';

  @ApiProperty({ description: 'Facility ID to filter by', required: false })
  @IsOptional()
  @IsString()
  facilityId?: string;
}

export class UpcomingBookingDto {
  @ApiProperty({ description: 'Booking ID' })
  id: string;

  @ApiProperty({ description: 'User name' })
  userName: string;

  @ApiProperty({ description: 'User email' })
  userEmail: string;

  @ApiProperty({ description: 'Facility name' })
  facilityName: string;

  @ApiProperty({ description: 'Court name' })
  courtName: string;

  @ApiProperty({ description: 'Sport type' })
  sportType: string;

  @ApiProperty({ description: 'Start datetime' })
  startDatetime: Date;

  @ApiProperty({ description: 'End datetime' })
  endDatetime: Date;

  @ApiProperty({ description: 'Total price' })
  totalPrice: number;

  @ApiProperty({ description: 'Booking status' })
  status: string;

  @ApiProperty({ description: 'Time until booking (in minutes)' })
  timeUntilBooking: number;
}

export class RecentActivityDto {
  @ApiProperty({ description: 'Activity ID' })
  id: string;

  @ApiProperty({ description: 'Activity type' })
  type: 'booking_created' | 'booking_cancelled' | 'facility_updated' | 'court_added';

  @ApiProperty({ description: 'Activity description' })
  description: string;

  @ApiProperty({ description: 'Activity timestamp' })
  timestamp: Date;

  @ApiProperty({ description: 'Related entity ID' })
  entityId: string;

  @ApiProperty({ description: 'Related entity type' })
  entityType: string;

  @ApiProperty({ description: 'User who performed the action' })
  userName?: string;
}
