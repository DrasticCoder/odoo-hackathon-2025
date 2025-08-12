'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import { UserRole } from '@/types/auth.type';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { OwnerService } from '@/services/owner.service';
import type { Facility } from '@/types/owner.types';
import { toast } from 'sonner';
import { AspectRatio } from '@/components/ui/aspect-ratio';

export default function VenuesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [q, setQ] = useState('');
  const [sport, setSport] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit, sort: 'name,asc' };
      if (q) params.q = q;
      if (sport !== 'all') params.sporttype = sport;
      const res = await OwnerService.getFacilities(params);
      console.log(res);
      if (res.data) {
        const items = Array.isArray(res.data.data) ? (res.data.data as Facility[]) : [];
        setFacilities(items);
        setTotal(res.data.meta.total);
      } else {
        setFacilities([]);
        setTotal(0);
      }
    } catch {
      toast.error('Failed to load venues');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, q, sport]);

  useEffect(() => {
    const t = setTimeout(() => load(), 300);
    return () => clearTimeout(t);
  }, [load]);

  const allSports = useMemo(() => {
    const set = new Set<string>();
    const list = Array.isArray(facilities) ? facilities : [];
    list.forEach((f) => (f.sportTypes || []).forEach((s) => set.add(s)));
    return ['all', ...Array.from(set)];
  }, [facilities]);

  return (
    <AuthGuard requiredRole={UserRole.USER}>
      <div className='container mx-auto p-6'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold'>Sports Venues</h1>
          <p className='text-muted-foreground mt-2'>Find and book your favorite sports facilities</p>
        </div>

        {/* Search and Filters */}
        <div className='mb-8 space-y-4'>
          <div className='flex flex-col gap-4 sm:flex-row'>
            <div className='relative flex-1'>
              <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
              <Input
                placeholder='Search venues...'
                className='pl-10'
                value={q}
                onChange={(e) => {
                  setPage(1);
                  setQ(e.target.value);
                }}
              />
            </div>
            <Button variant='outline' className='flex items-center gap-2' onClick={() => load()}>
              <Filter className='h-4 w-4' />
              Apply
            </Button>
          </div>

          {/* Quick Filters */}
          <div className='flex flex-wrap gap-2'>
            {allSports.map((s) => (
              <Button
                key={s}
                variant={sport === s ? 'default' : 'outline'}
                size='sm'
                onClick={() => {
                  setPage(1);
                  setSport(s);
                }}
              >
                {s === 'all' ? 'All Sports' : s}
              </Button>
            ))}
          </div>
        </div>

        {/* Venues Grid */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {isLoading && <div className='text-muted-foreground'>Loading...</div>}
          {!isLoading &&
            facilities.map((venue) => (
              <Card key={venue.id} className='overflow-hidden transition-shadow hover:shadow-sm'>
                <div className='relative'>
                  <AspectRatio ratio={16 / 9}>
                    <div className='bg-muted h-full w-full' />
                  </AspectRatio>
                  <div className='absolute top-3 right-3'>
                    <Badge variant='secondary'>
                      {venue.startingPrice ? `₹${venue.startingPrice}/hr` : 'Pricing varies'}
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <div className='flex items-start justify-between gap-2'>
                    <div>
                      <CardTitle className='text-lg'>{venue.name}</CardTitle>
                      <CardDescription className='mt-1 flex items-center gap-1'>
                        <MapPin className='h-3 w-3' />
                        {venue.shortLocation || venue.address}
                      </CardDescription>
                    </div>
                    {venue.courtsCount !== undefined && (
                      <Badge variant='outline' className='shrink-0'>
                        {venue.courtsCount} courts
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  {venue.description && <p className='text-muted-foreground mb-3 text-sm'>{venue.description}</p>}

                  {/* Sport Types */}
                  <div className='mb-4 flex flex-wrap gap-1'>
                    {(venue.sportTypes || []).map((sport) => (
                      <Badge key={sport} variant='outline' className='text-xs'>
                        {sport}
                      </Badge>
                    ))}
                  </div>

                  <Button asChild className='w-full'>
                    <Link href={`/venues/${venue.id}`}>View Details & Book</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          {!isLoading && facilities.length === 0 && <div className='text-muted-foreground'>No venues found.</div>}
        </div>

        {/* Pagination */}
        <div className='mt-8 flex items-center justify-center gap-2'>
          <Button variant='outline' disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <span className='text-muted-foreground text-sm'>Page {page}</span>
          <Button
            variant='outline'
            disabled={facilities.length < limit || page * limit >= total}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </AuthGuard>
  );
}
