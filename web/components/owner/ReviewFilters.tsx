'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, SlidersHorizontal, X, Star } from 'lucide-react';
import { ReviewQuery } from '@/types/owner.types';

interface ReviewFiltersProps {
  onFiltersChange: (filters: ReviewQuery) => void;
  initialFilters: ReviewQuery;
  isLoading?: boolean;
}

export function ReviewFilters({ onFiltersChange, initialFilters, isLoading }: ReviewFiltersProps) {
  const [filters, setFilters] = useState<ReviewQuery>(initialFilters);
  const [searchInput, setSearchInput] = useState(initialFilters.q || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setFilters(initialFilters);
    setSearchInput(initialFilters.q || '');
  }, [initialFilters]);

  const handleFilterChange = (key: keyof ReviewQuery, value: string | number | undefined) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    const newFilters = { ...filters, q: value || undefined, page: 1 };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: ReviewQuery = {
      page: 1,
      limit: filters.limit,
      include: 'user,facility',
    };
    setFilters(clearedFilters);
    setSearchInput('');
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = () => {
    return Boolean(
      filters.q ||
        filters.minRating ||
        filters.maxRating ||
        filters.facilityId ||
        (filters.sort && filters.sort !== 'createdAt,desc')
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.q) count++;
    if (filters.minRating) count++;
    if (filters.maxRating) count++;
    if (filters.facilityId) count++;
    if (filters.sort && filters.sort !== 'createdAt,desc') count++;
    return count;
  };

  const sortOptions = [
    { label: 'Newest First', value: 'createdAt,desc' },
    { label: 'Oldest First', value: 'createdAt,asc' },
    { label: 'Highest Rating', value: 'rating,desc' },
    { label: 'Lowest Rating', value: 'rating,asc' },
  ];

  const ratingOptions = [
    { label: 'All Ratings', value: 'all' },
    { label: '5 Stars', value: '5' },
    { label: '4+ Stars', value: '4' },
    { label: '3+ Stars', value: '3' },
    { label: '2+ Stars', value: '2' },
    { label: '1+ Stars', value: '1' },
  ];

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          {/* Search Bar */}
          <div className='flex gap-2'>
            <div className='relative flex-1'>
              <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
              <Input
                placeholder='Search reviews by comment, user, or facility...'
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className='pl-9'
                disabled={isLoading}
              />
            </div>
            <Button
              variant='outline'
              onClick={() => setShowAdvanced(!showAdvanced)}
              disabled={isLoading}
              className='flex items-center gap-2'
            >
              <SlidersHorizontal className='h-4 w-4' />
              Filters
              {getActiveFilterCount() > 0 && (
                <Badge variant='secondary' className='ml-1'>
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
            {hasActiveFilters() && (
              <Button variant='ghost' onClick={clearFilters} disabled={isLoading}>
                <X className='h-4 w-4' />
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className='grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-2 lg:grid-cols-4'>
              {/* Sort */}
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Sort By</label>
                <Select
                  value={filters.sort || 'createdAt,desc'}
                  onValueChange={(value) => handleFilterChange('sort', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Minimum Rating */}
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Minimum Rating</label>
                <Select
                  value={filters.minRating?.toString() || ''}
                  onValueChange={(value) => handleFilterChange('minRating', value ? parseInt(value) : undefined)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='All ratings' />
                  </SelectTrigger>
                  <SelectContent>
                    {ratingOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className='flex items-center gap-1'>
                          {option.value && <Star className='h-3 w-3 fill-yellow-400 text-yellow-400' />}
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Maximum Rating */}
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Maximum Rating</label>
                <Select
                  value={filters.maxRating?.toString() || ''}
                  onValueChange={(value) => handleFilterChange('maxRating', value ? parseInt(value) : undefined)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='All ratings' />
                  </SelectTrigger>
                  <SelectContent>
                    {ratingOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className='flex items-center gap-1'>
                          {option.value && <Star className='h-3 w-3 fill-yellow-400 text-yellow-400' />}
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters() && (
            <div className='flex flex-wrap gap-2 border-t pt-3'>
              <span className='text-muted-foreground text-sm font-medium'>Active filters:</span>
              {filters.q && (
                <Badge variant='secondary' className='flex items-center gap-1'>
                  Search: {filters.q}
                  <X className='h-3 w-3 cursor-pointer' onClick={() => handleFilterChange('q', undefined)} />
                </Badge>
              )}
              {filters.minRating && (
                <Badge variant='secondary' className='flex items-center gap-1'>
                  Min: {filters.minRating}⭐
                  <X className='h-3 w-3 cursor-pointer' onClick={() => handleFilterChange('minRating', undefined)} />
                </Badge>
              )}
              {filters.maxRating && (
                <Badge variant='secondary' className='flex items-center gap-1'>
                  Max: {filters.maxRating}⭐
                  <X className='h-3 w-3 cursor-pointer' onClick={() => handleFilterChange('maxRating', undefined)} />
                </Badge>
              )}
              {filters.sort && filters.sort !== 'createdAt,desc' && (
                <Badge variant='secondary' className='flex items-center gap-1'>
                  Sort: {sortOptions.find((s) => s.value === filters.sort)?.label}
                  <X className='h-3 w-3 cursor-pointer' onClick={() => handleFilterChange('sort', 'createdAt,desc')} />
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
