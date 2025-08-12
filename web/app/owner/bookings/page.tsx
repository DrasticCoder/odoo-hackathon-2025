'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Calendar as CalendarIcon, Filter, X, User, Clock, Building2, MapPin, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';

import { OwnerService } from '@/services/owner.service';
import { Booking, Facility, BookingQuery } from '@/types/owner.types';

import { toast } from 'sonner';

export default function BookingOverviewPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: BookingQuery = {
        page: currentPage,
        limit: 20,
        include: 'user,court,facility',
        sort: 'startDatetime,desc',
      };

      if (selectedFacility !== 'all') {
        params.facilityId = selectedFacility;
      }
      if (selectedStatus !== 'all') {
        params.status = selectedStatus as 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'FAILED';
      }
      if (selectedDate) {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        params.startDate = dateStr;
        params.endDate = dateStr;
      }
      if (searchQuery) {
        params.q = searchQuery;
      }

      const [bookingsResponse, facilitiesResponse] = await Promise.all([
        OwnerService.getBookings(params),
        currentPage === 1 ? OwnerService.getFacilities({}) : Promise.resolve({ data: null }),
      ]);

      if (bookingsResponse.data) {
        setBookings(bookingsResponse.data.data);
        setTotalPages(Math.ceil(bookingsResponse.data.meta.total / 20));
      }
      if (facilitiesResponse.data) {
        setFacilities(facilitiesResponse.data.data);
      }
    } catch (error) {
      toast.error('Failed to load bookings');
      console.error('Bookings error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedFacility, selectedStatus, selectedDate, searchQuery]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load data when filters change
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCancelBooking = async (booking: Booking) => {
    if (!confirm(`Are you sure you want to cancel this booking for ${booking.user?.name}?`)) return;

    try {
      await OwnerService.cancelBooking(booking.id, 'Cancelled by facility owner');
      toast.success('Booking cancelled successfully');
      loadData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel booking';
      toast.error(errorMessage);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'completed':
        return 'outline';
      case 'failed':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: format(date, 'MMM dd, yyyy'),
      time: format(date, 'HH:mm'),
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const clearFilters = () => {
    setSelectedFacility('all');
    setSelectedStatus('all');
    setSelectedDate(undefined);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedFacility !== 'all' || selectedStatus !== 'all' || selectedDate || searchQuery;

  if (isLoading && currentPage === 1) {
    return (
      <div className='container mx-auto p-6'>
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div className='space-y-2'>
              <div className='bg-muted h-8 w-64 animate-pulse rounded'></div>
              <div className='bg-muted h-4 w-96 animate-pulse rounded'></div>
            </div>
            <div className='bg-muted h-10 w-32 animate-pulse rounded'></div>
          </div>

          <Card>
            <CardHeader>
              <div className='bg-muted h-6 w-48 animate-pulse rounded'></div>
              <div className='bg-muted h-4 w-72 animate-pulse rounded'></div>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className='bg-muted h-10 animate-pulse rounded'></div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className='space-y-4'>
            {[...Array(5)].map((_, i) => (
              <Card key={i} className='animate-pulse'>
                <CardContent className='p-6'>
                  <div className='space-y-3'>
                    <div className='bg-muted h-4 w-1/4 rounded'></div>
                    <div className='bg-muted h-3 w-1/2 rounded'></div>
                    <div className='bg-muted h-3 w-1/3 rounded'></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6'>
      {/* Header */}
      <div className='mb-8 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Booking Overview</h1>
          <p className='text-muted-foreground mt-2'>View and manage all bookings across your facilities</p>
        </div>
        <Button variant='outline' onClick={() => window.location.reload()}>
          <CalendarIcon className='mr-2 h-4 w-4' />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className='mb-6'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <Filter className='h-5 w-5' />
                Search & Filter Bookings
              </CardTitle>
              <CardDescription>Find and filter bookings across your facilities</CardDescription>
            </div>
            {hasActiveFilters && (
              <Button variant='outline' size='sm' onClick={clearFilters}>
                <X className='mr-2 h-4 w-4' />
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {/* Search */}
            <div className='relative'>
              <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
              <Input
                placeholder='Search bookings...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>

            {/* Facility Filter */}
            <Select value={selectedFacility} onValueChange={setSelectedFacility}>
              <SelectTrigger>
                <SelectValue placeholder='All Facilities' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Facilities</SelectItem>
                {facilities.map((facility) => (
                  <SelectItem key={facility.id} value={facility.id}>
                    {facility.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder='All Statuses' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Statuses</SelectItem>
                <SelectItem value='PENDING'>Pending</SelectItem>
                <SelectItem value='CONFIRMED'>Confirmed</SelectItem>
                <SelectItem value='COMPLETED'>Completed</SelectItem>
                <SelectItem value='CANCELLED'>Cancelled</SelectItem>
                <SelectItem value='FAILED'>Failed</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant='outline' className='justify-start text-left font-normal'>
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {selectedDate ? format(selectedDate, 'PPP') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar mode='single' selected={selectedDate} onSelect={setSelectedDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          {/* Results Count */}
          <div className='mt-4 flex items-center justify-between'>
            <div className='text-muted-foreground text-sm'>
              {bookings.length} booking{bookings.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <Card>
          <CardContent className='py-16 text-center'>
            <div className='text-muted-foreground mb-4'>
              <CalendarIcon className='mx-auto h-16 w-16' />
            </div>
            <h3 className='mb-2 text-xl font-semibold'>No bookings found</h3>
            <p className='text-muted-foreground mx-auto max-w-md'>
              {hasActiveFilters
                ? 'No bookings match your current filters. Try adjusting your search criteria.'
                : 'No bookings have been made yet. Bookings will appear here once customers start booking your facilities.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-4'>
          {bookings.map((booking) => {
            const startTime = formatDateTime(booking.startDatetime);
            const endTime = formatDateTime(booking.endDatetime);
            const canCancel = booking.status === 'PENDING' || booking.status === 'CONFIRMED';
            const isFuture = new Date(booking.startDatetime) > new Date();

            return (
              <Card key={booking.id} className='transition-all hover:shadow-md'>
                <CardContent className='p-6'>
                  <div className='flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0'>
                    {/* Main Content */}
                    <div className='flex-1 space-y-4'>
                      {/* Header Row */}
                      <div className='flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
                        <div className='flex items-center gap-3'>
                          <div className='flex items-center gap-2'>
                            <User className='text-muted-foreground h-4 w-4' />
                            <span className='font-medium'>{booking.user?.name || 'Unknown User'}</span>
                          </div>
                          <Badge variant={getStatusVariant(booking.status)} className='capitalize'>
                            {booking.status.toLowerCase()}
                          </Badge>
                        </div>
                        <div className='flex items-center gap-2'>
                          <IndianRupee className='text-muted-foreground h-4 w-4' />
                          <span className='text-lg font-semibold'>{formatCurrency(booking.totalPrice)}</span>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className='grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3'>
                        <div className='flex items-center gap-2'>
                          <Building2 className='text-muted-foreground h-4 w-4' />
                          <div>
                            <div className='font-medium'>{booking.facility?.name}</div>
                            <div className='text-muted-foreground'>
                              {booking.court?.name} ({booking.court?.sportType})
                            </div>
                          </div>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Clock className='text-muted-foreground h-4 w-4' />
                          <div>
                            <div className='font-medium'>{startTime.date}</div>
                            <div className='text-muted-foreground'>
                              {startTime.time} - {endTime.time}
                            </div>
                          </div>
                        </div>
                        <div className='flex items-center gap-2'>
                          <MapPin className='text-muted-foreground h-4 w-4' />
                          <div>
                            <div className='font-medium'>Contact</div>
                            <div className='text-muted-foreground'>{booking.user?.email}</div>
                          </div>
                        </div>
                      </div>

                      {/* Transaction Reference */}
                      {booking.txnReference && (
                        <div className='text-muted-foreground text-sm'>Transaction Ref: {booking.txnReference}</div>
                      )}
                    </div>

                    {/* Actions */}
                    {canCancel && isFuture && (
                      <div className='flex justify-end lg:ml-4'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleCancelBooking(booking)}
                          className='border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700'
                        >
                          Cancel Booking
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='mt-8 flex items-center justify-between'>
          <div className='text-muted-foreground text-sm'>
            Page {currentPage} of {totalPages}
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isLoading}
            >
              Previous
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
