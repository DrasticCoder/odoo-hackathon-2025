import { ApiClient } from '@/lib/api-client';
import { User } from '@/types/auth.type';

export type UpdateUserPayload = Partial<Pick<User, 'name' | 'avatarUrl'>>;

export class UsersService {
  static async getById(id: string) {
    return await ApiClient.get<{ user: User }>(`/api/users/${id}`);
  }

  static async update(id: string, data: UpdateUserPayload) {
  return await ApiClient.patch<User, UpdateUserPayload>(`/api/users/${id}`, data);
  }
}
