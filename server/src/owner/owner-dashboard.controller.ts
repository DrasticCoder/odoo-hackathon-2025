import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OwnerDashboardService } from './owner-dashboard.service';
import {
  OwnerDashboardStatsDto,
  BookingTrendDto,
  EarningsSummaryDto,
  PeakHoursDto,
  DashboardQueryDto,
  UpcomingBookingDto,
  RecentActivityDto,
} from './dto/owner-dashboard.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { UserRole } from 'prisma/client';

interface CurrentUser {
  id: string;
  role: string;
}

@ApiTags('Owner Dashboard')
@Controller('api/owner/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN)
export class OwnerDashboardController {
  constructor(private readonly dashboardService: OwnerDashboardService) {}

  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get owner dashboard statistics and KPIs' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved successfully', type: OwnerDashboardStatsDto })
  getDashboardStats(@CurrentUser() currentUser: CurrentUser, @Query() query: DashboardQueryDto) {
    return this.dashboardService.getDashboardStats(currentUser.id, query);
  }

  @Get('booking-trends')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking trends for charts (daily/weekly/monthly)' })
  @ApiResponse({ status: 200, description: 'Booking trends retrieved successfully', type: [BookingTrendDto] })
  getBookingTrends(@CurrentUser() currentUser: CurrentUser, @Query() query: DashboardQueryDto) {
    return this.dashboardService.getBookingTrends(currentUser.id, query);
  }

  @Get('earnings-summary')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get earnings summary by facility' })
  @ApiResponse({ status: 200, description: 'Earnings summary retrieved successfully', type: [EarningsSummaryDto] })
  getEarningsSummary(@CurrentUser() currentUser: CurrentUser, @Query() query: DashboardQueryDto) {
    return this.dashboardService.getEarningsSummary(currentUser.id, query);
  }

  @Get('peak-hours')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get peak booking hours heatmap data' })
  @ApiResponse({ status: 200, description: 'Peak hours data retrieved successfully', type: [PeakHoursDto] })
  getPeakHours(@CurrentUser() currentUser: CurrentUser, @Query() query: DashboardQueryDto) {
    return this.dashboardService.getPeakHours(currentUser.id, query);
  }

  @Get('upcoming-bookings')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get upcoming bookings for owner facilities' })
  @ApiResponse({ status: 200, description: 'Upcoming bookings retrieved successfully', type: [UpcomingBookingDto] })
  getUpcomingBookings(@CurrentUser() currentUser: CurrentUser, @Query('limit') limit?: number) {
    return this.dashboardService.getUpcomingBookings(currentUser.id, limit);
  }

  @Get('recent-activity')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recent activity feed' })
  @ApiResponse({ status: 200, description: 'Recent activity retrieved successfully', type: [RecentActivityDto] })
  getRecentActivity(@CurrentUser() currentUser: CurrentUser, @Query('limit') limit?: number) {
    return this.dashboardService.getRecentActivity(currentUser.id, limit);
  }
}
