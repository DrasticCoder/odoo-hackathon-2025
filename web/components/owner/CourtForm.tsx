'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Court, Facility } from '@/types/owner.types';

const courtSchema = z.object({
  name: z.string().min(1, 'Court name is required'),
  sportType: z.string().min(1, 'Sport type is required'),
  pricePerHour: z.number().min(0, 'Price must be a positive number'),
  isActive: z.boolean().optional(),
});

type CourtFormData = z.infer<typeof courtSchema>;

interface CourtFormProps {
  initialData?: Court;
  facilities: Facility[];
  onSubmit: (facilityId: string, data: CourtFormData & { operatingHours?: Record<string, unknown> }) => void;
  isEdit?: boolean;
}

const commonSports = [
  'Badminton',
  'Tennis',
  'Table Tennis',
  'Basketball',
  'Football',
  'Cricket',
  'Volleyball',
  'Squash',
  'Swimming',
  'Gym',
  'Other',
];

const timeSlots = [
  '00:00',
  '01:00',
  '02:00',
  '03:00',
  '04:00',
  '05:00',
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00',
];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function CourtForm({ initialData, facilities, onSubmit, isEdit = false }: CourtFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(initialData?.facilityId || '');
  const [operatingHours, setOperatingHours] = useState<
    Record<string, { open: string; close: string; isOpen: boolean }>
  >(() => {
    const defaultHours = daysOfWeek.reduce(
      (acc, day) => {
        acc[day.toLowerCase()] = { open: '09:00', close: '22:00', isOpen: true };
        return acc;
      },
      {} as Record<string, { open: string; close: string; isOpen: boolean }>
    );

    // If editing and has operating hours, merge with defaults
    if (initialData?.operatingHours && typeof initialData.operatingHours === 'object') {
      const existingHours = initialData.operatingHours as Record<
        string,
        { open: string; close: string; isOpen: boolean }
      >;
      return { ...defaultHours, ...existingHours };
    }

    return defaultHours;
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CourtFormData>({
    resolver: zodResolver(courtSchema),
    defaultValues: {
      name: initialData?.name || '',
      sportType: initialData?.sportType || '',
      pricePerHour: initialData?.pricePerHour || 0,
      isActive: initialData?.isActive ?? true,
    },
  });

  const watchedSportType = watch('sportType');

  const handleOperatingHoursChange = (day: string, field: 'open' | 'close' | 'isOpen', value: string | boolean) => {
    setOperatingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const onFormSubmit = async (data: CourtFormData) => {
    if (!selectedFacility && !isEdit) {
      alert('Please select a facility');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(selectedFacility, {
        ...data,
        operatingHours,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className='space-y-6'>
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Court Information</CardTitle>
          <CardDescription>Enter the basic details of your court</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {!isEdit && (
            <div>
              <Label>Facility *</Label>
              <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                <SelectTrigger>
                  <SelectValue placeholder='Select a facility' />
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
          )}

          <div>
            <Label htmlFor='name'>Court Name *</Label>
            <Input id='name' {...register('name')} placeholder='e.g., Court 1, Badminton Court A' />
            {errors.name && <p className='mt-1 text-sm text-red-500'>{errors.name.message}</p>}
          </div>

          <div>
            <Label>Sport Type *</Label>
            <Select value={watchedSportType} onValueChange={(value) => setValue('sportType', value)}>
              <SelectTrigger>
                <SelectValue placeholder='Select sport type' />
              </SelectTrigger>
              <SelectContent>
                {commonSports.map((sport) => (
                  <SelectItem key={sport} value={sport}>
                    {sport}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sportType && <p className='mt-1 text-sm text-red-500'>{errors.sportType.message}</p>}
          </div>

          <div>
            <Label htmlFor='pricePerHour'>Price per Hour ($) *</Label>
            <Input
              id='pricePerHour'
              type='number'
              step='0.01'
              min='0'
              {...register('pricePerHour', { valueAsNumber: true })}
              placeholder='0.00'
            />
            {errors.pricePerHour && <p className='mt-1 text-sm text-red-500'>{errors.pricePerHour.message}</p>}
          </div>

          {isEdit && (
            <div className='flex items-center space-x-2'>
              <Switch checked={watch('isActive')} onCheckedChange={(checked) => setValue('isActive', checked)} />
              <Label>Court is active</Label>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Operating Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Operating Hours</CardTitle>
          <CardDescription>Set the operating hours for this court</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {daysOfWeek.map((day) => {
              const dayKey = day.toLowerCase();
              const dayHours = operatingHours[dayKey];

              return (
                <div key={day} className='flex items-center space-x-4'>
                  <div className='w-24'>
                    <Switch
                      checked={dayHours.isOpen}
                      onCheckedChange={(checked) => handleOperatingHoursChange(dayKey, 'isOpen', checked)}
                    />
                    <Label className='ml-2'>{day}</Label>
                  </div>

                  {dayHours.isOpen ? (
                    <div className='flex items-center space-x-2'>
                      <Select
                        value={dayHours.open}
                        onValueChange={(value) => handleOperatingHoursChange(dayKey, 'open', value)}
                      >
                        <SelectTrigger className='w-24'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <span>to</span>

                      <Select
                        value={dayHours.close}
                        onValueChange={(value) => handleOperatingHoursChange(dayKey, 'close', value)}
                      >
                        <SelectTrigger className='w-24'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <span className='text-gray-500'>Closed</span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className='flex justify-end space-x-2'>
        <Button type='submit' disabled={isLoading}>
          {isLoading ? 'Saving...' : isEdit ? 'Update Court' : 'Create Court'}
        </Button>
      </div>
    </form>
  );
}
