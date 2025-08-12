'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/auth/AuthGuard';
import { UserRole } from '@/types/auth.type';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserHeader from '@/components/UserHeader';
import Footer from '@/components/Footer';
import {
  MapPin,
  Star,
  Clock,
  Phone,
  Mail,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  ShowerHead,
  AirVent,
  Users,
  ArrowLeft,
  Calendar,
  Shield,
  Award,
} from 'lucide-react';

// Mock venue data - in real app, this would come from API
const mockVenueDetails = {
  '1': {
    id: '1',
    name: 'SportZone Arena',
    description:
      'Premium badminton and tennis facility with professional courts and top-notch amenities. Our facility features international standard courts with proper lighting and ventilation systems.',
    fullDescription:
      'SportZone Arena is a state-of-the-art sports facility located in the heart of Koramangala. We pride ourselves on providing world-class infrastructure for badminton and tennis enthusiasts. Our facility includes 8 badminton courts and 4 tennis courts, all meeting international standards. We also offer professional coaching services and equipment rental.',
    location: 'Koramangala, Bangalore',
    shortLocation: 'Koramangala',
    city: 'Bangalore',
    address: '123 Sports Complex Road, Koramangala 5th Block, Bangalore - 560095',
    sportTypes: ['Badminton', 'Tennis'],
    environment: 'Indoor',
    pricePerHour: 500,
    priceMin: 400,
    priceMax: 600,
    rating: 4.5,
    reviews: 124,
    images: [
      'https://img.example.com/1.png',
      'https://img.example.com/1-2.png',
      'https://img.example.com/1-3.png',
      'https://img.example.com/1-4.png',
    ],
    amenities: ['Parking', 'Changing Room', 'Water', 'AC', 'Equipment'],
    tags: ['Premium', 'Professional', 'Air Conditioned'],
    availability: 'Available',
    operatingHours: '6:00 AM - 11:00 PM',
    verified: true,
    featured: true,
    contact: {
      phone: '+91 9876543210',
      email: 'info@sportzonearena.com',
    },
    courts: [
      { id: '1', name: 'Badminton Court 1', type: 'Badminton', price: 500 },
      { id: '2', name: 'Badminton Court 2', type: 'Badminton', price: 500 },
      { id: '3', name: 'Tennis Court 1', type: 'Tennis', price: 600 },
      { id: '4', name: 'Tennis Court 2', type: 'Tennis', price: 600 },
    ],
    facilities: [
      'Professional synthetic courts',
      'International standard lighting',
      'Advanced ventilation system',
      'Equipment rental available',
      'Professional coaching',
      'Locker facilities',
      'Refreshment area',
      'Ample parking space',
    ],
    policies: [
      'Advance booking required',
      'Cancellation allowed up to 2 hours before',
      'Non-slip sports shoes mandatory',
      'Outside food not allowed',
      'Equipment rental at additional cost',
    ],
  },
  // Add more venue details as needed
};

const getAmenityIcon = (amenity: string) => {
  const amenityLower = amenity.toLowerCase();
  if (amenityLower.includes('parking') || amenityLower.includes('car')) return Car;
  if (amenityLower.includes('ac') || amenityLower.includes('air')) return AirVent;
  if (amenityLower.includes('wifi')) return Wifi;
  if (amenityLower.includes('cafe') || amenityLower.includes('coffee')) return Coffee;
  if (amenityLower.includes('gym') || amenityLower.includes('fitness')) return Dumbbell;
  if (amenityLower.includes('shower')) return ShowerHead;
  if (amenityLower.includes('equipment') || amenityLower.includes('coaching')) return Users;
  return Users;
};

