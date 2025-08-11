'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Calendar as CalendarIcon, Filter, X, User, Clock, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import AuthGuard from '@/components/auth/AuthGuard';
import { OwnerLayout } from '@/components/OwnerLayout';
import { OwnerService } from '@/services/owner.service';
import { Booking, Facility, BookingQuery } from '@/types/owner.types';
import { UserRole } from '@/types/auth.type';
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
        currentPage === 1 ? OwnerService.getFacilities({ status: 'APPROVED' }) : Promise.resolve({ data: null }),
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <AuthGuard requiredRole={UserRole.OWNER}>
        <OwnerLayout>
          <div className='container mx-auto p-6'>
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
        </OwnerLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole={UserRole.OWNER}>
      <OwnerLayout>
        <div className='container mx-auto p-6'>
          {/* Header */}
          <div className='mb-6'>
            <h1 className='text-foreground text-3xl font-bold'>Booking Overview</h1>
            <p className='text-muted-foreground'>View and manage all bookings across your facilities</p>
          </div>

          {/* Filters */}
          <Card className='mb-6'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='flex items-center gap-2'>
                  <Filter className='h-5 w-5' />
                  Filters
                </CardTitle>
                {hasActiveFilters && (
                  <Button variant='outline' size='sm' onClick={clearFilters}>
                    <X className='mr-1 h-4 w-4' />
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-5'>
                {/* Search */}
                <div className='relative'>
                  <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
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
                  <PopoverContent className='w-auto p-0'>
                    <Calendar mode='single' selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                  </PopoverContent>
                </Popover>

                {/* Search Button */}
                <Button
                  onClick={() => {
                    setCurrentPage(1);
                    loadData();
                  }}
                >
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bookings List */}
          {bookings.length === 0 ? (
            <Card>
              <CardContent className='py-12 text-center'>
                <div className='mb-4 text-gray-400'>
                  <CalendarIcon className='mx-auto h-12 w-12' />
                </div>
                <h3 className='mb-2 text-lg font-medium text-gray-900'>No bookings found</h3>
                <p className='text-gray-500'>
                  {hasActiveFilters ? 'No bookings match your current filters.' : 'No bookings have been made yet.'}
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
                  <Card key={booking.id} className='transition-shadow hover:shadow-md'>
                    <CardContent className='p-6'>
                      <div className='flex items-center justify-between'>
                        <div className='flex-1 space-y-2'>
                          {/* Header */}
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-3'>
                              <div className='flex items-center gap-2'>
                                <User className='h-4 w-4 text-gray-400' />
                                <span className='font-medium'>{booking.user?.name || 'Unknown User'}</span>
                              </div>
                              <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                            </div>
                            <div className='flex items-center gap-2'>
                              <DollarSign className='h-4 w-4 text-gray-400' />
                              <span className='font-medium'>{formatCurrency(booking.totalPrice)}</span>
                            </div>
                          </div>

                          {/* Details */}
                          <div className='grid grid-cols-1 gap-4 text-sm md:grid-cols-3'>
                            <div>
                              <span className='text-gray-500'>Facility:</span>
                              <div className='font-medium'>{booking.facility?.name}</div>
                            </div>
                            <div>
                              <span className='text-gray-500'>Court:</span>
                              <div className='font-medium'>
                                {booking.court?.name} ({booking.court?.sportType})
                              </div>
                            </div>
                            <div>
                              <span className='text-gray-500'>Contact:</span>
                              <div className='font-medium'>{booking.user?.email}</div>
                            </div>
                          </div>

                          {/* Time */}
                          <div className='flex items-center gap-4 text-sm'>
                            <div className='flex items-center gap-2'>
                              <Clock className='h-4 w-4 text-gray-400' />
                              <span>{startTime.date}</span>
                            </div>
                            <div>
                              {startTime.time} - {endTime.time}
                            </div>
                            {booking.txnReference && <div className='text-gray-500'>Ref: {booking.txnReference}</div>}
                          </div>
                        </div>

                        {/* Actions */}
                        {canCancel && isFuture && (
                          <div className='ml-4'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleCancelBooking(booking)}
                              className='text-red-600 hover:text-red-700'
                            >
                              Cancel
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
            <div className='mt-6 flex items-center justify-between'>
              <div className='text-sm text-gray-500'>
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
      </OwnerLayout>
    </AuthGuard>
  );
}
