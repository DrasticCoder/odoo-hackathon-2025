'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';
import { OwnerLayout } from '@/components/OwnerLayout';
import { OwnerService } from '@/services/owner.service';
import { UserRole } from '@/types/auth.type';
import { Facility } from '@/types/owner.types';
import { toast } from 'sonner';
import FacilityForm from '../../form';

interface FacilityFormData {
  name: string;
  description?: string;
  address: string;
  shortLocation?: string;
  about?: string;
  amenities?: Record<string, unknown>;
}

export default function EditFacilityPage() {
  const router = useRouter();
  const params = useParams();
  const facilityId = params.id as string;

  const [facility, setFacility] = useState<Facility | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFacility = async () => {
      try {
        const response = await OwnerService.getFacility(facilityId);
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
    };

    if (facilityId) {
      loadFacility();
    }
  }, [facilityId, router]);

  const handleUpdateFacility = async (data: FacilityFormData) => {
    try {
      const response = await OwnerService.updateFacility(facilityId, data);
      if (response.data) {
        toast.success('Facility updated successfully');
        router.push('/owner/facilities');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update facility';
      toast.error(errorMessage);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <AuthGuard requiredRole={UserRole.OWNER}>
        <OwnerLayout>
          <div className='container mx-auto max-w-4xl p-6'>
            <div className='flex min-h-[400px] items-center justify-center'>
              <div className='text-center'>
                <Loader2 className='text-primary mx-auto mb-4 h-8 w-8 animate-spin' />
                <p className='text-muted-foreground'>Loading facility details...</p>
              </div>
            </div>
          </div>
        </OwnerLayout>
      </AuthGuard>
    );
  }

  if (!facility) {
    return (
      <AuthGuard requiredRole={UserRole.OWNER}>
        <OwnerLayout>
          <div className='container mx-auto max-w-4xl p-6'>
            <div className='py-12 text-center'>
              <h2 className='mb-4 text-2xl font-bold'>Facility Not Found</h2>
              <p className='text-muted-foreground mb-6'>
                The facility you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to edit it.
              </p>
              <Button onClick={handleBack}>Back to Facilities</Button>
            </div>
          </div>
        </OwnerLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole={UserRole.OWNER}>
      <OwnerLayout>
        <div className='container mx-auto max-w-4xl p-6'>
          {/* Header */}
          <div className='mb-6'>
            <div className='mb-4 flex items-center gap-4'>
              <Button variant='ghost' size='sm' onClick={handleBack} className='gap-2'>
                <ArrowLeft className='h-4 w-4' />
                Back to Facilities
              </Button>
            </div>
            <div>
              <h1 className='text-foreground text-3xl font-bold'>Edit Facility</h1>
              <p className='text-muted-foreground'>Update information for {facility.name}</p>
            </div>
          </div>

          {/* Form Container */}
          <Card className='shadow-lg'>
            <CardHeader>
              <CardTitle>Facility Information</CardTitle>
              <CardDescription>
                Update the details below to modify your facility information. All fields marked with * are required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FacilityForm initialData={facility} onSubmit={handleUpdateFacility} />
            </CardContent>
          </Card>
        </div>
      </OwnerLayout>
    </AuthGuard>
  );
}
