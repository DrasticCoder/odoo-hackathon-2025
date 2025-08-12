'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, MapPin, Star, Calendar, Grid3X3, List, AlertCircle, IndianRupee } from 'lucide-react';

import { OwnerService } from '@/services/owner.service';
import { Facility, FacilityQuery } from '@/types/owner.types';
import { toast } from 'sonner';
import { FacilitiesTable } from './table';
import { DeleteFacilityButton } from './delete';
import { FacilityFilters } from '@/components/owner/FacilityFilters';
import { PaginationControls } from '@/components/common/PaginationControls';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function FacilitiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FacilityQuery>(() => {
    const initialFilters: FacilityQuery = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      include: 'courts,photos,counts',
    };

    if (searchParams.get('q')) initialFilters.q = searchParams.get('q')!;
    if (searchParams.get('sort')) initialFilters.sort = searchParams.get('sort')!;
    if (searchParams.get('status'))
      initialFilters.status = searchParams.get('status') as
        | 'APPROVED'
        | 'PENDING_APPROVAL'
        | 'REJECTED'
        | 'DRAFT'
        | 'SUSPENDED';
    if (searchParams.get('sporttype')) initialFilters.sporttype = searchParams.get('sporttype')!;
    if (searchParams.get('minprice')) initialFilters.minprice = parseFloat(searchParams.get('minprice')!);
    if (searchParams.get('maxprice')) initialFilters.maxprice = parseFloat(searchParams.get('maxprice')!);
    if (searchParams.get('ratingmin')) initialFilters.ratingmin = parseFloat(searchParams.get('ratingmin')!);

    return initialFilters;
  });

  // Load facilities when filters change
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await OwnerService.getFacilities(filters);
        console.log('Facilities response:', response);
        if (response.data) {
          setFacilities(response.data.data);
          setMeta(response.data.meta);
        } else if (response.error) {
          setError(response.error.message);
          toast.error(response.error.message);
        }
      } catch (error) {
        const errorMessage = 'Failed to load facilities';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Facilities error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [filters]);

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString());
      }
    });

    const newURL = `${window.location.pathname}?${params.toString()}`;
    router.replace(newURL, { scroll: false });
  }, [filters, router]);

  // Event handlers
  const handleFiltersChange = useCallback((newFilters: FacilityQuery) => {
    setFilters(newFilters);
  }, []);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setFilters((prev) => ({ ...prev, limit, page: 1 }));
  };

  const handleDeleteFacility = async (facility: Facility) => {
    try {
      const response = await OwnerService.deleteFacility(facility.id);
      if (response.error) {
        toast.error(response.error.message);
        return;
      }
      toast.success('Facility deleted successfully');
      // Reload facilities by updating filters to trigger useEffect
      setFilters((prev) => ({ ...prev }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete facility';
      toast.error(errorMessage);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'default';
      case 'PENDING_APPROVAL':
        return 'secondary';
      case 'REJECTED':
        return 'destructive';
      case 'DRAFT':
        return 'outline';
      case 'SUSPENDED':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const renderGridView = () => {
    if (facilities.length === 0) {
      return (
        <Card>
          <CardContent className='py-12 text-center'>
            <div className='text-muted-foreground mb-4'>
              <Calendar className='mx-auto h-12 w-12' />
            </div>
            <h3 className='mb-2 text-lg font-medium'>No facilities found</h3>
            <p className='text-muted-foreground mb-4'>
              {filters.q || filters.status || filters.sporttype
                ? 'No facilities match your search criteria.'
                : 'Start by creating your first facility.'}
            </p>
            {!filters.q && !filters.status && !filters.sporttype && (
              <Button onClick={() => router.push('/owner/facilities/add')}>
                <Plus className='mr-2 h-4 w-4' />
                Add Your First Facility
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {facilities.map((facility) => (
          <Card
            key={facility.id}
            className='cursor-pointer transition-shadow hover:shadow-lg'
            onClick={() => router.push(`/owner/facilities/${facility.id}`)}
          >
            <CardHeader>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <CardTitle className='text-lg'>{facility.name}</CardTitle>
                  <CardDescription className='mt-1 flex items-center gap-1'>
                    <MapPin className='h-3 w-3' />
                    {facility.shortLocation || facility.address}
                  </CardDescription>
                </div>
                <Badge variant={getStatusVariant(facility.status)}>{facility.status.replace('_', ' ')}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {/* Stats */}
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div className='flex items-center gap-2'>
                    <Calendar className='text-muted-foreground h-4 w-4' />
                    <span>{facility.courtsCount || 0} Courts</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <IndianRupee className='text-muted-foreground h-4 w-4' />
                    <span>{facility.startingPrice ? `˝˝ ${facility.startingPrice}/hr` : 'No pricing'}</span>
                  </div>
                </div>

                {/* Sports */}
                {facility.sportTypes && facility.sportTypes.length > 0 && (
                  <div className='flex flex-wrap gap-1'>
                    {facility.sportTypes.slice(0, 3).map((sport: string, index: number) => (
                      <Badge key={index} variant='secondary' className='text-xs'>
                        {sport}
                      </Badge>
                    ))}
                    {facility.sportTypes.length > 3 && (
                      <Badge variant='secondary' className='text-xs'>
                        +{facility.sportTypes.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Rating */}
                {facility.avgRating && (
                  <div className='flex items-center gap-1'>
                    <Star className='fill-primary text-primary h-4 w-4' />
                    <span className='text-sm font-medium'>{facility.avgRating.toFixed(1)}</span>
                    <span className='text-muted-foreground text-sm'>({facility.reviewsCount || 0} reviews)</span>
                  </div>
                )}

                {/* Description */}
                {facility.description && (
                  <p className='text-muted-foreground line-clamp-2 text-sm'>{facility.description}</p>
                )}

                {/* Actions */}
                <div className='flex gap-2 pt-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => router.push(`/owner/facilities/${facility.id}/edit`)}
                    className='flex-1'
                  >
                    <Edit className='mr-1 h-3 w-3' />
                    Edit
                  </Button>
                  <DeleteFacilityButton facility={facility} onDelete={handleDeleteFacility} variant='outline' />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className='container mx-auto p-6'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {[...Array(6)].map((_, i) => (
            <Card key={i} className='animate-pulse'>
              <CardHeader>
                <div className='bg-muted h-4 w-3/4 rounded'></div>
                <div className='bg-muted h-3 w-1/2 rounded'></div>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div className='bg-muted h-3 rounded'></div>
                  <div className='bg-muted h-3 w-2/3 rounded'></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6'>
      {/* Header */}
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-foreground text-3xl font-bold'>Facility Management</h1>
          <p className='text-muted-foreground'>Manage your sports facilities and courts</p>
        </div>
        <Button onClick={() => router.push('/owner/facilities/add')}>
          <Plus className='mr-2 h-4 w-4' />
          Add Facility
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant='destructive' className='mb-6'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className='mb-6'>
        <FacilityFilters onFiltersChange={handleFiltersChange} initialFilters={filters} isLoading={isLoading} />
      </div>

      {/* View Mode Toggle */}
      <div className='mb-6 flex justify-end'>
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'table')}>
          <TabsList>
            <TabsTrigger value='grid' className='flex items-center gap-2'>
              <Grid3X3 className='h-4 w-4' />
              Grid
            </TabsTrigger>
            <TabsTrigger value='table' className='flex items-center gap-2'>
              <List className='h-4 w-4' />
              Table
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className='space-y-6'>
        <Tabs value={viewMode} className='w-full'>
          <TabsContent value='grid' className='mt-0'>
            {renderGridView()}
          </TabsContent>
          <TabsContent value='table' className='mt-0'>
            <FacilitiesTable facilities={facilities} onDelete={handleDeleteFacility} isLoading={isLoading} />
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        {meta.total > 0 && (
          <PaginationControls
            meta={meta}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
