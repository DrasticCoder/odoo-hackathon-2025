import { ApiClient } from '@/lib/api-client';
import { PaginatedResponse } from '@/types';
import {
  UserProfile,
  UserBooking,
  UpdateUserProfileRequest,
  UserBookingFilters,
  PopularVenue,
  PopularSport,
} from '@/types/user.type';

/**
 * UserService - Handles USER role specific operations
 *
 * This service provides methods for regular users to:
 * - Manage their profile
 * - View their bookings
 * - Cancel bookings
 * - Get home page data
 */
export class UserService {
  // Profile Management
  static async getProfile() {
    return await ApiClient.get<UserProfile>('/api/users/me');
  }

  static async updateProfile(data: UpdateUserProfileRequest) {
    return await ApiClient.patch<UserProfile>('/api/users/me', data);
  }

  static async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);

    return await ApiClient.request<{ url: string }>({
      method: 'POST',
      url: '/api/users/me/avatar',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // My Bookings Management
  static async getMyBookings(filters: UserBookingFilters = {}) {
    const searchParams = new URLSearchParams();

    if (filters.page) searchParams.append('page', filters.page.toString());
    if (filters.limit) searchParams.append('limit', filters.limit.toString());
    if (filters.status) searchParams.append('status', filters.status);
    if (filters.dateFrom) searchParams.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) searchParams.append('dateTo', filters.dateTo);
    if (filters.sort) searchParams.append('sort', filters.sort);

    const url = `/api/users/me/bookings?${searchParams.toString()}`;
    return await ApiClient.get<PaginatedResponse<UserBooking>>(url);
  }

  static async getBookingById(bookingId: string) {
    return await ApiClient.get<UserBooking>(`/api/users/me/bookings/${bookingId}`);
  }

  static async cancelBooking(bookingId: string) {
    return await ApiClient.patch<UserBooking>(`/api/bookings/${bookingId}/cancel`, {});
  }

  // Home Page Data
  static async getPopularVenues(limit = 6) {
    return await ApiClient.get<PopularVenue[]>(`/api/venues/popular?limit=${limit}`);
  }

  static async getPopularSports() {
    return await ApiClient.get<PopularSport[]>('/api/sports/popular');
  }

  static async getHomePageData() {
    return await ApiClient.get<{
      popularVenues: PopularVenue[];
      popularSports: PopularSport[];
    }>('/api/home');
  }
}
