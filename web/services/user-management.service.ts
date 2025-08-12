import { ApiClient } from '@/lib/api-client';
import { User } from '@/types/auth.type';

export class UserManagementService {
  static async list(params: {
    page?: number;
    limit?: number;
    q?: string;
    role?: string;
    isActive?: boolean;
    isVerified?: boolean;
  }) {
    return await ApiClient.get<{ data: User[]; meta: any }>(`/api/users`, { params });
  }
  static async ban(id: string, reason?: string) {
    return await ApiClient.post(`/api/users/${id}/ban`, { reason });
  }
  static async unban(id: string) {
    return await ApiClient.post(`/api/users/${id}/unban`, {});
  }
  static async getBookings(id: string) {
    return await ApiClient.get<{ data: any[] }>(`/api/users/${id}/bookings`);
  }
}
