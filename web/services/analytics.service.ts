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
      ApiClient.get<any>(`/api/bookings/stats`),
    ]);
    const stats = (bookings.data as any)?.data ?? bookings.data ?? {};
    return {
      totalUsers: users.data?.meta?.total ?? 0,
      totalFacilities: facilities.data?.meta?.total ?? 0,
      totalBookings: stats.totalBookings ?? 0,
      totalRevenue: stats.totalRevenue ?? 0,
      averageBookingValue: stats.averageBookingValue ?? 0,
      confirmedBookings: stats.confirmedBookings ?? 0,
      cancelledBookings: stats.cancelledBookings ?? 0,
      monthlyBookings: stats.monthlyBookings ?? [],
    };
  }
}
