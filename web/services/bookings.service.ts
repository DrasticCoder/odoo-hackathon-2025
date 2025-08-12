import { ApiClient } from '@/lib/api-client';

export type CreateBookingRequest = {
  courtId: string;
  startDatetime: string; // ISO 8601
  endDatetime: string; // ISO 8601
  paymentMethod?: string;
  userId?: string; // optional; backend will use current user if omitted
};

export class BookingsService {
  static async createBooking(data: CreateBookingRequest) {
    return await ApiClient.post<{ id: string }>(`/api/bookings`, data);
  }
}
