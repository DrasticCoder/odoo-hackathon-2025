import { ApiClient } from '@/lib/api-client';

export type Report = {
  id: string;
  reporter: { id: string; name: string };
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  createdAt: string;
};

export class ReportsService {
  static async list() {
    // TODO: Replace with real API endpoint when available
    return await ApiClient.get<{ data: Report[] }>(`/api/reports`);
  }
  static async action(id: string, status: string) {
    return await ApiClient.patch(`/api/reports/${id}`, { status });
  }
}
