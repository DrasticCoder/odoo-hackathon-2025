'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Clock, AlertTriangle, Trash2, Edit, Calendar as CalendarIcon } from 'lucide-react';
import { format, addDays, startOfDay, endOfDay } from 'date-fns';

import { OwnerService } from '@/services/owner.service';
import { AvailabilitySlot, Court, Facility } from '@/types/owner.types';

import { toast } from 'sonner';
import AvailabilitySlotForm from '@/components/owner/AvailabilitySlotForm';

export default function AvailabilityManagementPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCourts, setIsLoadingCourts] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<string>('');
  const [selectedCourt, setSelectedCourt] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [,] = useState<string[]>([]);
  const [,] = useState(false);
  const [,] = useState<'calendar' | 'list'>('calendar');

  const loadFacilities = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await OwnerService.getFacilities({
        sort: 'name,asc',
      });

      if (response.data) {
        setFacilities(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedFacility(response.data.data[0].id);
        }
      }
    } catch (error) {
      toast.error('Failed to load facilities');
      console.error('Facilities error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadCourts = useCallback(async () => {
    if (!selectedFacility) {
      console.log('No selected facility, skipping courts load');
      return;
    }

    console.log('Loading courts for facility:', selectedFacility);
    setIsLoadingCourts(true);
    try {
      const params = {
        facilityId: selectedFacility,
        isActive: true,
        sort: 'name,asc',
      };
      console.log('Courts API params:', params);

      const response = await OwnerService.getCourts(params);
      console.log('Courts API response:', response);

      if (response.data) {
        console.log('Courts loaded:', response.data.data);
        setCourts(response.data.data);
        if (response.data.data.length > 0) {
          console.log('Setting selected court to:', response.data.data[0].id);
          setSelectedCourt(response.data.data[0].id);
        } else {
          console.log('No courts found, clearing selection');
          setSelectedCourt('');
          setAvailabilitySlots([]);
        }
      } else if (response.error) {
        console.error('Courts API error:', response.error);
        toast.error(response.error.message);
      }
    } catch (error) {
      toast.error('Failed to load courts');
      console.error('Courts error:', error);
    } finally {
      setIsLoadingCourts(false);
    }
  }, [selectedFacility]);

  const loadAvailability = useCallback(async () => {
    if (!selectedCourt) {
      console.log('No selected court, skipping availability load');
      return;
    }

    console.log('Loading availability for court:', selectedCourt, 'date:', selectedDate);
    try {
      const startDate = format(startOfDay(selectedDate), 'yyyy-MM-dd');
      const endDate = format(endOfDay(addDays(selectedDate, 6)), 'yyyy-MM-dd'); // Load a week

      console.log('Availability date range:', startDate, 'to', endDate);

      const response = await OwnerService.getCourtAvailability(selectedCourt, {
        startDate,
        endDate,
        includeBlocked: true,
      });

      console.log('Availability response:', response);

      if (response.data) {
        setAvailabilitySlots(response.data);
        console.log('Set availability slots:', response.data.length);
      }
    } catch (error) {
      toast.error('Failed to load availability');
      console.error('Availability error:', error);
    }
  }, [selectedCourt, selectedDate]);

  useEffect(() => {
    console.log('Loading facilities...');
    loadFacilities();
  }, [loadFacilities]);

  useEffect(() => {
    if (selectedFacility) {
      console.log('Loading courts for facility:', selectedFacility);
      loadCourts();
    }
  }, [selectedFacility, loadCourts]);

  useEffect(() => {
    console.log('useEffect triggered - selectedCourt:', selectedCourt, 'selectedDate:', selectedDate);
    if (selectedCourt) {
      loadAvailability();
    }
  }, [selectedCourt, selectedDate, loadAvailability]);

  const handleCreateSlot = async (data: { start: string; end: string; isBlocked?: boolean; reason?: string }) => {
    if (!selectedCourt) return;

    try {
      const response = await OwnerService.createAvailabilitySlot(selectedCourt, data);
      if (response.data) {
        toast.success('Availability slot created successfully');
        setIsCreateDialogOpen(false);
        loadAvailability();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create availability slot';
      toast.error(errorMessage);
    }
  };

  const handleUpdateSlot = async (data: { start?: string; end?: string; isBlocked?: boolean; reason?: string }) => {
    if (!selectedSlot) return;

    try {
      const response = await OwnerService.updateAvailabilitySlot(selectedSlot.id, data);
      if (response.data) {
        toast.success('Availability slot updated successfully');
        setIsEditDialogOpen(false);
        setSelectedSlot(null);
        loadAvailability();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update availability slot';
      toast.error(errorMessage);
    }
  };

  const handleDeleteSlot = async (slot: AvailabilitySlot) => {
    if (!confirm('Are you sure you want to delete this availability slot?')) return;

    try {
      await OwnerService.deleteAvailabilitySlot(slot.id);
      toast.success('Availability slot deleted successfully');
      loadAvailability();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete availability slot';
      toast.error(errorMessage);
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: format(date, 'MMM dd'),
      time: format(date, 'HH:mm'),
      full: format(date, 'PPP p'),
    };
  };

  const groupSlotsByDate = (slots: AvailabilitySlot[]) => {
    const grouped: { [key: string]: AvailabilitySlot[] } = {};

    slots.forEach((slot) => {
      const dateKey = format(new Date(slot.start), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(slot);
    });

    // Sort slots within each date by start time
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    });

    return grouped;
  };

  const selectedCourtName = courts.find((c) => c.id === selectedCourt)?.name;
  const selectedFacilityName = facilities.find((f) => f.id === selectedFacility)?.name;
  const groupedSlots = groupSlotsByDate(availabilitySlots);

  // Show loading only when facilities are being loaded initially
  if (isLoading && facilities.length === 0) {
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
              <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className='space-y-2'>
                    <div className='bg-muted h-4 w-16 animate-pulse rounded'></div>
                    <div className='bg-muted h-10 animate-pulse rounded'></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6'>
      {/* Header */}
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-foreground text-3xl font-bold'>Time Slot Management</h1>
          <p className='text-muted-foreground'>Set availability and block time slots for maintenance</p>
        </div>
        <div className='flex gap-2'>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedCourt}>
                <Plus className='mr-2 h-4 w-4' />
                Block Time Slot
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Block Time Slot</DialogTitle>
                <DialogDescription>Block a time slot for maintenance or other purposes</DialogDescription>
              </DialogHeader>
              <AvailabilitySlotForm onSubmit={handleCreateSlot} />
            </DialogContent>
          </Dialog>

          {selectedCourt && (
            <Button
              variant='outline'
              onClick={async () => {
                if (confirm('Are you sure you want to delete all availability slots for this court?')) {
                  try {
                    await OwnerService.deleteAllAvailabilitySlots(selectedCourt);
                    toast.success('All availability slots cleared');
                    loadAvailability();
                  } catch {
                    toast.error('Failed to clear availability slots');
                  }
                }
              }}
            >
              Clear All Slots
            </Button>
          )}
        </div>
      </div>

      {/* Selectors */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Clock className='h-5 w-5' />
            Select Court & Date
          </CardTitle>
          <CardDescription>Choose a facility, court, and date to manage time slots</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div>
              <label className='mb-2 block text-sm font-medium'>Facility</label>
              <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                <SelectTrigger>
                  <SelectValue placeholder='Select facility' />
                </SelectTrigger>
                <SelectContent>
                  {facilities.map((facility) => (
                    <SelectItem key={facility.id} value={facility.id}>
                      {facility.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium'>Court</label>
              <Select value={selectedCourt} onValueChange={setSelectedCourt} disabled={isLoadingCourts}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingCourts ? 'Loading courts...' : 'Select court'} />
                </SelectTrigger>
                <SelectContent>
                  {courts.map((court) => (
                    <SelectItem key={court.id} value={court.id}>
                      {court.name} ({court.sportType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium'>Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant='outline' className='w-full justify-start text-left font-normal'>
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {selectedDate ? format(selectedDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0'>
                  <Calendar
                    mode='single'
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      {selectedCourt && (
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Clock className='h-5 w-5' />
              Current Selection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              <div>
                <p className='text-muted-foreground text-sm'>Facility</p>
                <p className='font-medium'>{selectedFacilityName}</p>
              </div>
              <div>
                <p className='text-muted-foreground text-sm'>Court</p>
                <p className='font-medium'>{selectedCourtName}</p>
              </div>
              <div>
                <p className='text-muted-foreground text-sm'>Date</p>
                <p className='font-medium'>{format(selectedDate, 'PPPP')}</p>
              </div>
            </div>
            {availabilitySlots.length > 0 && (
              <div className='text-muted-foreground mt-4 flex items-center gap-4 text-sm'>
                <span>
                  {availabilitySlots.length} time slot{availabilitySlots.length !== 1 ? 's' : ''} configured
                </span>
                <span>•</span>
                <span>
                  {availabilitySlots.filter((slot) => slot.isBlocked).length} blocked slot
                  {availabilitySlots.filter((slot) => slot.isBlocked).length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {selectedCourt ? (
        <div className='space-y-6'>
          {/* Availability Slots */}
          {Object.keys(groupedSlots).length === 0 ? (
            <Card>
              <CardContent className='py-12 text-center'>
                <div className='text-muted-foreground mb-4'>
                  <Clock className='mx-auto h-12 w-12' />
                </div>
                <h3 className='text-foreground mb-2 text-lg font-medium'>No blocked time slots</h3>
                <p className='text-muted-foreground mb-4'>
                  This court has no blocked availability slots for the selected period. All time slots are available for
                  booking.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className='mr-2 h-4 w-4' />
                  Block First Time Slot
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className='space-y-4'>
              {Object.entries(groupedSlots).map(([date, slots]) => (
                <Card key={date}>
                  <CardHeader>
                    <CardTitle className='text-lg'>{format(new Date(date), 'EEEE, MMMM dd, yyyy')}</CardTitle>
                    <CardDescription>
                      {slots.length} blocked slot{slots.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                      {slots.map((slot) => {
                        const start = formatDateTime(slot.start);
                        const end = formatDateTime(slot.end);

                        return (
                          <Card key={slot.id} className='border-l-4 border-l-red-500'>
                            <CardContent className='p-4'>
                              <div className='flex items-start justify-between'>
                                <div className='flex-1'>
                                  <div className='mb-2 flex items-center gap-2'>
                                    <AlertTriangle className='h-4 w-4 text-red-500' />
                                    <Badge variant='secondary' className='bg-red-100 text-red-800'>
                                      Blocked
                                    </Badge>
                                  </div>
                                  <div className='mb-1 text-sm font-medium'>
                                    {start.time} - {end.time}
                                  </div>
                                  {slot.reason && <div className='text-sm text-gray-600'>{slot.reason}</div>}
                                </div>
                                <div className='ml-2 flex gap-1'>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => {
                                      setSelectedSlot(slot);
                                      setIsEditDialogOpen(true);
                                    }}
                                  >
                                    <Edit className='h-3 w-3' />
                                  </Button>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => handleDeleteSlot(slot)}
                                    className='text-red-600 hover:text-red-700'
                                  >
                                    <Trash2 className='h-3 w-3' />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className='py-12 text-center'>
            <div className='text-muted-foreground mb-4'>
              <Clock className='mx-auto h-12 w-12' />
            </div>
            <h3 className='text-foreground mb-2 text-lg font-medium'>Select a court to manage</h3>
            <p className='text-muted-foreground'>
              {courts.length === 0
                ? 'No active courts found in the selected facility. Please select a facility with available courts.'
                : 'Choose a court from the dropdown above to view and manage its availability slots.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Blocked Time Slot</DialogTitle>
            <DialogDescription>Update the blocked time slot details</DialogDescription>
          </DialogHeader>
          {selectedSlot && <AvailabilitySlotForm initialData={selectedSlot} onSubmit={handleUpdateSlot} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
