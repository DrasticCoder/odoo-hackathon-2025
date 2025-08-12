'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, IndianRupee } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { OwnerService } from '@/services/owner.service';
import type { Court } from '@/types/owner.types';
import { toast } from 'sonner';
import { BookingsService } from '@/services/bookings.service';
import { useRazorpay } from 'react-razorpay';

export default function CourtDetailsPage() {
  const params = useParams<{ facilityId: string; courtId: string }>();
  const courtId = params?.courtId as string;
  const [court, setCourt] = useState<Court | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1)); // Default to tomorrow
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  console.log(availableSlots);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const { Razorpay } = useRazorpay();
  const router = useRouter();

  // Generate time slots from 10 AM to 5 PM (1-hour slots)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 10; hour < 17; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      slots.push(`${startTime} - ${endTime}`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

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

  // Load booked slots for selected date
  useEffect(() => {
    const loadBookedSlots = async () => {
      if (!court || !selectedDate) return;

      try {
        const mockBookedSlots = ['11:00 - 12:00', '14:00 - 15:00']; //
        setBookedSlots(mockBookedSlots);
        const available = timeSlots.filter((slot) => !mockBookedSlots.includes(slot));
        setAvailableSlots(available);
      } catch (error) {
        console.error('Failed to load availability:', error);
      }
    };

    loadBookedSlots();
  }, [court, selectedDate, timeSlots]);

  // const handleQuickBook = async () => {
  //   if (!court) return;
  //   try {
  //     setIsBooking(true);
  //     const start = new Date();
  //     start.setDate(start.getDate() + 1);
  //     start.setHours(18, 0, 0, 0);
  //     const end = new Date(start);
  //     end.setHours(start.getHours() + 1);

  //     const res = await BookingsService.createBooking({
  //       courtId: court.id,
  //       startDatetime: start.toISOString(),
  //       endDatetime: end.toISOString(),
  //       paymentMethod: 'cash',
  //     });

  //     if (res.data) {
  //       toast.success('Booking created! Proceed to payment.');
  //     } else {
  //       toast.error(res.error?.message || 'Failed to create booking');
  //     }
  //   } catch {
  //     toast.error('Failed to create booking');
  //   } finally {
  //     setIsBooking(false);
  //   }
  // };

  if (isLoading) return <div className='container mx-auto p-6'>Loading...</div>;
  if (!court) return <div className='container mx-auto p-6'>Court not found</div>;

  const handlePayment = async () => {
    if (!court || !selectedTimeSlot || !selectedDate) {
      toast.error('Please select a date and time slot');
      return;
    }

    try {
      setIsBooking(true);

      // Parse the selected time slot
      const [startTimeStr, endTimeStr] = selectedTimeSlot.split(' - ');
      const [startHour, startMinute] = startTimeStr.split(':').map(Number);
      const [endHour, endMinute] = endTimeStr.split(':').map(Number);

      // Create start and end datetime objects
      const start = new Date(selectedDate);
      start.setHours(startHour, startMinute, 0, 0);

      const end = new Date(selectedDate);
      end.setHours(endHour, endMinute, 0, 0);

      const bookingRes = await BookingsService.createBooking({
        courtId: court.id,
        startDatetime: start.toISOString(),
        endDatetime: end.toISOString(),
        paymentMethod: 'razorpay',
      });

      if (!bookingRes.data) {
        toast.error(bookingRes.error?.message || 'Failed to create booking');
        return;
      }

      const amount = court.pricePerHour;

      fetch('/api/new', { method: 'POST', body: JSON.stringify({ amount: amount * 100 }) })
        .then((res) => res.json())
        .then((data) => {
          const options = {
            ...data,
            handler: function () {
              toast.success('Payment successful!');
              // Update booked slots to include the newly booked slot
              setBookedSlots([...bookedSlots, selectedTimeSlot]);
              setSelectedTimeSlot(null);
              setTimeout(() => {
                router.push('/user');
              }, 2000);
            },
            callback_url: location.href,
            cancel_url: location.href,
            name: 'QuickCourt',
          };
          const razorpayInstance = new Razorpay(options);
          razorpayInstance.open();
        });
      setIsBooking(false);
    } catch (error) {
      console.log(error);
      setIsBooking(false);
    }
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Court Details */}
        <div className='lg:col-span-1'>
          <Card>
            <CardHeader>
              <CardTitle>{court.name}</CardTitle>
              <CardDescription className='flex items-center gap-2'>
                <Badge variant='outline'>{court.sportType}</Badge>
                <div className='flex items-center gap-1'>
                  <IndianRupee className='h-3 w-3' />
                  <span>{court.pricePerHour}/hr</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <h4 className='font-medium'>Operating Hours</h4>
                  <div className='text-muted-foreground flex items-center gap-1 text-sm'>
                    <Clock className='h-3 w-3' />
                    <span>10:00 AM - 5:00 PM</span>
                  </div>
                </div>
                {court.facility && (
                  <div>
                    <h4 className='font-medium'>Location</h4>
                    <p className='text-muted-foreground text-sm'>{court.facility.name}</p>
                    {court.facility.shortLocation && (
                      <p className='text-muted-foreground text-sm'>{court.facility.shortLocation}</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Section */}
        <div className='lg:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle>Book This Court</CardTitle>
              <CardDescription>Select a date and time slot for your booking</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Date Selection */}
              <div>
                <h4 className='mb-3 font-medium'>Select Date</h4>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant='outline' className='w-full justify-start text-left font-normal'>
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      mode='single'
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDate(date);
                          setSelectedTimeSlot(null); // Reset time slot when date changes
                        }
                      }}
                      disabled={(date) => date < new Date() || date < addDays(new Date(), 0)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Slot Selection */}
              <div>
                <h4 className='mb-3 font-medium'>Available Time Slots</h4>
                <div className='grid grid-cols-2 gap-2 md:grid-cols-3'>
                  {timeSlots.map((slot) => {
                    const isBooked = bookedSlots.includes(slot);
                    const isSelected = selectedTimeSlot === slot;

                    return (
                      <Button
                        key={slot}
                        variant={isSelected ? 'default' : isBooked ? 'secondary' : 'outline'}
                        size='sm'
                        disabled={isBooked}
                        onClick={() => setSelectedTimeSlot(isSelected ? null : slot)}
                        className={`text-xs ${isBooked ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        {slot}
                        {isBooked && <span className='ml-1 text-xs'>(Booked)</span>}
                      </Button>
                    );
                  })}
                </div>

                {timeSlots.length === bookedSlots.length && (
                  <p className='text-muted-foreground mt-2 text-sm'>No available slots for this date.</p>
                )}
              </div>

              {/* Booking Summary */}
              {selectedTimeSlot && (
                <div className='bg-muted/50 rounded-lg border p-4'>
                  <h4 className='mb-2 font-medium'>Booking Summary</h4>
                  <div className='space-y-1 text-sm'>
                    <div className='flex justify-between'>
                      <span>Date:</span>
                      <span>{format(selectedDate, 'PPP')}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Time:</span>
                      <span>{selectedTimeSlot}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Duration:</span>
                      <span>1 hour</span>
                    </div>
                    <div className='flex justify-between font-medium'>
                      <span>Total:</span>
                      <div className='flex items-center gap-1'>
                        <IndianRupee className='h-3 w-3' />
                        <span>{court.pricePerHour}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Book Button */}
              <Button onClick={handlePayment} disabled={!selectedTimeSlot || isBooking} className='w-full' size='lg'>
                <CalendarIcon className='mr-2 h-4 w-4' />
                {isBooking ? 'Processing...' : selectedTimeSlot ? 'Book & Pay Now' : 'Select Time Slot'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
