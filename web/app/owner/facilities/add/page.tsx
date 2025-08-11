'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';
import { OwnerLayout } from '@/components/OwnerLayout';
import { OwnerService } from '@/services/owner.service';
import { UserRole } from '@/types/auth.type';
import { toast } from 'sonner';
import FacilityForm from '../form';

interface FacilityFormData {
  name: string;
  description?: string;
  address: string;
  shortLocation?: string;
  about?: string;
  amenities?: Record<string, unknown>;
}

export default function AddFacilityPage() {
  const router = useRouter();

  const handleCreateFacility = async (data: FacilityFormData) => {
    try {
      const response = await OwnerService.createFacility(data);
      if (response.data) {
        toast.success('Facility created successfully');
        router.push('/owner/facilities');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create facility';
      toast.error(errorMessage);
    }
  };

  const handleBack = () => {
    router.back();
  };

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
              <h1 className='text-foreground text-3xl font-bold'>Add New Facility</h1>
              <p className='text-muted-foreground'>Create a new sports facility for your business</p>
            </div>
          </div>

          {/* Form Container */}
          <Card className='shadow-lg'>
            <CardHeader>
              <CardTitle>Facility Information</CardTitle>
              <CardDescription>
                Fill in the details below to add a new facility to your portfolio. All fields marked with * are
                required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FacilityForm onSubmit={handleCreateFacility} />
            </CardContent>
          </Card>
        </div>
      </OwnerLayout>
    </AuthGuard>
  );
}
