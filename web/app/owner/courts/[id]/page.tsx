'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Clock, Building2, ToggleLeft, ToggleRight, Loader2, IndianRupee } from 'lucide-react';
import { OwnerService } from '@/services/owner.service';
import { Court } from '@/types/owner.types';
import { toast } from 'sonner';
import { DeleteCourtButton } from '../delete';

export default function CourtDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courtId = params.id as string;

  const [court, setCourt] = useState<Court | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCourt = async () => {
      try {
        const response = await OwnerService.getCourt(courtId, 'facility,photos,counts');
        if (response.data) {
          setCourt(response.data);
        } else {
          toast.error('Court not found');
          router.push('/owner/courts');
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
      loadCourt();
    }
  }, [courtId, router]);

  const handleToggleStatus = async () => {
    if (!court) return;

    try {
      const response = await OwnerService.updateCourt(court.id, {
        isActive: !court.isActive,
      });
      if (response.data) {
        setCourt(response.data);
        toast.success(`Court ${court.isActive ? 'deactivated' : 'activated'} successfully`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update court status';
      toast.error(errorMessage);
    }
  };

  const handleDeleteCourt = async (courtToDelete: Court) => {
    try {
      const response = await OwnerService.deleteCourt(courtToDelete.id);
      if (response.error) {
        toast.error(response.error.message);
        return;
      }
      toast.success('Court deleted successfully');
      router.push('/owner/courts');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete court';
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
            The court you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
          </p>
          <Button onClick={handleBack}>Back to Courts</Button>
        </div>
      </div>
    );
  }

  const operatingHours = court.operatingHours as Record<
    string,
    { open: string; close: string; isOpen: boolean }
  > | null;

  return (
    <>
      <div className='container mx-auto max-w-4xl p-6'>
        {/* Header */}
        <div className='mb-6'>
          <div className='mb-4 flex items-center gap-4'>
            <Button variant='ghost' size='sm' onClick={handleBack} className='gap-2'>
              <ArrowLeft className='h-4 w-4' />
              Back to Courts
            </Button>
          </div>
          <div className='flex items-start justify-between'>
            <div>
              <h1 className='text-foreground text-3xl font-bold'>{court.name}</h1>
              <p className='text-muted-foreground'>{court.facility?.name}</p>
            </div>
            <div className='flex items-center gap-2'>
              <Badge variant={court.isActive ? 'default' : 'secondary'}>{court.isActive ? 'Active' : 'Inactive'}</Badge>
              <Button variant='ghost' size='sm' onClick={handleToggleStatus} className='h-8 w-8 p-0'>
                {court.isActive ? (
                  <ToggleRight className='h-4 w-4 text-green-500' />
                ) : (
                  <ToggleLeft className='text-muted-foreground h-4 w-4' />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className='grid gap-6 lg:grid-cols-3'>
          {/* Main Information */}
          <div className='space-y-6 lg:col-span-2'>
            {/* Basic Details */}
            <Card>
              <CardHeader>
                <CardTitle>Court Details</CardTitle>
                <CardDescription>Basic information about this court</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-muted-foreground text-sm font-medium'>Sport Type</Label>
                    <div className='mt-1'>
                      <Badge variant='outline'>{court.sportType}</Badge>
                    </div>
                  </div>
                  <div>
                    <Label className='text-muted-foreground text-sm font-medium'>Price per Hour</Label>
                    <div className='mt-1 flex items-center gap-1'>
                      <IndianRupee className='text-muted-foreground h-4 w-4' />
                      <span className='font-medium'>{court.pricePerHour}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className='text-muted-foreground text-sm font-medium'>Facility</Label>
                  <div className='mt-1 flex items-center gap-1'>
                    <Building2 className='text-muted-foreground h-4 w-4' />
                    <span>{court.facility?.name}</span>
                    {court.facility?.shortLocation && (
                      <span className='text-muted-foreground text-sm'>• {court.facility.shortLocation}</span>
                    )}
                  </div>
                </div>

                {court.bookingsCount !== undefined && (
                  <div>
                    <Label className='text-muted-foreground text-sm font-medium'>Total Bookings</Label>
                    <div className='mt-1'>
                      <span className='font-medium'>{court.bookingsCount}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Operating Hours */}
            {operatingHours && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Clock className='h-5 w-5' />
                    Operating Hours
                  </CardTitle>
                  <CardDescription>Custom operating hours for this court</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {Object.entries(operatingHours).map(([day, hours]) => (
                      <div key={day} className='flex items-center justify-between'>
                        <span className='font-medium capitalize'>{day}</span>
                        {hours.isOpen ? (
                          <span className='text-muted-foreground text-sm'>
                            {hours.open} - {hours.close}
                          </span>
                        ) : (
                          <span className='text-muted-foreground text-sm'>Closed</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Actions Sidebar */}
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Manage this court</CardDescription>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Button className='w-full' onClick={() => router.push(`/owner/courts/${court.id}/edit`)}>
                  <Edit className='mr-2 h-4 w-4' />
                  Edit Court
                </Button>

                <Button variant='outline' className='w-full' onClick={handleToggleStatus}>
                  {court.isActive ? (
                    <>
                      <ToggleLeft className='mr-2 h-4 w-4' />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <ToggleRight className='mr-2 h-4 w-4' />
                      Activate
                    </>
                  )}
                </Button>

                <DeleteCourtButton
                  court={court}
                  onDelete={handleDeleteCourt}
                  variant='destructive'
                  className='w-full'
                />
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground text-sm'>Status</span>
                  <span className='text-sm font-medium'>{court.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground text-sm'>Created</span>
                  <span className='text-sm font-medium'>{new Date(court.createdAt).toLocaleDateString()}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground text-sm'>Last Updated</span>
                  <span className='text-sm font-medium'>{new Date(court.updatedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={className}>{children}</div>;
}
