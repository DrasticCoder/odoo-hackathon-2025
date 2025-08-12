'use client';

import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Eye, MapPin, Star, Calendar, Building2, IndianRupee } from 'lucide-react';
import { Facility } from '@/types/owner.types';
import { DeleteFacilityButton } from './delete';

interface FacilitiesTableProps {
  facilities: Facility[];
  onDelete: (facility: Facility) => Promise<void>;
  isLoading?: boolean;
}

export function FacilitiesTable({ facilities, onDelete, isLoading = false }: FacilitiesTableProps) {
  const router = useRouter();

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

  const formatStatus = (status: string) => {
    return status
      .replace('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className='rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[50px]'></TableHead>
              <TableHead>Facility</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Stats</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className='bg-muted h-10 w-10 animate-pulse rounded-full' />
                </TableCell>
                <TableCell>
                  <div className='space-y-2'>
                    <div className='bg-muted h-4 w-32 animate-pulse rounded' />
                    <div className='bg-muted h-3 w-24 animate-pulse rounded' />
                  </div>
                </TableCell>
                <TableCell>
                  <div className='bg-muted h-6 w-20 animate-pulse rounded' />
                </TableCell>
                <TableCell>
                  <div className='bg-muted h-4 w-40 animate-pulse rounded' />
                </TableCell>
                <TableCell>
                  <div className='space-y-1'>
                    <div className='bg-muted h-3 w-16 animate-pulse rounded' />
                    <div className='bg-muted h-3 w-20 animate-pulse rounded' />
                  </div>
                </TableCell>
                <TableCell>
                  <div className='bg-muted h-4 w-12 animate-pulse rounded' />
                </TableCell>
                <TableCell>
                  <div className='flex justify-end gap-2'>
                    <div className='bg-muted h-8 w-8 animate-pulse rounded' />
                    <div className='bg-muted h-8 w-8 animate-pulse rounded' />
                    <div className='bg-muted h-8 w-8 animate-pulse rounded' />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (facilities.length === 0) {
    return (
      <div className='rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[50px]'></TableHead>
              <TableHead>Facility</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Stats</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className='py-12 text-center'>
                <div className='text-muted-foreground flex flex-col items-center gap-4'>
                  <Building2 className='h-12 w-12' />
                  <div>
                    <h3 className='text-foreground mb-1 font-medium'>No facilities found</h3>
                    <p className='text-sm'>Create your first facility to get started</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className='rounded-lg border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[50px]'></TableHead>
            <TableHead>Facility</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Stats</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {facilities.map((facility) => (
            <TableRow key={facility.id} className='hover:bg-muted/50 transition-colors'>
              {/* Avatar/Icon */}
              <TableCell>
                <Avatar className='h-10 w-10'>
                  <AvatarImage src={facility.photos?.[0]?.url} alt={facility.name} />
                  <AvatarFallback className='bg-primary text-primary-foreground'>
                    {facility.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TableCell>

              {/* Facility Name & Description */}
              <TableCell>
                <div className='space-y-1'>
                  <div className='text-foreground font-medium'>{facility.name}</div>
                  {facility.description && (
                    <div className='text-muted-foreground line-clamp-1 text-sm'>{facility.description}</div>
                  )}
                  {facility.sportTypes && facility.sportTypes.length > 0 && (
                    <div className='mt-1 flex gap-1'>
                      {facility.sportTypes.slice(0, 2).map((sport: string, index: number) => (
                        <Badge key={index} variant='outline' className='text-xs'>
                          {sport}
                        </Badge>
                      ))}
                      {facility.sportTypes.length > 2 && (
                        <Badge variant='outline' className='text-xs'>
                          +{facility.sportTypes.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </TableCell>

              {/* Status */}
              <TableCell>
                <Badge variant={getStatusVariant(facility.status)}>{formatStatus(facility.status)}</Badge>
              </TableCell>

              {/* Location */}
              <TableCell>
                <div className='text-muted-foreground flex items-center gap-1 text-sm'>
                  <MapPin className='h-3 w-3 shrink-0' />
                  <span className='max-w-[200px] truncate'>{facility.shortLocation || facility.address}</span>
                </div>
              </TableCell>

              {/* Stats */}
              <TableCell>
                <div className='space-y-1 text-sm'>
                  <div className='text-muted-foreground flex items-center gap-1'>
                    <Calendar className='h-3 w-3' />
                    <span>{facility.courtsCount || 0} courts</span>
                  </div>
                  <div className='text-muted-foreground flex items-center gap-1'>
                    <IndianRupee className='h-3 w-3' />
                    <span>{facility.startingPrice ? `$${facility.startingPrice}/hr` : 'No pricing'}</span>
                  </div>
                </div>
              </TableCell>

              {/* Rating */}
              <TableCell>
                {facility.avgRating ? (
                  <div className='flex items-center gap-1'>
                    <Star className='fill-primary text-primary h-3 w-3' />
                    <span className='text-sm font-medium'>{facility.avgRating.toFixed(1)}</span>
                    <span className='text-muted-foreground text-xs'>({facility.reviewsCount || 0})</span>
                  </div>
                ) : (
                  <span className='text-muted-foreground text-sm'>No ratings</span>
                )}
              </TableCell>

              {/* Actions */}
              <TableCell className='text-right'>
                <div className='flex justify-end gap-1'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => router.push(`/owner/facilities/${facility.id}`)}
                    className='h-8 w-8 p-0'
                  >
                    <Eye className='h-3 w-3' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => router.push(`/owner/facilities/${facility.id}/edit`)}
                    className='h-8 w-8 p-0'
                  >
                    <Edit className='h-3 w-3' />
                  </Button>
                  <DeleteFacilityButton facility={facility} onDelete={onDelete} variant='ghost' />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
