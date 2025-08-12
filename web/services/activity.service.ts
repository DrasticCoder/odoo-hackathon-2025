import { ApiClient } from '@/lib/api-client';

export type Activity = {
  id: string;
  type: string;
  description: string;
  user: { id: string; name: string; avatarUrl?: string };
  createdAt: string;
};

export class ActivityService {
  static async list(page = 1, limit = 20) {
    // TODO: Replace with real API endpoint when available
    return await ApiClient.get<{ data: Activity[]; meta: any }>(`/api/admin/activities`, { params: { page, limit } });
  }
  static async create(activity: Partial<Activity>) {
    return await ApiClient.post<Activity, Partial<Activity>>(`/api/admin/activities`, activity);
  }
  static async update(id: string, activity: Partial<Activity>) {
    return await ApiClient.patch<Activity, Partial<Activity>>(`/api/admin/activities/${id}`, activity);
  }
  static async remove(id: string) {
    return await ApiClient.delete(`/api/admin/activities/${id}`);
  }
}
