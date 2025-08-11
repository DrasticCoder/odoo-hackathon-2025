'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Clock, AlertTriangle, Trash2, Edit } from 'lucide-react';
import { format, addDays, startOfDay, endOfDay } from 'date-fns';
import AuthGuard from '@/components/auth/AuthGuard';
import { OwnerLayout } from '@/components/OwnerLayout';
import { OwnerService } from '@/services/owner.service';
import { AvailabilitySlot, Court, Facility } from '@/types/owner.types';
import { UserRole } from '@/types/auth.type';
import { toast } from 'sonner';
import AvailabilitySlotForm from '@/components/owner/AvailabilitySlotForm';

export default function AvailabilityManagementPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState<string>('');
  const [selectedCourt, setSelectedCourt] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);

  const loadFacilities = useCallback(async () => {
    try {
      const response = await OwnerService.getFacilities({
        status: 'APPROVED',
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
    }
  }, []);

  const loadCourts = useCallback(async () => {
    try {
      const response = await OwnerService.getCourts({
        facilityId: selectedFacility,
        isActive: true,
        sort: 'name,asc',
      });

      if (response.data) {
        setCourts(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedCourt(response.data.data[0].id);
        } else {
          setSelectedCourt('');
          setAvailabilitySlots([]);
        }
      }
    } catch (error) {
      toast.error('Failed to load courts');
      console.error('Courts error:', error);
    }
  }, [selectedFacility]);

  const loadAvailability = useCallback(async () => {
    if (!selectedCourt) return;

    setIsLoading(true);
    try {
      const startDate = format(startOfDay(selectedDate), 'yyyy-MM-dd');
      const endDate = format(endOfDay(addDays(selectedDate, 6)), 'yyyy-MM-dd'); // Load a week

      const response = await OwnerService.getCourtAvailability(selectedCourt, {
        startDate,
        endDate,
        includeBlocked: true,
      });

      if (response.data) {
        setAvailabilitySlots(response.data);
      }
    } catch (error) {
      toast.error('Failed to load availability');
      console.error('Availability error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCourt, selectedDate]);

  useEffect(() => {
    loadFacilities();
  }, [loadFacilities]);

  useEffect(() => {
    if (selectedFacility) {
      loadCourts();
    }
  }, [selectedFacility, loadCourts]);

  useEffect(() => {
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

  if (isLoading && !selectedCourt) {
    return (
      <AuthGuard requiredRole={UserRole.OWNER}>
        <OwnerLayout>
          <div className='container mx-auto p-6'>
            <div className='animate-pulse space-y-4'>
              <div className='bg-muted h-8 w-1/3 rounded'></div>
              <div className='bg-muted h-4 w-1/2 rounded'></div>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className='bg-muted h-10 rounded'></div>
                ))}
              </div>
            </div>
          </div>
        </OwnerLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole={UserRole.OWNER}>
      <div className='container mx-auto p-6'>
        {/* Header */}
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-gray-900'>Time Slot Management</h1>
          <p className='text-gray-600'>Set availability and block time slots for maintenance</p>
        </div>

        {/* Selectors */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>Select Court</CardTitle>
            <CardDescription>Choose a facility and court to manage availability</CardDescription>
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
                <Select value={selectedCourt} onValueChange={setSelectedCourt}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select court' />
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
                <Calendar
                  mode='single'
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className='rounded-md border'
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        {selectedCourt ? (
          <div className='space-y-6'>
            {/* Actions */}
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-xl font-semibold'>
                  {selectedFacilityName} - {selectedCourtName}
                </h2>
                <p className='text-gray-600'>Availability for {format(selectedDate, 'PPPP')}</p>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className='mr-2 h-4 w-4' />
                    Block Time Slot
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Block Time Slot</DialogTitle>
                    <DialogDescription>Create a blocked time slot for maintenance or other purposes</DialogDescription>
                  </DialogHeader>
                  <AvailabilitySlotForm onSubmit={handleCreateSlot} defaultDate={selectedDate} />
                </DialogContent>
              </Dialog>
            </div>

            {/* Availability Slots */}
            {Object.keys(groupedSlots).length === 0 ? (
              <Card>
                <CardContent className='py-12 text-center'>
                  <div className='mb-4 text-gray-400'>
                    <Clock className='mx-auto h-12 w-12' />
                  </div>
                  <h3 className='mb-2 text-lg font-medium text-gray-900'>No blocked time slots</h3>
                  <p className='mb-4 text-gray-500'>
                    This court has no blocked availability slots for the selected period.
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
              <div className='mb-4 text-gray-400'>
                <Clock className='mx-auto h-12 w-12' />
              </div>
              <h3 className='mb-2 text-lg font-medium text-gray-900'>Select a court</h3>
              <p className='text-gray-500'>
                {courts.length === 0
                  ? 'No active courts found in the selected facility.'
                  : 'Choose a court to view and manage its availability.'}
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
    </AuthGuard>
  );
}