export default function VenueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const venueId = params.id as string;
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const venue = mockVenueDetails[venueId as keyof typeof mockVenueDetails];

  useEffect(() => {
    if (!venue) {
      router.push('/venues');
    }
  }, [venue, router]);

  if (!venue) {
    return (
      <AuthGuard requiredRole={UserRole.USER}>
        <div className='bg-background flex min-h-screen items-center justify-center'>
          <div className='text-center'>
            <h2 className='mb-2 text-2xl font-bold'>Venue not found</h2>
            <p className='text-muted-foreground mb-4'>The venue you&apos;re looking for doesn&apos;t exist.</p>
            <Link href='/venues'>
              <Button>Back to Venues</Button>
            </Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole={UserRole.USER}>
      <div className='bg-background min-h-screen'>
        <UserHeader />

        <div className='container mx-auto px-4 py-6'>
          {/* Back Button */}
          <div className='mb-6'>
            <Link href='/venues'>
              <Button variant='ghost' className='pl-0'>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back to Venues
              </Button>
            </Link>
          </div>

          {/* Hero Section */}
          <div className='mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2'>
            {/* Image Gallery */}
            <div className='space-y-4'>
              <div className='from-primary/10 to-secondary/10 relative aspect-video overflow-hidden rounded-xl bg-gradient-to-br'>
                <Image
                  src={venue.images[activeImageIndex]}
                  alt={venue.name}
                  className='h-full w-full object-cover'
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling!.classList.remove('hidden');
                  }}
                />
                <div className='flex hidden h-full w-full items-center justify-center text-8xl'>🏟️</div>

                {/* Image Navigation */}
                {venue.images.length > 1 && (
                  <div className='absolute bottom-4 left-1/2 flex -translate-x-1/2 transform gap-2'>
                    {venue.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`h-2 w-2 rounded-full transition-all ${
                          index === activeImageIndex ? 'w-6 bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {venue.images.length > 1 && (
                <div className='grid grid-cols-4 gap-2'>
                  {venue.images.slice(1, 5).map((image, index) => (
                    <div
                      key={index}
                      className='relative aspect-square cursor-pointer overflow-hidden rounded-lg transition-opacity hover:opacity-80'
                      onClick={() => setActiveImageIndex(index + 1)}
                    >
                      <Image
                        src={image}
                        alt={`${venue.name} ${index + 2}`}
                        className='h-full w-full object-cover'
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling!.classList.remove('hidden');
                        }}
                      />
                      <div className='from-primary/20 to-secondary/20 flex hidden h-full w-full items-center justify-center bg-gradient-to-br text-2xl'>
                        🏟️
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Venue Info */}
            <div className='space-y-6'>
              {/* Header */}
              <div>
                <div className='mb-4 flex items-start justify-between'>
                  <div>
                    <h1 className='text-foreground mb-2 text-3xl font-bold'>{venue.name}</h1>
                    <div className='text-muted-foreground mb-2 flex items-center gap-2'>
                      <MapPin className='h-4 w-4' />
                      <span>{venue.location}</span>
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='text-primary text-3xl font-bold'>₹{venue.pricePerHour}</div>
                    <div className='text-muted-foreground text-sm'>per hour</div>
                  </div>
                </div>

                {/* Badges */}
                <div className='mb-4 flex flex-wrap gap-2'>
                  {venue.featured && (
                    <Badge className='bg-yellow-500 hover:bg-yellow-600'>
                      <Award className='mr-1 h-3 w-3' />
                      Featured
                    </Badge>
                  )}
                  {venue.verified && (
                    <Badge className='bg-green-500 hover:bg-green-600'>
                      <Shield className='mr-1 h-3 w-3' />
                      Verified
                    </Badge>
                  )}
                  <Badge variant='outline'>{venue.environment}</Badge>
                </div>

                {/* Rating */}
                <div className='mb-4 flex items-center gap-4'>
                  <div className='flex items-center gap-1'>
                    <Star className='h-5 w-5 fill-yellow-400 text-yellow-400' />
                    <span className='text-lg font-semibold'>{venue.rating}</span>
                    <span className='text-muted-foreground'>({venue.reviews} reviews)</span>
                  </div>
                  <div className='text-muted-foreground flex items-center gap-2'>
                    <Clock className='h-4 w-4' />
                    <span className='text-sm'>{venue.operatingHours}</span>
                  </div>
                </div>

                {/* Description */}
                <p className='text-muted-foreground'>{venue.description}</p>
              </div>

              {/* Sports */}
              <div>
                <h3 className='mb-2 font-semibold'>Available Sports</h3>
                <div className='flex flex-wrap gap-2'>
                  {venue.sportTypes.map((sport) => (
                    <Badge key={sport} variant='secondary' className='px-3 py-1 text-sm'>
                      {sport}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className='mb-2 font-semibold'>Amenities</h3>
                <div className='grid grid-cols-2 gap-3'>
                  {venue.amenities.map((amenity) => {
                    const IconComponent = getAmenityIcon(amenity);
                    return (
                      <div key={amenity} className='flex items-center gap-2'>
                        <IconComponent className='text-primary h-4 w-4' />
                        <span className='text-sm'>{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Contact & Book Button */}
              <div className='space-y-4'>
                <div className='flex gap-4'>
                  <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                    <Phone className='h-4 w-4' />
                    <span>{venue.contact.phone}</span>
                  </div>
                  <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                    <Mail className='h-4 w-4' />
                    <span>{venue.contact.email}</span>
                  </div>
                </div>

                <Button size='lg' className='w-full'>
                  <Calendar className='mr-2 h-4 w-4' />
                  Book Now
                </Button>
              </div>
            </div>
          </div>

          {/* Detailed Information Tabs */}
          <Tabs defaultValue='overview' className='w-full'>
            <TabsList className='grid w-full grid-cols-4'>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='courts'>Courts</TabsTrigger>
              <TabsTrigger value='facilities'>Facilities</TabsTrigger>
              <TabsTrigger value='policies'>Policies</TabsTrigger>
            </TabsList>

            <TabsContent value='overview' className='mt-6'>
              <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                <Card>
                  <CardHeader>
                    <CardTitle>About This Venue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='text-muted-foreground mb-4'>{venue.fullDescription}</p>
                    <div className='space-y-2'>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Environment:</span>
                        <span>{venue.environment}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Price Range:</span>
                        <span>
                          ₹{venue.priceMin} - ₹{venue.priceMax}/hr
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Operating Hours:</span>
                        <span>{venue.operatingHours}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Location & Contact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      <div>
                        <div className='flex items-start gap-2'>
                          <MapPin className='text-primary mt-1 h-4 w-4' />
                          <div>
                            <div className='font-medium'>{venue.address}</div>
                            <div className='text-muted-foreground text-sm'>{venue.city}</div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <Phone className='text-primary h-4 w-4' />
                          <span>{venue.contact.phone}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Mail className='text-primary h-4 w-4' />
                          <span>{venue.contact.email}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value='courts' className='mt-6'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {venue.courts.map((court) => (
                  <Card key={court.id}>
                    <CardHeader>
                      <CardTitle className='text-lg'>{court.name}</CardTitle>
                      <CardDescription>{court.type}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className='flex items-center justify-between'>
                        <span className='text-primary text-2xl font-bold'>₹{court.price}/hr</span>
                        <Button>Book This Court</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value='facilities' className='mt-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Available Facilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {venue.facilities.map((facility, index) => (
                      <div key={index} className='flex items-center gap-3'>
                        <div className='bg-primary h-2 w-2 rounded-full' />
                        <span>{facility}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='policies' className='mt-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Venue Policies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {venue.policies.map((policy, index) => (
                      <div key={index} className='flex items-start gap-3'>
                        <div className='bg-muted-foreground mt-2 h-1.5 w-1.5 rounded-full' />
                        <span className='text-muted-foreground'>{policy}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <Footer />
      </div>
    </AuthGuard>
  );
}
