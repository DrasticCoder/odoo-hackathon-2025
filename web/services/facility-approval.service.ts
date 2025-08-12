import { ApiClient } from '@/lib/api-client';

export type FacilityApproval = {
  id: string;
  name: string;
  address: string;
  status: string;
  owner: { id: string; name: string; email: string };
  photos?: { id: string; url: string; caption?: string }[];
  description?: string;
  createdAt: string;
};

export class FacilityApprovalService {
  static async listPending() {
    return await ApiClient.get<{ data: FacilityApproval[] }>(`/api/facilities`, {
      params: { status: 'PENDING_APPROVAL', include: 'owner,photos' },
    });
  }
  static async getById(id: string) {
    return await ApiClient.get<FacilityApproval>(`/api/facilities/${id}`, { params: { include: 'owner,photos' } });
  }
  static async approve(id: string, comment?: string) {
    return await ApiClient.patch(`/api/facilities/${id}`, { status: 'APPROVED', comment });
  }
  static async reject(id: string, comment?: string) {
    return await ApiClient.patch(`/api/facilities/${id}`, { status: 'REJECTED', comment });
  }
}
