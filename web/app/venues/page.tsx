'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import { UserRole } from '@/types/auth.type';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Search, Filter } from 'lucide-react';
import Link from 'next/link';

// Mock data for venues
const mockVenues = [
  {
    id: '1',
    name: 'SportZone Arena',
    description: 'Premium badminton and tennis facility',
    location: 'Koramangala, Bangalore',
    sportTypes: ['Badminton', 'Tennis'],
    pricePerHour: 500,
    rating: 4.5,
    image: '/api/placeholder/300/200',
    amenities: ['Parking', 'Changing Room', 'Water'],
  },
  {
    id: '2',
    name: 'City Sports Complex',
    description: 'Multi-sport facility with modern equipment',
    location: 'Indiranagar, Bangalore',
    sportTypes: ['Basketball', 'Football', 'Cricket'],
    pricePerHour: 800,
    rating: 4.2,
    image: '/api/placeholder/300/200',
    amenities: ['Parking', 'Cafeteria', 'Locker Room'],
  },
  {
    id: '3',
    name: 'Elite Badminton Club',
    description: 'Professional badminton courts',
    location: 'Whitefield, Bangalore',
    sportTypes: ['Badminton'],
    pricePerHour: 600,
    rating: 4.8,
    image: '/api/placeholder/300/200',
    amenities: ['AC', 'Parking', 'Pro Shop'],
  },
];

export default function VenuesPage() {
  return (
    <AuthGuard requiredRole={UserRole.USER}>
      <div className='container mx-auto p-6'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>Sports Venues</h1>
          <p className='mt-2 text-gray-600'>Find and book your favorite sports facilities</p>
        </div>

        {/* Search and Filters */}
        <div className='mb-8 space-y-4'>
          <div className='flex flex-col gap-4 sm:flex-row'>
            <div className='relative flex-1'>
              <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
              <Input placeholder='Search venues...' className='pl-10' />
            </div>
            <Button variant='outline' className='flex items-center gap-2'>
              <Filter className='h-4 w-4' />
              Filters
            </Button>
          </div>

          {/* Quick Filters */}
          <div className='flex flex-wrap gap-2'>
            <Button variant='outline' size='sm'>
              All Sports
            </Button>
            <Button variant='outline' size='sm'>
              Badminton
            </Button>
            <Button variant='outline' size='sm'>
              Tennis
            </Button>
            <Button variant='outline' size='sm'>
              Basketball
            </Button>
            <Button variant='outline' size='sm'>
              Football
            </Button>
          </div>
        </div>

        {/* Venues Grid */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {mockVenues.map((venue) => (
            <Card key={venue.id} className='overflow-hidden transition-shadow hover:shadow-lg'>
              <div className='relative aspect-video bg-gray-200'>
                <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent' />
                <div className='absolute top-4 right-4'>
                  <Badge variant='secondary' className='bg-white/90'>
                    ₹{venue.pricePerHour}/hr
                  </Badge>
                </div>
              </div>

              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div>
                    <CardTitle className='text-lg'>{venue.name}</CardTitle>
                    <CardDescription className='mt-1 flex items-center gap-1'>
                      <MapPin className='h-3 w-3' />
                      {venue.location}
                    </CardDescription>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                    <span className='text-sm font-medium'>{venue.rating}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <p className='mb-3 text-sm text-gray-600'>{venue.description}</p>

                {/* Sport Types */}
                <div className='mb-3 flex flex-wrap gap-1'>
                  {venue.sportTypes.map((sport) => (
                    <Badge key={sport} variant='outline' className='text-xs'>
                      {sport}
                    </Badge>
                  ))}
                </div>

                {/* Amenities */}
                <div className='mb-4 flex flex-wrap gap-1'>
                  {venue.amenities.map((amenity) => (
                    <Badge key={amenity} variant='secondary' className='text-xs'>
                      {amenity}
                    </Badge>
                  ))}
                </div>

                <Button asChild className='w-full'>
                  <Link href={`/venues/${venue.id}`}>View Details & Book</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className='mt-8 text-center'>
          <Button variant='outline'>Load More Venues</Button>
        </div>
      </div>
    </AuthGuard>
  );
}
