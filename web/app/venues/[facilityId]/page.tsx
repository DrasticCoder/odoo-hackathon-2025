'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Separator } from '@/components/ui/separator';
import { MapPin, Star, Clock, Users, Wifi, Car, Coffee, Zap, Shield, Phone } from 'lucide-react';
import { OwnerService } from '@/services/owner.service';
import type { Facility, Court } from '@/types/owner.types';
import { toast } from 'sonner';

export default function FacilityDetailsPage() {
  const params = useParams<{ facilityId: string }>();
  const facilityId = params?.facilityId as string;
  const [facility, setFacility] = useState<Facility | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await OwnerService.getFacility(facilityId, 'courts,photos');
        if (res.data) {
          setFacility(res.data);
          setCourts(res.data.courts || []);
        }
      } catch {
        toast.error('Failed to load facility');
      } finally {
        setIsLoading(false);
      }
    };
    if (facilityId) load();
  }, [facilityId]);

  if (isLoading) {
    return <div className='container mx-auto p-6'>Loading...</div>;
  }

  if (!facility) {
    return <div className='container mx-auto p-6'>Facility not found</div>;
  }

  const amenityIcons: { [key: string]: React.ElementType } = {
    parking: Car,
    wifi: Wifi,
    cafeteria: Coffee,
    'changing room': Users,
    ac: Zap,
    security: Shield,
    'pro shop': Coffee,
    locker: Users,
  };

  const getAmenityIcon = (amenity: string) => {
    const key = amenity.toLowerCase();
    return amenityIcons[key] || Coffee;
  };

  return (
    <div className='container mx-auto space-y-6 p-6'>
      {/* Hero Section */}
      <div className='space-y-4'>
        <div className='flex items-start justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>{facility.name}</h1>
            <div className='text-muted-foreground mt-2 flex items-center gap-4'>
              <div className='flex items-center gap-1'>
                <MapPin className='h-4 w-4' />
                <span>{facility.shortLocation || facility.address}</span>
              </div>
              {facility.avgRating && (
                <div className='flex items-center gap-1'>
                  <Star className='fill-primary text-primary h-4 w-4' />
                  <span>{facility.avgRating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
          {facility.startingPrice && (
            <div className='text-right'>
              <div className='text-primary text-2xl font-bold'>₹{facility.startingPrice}/hr</div>
              <div className='text-muted-foreground text-sm'>Starting from</div>
            </div>
          )}
        </div>

        {/* Photo Gallery */}
        {facility.photoUrls && facility.photoUrls.length > 0 && (
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div className='md:col-span-2'>
              <AspectRatio ratio={16 / 10}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={facility.photoUrls[0]}
                  alt={facility.name}
                  className='h-full w-full rounded-lg object-cover'
                />
              </AspectRatio>
            </div>
            <div className='grid grid-cols-2 gap-2 md:grid-cols-1'>
              {facility.photoUrls.slice(1, 3).map((url, index) => (
                <AspectRatio key={index} ratio={16 / 10}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`${facility.name} ${index + 2}`}
                    className='h-full w-full rounded-lg object-cover'
                  />
                </AspectRatio>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Main Content */}
        <div className='space-y-6 lg:col-span-2'>
          {/* About Section */}
          {facility.description && (
            <Card>
              <CardHeader>
                <CardTitle>About This Facility</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground leading-relaxed'>{facility.description}</p>
                {facility.about && (
                  <>
                    <Separator className='my-4' />
                    <p className='text-muted-foreground leading-relaxed'>{facility.about}</p>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Sports Available */}
          {facility.sportTypes && facility.sportTypes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sports Available</CardTitle>
                <CardDescription>Choose from various sports activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap gap-2'>
                  {facility.sportTypes.map((sport) => (
                    <Badge key={sport} variant='secondary' className='px-3 py-1'>
                      {sport}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Amenities */}
          {facility.amenities && Object.keys(facility.amenities).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
                <CardDescription>Facilities and services available</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
                  {Object.entries(facility.amenities).map(([key, value]) => {
                    if (value) {
                      const IconComponent = getAmenityIcon(key);
                      return (
                        <div key={key} className='flex items-center gap-2'>
                          <IconComponent className='text-primary h-4 w-4' />
                          <span className='capitalize'>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Users className='text-muted-foreground h-4 w-4' />
                <span className='text-sm'>
                  {facility.courtsCount} Court{facility.courtsCount !== 1 ? 's' : ''} Available
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Clock className='text-muted-foreground h-4 w-4' />
                <span className='text-sm'>Open Daily 6:00 AM - 11:00 PM</span>
              </div>
              <div className='flex items-center gap-2'>
                <Phone className='text-muted-foreground h-4 w-4' />
                <span className='text-sm'>+91 98765 43210</span>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground mb-4 text-sm'>{facility.address}</p>
              <div className='bg-muted flex h-32 w-full items-center justify-center rounded-lg'>
                <span className='text-muted-foreground text-sm'>Map View</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Courts Section */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Available Courts</CardTitle>
              <CardDescription>Select a court to see details and book</CardDescription>
            </div>
            <Button asChild variant='outline'>
              <Link href={`/venues/${facilityId}/courts`}>View All Courts</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {courts.slice(0, 6).map((court) => (
              <Card key={court.id} className='border-muted-foreground/20 transition-shadow hover:shadow-md'>
                <CardHeader>
                  <CardTitle className='text-base'>{court.name}</CardTitle>
                  <CardDescription className='flex items-center justify-between'>
                    <Badge variant='outline'>{court.sportType}</Badge>
                    <span className='text-primary text-sm font-semibold'>₹{court.pricePerHour}/hr</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className='w-full'>
                    <Link href={`/venues/${facilityId}/courts/${court.id}`}>View & Book</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
            {courts.length === 0 && (
              <div className='col-span-full py-8 text-center'>
                <p className='text-muted-foreground'>No active courts available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
