'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2, Clock, DollarSign, Building2, ToggleLeft, ToggleRight } from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';
import { OwnerLayout } from '@/components/OwnerLayout';
import { OwnerService } from '@/services/owner.service';
import { Court, Facility } from '@/types/owner.types';
import { UserRole } from '@/types/auth.type';
import { toast } from 'sonner';
import CourtForm from '@/components/owner/CourtForm';

export default function CourtsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<string>('all');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [courtsResponse, facilitiesResponse] = await Promise.all([
        OwnerService.getCourts({
          include: 'facility,photos,counts',
          sort: 'createdAt,desc',
        }),
        OwnerService.getFacilities({
          status: 'APPROVED',
          sort: 'name,asc',
        }),
      ]);

      if (courtsResponse.data) {
        setCourts(courtsResponse.data.data);
      }
      if (facilitiesResponse.data) {
        setFacilities(facilitiesResponse.data.data);
      }
    } catch (error) {
      toast.error('Failed to load courts');
      console.error('Courts error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCourt = async (
    facilityId: string,
    data: { name: string; sportType: string; pricePerHour: number; operatingHours?: Record<string, unknown> }
  ) => {
    try {
      const response = await OwnerService.createCourt(facilityId, data);
      if (response.data) {
        toast.success('Court created successfully');
        setIsCreateDialogOpen(false);
        loadData();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create court';
      toast.error(errorMessage);
    }
  };

  const handleUpdateCourt = async (data: {
    name?: string;
    sportType?: string;
    pricePerHour?: number;
    operatingHours?: Record<string, unknown>;
    isActive?: boolean;
  }) => {
    if (!selectedCourt) return;

    try {
      const response = await OwnerService.updateCourt(selectedCourt.id, data);
      if (response.data) {
        toast.success('Court updated successfully');
        setIsEditDialogOpen(false);
        setSelectedCourt(null);
        loadData();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update court';
      toast.error(errorMessage);
    }
  };

  const handleDeleteCourt = async (court: Court) => {
    if (!confirm(`Are you sure you want to delete "${court.name}"?`)) return;

    try {
      await OwnerService.deleteCourt(court.id);
      toast.success('Court deleted successfully');
      loadData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete court';
      toast.error(errorMessage);
    }
  };

  const toggleCourtStatus = async (court: Court) => {
    try {
      const response = await OwnerService.updateCourt(court.id, {
        isActive: !court.isActive,
      });
      if (response.data) {
        toast.success(`Court ${court.isActive ? 'deactivated' : 'activated'} successfully`);
        loadData();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update court status';
      toast.error(errorMessage);
    }
  };

  const filteredCourts = courts.filter((court) => {
    const matchesSearch =
      court.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      court.sportType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      court.facility?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFacility = selectedFacility === 'all' || court.facilityId === selectedFacility;
    const matchesSport = selectedSport === 'all' || court.sportType.toLowerCase().includes(selectedSport.toLowerCase());

    return matchesSearch && matchesFacility && matchesSport;
  });

  const uniqueSports = [...new Set(courts.map((court) => court.sportType))];

  if (isLoading) {
    return (
      <AuthGuard requiredRole={UserRole.OWNER}>
        <OwnerLayout>
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
        </OwnerLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole={UserRole.OWNER}>
      <OwnerLayout>
        <div className='container mx-auto p-6'>
          {/* Header */}
          <div className='mb-6 flex items-center justify-between'>
            <div>
              <h1 className='text-foreground text-3xl font-bold'>Court Management</h1>
              <p className='text-muted-foreground'>Manage courts across your facilities</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Court
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-2xl'>
                <DialogHeader>
                  <DialogTitle>Create New Court</DialogTitle>
                  <DialogDescription>Add a new court to one of your facilities</DialogDescription>
                </DialogHeader>
                <CourtForm facilities={facilities} onSubmit={handleCreateCourt} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-4'>
            <div className='relative'>
              <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
              <Input
                placeholder='Search courts...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>

            <Select value={selectedFacility} onValueChange={setSelectedFacility}>
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

            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger>
                <SelectValue placeholder='All Sports' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Sports</SelectItem>
                {uniqueSports.map((sport) => (
                  <SelectItem key={sport} value={sport.toLowerCase()}>
                    {sport}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className='flex items-center text-sm text-gray-500'>
              {filteredCourts.length} court{filteredCourts.length !== 1 ? 's' : ''} found
            </div>
          </div>

          {/* Courts Grid */}
          {filteredCourts.length === 0 ? (
            <Card>
              <CardContent className='py-12 text-center'>
                <div className='mb-4 text-gray-400'>
                  <Building2 className='mx-auto h-12 w-12' />
                </div>
                <h3 className='mb-2 text-lg font-medium text-gray-900'>No courts found</h3>
                <p className='mb-4 text-gray-500'>
                  {searchQuery || selectedFacility !== 'all' || selectedSport !== 'all'
                    ? 'No courts match your filters.'
                    : 'Start by creating your first court.'}
                </p>
                {!searchQuery && selectedFacility === 'all' && selectedSport === 'all' && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Your First Court
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {filteredCourts.map((court) => (
                <Card
                  key={court.id}
                  className={`transition-shadow hover:shadow-lg ${!court.isActive ? 'opacity-60' : ''}`}
                >
                  <CardHeader>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <CardTitle className='flex items-center gap-2 text-lg'>
                          {court.name}
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => toggleCourtStatus(court)}
                            className='h-6 w-6 p-0'
                          >
                            {court.isActive ? (
                              <ToggleRight className='h-4 w-4 text-green-500' />
                            ) : (
                              <ToggleLeft className='h-4 w-4 text-gray-400' />
                            )}
                          </Button>
                        </CardTitle>
                        <CardDescription>
                          <Building2 className='mr-1 inline h-3 w-3' />
                          {court.facility?.name}
                        </CardDescription>
                      </div>
                      <Badge variant={court.isActive ? 'default' : 'secondary'}>
                        {court.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      {/* Sport Type */}
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-500'>Sport Type</span>
                        <Badge variant='outline'>{court.sportType}</Badge>
                      </div>

                      {/* Price */}
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-500'>Price per Hour</span>
                        <div className='flex items-center gap-1'>
                          <DollarSign className='h-3 w-3' />
                          <span className='font-medium'>{court.pricePerHour}</span>
                        </div>
                      </div>

                      {/* Operating Hours */}
                      {court.operatingHours && (
                        <div className='flex items-center justify-between'>
                          <span className='text-sm text-gray-500'>Operating Hours</span>
                          <div className='flex items-center gap-1'>
                            <Clock className='h-3 w-3' />
                            <span className='text-xs'>Set</span>
                          </div>
                        </div>
                      )}

                      {/* Bookings */}
                      {court.bookingsCount !== undefined && (
                        <div className='flex items-center justify-between'>
                          <span className='text-sm text-gray-500'>Total Bookings</span>
                          <span className='font-medium'>{court.bookingsCount}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className='flex gap-2 pt-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            setSelectedCourt(court);
                            setIsEditDialogOpen(true);
                          }}
                          className='flex-1'
                        >
                          <Edit className='mr-1 h-3 w-3' />
                          Edit
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleDeleteCourt(court)}
                          className='text-red-600 hover:text-red-700'
                        >
                          <Trash2 className='h-3 w-3' />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle>Edit Court</DialogTitle>
                <DialogDescription>Update your court information</DialogDescription>
              </DialogHeader>
              {selectedCourt && (
                <CourtForm
                  initialData={selectedCourt}
                  facilities={facilities}
                  onSubmit={(
                    _: string,
                    data: {
                      name?: string;
                      sportType?: string;
                      pricePerHour?: number;
                      operatingHours?: Record<string, unknown>;
                      isActive?: boolean;
                    }
                  ) => handleUpdateCourt(data)}
                  isEdit
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </OwnerLayout>
    </AuthGuard>
  );
}
