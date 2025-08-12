'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { Facility } from '@/types/owner.types';

interface CourtQuery {
  page?: number;
  limit?: number;
  q?: string;
  sort?: string;
  facilityId?: string;
  sportType?: string;
  status?: 'active' | 'inactive';
  include?: string;
  [key: string]: unknown;
}

interface CourtsFiltersProps {
  onFiltersChange: (filters: CourtQuery) => void;
  initialFilters: CourtQuery;
  isLoading?: boolean;
  facilities: Facility[];
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

export function CourtsFilters({ onFiltersChange, initialFilters, isLoading, facilities }: CourtsFiltersProps) {
  const [localFilters, setLocalFilters] = useState<CourtQuery>(initialFilters);

  useEffect(() => {
    setLocalFilters(initialFilters);
  }, [initialFilters]);

  const handleFilterChange = (key: string, value: string | undefined) => {
    const newFilters = {
      ...localFilters,
      [key]: value === 'all' || value === '' ? undefined : value,
      page: 1, // Reset to first page when filters change
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      page: 1,
      limit: localFilters.limit,
      include: localFilters.include,
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = localFilters.q || localFilters.facilityId || localFilters.sportType || localFilters.status;

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <Search className='h-5 w-5' />
              Search & Filter Courts
            </CardTitle>
            <CardDescription>Find and filter courts across your facilities</CardDescription>
          </div>
          {hasActiveFilters && (
            <Button variant='outline' size='sm' onClick={clearFilters} disabled={isLoading}>
              <X className='mr-1 h-3 w-3' />
              Clear Filters
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          {/* Search */}
          <div className='relative'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
            <Input
              placeholder='Search courts...'
              value={localFilters.q || ''}
              onChange={(e) => handleFilterChange('q', e.target.value)}
              className='pl-10'
              disabled={isLoading}
            />
          </div>

          {/* Facility Filter */}
          <Select
            value={localFilters.facilityId || 'all'}
            onValueChange={(value) => handleFilterChange('facilityId', value)}
            disabled={isLoading}
          >
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

          {/* Sport Type Filter */}
          <Select
            value={localFilters.sportType || 'all'}
            onValueChange={(value) => handleFilterChange('sportType', value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder='All Sports' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Sports</SelectItem>
              {commonSports.map((sport) => (
                <SelectItem key={sport} value={sport}>
                  {sport}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={localFilters.status || 'all'}
            onValueChange={(value) => handleFilterChange('status', value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder='All Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value='active'>Active</SelectItem>
              <SelectItem value='inactive'>Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
