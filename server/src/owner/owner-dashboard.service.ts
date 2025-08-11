import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  OwnerDashboardStatsDto,
  BookingTrendDto,
  EarningsSummaryDto,
  PeakHoursDto,
  DashboardQueryDto,
  UpcomingBookingDto,
  RecentActivityDto,
} from './dto/owner-dashboard.dto';
import { BookingStatus, Prisma } from 'prisma/client';

@Injectable()
export class OwnerDashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(ownerId: string, query?: DashboardQueryDto): Promise<OwnerDashboardStatsDto> {
    const { startDate, endDate, facilityId } = query || {};

    // Build date filter
    const dateFilter: Prisma.DateTimeFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate + 'T23:59:59.999Z');

    // Build facility filter for owner
    const facilityFilter: Prisma.FacilityWhereInput = { ownerId };
    if (facilityId) facilityFilter.id = facilityId;

    // Get current month dates
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // Execute parallel queries
    const [
      totalBookings,
      activeCourts,
      totalFacilities,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      earningsResult,
      thisMonthEarnings,
      lastMonthEarnings,
    ] = await Promise.all([
      // Total bookings
      this.prisma.booking.count({
        where: {
          facility: facilityFilter,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
      }),
      // Active courts
      this.prisma.court.count({
        where: {
          facility: facilityFilter,
          isActive: true,
        },
      }),
      // Total facilities
      this.prisma.facility.count({
        where: facilityFilter,
      }),
      // Pending bookings
      this.prisma.booking.count({
        where: {
          facility: facilityFilter,
          status: BookingStatus.PENDING,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
      }),
      // Confirmed bookings
      this.prisma.booking.count({
        where: {
          facility: facilityFilter,
          status: BookingStatus.CONFIRMED,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
      }),
      // Cancelled bookings
      this.prisma.booking.count({
        where: {
          facility: facilityFilter,
          status: BookingStatus.CANCELLED,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
      }),
      // Total earnings
      this.prisma.booking.aggregate({
        where: {
          facility: facilityFilter,
          status: BookingStatus.CONFIRMED,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
        _sum: { totalPrice: true },
        _avg: { totalPrice: true },
      }),
      // This month earnings
      this.prisma.booking.aggregate({
        where: {
          facility: facilityFilter,
          status: BookingStatus.CONFIRMED,
          createdAt: { gte: thisMonthStart },
        },
        _sum: { totalPrice: true },
      }),
      // Last month earnings
      this.prisma.booking.aggregate({
        where: {
          facility: facilityFilter,
          status: BookingStatus.CONFIRMED,
          createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
        },
        _sum: { totalPrice: true },
      }),
    ]);

    const totalEarnings = earningsResult._sum.totalPrice || 0;
    const averageBookingValue = earningsResult._avg.totalPrice || 0;
    const thisMonth = thisMonthEarnings._sum.totalPrice || 0;
    const lastMonth = lastMonthEarnings._sum.totalPrice || 0;
    const growthPercentage = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

    return {
      totalBookings,
      activeCourts,
      totalEarnings,
      totalFacilities,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      averageBookingValue,
      thisMonthEarnings: thisMonth,
      lastMonthEarnings: lastMonth,
      growthPercentage,
    };
  }

  async getBookingTrends(ownerId: string, query?: DashboardQueryDto): Promise<BookingTrendDto[]> {
    const { startDate, endDate, period = 'daily', facilityId } = query || {};

    // Default to last 30 days if no date range provided
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    const start = startDate ? new Date(startDate) : defaultStartDate;
    const end = endDate ? new Date(endDate + 'T23:59:59.999Z') : defaultEndDate;

    const facilityFilter: Prisma.FacilityWhereInput = { ownerId };
    if (facilityId) facilityFilter.id = facilityId;

    // Get bookings data
    const bookings = await this.prisma.booking.findMany({
      where: {
        facility: facilityFilter,
        createdAt: { gte: start, lte: end },
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
      },
      select: {
        createdAt: true,
        totalPrice: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by period
    const trends: { [key: string]: { bookings: number; earnings: number; date: Date } } = {};

    bookings.forEach((booking) => {
      let periodKey: string;
      let periodDate: Date;

      switch (period) {
        case 'weekly': {
          const weekStart = new Date(booking.createdAt);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          periodKey = weekStart.toISOString().split('T')[0];
          periodDate = weekStart;
          break;
        }
        case 'monthly': {
          periodKey = `${booking.createdAt.getFullYear()}-${String(booking.createdAt.getMonth() + 1).padStart(2, '0')}`;
          periodDate = new Date(booking.createdAt.getFullYear(), booking.createdAt.getMonth(), 1);
          break;
        }
        default: // daily
          periodKey = booking.createdAt.toISOString().split('T')[0];
          periodDate = new Date(booking.createdAt.toISOString().split('T')[0]);
      }

      if (!trends[periodKey]) {
        trends[periodKey] = { bookings: 0, earnings: 0, date: periodDate };
      }
      trends[periodKey].bookings++;
      trends[periodKey].earnings += booking.totalPrice;
    });

    return Object.entries(trends).map(([period, data]) => ({
      period,
      bookings: data.bookings,
      earnings: data.earnings,
      date: data.date,
    }));
  }

  async getEarningsSummary(ownerId: string, query?: DashboardQueryDto): Promise<EarningsSummaryDto[]> {
    const { startDate, endDate, facilityId } = query || {};

    const dateFilter: Prisma.DateTimeFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate + 'T23:59:59.999Z');

    const facilityFilter: Prisma.FacilityWhereInput = { ownerId };
    if (facilityId) facilityFilter.id = facilityId;

    const earnings = await this.prisma.booking.groupBy({
      by: ['facilityId'],
      where: {
        facility: facilityFilter,
        status: BookingStatus.CONFIRMED,
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
      },
      _sum: { totalPrice: true },
      _count: { id: true },
    });

    // Get facility names
    const facilities = await this.prisma.facility.findMany({
      where: {
        id: { in: earnings.map((e) => e.facilityId) },
      },
      select: { id: true, name: true },
    });

    const facilityMap = new Map(facilities.map((f) => [f.id, f.name]));

    return earnings.map((earning) => ({
      facilityId: earning.facilityId,
      facilityName: facilityMap.get(earning.facilityId) || 'Unknown',
      earnings: earning._sum.totalPrice || 0,
      bookings: earning._count.id,
    }));
  }

  async getPeakHours(ownerId: string, query?: DashboardQueryDto): Promise<PeakHoursDto[]> {
    const { startDate, endDate, facilityId } = query || {};

    const dateFilter: Prisma.DateTimeFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate + 'T23:59:59.999Z');

    const facilityFilter: Prisma.FacilityWhereInput = { ownerId };
    if (facilityId) facilityFilter.id = facilityId;

    const bookings = await this.prisma.booking.findMany({
      where: {
        facility: facilityFilter,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
        ...(Object.keys(dateFilter).length > 0 && { startDatetime: dateFilter }),
      },
      select: {
        startDatetime: true,
      },
    });

    // Group by hour and day of week
    const heatmap: { [key: string]: number } = {};
    const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    bookings.forEach((booking) => {
      const hour = booking.startDatetime.getHours();
      const dayOfWeek = booking.startDatetime.getDay();
      const key = `${dayOfWeek}-${hour}`;

      heatmap[key] = (heatmap[key] || 0) + 1;
    });

    // Convert to array format
    const peakHours: PeakHoursDto[] = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const key = `${day}-${hour}`;
        const bookings = heatmap[key] || 0;

        peakHours.push({
          hour,
          dayOfWeek: day,
          bookings,
          hourLabel: hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`,
          dayLabel: dayLabels[day],
        });
      }
    }

    return peakHours.filter((p) => p.bookings > 0).sort((a, b) => b.bookings - a.bookings);
  }

  async getUpcomingBookings(ownerId: string, limit = 10): Promise<UpcomingBookingDto[]> {
    const now = new Date();
    const bookings = await this.prisma.booking.findMany({
      where: {
        facility: { ownerId },
        startDatetime: { gte: now },
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
      },
      take: limit,
      orderBy: { startDatetime: 'asc' },
      include: {
        user: { select: { name: true, email: true } },
        facility: { select: { name: true } },
        court: { select: { name: true, sportType: true } },
      },
    });

    return bookings.map((booking) => ({
      id: booking.id,
      userName: booking.user.name || 'Unknown',
      userEmail: booking.user.email,
      facilityName: booking.facility.name,
      courtName: booking.court.name,
      sportType: booking.court.sportType,
      startDatetime: booking.startDatetime,
      endDatetime: booking.endDatetime,
      totalPrice: booking.totalPrice,
      status: booking.status,
      timeUntilBooking: Math.floor((booking.startDatetime.getTime() - now.getTime()) / (1000 * 60)),
    }));
  }

  async getRecentActivity(ownerId: string, limit = 20): Promise<RecentActivityDto[]> {
    // Get recent bookings
    const recentBookings = await this.prisma.booking.findMany({
      where: {
        facility: { ownerId },
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        facility: { select: { name: true } },
        court: { select: { name: true } },
      },
    });

    // Get recent facility updates
    const recentFacilities = await this.prisma.facility.findMany({
      where: {
        ownerId,
        updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      take: limit,
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, updatedAt: true },
    });

    const activities: RecentActivityDto[] = [];

    // Add booking activities
    recentBookings.forEach((booking) => {
      let type: 'booking_created' | 'booking_cancelled' | 'facility_updated' | 'court_added';
      let description: string;

      if (booking.status === BookingStatus.CANCELLED) {
        type = 'booking_cancelled';
        description = `Booking cancelled for ${booking.court.name} at ${booking.facility.name}`;
      } else {
        type = 'booking_created';
        description = `New booking for ${booking.court.name} at ${booking.facility.name}`;
      }

      activities.push({
        id: booking.id,
        type,
        description,
        timestamp: booking.createdAt,
        entityId: booking.id,
        entityType: 'booking',
        userName: booking.user.name || 'Unknown',
      });
    });

    // Add facility activities
    recentFacilities.forEach((facility) => {
      activities.push({
        id: facility.id,
        type: 'facility_updated',
        description: `Facility "${facility.name}" was updated`,
        timestamp: facility.updatedAt,
        entityId: facility.id,
        entityType: 'facility',
      });
    });

    // Sort by timestamp and return limited results
    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
  }
}
