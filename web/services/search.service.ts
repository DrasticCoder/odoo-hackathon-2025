import { ApiClient } from '@/lib/api-client';

export interface SearchEntity {
  FACILITIES: 'facilities';
  COURTS: 'courts';
  USERS: 'users';
  REVIEWS: 'reviews';
  MATCHES: 'matches';
}

export interface SearchResultItem {
  id: string;
  type: keyof SearchEntity;
  title: string;
  description?: string;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
  url?: string;
  score?: number;
}

export interface UniversalSearchQuery {
  q: string;
  entities?: (keyof SearchEntity)[];
  limit?: number;
  [key: string]: unknown;
}

export interface UniversalSearchResponse {
  query: string;
  results: {
    [K in keyof SearchEntity]?: SearchResultItem[];
  };
  totalResults: number;
  executionTime: number;
  suggestions?: string[];
}

export class SearchService {
  static async universalSearch(query: UniversalSearchQuery): Promise<UniversalSearchResponse> {
    const response = await ApiClient.get<UniversalSearchResponse>('/api/search/universal', {
      params: query,
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  }

  static async quickSearch(query: string, limit = 5): Promise<UniversalSearchResponse> {
    return this.universalSearch({
      q: query,
      limit,
      entities: ['FACILITIES', 'COURTS'],
    });
  }
}
