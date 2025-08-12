'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon } from 'lucide-react';
import { OwnerService } from '@/services/owner.service';
import type { Court } from '@/types/owner.types';
import { toast } from 'sonner';
import { BookingsService } from '@/services/bookings.service';

export default function CourtDetailsPage() {
  const params = useParams<{ facilityId: string; courtId: string }>();
  const courtId = params?.courtId as string;
  const [court, setCourt] = useState<Court | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await OwnerService.getCourt(courtId);
        if (res.data) setCourt(res.data);
      } catch {
        toast.error('Failed to load court');
      } finally {
        setIsLoading(false);
      }
    };
    if (courtId) load();
  }, [courtId]);

  const handleQuickBook = async () => {
    if (!court) return;
    try {
      setIsBooking(true);
      const start = new Date();
      start.setDate(start.getDate() + 1);
      start.setHours(18, 0, 0, 0);
      const end = new Date(start);
      end.setHours(start.getHours() + 1);

      const res = await BookingsService.createBooking({
        courtId: court.id,
        startDatetime: start.toISOString(),
        endDatetime: end.toISOString(),
        paymentMethod: 'cash',
      });

      if (res.data) {
        toast.success('Booking created! Proceed to payment.');
      } else {
        toast.error(res.error?.message || 'Failed to create booking');
      }
    } catch {
      toast.error('Failed to create booking');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) return <div className='container mx-auto p-6'>Loading...</div>;
  if (!court) return <div className='container mx-auto p-6'>Court not found</div>;

  return (
    <div className='container mx-auto p-6'>
      <Card>
        <CardHeader>
          <CardTitle>{court.name}</CardTitle>
          <CardDescription className='flex items-center gap-2'>
            <Badge variant='outline'>{court.sportType}</Badge>
            <span>${court.pricePerHour}/hr</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-muted-foreground mb-4 text-sm'>
            Choose a time slot to book this court. For demo, a quick book creates a 1-hour booking for tomorrow 6 PM.
          </div>
          <Button onClick={handleQuickBook} disabled={isBooking}>
            <CalendarIcon className='mr-2 h-4 w-4' /> {isBooking ? 'Booking...' : 'Quick Book (Tomorrow 6-7 PM)'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
