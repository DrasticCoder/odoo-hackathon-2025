'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import AuthGuard from '@/components/auth/AuthGuard';
import { UserRole } from '@/types/auth.type';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import UserHeader from '@/components/UserHeader';
import Footer from '@/components/Footer';
import {
  MapPin,
  Star,
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  X,
  Clock,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  ShowerHead,
  AirVent,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useLocationStore } from '@/store/location.store';
import { cn } from '@/lib/utils';

// Extended mock data for venues with more realistic information
const mockVenues = [
  {
    id: '1',
    name: 'SportZone Arena',
    description: 'Premium badminton and tennis facility with professional courts',
    location: 'Koramangala, Bangalore',
    shortLocation: 'Koramangala',
    city: 'Bangalore',
    sportTypes: ['Badminton', 'Tennis'],
    environment: 'Indoor',
    pricePerHour: 500,
    priceMin: 400,
    priceMax: 600,
    rating: 4.5,
    reviews: 124,
    image: 'https://img.example.com/1.png',
    amenities: ['Parking', 'Changing Room', 'Water', 'AC', 'Equipment'],
    tags: ['Premium', 'Professional', 'Air Conditioned'],
    availability: 'Available',
    operatingHours: '6:00 AM - 11:00 PM',
    verified: true,
    featured: true,
  },
  {
    id: '2',
    name: 'City Sports Complex',
    description: 'Multi-sport facility with modern equipment and spacious courts',
    location: 'Indiranagar, Bangalore',
    shortLocation: 'Indiranagar',
    city: 'Bangalore',
    sportTypes: ['Basketball', 'Football', 'Cricket'],
    environment: 'Outdoor',
    pricePerHour: 800,
    priceMin: 700,
    priceMax: 900,
    rating: 4.2,
    reviews: 89,
    image: 'https://img.example.com/2.png',
    amenities: ['Parking', 'Cafeteria', 'Locker Room', 'Shower'],
    tags: ['Multi-Sport', 'Spacious', 'Modern'],
    availability: 'Available',
    operatingHours: '5:30 AM - 10:30 PM',
    verified: true,
    featured: false,
  },
  {
    id: '3',
    name: 'Elite Badminton Club',
    description: 'Professional badminton courts with coaching facilities',
    location: 'Whitefield, Bangalore',
    shortLocation: 'Whitefield',
    city: 'Bangalore',
    sportTypes: ['Badminton'],
    environment: 'Indoor',
    pricePerHour: 600,
    priceMin: 550,
    priceMax: 650,
    rating: 4.8,
    reviews: 156,
    image: 'https://img.example.com/3.png',
    amenities: ['AC', 'Parking', 'Pro Shop', 'Equipment', 'Coaching'],
    tags: ['Elite', 'Professional', 'Coaching Available'],
    availability: 'Available',
    operatingHours: '6:00 AM - 11:30 PM',
    verified: true,
    featured: true,
  },
  {
    id: '4',
    name: 'Fitness First Arena',
    description: 'Combined fitness center and sports facility',
    location: 'HSR Layout, Bangalore',
    shortLocation: 'HSR Layout',
    city: 'Bangalore',
    sportTypes: ['Basketball', 'Badminton', 'Table Tennis'],
    environment: 'Indoor',
    pricePerHour: 450,
    priceMin: 400,
    priceMax: 500,
    rating: 4.3,
    reviews: 78,
    image: 'https://img.example.com/4.png',
    amenities: ['Gym', 'Parking', 'Locker', 'Shower', 'Cafe'],
    tags: ['Fitness', 'Multi-Sport', 'Gym Access'],
    availability: 'Available',
    operatingHours: '5:00 AM - 12:00 AM',
    verified: false,
    featured: false,
  },
  {
    id: '5',
    name: 'Royal Tennis Academy',
    description: 'Premier tennis facility with clay and hard courts',
    location: 'Jayanagar, Bangalore',
    shortLocation: 'Jayanagar',
    city: 'Bangalore',
    sportTypes: ['Tennis'],
    environment: 'Outdoor',
    pricePerHour: 1200,
    priceMin: 1000,
    priceMax: 1400,
    rating: 4.6,
    reviews: 92,
    image: 'https://img.example.com/5.png',
    amenities: ['Parking', 'Equipment', 'Cafe', 'Coaching', 'Pro Shop'],
    tags: ['Premium', 'Clay Courts', 'Professional'],
    availability: 'Available',
    operatingHours: '6:00 AM - 10:00 PM',
    verified: true,
    featured: true,
  },
  {
    id: '6',
    name: 'Phoenix Sports Club',
    description: 'Affordable multi-sport facility for all skill levels',
    location: 'BTM Layout, Bangalore',
    shortLocation: 'BTM Layout',
    city: 'Bangalore',
    sportTypes: ['Badminton', 'Table Tennis', 'Squash'],
    environment: 'Indoor',
    pricePerHour: 350,
    priceMin: 300,
    priceMax: 400,
    rating: 4.0,
    reviews: 67,
    image: 'https://img.example.com/6.png',
    amenities: ['Parking', 'Water', 'Equipment'],
    tags: ['Affordable', 'Family Friendly', 'Beginner Friendly'],
    availability: 'Available',
    operatingHours: '6:30 AM - 10:00 PM',
    verified: false,
    featured: false,
  },
  {
    id: '7',
    name: 'Mumbai Cricket Grounds',
    description: 'Professional cricket facility with multiple pitches',
    location: 'Andheri, Mumbai',
    shortLocation: 'Andheri',
    city: 'Mumbai',
    sportTypes: ['Cricket'],
    environment: 'Outdoor',
    pricePerHour: 1500,
    priceMin: 1300,
    priceMax: 1700,
    rating: 4.7,
    reviews: 134,
    image: 'https://img.example.com/7.png',
    amenities: ['Parking', 'Equipment', 'Changing Room', 'Cafeteria'],
    tags: ['Professional', 'Multiple Pitches', 'Tournament Ready'],
    availability: 'Available',
    operatingHours: '7:00 AM - 9:00 PM',
    verified: true,
    featured: true,
  },
  {
    id: '8',
    name: 'Delhi Sports Hub',
    description: 'Modern indoor sports complex with multiple facilities',
    location: 'Dwarka, Delhi',
    shortLocation: 'Dwarka',
    city: 'Delhi',
    sportTypes: ['Basketball', 'Badminton', 'Volleyball'],
    environment: 'Indoor',
    pricePerHour: 700,
    priceMin: 600,
    priceMax: 800,
    rating: 4.4,
    reviews: 98,
    image: 'https://img.example.com/8.png',
    amenities: ['AC', 'Parking', 'Locker Room', 'Equipment', 'Cafe'],
    tags: ['Modern', 'Multi-Sport', 'Air Conditioned'],
    availability: 'Available',
    operatingHours: '5:30 AM - 11:00 PM',
    verified: true,
    featured: false,
  },
];

