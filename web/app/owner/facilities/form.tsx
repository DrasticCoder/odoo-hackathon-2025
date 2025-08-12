'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MediaUploader from '@/components/media-uploader';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Facility } from '@/types/owner.types';
import { Checkbox } from '@/components/ui/checkbox';

const facilitySchema = z.object({
  name: z.string().min(1, 'Facility name is required'),
  description: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  shortLocation: z.string().optional(),
  about: z.string().optional(),
});

type FacilityFormData = z.infer<typeof facilitySchema>;

interface FacilityFormProps {
  initialData?: Facility;
  onSubmit: (data: FacilityFormData & { amenities?: Record<string, unknown>; images?: string[] }) => void;
}

const commonAmenities = [
  'Parking',
  'Restrooms',
  'Changing Rooms',
  'Showers',
  'Water Fountain',
  'First Aid',
  'Equipment Rental',
  'Lockers',
  'Air Conditioning',
  'Lighting',
  'Seating Area',
  'Refreshments',
  'WiFi',
  'Sound System',
  'Scoreboard',
];

export default function FacilityForm({ initialData, onSubmit }: FacilityFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const initialAmenities = useMemo(() => {
    if (initialData?.amenities && typeof initialData.amenities === 'object') {
      return Object.keys(initialData.amenities).filter((key) => initialData.amenities![key] === true);
    }
    return [];
  }, [initialData?.amenities]);

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialAmenities);

  // Update amenities when initialData changes
  useEffect(() => {
    setSelectedAmenities(initialAmenities);
  }, [initialAmenities]);

  const defaultValues = useMemo(
    () => ({
      name: initialData?.name || '',
      description: initialData?.description || '',
      address: initialData?.address || '',
      shortLocation: initialData?.shortLocation || '',
      about: initialData?.about || '',
    }),
    [initialData]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FacilityFormData>({
    resolver: zodResolver(facilitySchema),
    defaultValues,
  });

  const handleAmenityToggle = useCallback((amenity: string) => {
    setSelectedAmenities((prev) => (prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]));
  }, []);

  const onFormSubmit = async (data: FacilityFormData) => {
    setIsLoading(true);
    try {
      const amenitiesObj = selectedAmenities.reduce(
        (acc, amenity) => {
          acc[amenity] = true;
          return acc;
        },
        {} as Record<string, boolean>
      );

      await onSubmit({
        ...data,
        amenities: amenitiesObj,
        images,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [images, setImages] = useState<string[]>((initialData as Facility & { images?: string[] })?.images || []);

  const setValue = useCallback((field: string, value: string[]) => {
    if (field === 'images') {
      setImages(value);
    }
  }, []);
  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className='space-y-6'>
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Enter the basic details of your sports facility</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <Label htmlFor='name'>Facility Name *</Label>
            <Input id='name' {...register('name')} placeholder='e.g., Koramangala Sports Arena' />
            {errors.name && <p className='text-destructive mt-1 text-sm'>{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              {...register('description')}
              placeholder='Brief description of your facility...'
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor='address'>Full Address *</Label>
            <Textarea
              id='address'
              {...register('address')}
              placeholder='Complete address with city, state, and postal code'
              rows={2}
            />
            {errors.address && <p className='text-destructive mt-1 text-sm'>{errors.address.message}</p>}
          </div>

          <div>
            <Label htmlFor='shortLocation'>Short Location</Label>
            <Input id='shortLocation' {...register('shortLocation')} placeholder='e.g., Koramangala, HSR Layout' />
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card>
        <CardHeader>
          <CardTitle>Amenities</CardTitle>
          <CardDescription>Select the amenities available at your facility</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-3 md:grid-cols-3'>
            {commonAmenities.map((amenity) => (
              <div
                key={amenity}
                className='hover:bg-accent flex items-center space-x-2 rounded-lg border p-2 transition-colors'
              >
                <Checkbox
                  checked={selectedAmenities.includes(amenity)}
                  onCheckedChange={() => handleAmenityToggle(amenity)}
                  id={`amenity-${amenity}`}
                />
                <Label htmlFor={`amenity-${amenity}`} className='flex-1 cursor-pointer'>
                  {amenity}
                </Label>
              </div>
            ))}
          </div>

          <Card>
            <CardContent>
              <Label className='mb-5'>Upload Facility Images</Label>
              <MediaUploader
                type='image'
                multiple
                folderName='facilities'
                onUpload={(urls) => {
                  setValue('images', [...images, ...urls]);
                }}
              />
            </CardContent>
          </Card>

          {/* Selected Amenities */}
          {selectedAmenities.length > 0 && (
            <div className='mt-4'>
              <Label className='text-sm font-medium'>Selected Amenities:</Label>
              <div className='mt-2 flex flex-wrap gap-2'>
                {selectedAmenities.map((amenity) => (
                  <Badge
                    key={amenity}
                    variant='secondary'
                    className='hover:bg-destructive hover:text-destructive-foreground cursor-pointer'
                    onClick={() => handleAmenityToggle(amenity)}
                  >
                    {amenity}
                    <X className='ml-1 h-3 w-3' />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle>About Your Facility</CardTitle>
          <CardDescription>Tell potential customers more about your facility</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register('about')}
            placeholder="Describe your facility's unique features, history, or any special information customers should know..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className='flex justify-end space-x-2'>
        <Button type='submit' disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Facility' : 'Create Facility'}
        </Button>
      </div>
    </form>
  );
}
