'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { AvailabilitySlot } from '@/types/owner.types';

const availabilitySlotSchema = z
  .object({
    start: z.string().min(1, 'Start time is required'),
    end: z.string().min(1, 'End time is required'),
    isBlocked: z.boolean().optional(),
    reason: z.string().optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.start);
      const end = new Date(data.end);
      return start < end;
    },
    {
      message: 'End time must be after start time',
      path: ['end'],
    }
  );

type AvailabilitySlotFormData = z.infer<typeof availabilitySlotSchema>;

interface AvailabilitySlotFormProps {
  initialData?: AvailabilitySlot;
  defaultDate?: Date;
  onSubmit: (data: AvailabilitySlotFormData) => void;
}

export default function AvailabilitySlotForm({
  initialData,
  defaultDate = new Date(),
  onSubmit,
}: AvailabilitySlotFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AvailabilitySlotFormData>({
    resolver: zodResolver(availabilitySlotSchema),
    defaultValues: {
      start: initialData?.start
        ? format(new Date(initialData.start), "yyyy-MM-dd'T'HH:mm")
        : format(defaultDate, "yyyy-MM-dd'T'09:00"),
      end: initialData?.end
        ? format(new Date(initialData.end), "yyyy-MM-dd'T'HH:mm")
        : format(defaultDate, "yyyy-MM-dd'T'17:00"),
      isBlocked: initialData?.isBlocked ?? true,
      reason: initialData?.reason || '',
    },
  });

  const isBlocked = watch('isBlocked');

  const onFormSubmit = async (data: AvailabilitySlotFormData) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className='space-y-6'>
      <div className='space-y-4'>
        {/* Start Time */}
        <div>
          <Label htmlFor='start'>Start Time *</Label>
          <Input id='start' type='datetime-local' {...register('start')} />
          {errors.start && <p className='mt-1 text-sm text-red-500'>{errors.start.message}</p>}
        </div>

        {/* End Time */}
        <div>
          <Label htmlFor='end'>End Time *</Label>
          <Input id='end' type='datetime-local' {...register('end')} />
          {errors.end && <p className='mt-1 text-sm text-red-500'>{errors.end.message}</p>}
        </div>

        {/* Is Blocked Toggle */}
        <div className='flex items-center space-x-2'>
          <Switch checked={isBlocked} onCheckedChange={(checked) => setValue('isBlocked', checked)} />
          <Label>Block this time slot</Label>
        </div>

        {/* Reason (only show if blocked) */}
        {isBlocked && (
          <div>
            <Label htmlFor='reason'>Reason for Blocking</Label>
            <Textarea
              id='reason'
              {...register('reason')}
              placeholder='e.g., Maintenance, Cleaning, Private Event'
              rows={3}
            />
            <p className='mt-1 text-sm text-gray-500'>Optional: Provide a reason for blocking this time slot</p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className='flex justify-end space-x-2'>
        <Button type='submit' disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Slot' : 'Create Slot'}
        </Button>
      </div>
    </form>
  );
}
