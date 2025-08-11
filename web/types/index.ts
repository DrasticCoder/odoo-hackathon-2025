export * from './files';
export * from './auth.type';
export * from './user.type';
export * from './owner.types';

// Common API response types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
