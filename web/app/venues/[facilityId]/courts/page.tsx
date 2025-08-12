'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OwnerService } from '@/services/owner.service';
import type { Court } from '@/types/owner.types';
import { toast } from 'sonner';

export default function FacilityCourtsListPage() {
  const params = useParams<{ facilityId: string }>();
  const facilityId = params?.facilityId as string;
  const [courts, setCourts] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await OwnerService.getCourts({ facilityId, isActive: true, sort: 'name,asc' });
        if (res.data) {
          const items = Array.isArray(res.data.data) ? res.data.data : [];
          setCourts(items as Court[]);
        } else {
          setCourts([]);
        }
      } catch {
        toast.error('Failed to load courts');
      } finally {
        setIsLoading(false);
      }
    };
    if (facilityId) load();
  }, [facilityId]);

  if (isLoading) return <div className='container mx-auto p-6'>Loading...</div>;

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-semibold'>Courts</h1>
        <p className='text-muted-foreground'>Available courts for this facility</p>
      </div>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {courts.map((court) => (
          <Card key={court.id}>
            <CardHeader>
              <CardTitle className='text-base'>{court.name}</CardTitle>
              <CardDescription className='flex items-center justify-between'>
                <Badge variant='outline'>{court.sportType}</Badge>
                <span className='text-sm'>${court.pricePerHour}/hr</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className='w-full'>
                <Link href={`/venues/${facilityId}/courts/${court.id}`}>View & Book</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
        {courts.length === 0 && <p className='text-muted-foreground'>No active courts</p>}
      </div>
    </div>
  );
}
