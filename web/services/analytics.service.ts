import { ApiClient } from '@/lib/api-client';

export type AnalyticsStats = {
  totalUsers: number;
  totalFacilities: number;
  totalBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  confirmedBookings: number;
  cancelledBookings: number;
  monthlyBookings: { month: string; bookings: number }[];
};

export class AnalyticsService {
  static async getStats() {
    // You may want to adjust endpoints if you add a dedicated analytics API
    const [users, facilities, bookings] = await Promise.all([
      ApiClient.get<{ meta: { total: number } }>(`/api/users`),
      ApiClient.get<{ meta: { total: number } }>(`/api/facilities`),
      ApiClient.get<{ data: { 
        totalBookings?: number;
        totalRevenue?: number;
        averageBookingValue?: number;
        confirmedBookings?: number;
        cancelledBookings?: number;
        monthlyBookings?: { month: string; bookings: number }[];
      } }>(`/api/bookings/stats`),
    ]);
    return {
      totalUsers: users.data?.meta?.total ?? 0,
      totalFacilities: facilities.data?.meta?.total ?? 0,
      totalBookings: bookings.data?.data?.totalBookings ?? 0,
      totalRevenue: bookings.data?.data?.totalRevenue ?? 0,
      averageBookingValue: bookings.data?.data?.averageBookingValue ?? 0,
      confirmedBookings: bookings.data?.data?.confirmedBookings ?? 0,
      cancelledBookings: bookings.data?.data?.cancelledBookings ?? 0,
      monthlyBookings: bookings.data?.data?.monthlyBookings ?? [],
    };
  }
}
