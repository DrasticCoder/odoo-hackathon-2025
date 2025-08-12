import { ApiClient } from '@/lib/api-client';

export type LogEntry = {
  id: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  user?: { id: string; name: string; avatarUrl?: string };
  createdAt: string;
};

export class LogsService {
  static async list(page = 1, limit = 20) {
    // TODO: Replace with real API endpoint when available
    return await ApiClient.get<{ data: LogEntry[]; meta: any }>(`/api/admin/logs`, { params: { page, limit } });
  }
  static async remove(id: string) {
    return await ApiClient.delete(`/api/admin/logs/${id}`);
  }
}
