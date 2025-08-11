import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FacilityStatus, BookingStatus } from 'prisma/client';

@Injectable()
export class HomeService {
  constructor(private prisma: PrismaService) {}

  async getPopularVenues(limit = 6) {
    // Get facilities with highest average rating and most bookings
    const facilities = await this.prisma.facility.findMany({
      where: {
        status: FacilityStatus.APPROVED,
      },
      take: limit,
      orderBy: [{ avgRating: 'desc' }, { createdAt: 'desc' }],
      include: {
        photos: {
          take: 1,
          select: { url: true },
        },
        courts: {
          select: { sportType: true, pricePerHour: true },
        },
        _count: {
          select: { bookings: true, reviews: true },
        },
      },
    });

    return facilities.map((facility) => ({
      id: facility.id,
      name: facility.name,
      shortLocation: facility.shortLocation,
      avgRating: facility.avgRating,
      reviewsCount: facility._count.reviews,
      bookingsCount: facility._count.bookings,
      startingPrice: facility.courts.length > 0 ? Math.min(...facility.courts.map((c) => c.pricePerHour)) : null,
      sportTypes: [...new Set(facility.courts.map((c) => c.sportType))],
      imageUrl: facility.photos[0]?.url || null,
    }));
  }

  async getPopularSports() {
    // Get sport types with most bookings
    const sportsData = await this.prisma.booking.groupBy({
      by: ['courtId'],
      _count: {
        id: true,
      },
      where: {
        status: BookingStatus.CONFIRMED,
      },
    });

    // Get court details with sport types
    const courtIds = sportsData.map((s) => s.courtId);
    const courts = await this.prisma.court.findMany({
      where: {
        id: { in: courtIds },
      },
      select: {
        id: true,
        sportType: true,
      },
    });

    // Group by sport type and count bookings
    const sportCounts: Record<string, number> = {};
    sportsData.forEach((booking) => {
      const court = courts.find((c) => c.id === booking.courtId);
      if (court) {
        sportCounts[court.sportType] = (sportCounts[court.sportType] || 0) + booking._count.id;
      }
    });

    // Convert to array and sort
    return Object.entries(sportCounts)
      .map(([name, bookingCount]) => ({ name, bookingCount }))
      .sort((a, b) => b.bookingCount - a.bookingCount)
      .slice(0, 10);
  }

  async getHomePageData() {
    const [popularVenues, popularSports] = await Promise.all([this.getPopularVenues(6), this.getPopularSports()]);

    return {
      popularVenues,
      popularSports,
    };
  }
}
