'use client';

import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Eye, Building2, Clock, ToggleLeft, ToggleRight, IndianRupee } from 'lucide-react';
import { Court } from '@/types/owner.types';
import { DeleteCourtButton } from './delete';

interface CourtsTableProps {
  courts: Court[];
  onDelete: (court: Court) => Promise<void>;
  onToggleStatus: (court: Court) => Promise<void>;
  isLoading?: boolean;
}

export function CourtsTable({ courts, onDelete, onToggleStatus, isLoading = false }: CourtsTableProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className='rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[50px]'></TableHead>
              <TableHead>Court</TableHead>
              <TableHead>Facility</TableHead>
              <TableHead>Sport</TableHead>
              <TableHead>Price/Hour</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Hours</TableHead>
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
                  <div className='bg-muted h-4 w-40 animate-pulse rounded' />
                </TableCell>
                <TableCell>
                  <div className='bg-muted h-6 w-20 animate-pulse rounded' />
                </TableCell>
                <TableCell>
                  <div className='bg-muted h-4 w-16 animate-pulse rounded' />
                </TableCell>
                <TableCell>
                  <div className='bg-muted h-6 w-16 animate-pulse rounded' />
                </TableCell>
                <TableCell>
                  <div className='bg-muted h-4 w-20 animate-pulse rounded' />
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

  if (courts.length === 0) {
    return (
      <div className='rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[50px]'></TableHead>
              <TableHead>Court</TableHead>
              <TableHead>Facility</TableHead>
              <TableHead>Sport</TableHead>
              <TableHead>Price/Hour</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={8} className='py-12 text-center'>
                <div className='text-muted-foreground flex flex-col items-center gap-4'>
                  <Building2 className='h-12 w-12' />
                  <div>
                    <h3 className='text-foreground mb-1 font-medium'>No courts found</h3>
                    <p className='text-sm'>Create your first court to get started</p>
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
            <TableHead>Court</TableHead>
            <TableHead>Facility</TableHead>
            <TableHead>Sport</TableHead>
            <TableHead>Price/Hour</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courts.map((court) => (
            <TableRow key={court.id} className='hover:bg-muted/50 transition-colors'>
              {/* Avatar/Icon */}
              <TableCell>
                <Avatar className='h-10 w-10'>
                  <AvatarImage src={court.photos?.[0]?.url} alt={court.name} />
                  <AvatarFallback className='bg-primary text-primary-foreground'>
                    {court.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TableCell>

              {/* Court Name & Stats */}
              <TableCell>
                <div className='space-y-1'>
                  <div className='text-foreground font-medium'>{court.name}</div>
                  {court.bookingsCount !== undefined && (
                    <div className='text-muted-foreground text-sm'>{court.bookingsCount} bookings</div>
                  )}
                </div>
              </TableCell>

              {/* Facility */}
              <TableCell>
                <div className='text-sm'>{court.facility?.name || 'Unknown Facility'}</div>
                {court.facility?.shortLocation && (
                  <div className='text-muted-foreground text-xs'>{court.facility.shortLocation}</div>
                )}
              </TableCell>

              {/* Sport Type */}
              <TableCell>
                <Badge variant='outline'>{court.sportType}</Badge>
              </TableCell>

              {/* Price */}
              <TableCell>
                <div className='flex items-center gap-1'>
                  <IndianRupee className='text-muted-foreground h-4 w-4' />
                  <span className='font-medium'>{court.pricePerHour}</span>
                </div>
              </TableCell>

              {/* Status */}
              <TableCell>
                <div className='flex items-center gap-2'>
                  <div className={`h-2 w-2 rounded-full ${court.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className='text-sm'>{court.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </TableCell>

              {/* Operating Hours */}
              <TableCell>
                <div className='text-muted-foreground flex items-center gap-1 text-sm'>
                  <Clock className='h-3 w-3' />
                  <span>{court.operatingHours ? 'Custom' : 'Standard'}</span>
                </div>
              </TableCell>

              {/* Actions */}
              <TableCell className='text-right'>
                <div className='flex justify-end gap-1'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => router.push(`/owner/courts/${court.id}`)}
                    className='h-8 w-8 p-0'
                  >
                    <Eye className='h-3 w-3' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => router.push(`/owner/courts/${court.id}/edit`)}
                    className='h-8 w-8 p-0'
                  >
                    <Edit className='h-3 w-3' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => onToggleStatus(court)}
                    className={`h-8 w-8 p-0 ${
                      court.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'
                    }`}
                  >
                    {court.isActive ? <ToggleRight className='h-4 w-4' /> : <ToggleLeft className='h-4 w-4' />}
                  </Button>
                  <DeleteCourtButton court={court} onDelete={onDelete} variant='ghost' />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
