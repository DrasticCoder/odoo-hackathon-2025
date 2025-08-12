'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Filter, X, Search, SortAsc, SortDesc, Star, IndianRupee } from 'lucide-react';
import { FacilityQuery, FacilitySortOption } from '@/types/owner.types';

interface FacilityFiltersProps {
  onFiltersChange: (filters: FacilityQuery) => void;
  initialFilters?: FacilityQuery;
  isLoading?: boolean;
}

const FACILITY_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft', color: 'outline' },
  { value: 'PENDING_APPROVAL', label: 'Pending Approval', color: 'secondary' },
  { value: 'APPROVED', label: 'Approved', color: 'default' },
  { value: 'REJECTED', label: 'Rejected', color: 'destructive' },
  { value: 'SUSPENDED', label: 'Suspended', color: 'secondary' },
] as const;

const SPORT_TYPE_OPTIONS = [
  'Badminton',
  'Tennis',
  'Basketball',
  'Football',
  'Soccer',
  'Cricket',
  'Volleyball',
  'Table Tennis',
  'Squash',
  'Gym',
  'Swimming',
  'Hockey',
  'Golf',
  'Other',
];

const SORT_OPTIONS: FacilitySortOption[] = [
  { label: 'Name (A-Z)', value: 'name,asc' },
  { label: 'Name (Z-A)', value: 'name,desc' },
  { label: 'Created Date (Newest)', value: 'createdAt,desc' },
  { label: 'Created Date (Oldest)', value: 'createdAt,asc' },
  { label: 'Updated Date (Newest)', value: 'updatedAt,desc' },
  { label: 'Updated Date (Oldest)', value: 'updatedAt,asc' },
  { label: 'Rating (Highest)', value: 'avgRating,desc' },
  { label: 'Rating (Lowest)', value: 'avgRating,asc' },
  { label: 'Price (Lowest)', value: 'startingPrice,asc' },
  { label: 'Price (Highest)', value: 'startingPrice,desc' },
  { label: 'Courts Count (Most)', value: 'courtsCount,desc' },
  { label: 'Courts Count (Least)', value: 'courtsCount,asc' },
];

