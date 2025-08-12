'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { OwnerService } from '@/services/owner.service';
import { Court, Facility } from '@/types/owner.types';
import { toast } from 'sonner';
import CourtForm from '../../form';

interface CourtFormData {
  name?: string;
  sportType?: string;
  pricePerHour?: number;
  isActive?: boolean;
  operatingHours?: Record<string, unknown>;
}

export default function EditCourtPage() {
  const router = useRouter();
  const params = useParams();
  const courtId = params.id as string;

  const [court, setCourt] = useState<Court | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [courtResponse, facilitiesResponse] = await Promise.all([
          OwnerService.getCourt(courtId, 'facility'),
          OwnerService.getFacilities({
            sort: 'name,asc',
          }),
        ]);

        if (courtResponse.data) {
          setCourt(courtResponse.data);
        } else {
          toast.error('Court not found');
          router.push('/owner/courts');
          return;
        }

        if (facilitiesResponse.data) {
          setFacilities(facilitiesResponse.data.data);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load court details';
        toast.error(errorMessage);
        router.push('/owner/courts');
      } finally {
        setIsLoading(false);
      }
    };

    if (courtId) {
      loadData();
    }
  }, [courtId, router]);

  const handleUpdateCourt = async (_facilityId: string, data: CourtFormData) => {
    try {
      const response = await OwnerService.updateCourt(courtId, data);
      if (response.data) {
        toast.success('Court updated successfully');
        router.push('/owner/courts');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update court';
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
            <Loader2 className='text-primary mx-auto mb-4 h-8 w-8 animate-spin' />
            <p className='text-muted-foreground'>Loading court details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!court) {
    return (
      <div className='container mx-auto max-w-4xl p-6'>
        <div className='py-12 text-center'>
          <h2 className='mb-4 text-2xl font-bold'>Court Not Found</h2>
          <p className='text-muted-foreground mb-6'>
            The court you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to edit it.
          </p>
          <Button onClick={handleBack}>Back to Courts</Button>
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
          <h1 className='text-foreground text-3xl font-bold'>Edit Court</h1>
          <p className='text-muted-foreground'>Update information for {court.name}</p>
        </div>
      </div>

      {/* Form Container */}
      <Card className='shadow-lg'>
        <CardHeader>
          <CardTitle>Court Information</CardTitle>
          <CardDescription>
            Update the details below to modify your court information. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CourtForm initialData={court} facilities={facilities} onSubmit={handleUpdateCourt} isEdit />
        </CardContent>
      </Card>
    </div>
  );
}
