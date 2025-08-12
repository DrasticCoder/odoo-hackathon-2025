export interface OwnerDashboardStats {
  totalBookings: number;
  activeCourts: number;
  totalEarnings: number;
  totalFacilities: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  averageBookingValue: number;
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  growthPercentage: number;
}

export interface BookingTrend {
  period: string;
  bookings: number;
  earnings: number;
  date: string;
}

export interface EarningsSummary {
  facilityName: string;
  earnings: number;
  bookings: number;
  facilityId: string;
}

export interface PeakHours {
  hour: number;
  dayOfWeek: number;
  bookings: number;
  hourLabel: string;
  dayLabel: string;
}

export interface UpcomingBooking {
  id: string;
  userName: string;
  userEmail: string;
  facilityName: string;
  courtName: string;
  sportType: string;
  startDatetime: string;
  endDatetime: string;
  totalPrice: number;
  status: string;
  timeUntilBooking: number;
}

export interface RecentActivity {
  id: string;
  type: 'booking_created' | 'booking_cancelled' | 'facility_updated' | 'court_added';
  description: string;
  timestamp: string;
  entityId: string;
  entityType: string;
  userName?: string;
}

export interface DashboardQuery {
  startDate?: string;
  endDate?: string;
  period?: 'daily' | 'weekly' | 'monthly';
  facilityId?: string;
  [key: string]: unknown;
}

// Facility Management Types
export interface Facility {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  address: string;
  shortLocation: string | null;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  amenities: Record<string, unknown> | null;
  about: string | null;
  avgRating: number | null;
  createdAt: string;
  updatedAt: string;
  startingPrice?: number;
  sportTypes?: string[];
  courtsCount?: number;
  reviewsCount?: number;
  photoUrls?: string[];
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  courts?: Court[];
  photos?: Photo[];
}

export interface CreateFacilityRequest {
  name: string;
  description?: string;
  address: string;
  shortLocation?: string;
  amenities?: Record<string, unknown>;
  about?: string;
  photoUrls?: string[];
}

export interface UpdateFacilityRequest {
  name?: string;
  description?: string;
  address?: string;
  shortLocation?: string;
  amenities?: Record<string, unknown>;
  about?: string;
  status?: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  photoUrls?: string[];
}

// Court Management Types
export interface Court {
  id: string;
  facilityId: string;
  name: string;
  sportType: string;
  pricePerHour: number;
  isActive: boolean;
  operatingHours: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  facility?: {
    id: string;
    name: string;
    shortLocation: string | null;
    ownerId: string;
  };
  photos?: Photo[];
  bookingsCount?: number;
}

export interface CreateCourtRequest {
  name: string;
  sportType: string;
  pricePerHour: number;
  operatingHours?: Record<string, unknown>;
}

export interface UpdateCourtRequest {
  name?: string;
  sportType?: string;
  pricePerHour?: number;
  isActive?: boolean;
  operatingHours?: Record<string, unknown>;
}

// Availability Slot Types
export interface AvailabilitySlot {
  id: string;
  courtId: string;
  start: string;
  end: string;
  isBlocked: boolean;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAvailabilitySlotRequest {
  start: string;
  end: string;
  isBlocked?: boolean;
  reason?: string;
}

// Photo Types
export interface Photo {
  id: string;
  url: string;
  caption: string | null;
  facilityId: string | null;
  courtId: string | null;
  userId: string | null;
  createdAt: string;
}

export interface CreatePhotoRequest {
  caption?: string;
  facilityId?: string;
  courtId?: string;
  userId?: string;
}

// Booking Types
export interface Booking {
  id: string;
  userId: string;
  courtId: string;
  facilityId: string;
  startDatetime: string;
  endDatetime: string;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'FAILED';
  txnReference: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  court?: {
    id: string;
    name: string;
    sportType: string;
    pricePerHour: number;
  };
  facility?: {
    id: string;
    name: string;
    shortLocation: string | null;
  };
}

export interface BookingQuery {
  page?: number;
  limit?: number;
  q?: string;
  sort?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'FAILED';
  userId?: string;
  facilityId?: string;
  courtId?: string;
  startDate?: string;
  endDate?: string;
  include?: string;
  [key: string]: unknown;
}

// Facility Query Types
export interface FacilityQuery {
  page?: number;
  limit?: number;
  q?: string;
  sort?: string;
  field?: string;
  status?: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  ownerid?: string;
  sporttype?: string;
  minprice?: number;
  maxprice?: number;
  ratingmin?: number;
  include?: string;
  [key: string]: unknown;
}

// Sort options for facilities
export interface FacilitySortOption {
  label: string;
  value: string;
}

// Filter options for facilities
export interface FacilityFilters {
  status?: string[];
  sportTypes?: string[];
  priceRange?: {
    min?: number;
    max?: number;
  };
  ratingMin?: number;
}

// Review Management Types
export interface Review {
  id: string;
  userId: string;
  facilityId: string;
  bookingId: string | null;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
  facility?: {
    id: string;
    name: string;
    shortLocation: string | null;
    avgRating: number | null;
  };
}

export interface ReviewQuery {
  page?: number;
  limit?: number;
  q?: string;
  sort?: string;
  facilityId?: string;
  userId?: string;
  minRating?: number;
  maxRating?: number;
  isApproved?: boolean;
  include?: string;
  [key: string]: unknown;
}

export interface ReviewStats {
  totalReviews: number;
  approvedReviews: number;
  pendingReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