export function FacilityFilters({ onFiltersChange, initialFilters = {}, isLoading = false }: FacilityFiltersProps) {
  const [filters, setFilters] = useState<FacilityQuery>(initialFilters);
  const [localFilters, setLocalFilters] = useState<FacilityQuery>(initialFilters);
  const [isOpen, setIsOpen] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.q !== localFilters.q) {
        onFiltersChange({ ...filters, q: localFilters.q, page: 1 });
        setFilters((prev) => ({ ...prev, q: localFilters.q, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localFilters.q, filters, setFilters, onFiltersChange]);

  const handleFilterChange = (key: keyof FacilityQuery, value: string | number | undefined) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleLocalFilterChange = (key: keyof FacilityQuery, value: string | number | undefined) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (sortValue: string) => {
    handleFilterChange('sort', sortValue);
  };

  const clearAllFilters = () => {
    const clearedFilters: FacilityQuery = {
      page: 1,
      limit: filters.limit || 20,
      include: 'courts,photos,counts',
    };
    setFilters(clearedFilters);
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const applyFilters = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    const newFilters = { ...localFilters, page: 1 };
    setFilters(newFilters);
    onFiltersChange(newFilters);
    setIsOpen(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.q) count++;
    if (filters.status) count++;
    if (filters.sporttype) count++;
    if (filters.minprice || filters.maxprice) count++;
    if (filters.ratingmin) count++;
    if (filters.sort && filters.sort !== 'createdAt,desc') count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className='space-y-4'>
      {/* Search and Sort Bar */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='relative max-w-md flex-1'>
          <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
          <Input
            placeholder='Search facilities...'
            value={localFilters.q || ''}
            onChange={(e) => handleLocalFilterChange('q', e.target.value)}
            className='pl-10'
            disabled={isLoading}
          />
        </div>

        <div className='flex items-center gap-2'>
          {/* Sort Dropdown */}
          <Select value={filters.sort || 'createdAt,desc'} onValueChange={handleSortChange}>
            <SelectTrigger className='w-[200px]'>
              <div className='flex items-center gap-2'>
                {filters.sort?.includes('desc') ? <SortDesc className='h-4 w-4' /> : <SortAsc className='h-4 w-4' />}
                <SelectValue placeholder='Sort by' />
              </div>
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filters Sheet */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant='outline' className='relative'>
                <Filter className='mr-2 h-4 w-4' />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge
                    variant='destructive'
                    className='absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs'
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className='w-[400px] sm:w-[540px]'>
              <SheetHeader>
                <SheetTitle>Filter Facilities</SheetTitle>
                <SheetDescription>Refine your search with these filters</SheetDescription>
              </SheetHeader>

              <div className='space-y-6 py-6'>
                {/* Status Filter */}
                <div>
                  <Label className='text-base font-medium'>Status</Label>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {FACILITY_STATUS_OPTIONS.map((option) => (
                      <Badge
                        key={option.value}
                        variant={localFilters.status === option.value ? 'default' : 'outline'}
                        className='hover:bg-accent cursor-pointer'
                        onClick={(e) => {
                          e.preventDefault();
                          handleLocalFilterChange(
                            'status',
                            localFilters.status === option.value ? undefined : option.value
                          );
                        }}
                      >
                        {option.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Sport Type Filter */}
                <div>
                  <Label className='text-base font-medium'>Sport Type</Label>
                  <div className='mt-2 grid grid-cols-2 gap-2'>
                    {SPORT_TYPE_OPTIONS.map((sport) => {
                      const selectedSports = localFilters.sporttype ? localFilters.sporttype.split(',') : [];
                      return (
                        <div key={sport} className='flex items-center space-x-2'>
                          <Checkbox
                            id={sport}
                            checked={selectedSports.includes(sport)}
                            onCheckedChange={(checked) => {
                              const currentSports = localFilters.sporttype ? localFilters.sporttype.split(',') : [];
                              const newSports = checked
                                ? [...currentSports, sport]
                                : currentSports.filter((s) => s !== sport);
                              handleLocalFilterChange(
                                'sporttype',
                                newSports.length > 0 ? newSports.join(',') : undefined
                              );
                            }}
                          />
                          <Label htmlFor={sport} className='text-sm font-normal'>
                            {sport}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Price Range Filter */}
                <div>
                  <Label className='flex items-center gap-2 text-base font-medium'>
                    <IndianRupee className='h-4 w-4' />
                    Price Range (per hour)
                  </Label>
                  <div className='mt-4 space-y-4'>
                    <Slider
                      value={[localFilters.minprice || 0, localFilters.maxprice || 1000]}
                      onValueChange={([min, max]) => {
                        handleLocalFilterChange('minprice', min > 0 ? min : undefined);
                        handleLocalFilterChange('maxprice', max < 1000 ? max : undefined);
                      }}
                      max={1000}
                      min={0}
                      step={10}
                      className='w-full'
                    />
                    <div className='text-muted-foreground flex items-center justify-between text-sm'>
                      <span>${localFilters.minprice || 0}</span>
                      <span>${localFilters.maxprice || 1000}+</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Rating Filter */}
                <div>
                  <Label className='flex items-center gap-2 text-base font-medium'>
                    <Star className='h-4 w-4' />
                    Minimum Rating
                  </Label>
                  <div className='mt-2 flex gap-2'>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        variant={localFilters.ratingmin === rating ? 'default' : 'outline'}
                        size='sm'
                        onClick={(e) => {
                          e.preventDefault();
                          handleLocalFilterChange('ratingmin', localFilters.ratingmin === rating ? undefined : rating);
                        }}
                        className='flex items-center gap-1'
                      >
                        <Star className='h-3 w-3' />
                        {rating}+
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <SheetFooter>
                <Button
                  variant='outline'
                  onClick={(e) => {
                    e.preventDefault();
                    clearAllFilters();
                  }}
                >
                  Clear All
                </Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    applyFilters();
                  }}
                >
                  Apply Filters
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className='flex flex-wrap items-center gap-2'>
          <span className='text-muted-foreground text-sm'>Active filters:</span>

          {filters.q && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              <Search className='h-3 w-3' />
              Search: {filters.q}
              <Button
                variant='ghost'
                size='sm'
                className='h-4 w-4 p-0 hover:bg-transparent'
                onClick={(e) => {
                  e.preventDefault();
                  handleFilterChange('q', undefined);
                }}
              >
                <X className='h-3 w-3' />
              </Button>
            </Badge>
          )}

          {filters.status && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              Status: {FACILITY_STATUS_OPTIONS.find((s) => s.value === filters.status)?.label}
              <Button
                variant='ghost'
                size='sm'
                className='h-4 w-4 p-0 hover:bg-transparent'
                onClick={(e) => {
                  e.preventDefault();
                  handleFilterChange('status', undefined);
                }}
              >
                <X className='h-3 w-3' />
              </Button>
            </Badge>
          )}

          {filters.sporttype && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              Sport: {filters.sporttype.split(',').join(', ')}
              <Button
                variant='ghost'
                size='sm'
                className='h-4 w-4 p-0 hover:bg-transparent'
                onClick={(e) => {
                  e.preventDefault();
                  handleFilterChange('sporttype', undefined);
                }}
              >
                <X className='h-3 w-3' />
              </Button>
            </Badge>
          )}

          {(filters.minprice || filters.maxprice) && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              <IndianRupee className='h-3 w-3' />${filters.minprice || 0} - ${filters.maxprice || '1000+'}
              <Button
                variant='ghost'
                size='sm'
                className='h-4 w-4 p-0 hover:bg-transparent'
                onClick={(e) => {
                  e.preventDefault();
                  const newFilters = { ...filters };
                  delete newFilters.minprice;
                  delete newFilters.maxprice;
                  setFilters(newFilters);
                  setLocalFilters(newFilters);
                  onFiltersChange(newFilters);
                }}
              >
                <X className='h-3 w-3' />
              </Button>
            </Badge>
          )}

          {filters.ratingmin && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              <Star className='h-3 w-3' />
              {filters.ratingmin}+ stars
              <Button
                variant='ghost'
                size='sm'
                className='h-4 w-4 p-0 hover:bg-transparent'
                onClick={(e) => {
                  e.preventDefault();
                  handleFilterChange('ratingmin', undefined);
                }}
              >
                <X className='h-3 w-3' />
              </Button>
            </Badge>
          )}

          <Button
            variant='ghost'
            size='sm'
            onClick={(e) => {
              e.preventDefault();
              clearAllFilters();
            }}
            className='text-muted-foreground hover:text-foreground'
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
