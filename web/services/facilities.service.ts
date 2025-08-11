import { ApiClient } from '@/lib/api-client';

export type Facility = {
  id: string;
  name: string;
  description?: string | null;
  address: string;
  shortLocation?: string | null;
  status: string;
  startingPrice?: number | null;
  sportTypes?: string[];
};

export type UpdateFacilityPayload = Partial<Pick<Facility, 'name' | 'description' | 'address' | 'shortLocation'>> & {
  status?: string;
};

export class FacilitiesService {
  static async listMine() {
    // server returns only owner's facilities for owner; admin will get all when needed
    return await ApiClient.get<{ data: Facility[] }>(`/api/facilities`, { params: { include: 'counts' } });
  }

  static async remove(id: string) {
    return await ApiClient.delete(`/api/facilities/${id}`);
  }
}
