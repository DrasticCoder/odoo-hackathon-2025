'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Star, Calendar, MapPin, MessageSquare, Eye } from 'lucide-react';
import { Review } from '@/types/owner.types';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface ReviewsTableProps {
  reviews: Review[];
  isLoading?: boolean;
}

export function ReviewsTable({ reviews, isLoading }: ReviewsTableProps) {
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  const toggleExpanded = (reviewId: string) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const renderStars = (rating: number) => {
    return (
      <div className='flex items-center gap-1'>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
          />
        ))}
        <span className='ml-1 text-sm font-medium'>{rating}</span>
      </div>
    );
  };

  const getUserInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='animate-pulse'>
                <div className='flex items-start space-x-4'>
                  <div className='bg-muted h-10 w-10 rounded-full'></div>
                  <div className='flex-1 space-y-2'>
                    <div className='bg-muted h-4 w-1/4 rounded'></div>
                    <div className='bg-muted h-3 w-full rounded'></div>
                    <div className='bg-muted h-3 w-3/4 rounded'></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className='py-12 text-center'>
          <div className='text-muted-foreground mb-4'>
            <MessageSquare className='mx-auto h-12 w-12' />
          </div>
          <h3 className='mb-2 text-lg font-medium'>No reviews found</h3>
          <p className='text-muted-foreground'>
            No reviews match your current filters. Try adjusting your search criteria.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <MessageSquare className='h-5 w-5' />
          Reviews ({reviews.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Facility</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='w-[100px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  {/* Customer */}
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage src={review.user?.avatarUrl || undefined} />
                        <AvatarFallback className='text-xs'>
                          {getUserInitials(review.user?.name || null)}
                        </AvatarFallback>
                      </Avatar>
                      <div className='min-w-0'>
                        <div className='font-medium'>{review.user?.name || 'Anonymous'}</div>
                        <div className='text-muted-foreground text-xs'>{review.user?.email}</div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Facility */}
                  <TableCell>
                    <div className='min-w-0'>
                      <div className='font-medium'>{review.facility?.name}</div>
                      {review.facility?.shortLocation && (
                        <div className='text-muted-foreground flex items-center gap-1 text-xs'>
                          <MapPin className='h-3 w-3' />
                          {review.facility.shortLocation}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Rating */}
                  <TableCell>{renderStars(review.rating)}</TableCell>

                  {/* Comment */}
                  <TableCell className='max-w-xs'>
                    {review.comment ? (
                      <div>
                        <p className='text-sm'>
                          {expandedReviews.has(review.id) ? review.comment : truncateText(review.comment, 100)}
                        </p>
                        {review.comment.length > 100 && (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => toggleExpanded(review.id)}
                            className='mt-1 h-auto p-0 text-xs'
                          >
                            {expandedReviews.has(review.id) ? 'Show less' : 'Show more'}
                          </Button>
                        )}
                      </div>
                    ) : (
                      <span className='text-muted-foreground italic'>No comment</span>
                    )}
                  </TableCell>

                  {/* Date */}
                  <TableCell>
                    <div className='text-muted-foreground flex items-center gap-1 text-sm'>
                      <Calendar className='h-3 w-3' />
                      {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge variant={review.isApproved ? 'default' : 'secondary'}>
                      {review.isApproved ? 'Approved' : 'Pending'}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <Link href={`/owner/reviews/${review.id}`}>
                      <Button variant='ghost' size='sm' title='View Details'>
                        <Eye className='h-4 w-4' />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
