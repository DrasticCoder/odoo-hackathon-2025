import { ApiClient } from '@/lib/api-client';

export class FacilityApprovalHistoryService {
  static async list(params: { status?: string; page?: number; limit?: number } = {}) {
    return await ApiClient.get<{ data: any[] }>(`/api/facilities`, { params: { ...params, include: 'owner,photos' } });
  }
  static async getById(id: string) {
    return await ApiClient.get<any>(`/api/facilities/${id}`, { params: { include: 'owner,photos' } });
  }
}
