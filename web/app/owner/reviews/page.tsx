'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, MessageSquare, Calendar, Grid3X3, List, AlertCircle, TrendingUp } from 'lucide-react';

import { OwnerService } from '@/services/owner.service';
import { Review, ReviewQuery, ReviewStats } from '@/types/owner.types';
import { toast } from 'sonner';
import { ReviewsTable } from './table';
import { ReviewFilters } from '@/components/owner/ReviewFilters';
import { PaginationControls } from '@/components/common/PaginationControls';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ReviewsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Initialize filters from URL params
  const [filters, setFilters] = useState<ReviewQuery>(() => {
    const initialFilters: ReviewQuery = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      include: 'user,facility',
    };

    if (searchParams.get('q')) initialFilters.q = searchParams.get('q')!;
    if (searchParams.get('sort')) initialFilters.sort = searchParams.get('sort')!;
    if (searchParams.get('minRating')) initialFilters.minRating = parseInt(searchParams.get('minRating')!);
    if (searchParams.get('maxRating')) initialFilters.maxRating = parseInt(searchParams.get('maxRating')!);
    if (searchParams.get('facilityId')) initialFilters.facilityId = searchParams.get('facilityId')!;

    return initialFilters;
  });

  // Load reviews when filters change
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await OwnerService.getReviews(filters);
        console.log('Reviews response:', response);
        if (response.data) {
          setReviews(response.data.data);
          setMeta(response.data.meta);
        } else if (response.error) {
          setError(response.error.message);
          toast.error(response.error.message);
        }
      } catch (error) {
        const errorMessage = 'Failed to load reviews';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Reviews error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [filters]);

  // Load stats
  useEffect(() => {
    const loadStats = async () => {
      setIsStatsLoading(true);
      try {
        const response = await OwnerService.getReviewStats();
        if (response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to load review stats:', error);
      } finally {
        setIsStatsLoading(false);
      }
    };

    loadStats();
  }, []);

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
  const handleFiltersChange = useCallback((newFilters: ReviewQuery) => {
    setFilters(newFilters);
  }, []);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setFilters((prev) => ({ ...prev, limit, page: 1 }));
  };

  const renderStats = () => {
    if (isStatsLoading) {
      return (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {[...Array(4)].map((_, i) => (
            <Card key={i} className='animate-pulse'>
              <CardContent className='p-6'>
                <div className='bg-muted mb-2 h-8 w-8 rounded'></div>
                <div className='bg-muted mb-1 h-6 w-16 rounded'></div>
                <div className='bg-muted h-4 w-20 rounded'></div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (!stats) {
      return null;
    }

    const statCards = [
      {
        title: 'Total Reviews',
        value: stats.totalReviews,
        icon: MessageSquare,
        description: 'All time',
        color: 'text-blue-600',
      },
      {
        title: 'Average Rating',
        value: stats.averageRating ? stats.averageRating.toFixed(1) : '0.0',
        icon: Star,
        description: 'Overall rating',
        color: 'text-yellow-600',
      },
      {
        title: 'Approved Reviews',
        value: stats.approvedReviews,
        icon: TrendingUp,
        description: `${stats.totalReviews > 0 ? Math.round((stats.approvedReviews / stats.totalReviews) * 100) : 0}% approval rate`,
        color: 'text-green-600',
      },
      {
        title: 'Pending Reviews',
        value: stats.pendingReviews,
        icon: Calendar,
        description: 'Awaiting approval',
        color: 'text-orange-600',
      },
    ];

    return (
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-muted-foreground text-sm font-medium'>{stat.title}</p>
                  <p className='text-2xl font-bold'>{stat.value}</p>
                  <p className='text-muted-foreground text-xs'>{stat.description}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderGridView = () => {
    if (reviews.length === 0) {
      return (
        <Card>
          <CardContent className='py-12 text-center'>
            <div className='text-muted-foreground mb-4'>
              <MessageSquare className='mx-auto h-12 w-12' />
            </div>
            <h3 className='mb-2 text-lg font-medium'>No reviews found</h3>
            <p className='text-muted-foreground mb-4'>
              {filters.q || filters.minRating || filters.maxRating
                ? 'No reviews match your search criteria.'
                : "You haven't received any reviews yet."}
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {reviews.map((review) => (
          <Link key={review.id} href={`/owner/reviews/${review.id}`}>
            <Card className='cursor-pointer transition-shadow hover:shadow-lg'>
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <CardTitle className='text-lg'>{review.facility?.name}</CardTitle>
                    <CardDescription className='mt-1'>by {review.user?.name || 'Anonymous User'}</CardDescription>
                  </div>
                  <Badge variant={review.isApproved ? 'default' : 'secondary'}>
                    {review.isApproved ? 'Approved' : 'Pending'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {/* Rating */}
                  <div className='flex items-center gap-2'>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                    <span className='font-medium'>{review.rating}/5</span>
                  </div>

                  {/* Comment */}
                  {review.comment && <p className='text-muted-foreground line-clamp-3 text-sm'>{review.comment}</p>}

                  {/* Date */}
                  <div className='text-muted-foreground flex items-center gap-2 text-xs'>
                    <Calendar className='h-3 w-3' />
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    );
  };

  if (isLoading && reviews.length === 0) {
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
      <div className='mb-6'>
        <h1 className='text-foreground text-3xl font-bold'>Reviews Management</h1>
        <p className='text-muted-foreground'>View and manage customer reviews for your facilities</p>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant='destructive' className='mb-6'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className='mb-6'>{renderStats()}</div>

      {/* Filters */}
      <div className='mb-6'>
        <ReviewFilters onFiltersChange={handleFiltersChange} initialFilters={filters} isLoading={isLoading} />
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
            <ReviewsTable reviews={reviews} isLoading={isLoading} />
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
