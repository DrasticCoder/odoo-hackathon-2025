import { ApiClient } from '@/lib/api-client';

export interface Venue {
  id: string;
  name: string;
  description?: string | null;
  address: string;
  shortLocation?: string | null;
  status: string;
  avgRating?: number | null;
  startingPrice?: number | null;
  sportTypes?: string[];
  photoUrls?: string[];
  courtsCount?: number;
  reviewsCount?: number;
}

export interface VenueFilters {
  q?: string;
  sportType?: string;
  minPrice?: number;
  maxPrice?: number;
  ratingMin?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedVenues {
  data: Venue[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class VenuesService {
  static async getVenues(filters?: VenueFilters) {
    return await ApiClient.get<PaginatedVenues>('/api/facilities', {
      params: {
        ...filters,
        include: 'photos,counts',
      },
    });
  }

  static async getVenue(id: string) {
    return await ApiClient.get<Venue>(`/api/facilities/${id}`, {
      params: {
        include: 'photos,courts,reviews',
      },
    });
  }

  static async getVenueCourts(venueId: string) {
    return await ApiClient.get<any[]>(`/api/courts`, {
      params: {
        facilityId: venueId,
        include: 'photos,availability',
      },
    });
  }
}
