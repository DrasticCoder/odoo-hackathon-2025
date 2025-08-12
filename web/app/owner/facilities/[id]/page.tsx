'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, MapPin, Star, Calendar, Users, Loader2, IndianRupee } from 'lucide-react';

import { OwnerService } from '@/services/owner.service';

import { Facility } from '@/types/owner.types';
import { toast } from 'sonner';

export default function FacilityDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const facilityId = params.id as string;

  const [facility, setFacility] = useState<Facility | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadFacility = useCallback(async () => {
    try {
      const response = await OwnerService.getFacility(facilityId);
      console.log(response);
      if (response.data) {
        setFacility(response.data);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load facility';
      toast.error(errorMessage);
      router.push('/owner/facilities');
    } finally {
      setIsLoading(false);
    }
  }, [facilityId, router]);

  useEffect(() => {
    if (facilityId) {
      loadFacility();
    }
  }, [facilityId, loadFacility]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'default';
      case 'PENDING_APPROVAL':
        return 'secondary';
      case 'REJECTED':
        return 'destructive';
      case 'DRAFT':
        return 'outline';
      case 'SUSPENDED':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className='container mx-auto max-w-4xl p-6'>
        <div className='flex min-h-[400px] items-center justify-center'>
          <div className='text-center'>
            <Loader2 className='text-primary mx-auto mb-4 h-8 w-8 animate-spin' />
            <p className='text-muted-foreground'>Loading facility details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className='container mx-auto max-w-4xl p-6'>
        <div className='py-12 text-center'>
          <h2 className='mb-4 text-2xl font-bold'>Facility Not Found</h2>
          <p className='text-muted-foreground mb-6'>
            The facility you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
          </p>
          <Button onClick={() => router.push('/owner/facilities')}>Back to Facilities</Button>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto max-w-4xl p-6'>
      {/* Header */}
      <div className='mb-6'>
        <div className='mb-4 flex items-center gap-4'>
          <Button variant='ghost' size='sm' onClick={() => router.back()} className='gap-2'>
            <ArrowLeft className='h-4 w-4' />
            Back to Facilities
          </Button>
        </div>
        <div className='flex items-start justify-between'>
          <div>
            <h1 className='text-foreground mb-2 text-3xl font-bold'>{facility.name}</h1>
            <div className='text-muted-foreground mb-4 flex items-center gap-2'>
              <MapPin className='h-4 w-4' />
              <span>{facility.address}</span>
            </div>
            <Badge variant={getStatusVariant(facility.status)} className='mb-4'>
              {facility.status.replace('_', ' ')}
            </Badge>
          </div>
          <Button onClick={() => router.push(`/owner/facilities/${facility.id}/edit`)}>
            <Edit className='mr-2 h-4 w-4' />
            Edit Facility
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className='mb-6 grid gap-4 md:grid-cols-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <Calendar className='text-primary h-4 w-4' />
              <div>
                <p className='text-muted-foreground text-sm'>Courts</p>
                <p className='font-semibold'>{facility.courtsCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <IndianRupee className='text-primary h-4 w-4' />
              <div>
                <p className='text-muted-foreground text-sm'>Starting Price</p>
                <p className='font-semibold'>{facility.startingPrice ? `$${facility.startingPrice}/hr` : 'Not set'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <Star className='text-primary h-4 w-4' />
              <div>
                <p className='text-muted-foreground text-sm'>Rating</p>
                <p className='font-semibold'>{facility.avgRating ? facility.avgRating.toFixed(1) : 'No ratings'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <Users className='text-primary h-4 w-4' />
              <div>
                <p className='text-muted-foreground text-sm'>Reviews</p>
                <p className='font-semibold'>{facility.reviewsCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Facility Details */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground'>{facility.description || 'No description provided.'}</p>
          </CardContent>
        </Card>

        {/* Sports Types */}
        <Card>
          <CardHeader>
            <CardTitle>Sports Available</CardTitle>
          </CardHeader>
          <CardContent>
            {facility.sportTypes && facility.sportTypes.length > 0 ? (
              <div className='flex flex-wrap gap-2'>
                {facility.sportTypes.map((sport: string, index: number) => (
                  <Badge key={index} variant='secondary'>
                    {sport}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className='text-muted-foreground'>No sports specified.</p>
            )}
          </CardContent>
        </Card>

        {/* About */}
        {facility.about && (
          <Card className='md:col-span-2'>
            <CardHeader>
              <CardTitle>About This Facility</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground whitespace-pre-wrap'>{facility.about}</p>
            </CardContent>
          </Card>
        )}

        {/* Amenities */}
        <Card className='md:col-span-2'>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            {facility.amenities && Object.keys(facility.amenities).length > 0 ? (
              <div className='grid grid-cols-2 gap-2 md:grid-cols-3'>
                {Object.entries(facility.amenities).map(([amenity, available]) =>
                  available ? (
                    <div key={amenity} className='flex items-center gap-2'>
                      <div className='bg-primary h-2 w-2 rounded-full' />
                      <span className='text-sm'>{amenity}</span>
                    </div>
                  ) : null
                )}
              </div>
            ) : (
              <p className='text-muted-foreground'>No amenities specified.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
