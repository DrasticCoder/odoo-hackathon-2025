import { ApiClient } from '@/lib/api-client';
import {
  OwnerDashboardStats,
  BookingTrend,
  EarningsSummary,
  PeakHours,
  UpcomingBooking,
  RecentActivity,
  DashboardQuery,
  Facility,
  CreateFacilityRequest,
  UpdateFacilityRequest,
  Court,
  CreateCourtRequest,
  UpdateCourtRequest,
  AvailabilitySlot,
  CreateAvailabilitySlotRequest,
  Photo,
  Booking,
  BookingQuery,
  FacilityQuery,
} from '@/types/owner.types';
import { PaginatedResponse } from '@/types';

export class OwnerService {
  // Dashboard APIs
  static async getDashboardStats(query?: DashboardQuery) {
    return await ApiClient.get<OwnerDashboardStats>('/api/owner/dashboard/stats', { params: query });
  }

  static async getBookingTrends(query?: DashboardQuery) {
    return await ApiClient.get<BookingTrend[]>('/api/owner/dashboard/booking-trends', { params: query });
  }

  static async getEarningsSummary(query?: DashboardQuery) {
    return await ApiClient.get<EarningsSummary[]>('/api/owner/dashboard/earnings-summary', { params: query });
  }

  static async getPeakHours(query?: DashboardQuery) {
    return await ApiClient.get<PeakHours[]>('/api/owner/dashboard/peak-hours', { params: query });
  }

  static async getUpcomingBookings(limit?: number) {
    return await ApiClient.get<UpcomingBooking[]>('/api/owner/dashboard/upcoming-bookings', {
      params: { limit },
    });
  }

  static async getRecentActivity(limit?: number) {
    return await ApiClient.get<RecentActivity[]>('/api/owner/dashboard/recent-activity', {
      params: { limit },
    });
  }

  // Facility Management APIs
  static async getFacilities(params?: FacilityQuery) {
    const backendParams: Record<string, string | number | boolean> = {};

    if (params) {
      if (params.page) backendParams.page = params.page;
      if (params.limit) backendParams.limit = params.limit;
      if (params.q) backendParams.q = params.q;
      if (params.sort) backendParams.sort = params.sort;
      if (params.status) backendParams.status = params.status;
      if (params.include) backendParams.include = params.include;

      if (params.sporttype) backendParams.sportType = params.sporttype;
      if (params.minprice !== undefined) backendParams.minPrice = params.minprice;
      if (params.maxprice !== undefined) backendParams.maxPrice = params.maxprice;
      if (params.ratingmin !== undefined) backendParams.ratingMin = params.ratingmin;
      if (params.ownerid) backendParams.ownerId = params.ownerid;
    }

    return await ApiClient.get<PaginatedResponse<Facility>>('/api/facilities', { params: backendParams });
  }

  static async getFacility(id: string, include?: string) {
    return await ApiClient.get<Facility>(`/api/facilities/${id}`, {
      params: { include },
    });
  }

  static async createFacility(data: CreateFacilityRequest) {
    return await ApiClient.post<Facility>('/api/facilities', data);
  }

  static async updateFacility(id: string, data: UpdateFacilityRequest) {
    return await ApiClient.patch<Facility>(`/api/facilities/${id}`, data);
  }

  static async deleteFacility(id: string) {
    return await ApiClient.delete(`/api/facilities/${id}`);
  }

  // Court Management APIs
  static async getCourts(params?: Record<string, any>) {
    return await ApiClient.get<PaginatedResponse<Court>>('/api/courts', { params });
  }

  static async getCourt(id: string, include?: string) {
    return await ApiClient.get<Court>(`/api/courts/${id}`, {
      params: { include },
    });
  }

  static async createCourt(facilityId: string, data: CreateCourtRequest) {
    return await ApiClient.post<Court>(`/api/courts/facilities/${facilityId}/courts`, data);
  }

  static async updateCourt(id: string, data: UpdateCourtRequest) {
    return await ApiClient.patch<Court>(`/api/courts/${id}`, data);
  }

  static async deleteCourt(id: string) {
    return await ApiClient.delete(`/api/courts/${id}`);
  }

  // Availability Management APIs
  static async getCourtAvailability(courtId: string, params?: Record<string, any>) {
    return await ApiClient.get<AvailabilitySlot[]>(`/api/courts/${courtId}/availability`, { params });
  }

  static async createAvailabilitySlot(courtId: string, data: CreateAvailabilitySlotRequest) {
    return await ApiClient.post<AvailabilitySlot>(`/api/courts/${courtId}/availability`, data);
  }

  static async updateAvailabilitySlot(slotId: string, data: Partial<CreateAvailabilitySlotRequest>) {
    return await ApiClient.patch<AvailabilitySlot>(`/api/courts/availability/${slotId}`, data);
  }

  static async deleteAvailabilitySlot(slotId: string) {
    return await ApiClient.delete(`/api/courts/availability/${slotId}`);
  }

  // Photo Management APIs
  static async getPhotos(params?: Record<string, any>) {
    return await ApiClient.get<Photo[]>('/api/photos', { params });
  }

  static async uploadPhoto(formData: FormData) {
    return await ApiClient.post<{ photo: Photo; message: string }>('/api/photos/upload', formData);
  }

  static async updatePhoto(id: string, data: { caption?: string }) {
    return await ApiClient.patch<Photo>(`/api/photos/${id}`, data);
  }

  static async deletePhoto(id: string) {
    return await ApiClient.delete(`/api/photos/${id}`);
  }

  // Booking Management APIs
  static async getBookings(params?: BookingQuery) {
    return await ApiClient.get<PaginatedResponse<Booking>>('/api/bookings', { params });
  }

  static async getBooking(id: string) {
    return await ApiClient.get<Booking>(`/api/bookings/${id}`);
  }

  static async getBookingStats(facilityId?: string) {
    return await ApiClient.get<{
      totalBookings: number;
      confirmedBookings: number;
      cancelledBookings: number;
      totalRevenue: number;
      averageBookingValue: number;
    }>('/api/bookings/stats', {
      params: { facilityId },
    });
  }

  static async cancelBooking(id: string, reason?: string) {
    return await ApiClient.post<Booking>(`/api/bookings/${id}/cancel`, { reason });
  }
}