// Filter options
const SPORTS_OPTIONS = [
  'All Sports',
  'Badminton',
  'Tennis',
  'Basketball',
  'Football',
  'Cricket',
  'Table Tennis',
  'Squash',
  'Volleyball',
];

const LOCATION_OPTIONS = ['All Locations', 'Bangalore', 'Mumbai', 'Delhi', 'Pune'];

const ENVIRONMENT_OPTIONS = ['All', 'Indoor', 'Outdoor'];

const AMENITIES_OPTIONS = [
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'ac', label: 'Air Conditioning', icon: AirVent },
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'cafe', label: 'Cafe/Cafeteria', icon: Coffee },
  { id: 'gym', label: 'Gym Access', icon: Dumbbell },
  { id: 'shower', label: 'Shower', icon: ShowerHead },
  { id: 'equipment', label: 'Equipment', icon: Users },
  { id: 'coaching', label: 'Coaching', icon: Users },
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'reviews', label: 'Most Reviewed' },
  { value: 'name', label: 'Name (A-Z)' },
];

interface VenueFilters {
  search: string;
  location: string;
  sport: string;
  environment: string;
  priceRange: [number, number];
  amenities: string[];
  rating: number;
  sort: string;
}

const ITEMS_PER_PAGE = 6;

export default function VenuesPage() {
  const { selectedLocation } = useLocationStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [filters, setFilters] = useState<VenueFilters>({
    search: '',
    location: selectedLocation || 'All Locations',
    sport: 'All Sports',
    environment: 'All',
    priceRange: [0, 2000],
    amenities: [],
    rating: 0,
    sort: 'relevance',
  });

  // Handle filter changes
  const updateFilter = (key: keyof VenueFilters, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      location: 'All Locations',
      sport: 'All Sports',
      environment: 'All',
      priceRange: [0, 2000],
      amenities: [],
      rating: 0,
      sort: 'relevance',
    });
    setCurrentPage(1);
  };

  const toggleAmenity = (amenityId: string) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter((id) => id !== amenityId)
        : [...prev.amenities, amenityId],
    }));
    setCurrentPage(1);
  };

  // Filter and sort venues
  const filteredVenues = useMemo(() => {
    const filtered = mockVenues.filter((venue) => {
      // Search filter
      if (
        filters.search &&
        !venue.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !venue.description.toLowerCase().includes(filters.search.toLowerCase()) &&
        !venue.location.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Location filter
      if (filters.location !== 'All Locations' && venue.city !== filters.location) {
        return false;
      }

      // Sport filter
      if (filters.sport !== 'All Sports' && !venue.sportTypes.includes(filters.sport)) {
        return false;
      }

      // Environment filter
      if (filters.environment !== 'All' && venue.environment !== filters.environment) {
        return false;
      }

      // Price range filter
      if (venue.pricePerHour < filters.priceRange[0] || venue.pricePerHour > filters.priceRange[1]) {
        return false;
      }

      // Rating filter
      if (filters.rating > 0 && venue.rating < filters.rating) {
        return false;
      }

      // Amenities filter
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every((amenity) => {
          return venue.amenities.some(
            (venueAmenity) =>
              venueAmenity.toLowerCase().includes(amenity.toLowerCase()) ||
              (amenity === 'ac' && venueAmenity.toLowerCase().includes('air')) ||
              (amenity === 'cafe' &&
                (venueAmenity.toLowerCase().includes('cafe') || venueAmenity.toLowerCase().includes('cafeteria')))
          );
        });
        if (!hasAllAmenities) return false;
      }

      return true;
    });

    // Sort venues
    switch (filters.sort) {
      case 'price_low':
        filtered.sort((a, b) => a.pricePerHour - b.pricePerHour);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.pricePerHour - a.pricePerHour);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // relevance
        filtered.sort((a, b) => {
          // Featured venues first, then by rating
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.rating - a.rating;
        });
    }

    return filtered;
  }, [filters]);

  // Pagination
  const totalPages = Math.ceil(filteredVenues.length / ITEMS_PER_PAGE);
  const paginatedVenues = filteredVenues.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Filter sidebar component
  const FilterSidebar = ({ className = '' }: { className?: string }) => (
    <div className={cn('space-y-6', className)}>
      <div>
        <h3 className='mb-4 text-lg font-semibold'>Filters</h3>

        {/* Location Filter */}
        <div className='space-y-3'>
          <label className='text-sm font-medium'>Location</label>
          <Select value={filters.location} onValueChange={(value) => updateFilter('location', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOCATION_OPTIONS.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Sport Filter */}
        <div className='space-y-3'>
          <label className='text-sm font-medium'>Sport Type</label>
          <Select value={filters.sport} onValueChange={(value) => updateFilter('sport', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPORTS_OPTIONS.map((sport) => (
                <SelectItem key={sport} value={sport}>
                  {sport}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Environment Filter */}
        <div className='space-y-3'>
          <label className='text-sm font-medium'>Environment</label>
          <Select value={filters.environment} onValueChange={(value) => updateFilter('environment', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ENVIRONMENT_OPTIONS.map((env) => (
                <SelectItem key={env} value={env}>
                  {env}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Price Range */}
        <div className='space-y-3'>
          <label className='text-sm font-medium'>
            Price Range: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}/hr
          </label>
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => updateFilter('priceRange', value)}
            max={2000}
            min={0}
            step={50}
            className='w-full'
          />
        </div>

        <Separator />

        {/* Rating Filter */}
        <div className='space-y-3'>
          <label className='text-sm font-medium'>Minimum Rating</label>
          <div className='flex gap-2'>
            {[0, 3, 4, 4.5].map((rating) => (
              <Button
                key={rating}
                variant={filters.rating === rating ? 'default' : 'outline'}
                size='sm'
                onClick={() => updateFilter('rating', rating)}
                className='flex items-center gap-1'
              >
                <Star className='h-3 w-3' />
                {rating === 0 ? 'Any' : `${rating}+`}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Amenities */}
        <div className='space-y-3'>
          <label className='text-sm font-medium'>Amenities</label>
          <div className='space-y-2'>
            {AMENITIES_OPTIONS.map((amenity) => {
              const IconComponent = amenity.icon;
              return (
                <div key={amenity.id} className='flex items-center space-x-2'>
                  <Checkbox
                    id={amenity.id}
                    checked={filters.amenities.includes(amenity.id)}
                    onCheckedChange={() => toggleAmenity(amenity.id)}
                  />
                  <label htmlFor={amenity.id} className='flex cursor-pointer items-center gap-2 text-sm'>
                    <IconComponent className='h-3 w-3' />
                    {amenity.label}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Clear Filters */}
        <Button variant='outline' onClick={clearAllFilters} className='w-full'>
          Clear All Filters
        </Button>
      </div>
    </div>
  );

  // Venue Card Component
  const VenueCard = ({ venue, isListView = false }: { venue: (typeof mockVenues)[0]; isListView?: boolean }) => (
    <Link href={`/venues/${venue.id}`}>
      <Card
        className={cn(
          'group cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl',
          isListView ? 'flex h-48 flex-row' : ''
        )}
      >
        <div
          className={cn(
            'from-primary/10 to-secondary/10 relative flex items-center justify-center bg-gradient-to-br',
            isListView ? 'w-48 flex-shrink-0' : 'aspect-video'
          )}
        >
          <Image
            src={venue.image}
            alt={venue.name}
            className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling!.classList.remove('hidden');
            }}
          />
          <div className='hidden text-6xl'>🏟️</div>

          <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent' />

          {/* Badges */}
          <div className='absolute top-3 left-3 flex flex-wrap gap-1'>
            {venue.featured && <Badge className='bg-yellow-500 text-xs text-white hover:bg-yellow-600'>Featured</Badge>}
            {venue.verified && <Badge className='bg-green-500 text-xs text-white hover:bg-green-600'>Verified</Badge>}
          </div>

          <div className='absolute top-3 right-3'>
            <Badge variant='secondary' className='bg-white/95 font-semibold backdrop-blur-sm'>
              ₹{venue.pricePerHour}/hr
            </Badge>
          </div>

          <div className='absolute bottom-3 left-3 text-white'>
            <Badge variant='outline' className='border-white/50 text-xs text-white'>
              {venue.environment}
            </Badge>
          </div>
        </div>

        <div className='flex-1'>
          <CardHeader className={isListView ? 'pb-2' : ''}>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <CardTitle
                  className={cn('group-hover:text-primary transition-colors', isListView ? 'text-lg' : 'text-xl')}
                >
                  {venue.name}
                </CardTitle>
                <CardDescription className='mt-1 flex items-center gap-1'>
                  <MapPin className='h-3 w-3' />
                  {venue.shortLocation}
                </CardDescription>
              </div>
              <div className='ml-2 flex items-center gap-1'>
                <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                <span className='text-sm font-semibold'>{venue.rating}</span>
                <span className='text-muted-foreground text-xs'>({venue.reviews})</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className={isListView ? 'pt-0' : ''}>
            <p className={cn('text-muted-foreground mb-3', isListView ? 'line-clamp-2 text-sm' : 'text-sm')}>
              {venue.description}
            </p>

            {/* Sport Types */}
            <div className='mb-3 flex flex-wrap gap-1'>
              {venue.sportTypes.slice(0, isListView ? 2 : 3).map((sport) => (
                <Badge key={sport} variant='outline' className='text-xs'>
                  {sport}
                </Badge>
              ))}
              {venue.sportTypes.length > (isListView ? 2 : 3) && (
                <Badge variant='secondary' className='text-xs'>
                  +{venue.sportTypes.length - (isListView ? 2 : 3)} more
                </Badge>
              )}
            </div>

            {/* Amenities */}
            <div className='mb-4 flex flex-wrap gap-1'>
              {venue.amenities.slice(0, isListView ? 3 : 4).map((amenity) => (
                <Badge key={amenity} variant='secondary' className='bg-muted text-xs'>
                  {amenity}
                </Badge>
              ))}
              {venue.amenities.length > (isListView ? 3 : 4) && (
                <Badge variant='outline' className='text-xs'>
                  +{venue.amenities.length - (isListView ? 3 : 4)}
                </Badge>
              )}
            </div>

            {/* Operating Hours */}
            <div className='text-muted-foreground mb-3 flex items-center gap-2 text-xs'>
              <Clock className='h-3 w-3' />
              {venue.operatingHours}
            </div>

            <Button className='group-hover:bg-primary/90 w-full transition-colors'>View Details & Book</Button>
          </CardContent>
        </div>
      </Card>
    </Link>
  );

  return (
    <AuthGuard requiredRole={UserRole.USER}>
      <div className='bg-background min-h-screen'>
        <UserHeader />

        <div className='container mx-auto px-4 py-6'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-foreground mb-2 text-3xl font-bold'>Sports Venues</h1>
            <p className='text-muted-foreground'>Discover and book the best sports facilities in your area</p>
          </div>

          <div className='flex gap-6'>
            {/* Desktop Sidebar */}
            <div className='hidden w-72 flex-shrink-0 lg:block'>
              <div className='bg-card sticky top-6 rounded-lg border p-6 shadow-sm'>
                <FilterSidebar />
              </div>
            </div>

            {/* Main Content */}
            <div className='flex-1'>
              {/* Search and Controls Bar */}
              <div className='mb-6 space-y-4'>
                <div className='flex flex-col gap-4 sm:flex-row'>
                  <div className='relative flex-1'>
                    <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
                    <Input
                      placeholder='Search venues, sports, or locations...'
                      className='pl-10'
                      value={filters.search}
                      onChange={(e) => updateFilter('search', e.target.value)}
                    />
                  </div>

                  {/* Mobile Filter Button */}
                  <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
                    <SheetTrigger asChild>
                      <Button variant='outline' className='flex items-center gap-2 lg:hidden'>
                        <SlidersHorizontal className='h-4 w-4' />
                        Filters
                        {(filters.amenities.length > 0 ||
                          filters.sport !== 'All Sports' ||
                          filters.location !== 'All Locations') && (
                          <Badge variant='secondary' className='ml-1'>
                            {
                              [
                                ...filters.amenities,
                                ...(filters.sport !== 'All Sports' ? [1] : []),
                                ...(filters.location !== 'All Locations' ? [1] : []),
                              ].length
                            }
                          </Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side='left' className='w-80 overflow-y-auto'>
                      <SheetHeader>
                        <SheetTitle>Filter Venues</SheetTitle>
                        <SheetDescription>Narrow down your search to find the perfect venue</SheetDescription>
                      </SheetHeader>
                      <div className='mt-6'>
                        <FilterSidebar />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                {/* Sort and View Controls */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <Select value={filters.sort} onValueChange={(value) => updateFilter('sort', value)}>
                      <SelectTrigger className='w-48'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SORT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className='text-muted-foreground text-sm'>
                      {filteredVenues.length} venue{filteredVenues.length !== 1 ? 's' : ''} found
                    </div>
                  </div>

                  {/* View Mode Toggle */}
                  <div className='hidden items-center rounded-lg border p-1 sm:flex'>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size='sm'
                      onClick={() => setViewMode('grid')}
                      className='h-8 w-8 p-0'
                    >
                      <Grid3X3 className='h-4 w-4' />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size='sm'
                      onClick={() => setViewMode('list')}
                      className='h-8 w-8 p-0'
                    >
                      <List className='h-4 w-4' />
                    </Button>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(filters.amenities.length > 0 ||
                  filters.sport !== 'All Sports' ||
                  filters.location !== 'All Locations' ||
                  filters.environment !== 'All' ||
                  filters.rating > 0) && (
                  <div className='flex flex-wrap gap-2'>
                    {filters.sport !== 'All Sports' && (
                      <Badge variant='secondary' className='px-2 py-1'>
                        {filters.sport}
                        <X
                          className='ml-1 h-3 w-3 cursor-pointer'
                          onClick={() => updateFilter('sport', 'All Sports')}
                        />
                      </Badge>
                    )}
                    {filters.location !== 'All Locations' && (
                      <Badge variant='secondary' className='px-2 py-1'>
                        {filters.location}
                        <X
                          className='ml-1 h-3 w-3 cursor-pointer'
                          onClick={() => updateFilter('location', 'All Locations')}
                        />
                      </Badge>
                    )}
                    {filters.environment !== 'All' && (
                      <Badge variant='secondary' className='px-2 py-1'>
                        {filters.environment}
                        <X className='ml-1 h-3 w-3 cursor-pointer' onClick={() => updateFilter('environment', 'All')} />
                      </Badge>
                    )}
                    {filters.rating > 0 && (
                      <Badge variant='secondary' className='px-2 py-1'>
                        {filters.rating}+ rating
                        <X className='ml-1 h-3 w-3 cursor-pointer' onClick={() => updateFilter('rating', 0)} />
                      </Badge>
                    )}
                    {filters.amenities.map((amenity) => (
                      <Badge key={amenity} variant='secondary' className='px-2 py-1'>
                        {AMENITIES_OPTIONS.find((a) => a.id === amenity)?.label}
                        <X className='ml-1 h-3 w-3 cursor-pointer' onClick={() => toggleAmenity(amenity)} />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Results */}
              {filteredVenues.length === 0 ? (
                <div className='py-12 text-center'>
                  <div className='mb-4 text-6xl'>🏟️</div>
                  <h3 className='mb-2 text-lg font-semibold'>No venues found</h3>
                  <p className='text-muted-foreground mb-4'>Try adjusting your filters or search terms</p>
                  <Button onClick={clearAllFilters}>Clear All Filters</Button>
                </div>
              ) : (
                <>
                  {/* Venues Grid/List */}
                  <div
                    className={cn(
                      'mb-8 gap-6',
                      viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'space-y-6'
                    )}
                  >
                    {paginatedVenues.map((venue) => (
                      <VenueCard key={venue.id} venue={venue} isListView={viewMode === 'list'} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className='flex items-center justify-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2)
                        .map((page, index, arr) => (
                          <div key={page} className='flex items-center'>
                            {index > 0 && arr[index - 1] !== page - 1 && (
                              <span className='text-muted-foreground px-2'>...</span>
                            )}
                            <Button
                              variant={currentPage === page ? 'default' : 'outline'}
                              size='sm'
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Button>
                          </div>
                        ))}

                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </AuthGuard>
  );
}
