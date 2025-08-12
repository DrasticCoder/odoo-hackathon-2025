'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Edit,
  Building2,
  ToggleLeft,
  ToggleRight,
  Grid3X3,
  List,
  AlertCircle,
  Clock,
  IndianRupee,
} from 'lucide-react';

import { OwnerService } from '@/services/owner.service';
import { Court, Facility } from '@/types/owner.types';
import { toast } from 'sonner';
import { CourtsTable } from './table';
import { DeleteCourtButton } from './delete';
import { CourtsFilters } from '../../../components/owner/CourtsFilters';
import { PaginationControls } from '@/components/common/PaginationControls';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

export default function CourtsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [courts, setCourts] = useState<Court[]>([]);
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
  const [filters, setFilters] = useState<CourtQuery>(() => {
    const initialFilters: CourtQuery = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      include: 'facility,photos,counts',
    };

    if (searchParams.get('q')) initialFilters.q = searchParams.get('q')!;
    if (searchParams.get('sort')) initialFilters.sort = searchParams.get('sort')!;
    if (searchParams.get('facilityId')) initialFilters.facilityId = searchParams.get('facilityId')!;
    if (searchParams.get('sportType')) initialFilters.sportType = searchParams.get('sportType')!;
    if (searchParams.get('status')) initialFilters.status = searchParams.get('status') as 'active' | 'inactive';

    return initialFilters;
  });

  // Load courts when filters change
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [courtsResponse, facilitiesResponse] = await Promise.all([
          OwnerService.getCourts(filters),
          OwnerService.getFacilities({
            sort: 'name,asc',
          }),
        ]);

        console.log('Courts response:', courtsResponse);
        if (courtsResponse.data) {
          setCourts(courtsResponse.data.data || []);
          setMeta(
            courtsResponse.data.meta || {
              page: 1,
              limit: 20,
              total: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: false,
            }
          );
        } else if (courtsResponse.error) {
          setError(courtsResponse.error.message);
          toast.error(courtsResponse.error.message);
        }

        if (facilitiesResponse.data) {
          setFacilities(facilitiesResponse.data.data || []);
        }
      } catch (error) {
        const errorMessage = 'Failed to load courts';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Courts error:', error);
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
  const handleFiltersChange = useCallback((newFilters: CourtQuery) => {
    setFilters(newFilters);
  }, []);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setFilters((prev) => ({ ...prev, limit, page: 1 }));
  };

  const handleDeleteCourt = async (court: Court) => {
    try {
      const response = await OwnerService.deleteCourt(court.id);
      if (response.error) {
        toast.error(response.error.message);
        return;
      }
      toast.success('Court deleted successfully');
      // Reload courts by updating filters to trigger useEffect
      setFilters((prev) => ({ ...prev }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete court';
      toast.error(errorMessage);
    }
  };

  const handleToggleCourtStatus = async (court: Court) => {
    try {
      const response = await OwnerService.updateCourt(court.id, {
        isActive: !court.isActive,
      });
      if (response.error) {
        toast.error(response.error.message);
        return;
      }
      toast.success(`Court ${court.isActive ? 'deactivated' : 'activated'} successfully`);
      // Reload courts by updating filters to trigger useEffect
      setFilters((prev) => ({ ...prev }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update court status';
      toast.error(errorMessage);
    }
  };

  const renderGridView = () => {
    if (courts.length === 0) {
      return (
        <Card>
          <CardContent className='py-12 text-center'>
            <div className='text-muted-foreground mb-4'>
              <Building2 className='mx-auto h-12 w-12' />
            </div>
            <h3 className='mb-2 text-lg font-medium'>No courts found</h3>
            <p className='text-muted-foreground mb-4'>
              {filters.q || filters.facilityId || filters.sportType
                ? 'No courts match your search criteria.'
                : 'Start by creating your first court.'}
            </p>
            {!filters.q && !filters.facilityId && !filters.sportType && (
              <Button onClick={() => router.push('/owner/courts/add')}>
                <Plus className='mr-2 h-4 w-4' />
                Add Your First Court
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {courts.map((court) => (
          <Card
            key={court.id}
            className={`cursor-pointer transition-shadow hover:shadow-lg ${!court.isActive ? 'opacity-60' : ''}`}
            onClick={() => router.push(`/owner/courts/${court.id}`)}
          >
            <CardHeader>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <CardTitle className='flex items-center gap-2 text-lg'>
                    {court.name}
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleCourtStatus(court);
                      }}
                      className='h-6 w-6 p-0'
                    >
                      {court.isActive ? (
                        <ToggleRight className='h-4 w-4 text-green-500' />
                      ) : (
                        <ToggleLeft className='text-muted-foreground h-4 w-4' />
                      )}
                    </Button>
                  </CardTitle>
                  <CardDescription className='mt-1 flex items-center gap-1'>
                    <Building2 className='h-3 w-3' />
                    {court.facility?.name || 'Unknown Facility'}
                  </CardDescription>
                </div>
                <div className='flex flex-col gap-1'>
                  <Badge variant={court.isActive ? 'default' : 'secondary'}>
                    {court.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge
                    variant={
                      court.status === 'APPROVED'
                        ? 'default'
                        : court.status === 'PENDING_APPROVAL'
                          ? 'secondary'
                          : court.status === 'REJECTED'
                            ? 'destructive'
                            : 'outline'
                    }
                    className='text-xs'
                  >
                    {court.status?.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {/* Sport Type */}
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground text-sm'>Sport Type</span>
                  <Badge variant='outline'>{court.sportType}</Badge>
                </div>

                {/* Price */}
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground text-sm'>Price per Hour</span>
                  <div className='flex items-center gap-1'>
                    <IndianRupee className='h-3 w-3' />
                    <span className='font-medium'>{court.pricePerHour}</span>
                  </div>
                </div>

                {/* Operating Hours */}
                {court.operatingHours && (
                  <div className='flex items-center justify-between'>
                    <span className='text-muted-foreground text-sm'>Operating Hours</span>
                    <div className='flex items-center gap-1'>
                      <Clock className='h-3 w-3' />
                      <span className='text-xs'>Custom</span>
                    </div>
                  </div>
                )}

                {/* Bookings */}
                {court.bookingsCount !== undefined && (
                  <div className='flex items-center justify-between'>
                    <span className='text-muted-foreground text-sm'>Total Bookings</span>
                    <span className='font-medium'>{court.bookingsCount}</span>
                  </div>
                )}

                {/* Actions */}
                <div className='flex gap-2 pt-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/owner/courts/${court.id}/edit`);
                    }}
                    className='flex-1'
                  >
                    <Edit className='mr-1 h-3 w-3' />
                    Edit
                  </Button>
                  <DeleteCourtButton
                    court={court}
                    onDelete={handleDeleteCourt}
                    variant='outline'
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  />
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
          <h1 className='text-foreground text-3xl font-bold'>Court Management</h1>
          <p className='text-muted-foreground'>Manage courts across your facilities</p>
        </div>
        <Button onClick={() => router.push('/owner/courts/add')}>
          <Plus className='mr-2 h-4 w-4' />
          Add Court
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
        <CourtsFilters
          onFiltersChange={handleFiltersChange}
          initialFilters={filters}
          isLoading={isLoading}
          facilities={facilities}
        />
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
            <CourtsTable
              courts={courts}
              onDelete={handleDeleteCourt}
              onToggleStatus={handleToggleCourtStatus}
              isLoading={isLoading}
            />
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
