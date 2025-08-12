import { ApiClient } from '@/lib/api-client';

export class UserBanHistoryService {
  static async list(params: { banned?: boolean; page?: number; limit?: number } = {}) {
    // Assume isActive=false means banned
    return await ApiClient.get<{ data: any[] }>(`/api/users`, { params: { ...params, isActive: false } });
  }
  static async getBanHistory(id: string) {
    // TODO: Replace with real API endpoint if available
    return await ApiClient.get<{ data: any[] }>(`/api/users/${id}/ban-history`);
  }
}
