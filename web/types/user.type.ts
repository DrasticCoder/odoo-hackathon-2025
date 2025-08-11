import { UserRole } from './auth.type';

// User profile data for USER role
export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: UserRole;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Update profile request for USER role
export interface UpdateUserProfileRequest {
  name?: string;
  avatarUrl?: string;
}

// User booking item for "My Bookings" page
export interface UserBooking {
  id: string;
  facilityId: string;
  courtId: string;
  startDatetime: Date;
  endDatetime: Date;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'FAILED';
  txnReference: string | null;
  createdAt: Date;
  updatedAt: Date;
  facility: {
    id: string;
    name: string;
    shortLocation: string | null;
  };
  court: {
    id: string;
    name: string;
    sportType: string;
  };
}

// Filters for user bookings
export interface UserBookingFilters {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'FAILED';
  dateFrom?: string; // ISO date string
  dateTo?: string; // ISO date string
  sort?: string; // e.g., "startDatetime,desc"
}

// Popular venue for home page
export interface PopularVenue {
  id: string;
  name: string;
  shortLocation: string | null;
  sportTypes: string[];
  startingPrice: number;
  avgRating: number | null;
  photos: Array<{
    id: string;
    url: string;
  }>;
}

// Popular sport for home page
export interface PopularSport {
  sportType: string;
  venueCount: number;
  averagePrice: number;
}
