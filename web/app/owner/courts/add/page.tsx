'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { OwnerService } from '@/services/owner.service';
import { Facility } from '@/types/owner.types';
import { toast } from 'sonner';
import CourtForm from '../form';

interface CourtFormData {
  name: string;
  sportType: string;
  pricePerHour: number;
  operatingHours?: Record<string, unknown>;
}

export default function AddCourtPage() {
  const router = useRouter();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFacilities = async () => {
      try {
        const response = await OwnerService.getFacilities({
          sort: 'name,asc',
        });
        if (response.data) {
          setFacilities(response.data.data);
        }
      } catch (error) {
        toast.error('Failed to load facilities');
        console.error('Facilities error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFacilities();
  }, []);

  const handleCreateCourt = async (facilityId: string, data: CourtFormData) => {
    try {
      const response = await OwnerService.createCourt(facilityId, data);
      if (response.data) {
        toast.success('Court created successfully');
        router.push('/owner/courts');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create court';
      toast.error(errorMessage);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className='container mx-auto max-w-4xl p-6'>
        <div className='flex min-h-[400px] items-center justify-center'>
          <div className='text-center'>
            <div className='text-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent' />
            <p className='text-muted-foreground'>Loading facilities...</p>
          </div>
        </div>
      </div>
    );
  }

  if (facilities.length === 0) {
    return (
      <div className='container mx-auto max-w-4xl p-6'>
        <div className='py-12 text-center'>
          <h2 className='mb-4 text-2xl font-bold'>No Facilities Found</h2>
          <p className='text-muted-foreground mb-6'>
            You need to create at least one approved facility before adding courts.
          </p>
          <Button onClick={() => router.push('/owner/facilities/add')}>Create Facility</Button>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto max-w-4xl p-6'>
      {/* Header */}
      <div className='mb-6'>
        <div className='mb-4 flex items-center gap-4'>
          <Button variant='ghost' size='sm' onClick={handleBack} className='gap-2'>
            <ArrowLeft className='h-4 w-4' />
            Back to Courts
          </Button>
        </div>
        <div>
          <h1 className='text-foreground text-3xl font-bold'>Add New Court</h1>
          <p className='text-muted-foreground'>Create a new court for one of your facilities</p>
        </div>
      </div>

      {/* Form Container */}
      <Card className='shadow-lg'>
        <CardHeader>
          <CardTitle>Court Information</CardTitle>
          <CardDescription>
            Fill in the details below to add a new court to your facility. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CourtForm facilities={facilities} onSubmit={handleCreateCourt} />
        </CardContent>
      </Card>
    </div>
  );
}
