'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Star,
  Calendar,
  MapPin,
  MessageSquare,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  Building2,
} from 'lucide-react';

import { OwnerService } from '@/services/owner.service';
import { Review } from '@/types/owner.types';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface ReviewDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ReviewDetailPage({ params }: ReviewDetailPageProps) {
  const router = useRouter();
  const [review, setReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReview = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const resolvedParams = await params;
        const response = await OwnerService.getReview(resolvedParams.id);
        if (response.data) {
          setReview(response.data);
        } else if (response.error) {
          setError(response.error.message);
          toast.error(response.error.message);
        }
      } catch (error) {
        const errorMessage = 'Failed to load review';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Review error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReview();
  }, [params]);

  const getUserInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStars = (rating: number) => {
    return (
      <div className='flex items-center gap-1'>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
          />
        ))}
        <span className='ml-2 text-lg font-semibold'>{rating}/5</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className='container mx-auto p-6'>
        <div className='mx-auto max-w-4xl'>
          <Card className='animate-pulse'>
            <CardHeader>
              <div className='bg-muted mb-2 h-6 w-1/4 rounded'></div>
              <div className='bg-muted h-4 w-1/2 rounded'></div>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='bg-muted h-4 rounded'></div>
                <div className='bg-muted h-4 w-3/4 rounded'></div>
                <div className='bg-muted h-4 w-1/2 rounded'></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className='container mx-auto p-6'>
        <div className='mx-auto max-w-4xl'>
          <Button variant='ghost' onClick={() => router.back()} className='mb-6 flex items-center gap-2'>
            <ArrowLeft className='h-4 w-4' />
            Back to Reviews
          </Button>

          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{error || 'Review not found'}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6'>
      <div className='mx-auto max-w-4xl'>
        {/* Header */}
        <div className='mb-6 flex items-center justify-between'>
          <Button variant='ghost' onClick={() => router.back()} className='flex items-center gap-2'>
            <ArrowLeft className='h-4 w-4' />
            Back to Reviews
          </Button>

          <Badge variant={review.isApproved ? 'default' : 'secondary'} className='flex items-center gap-1'>
            {review.isApproved ? (
              <>
                <CheckCircle2 className='h-3 w-3' />
                Approved
              </>
            ) : (
              <>
                <Clock className='h-3 w-3' />
                Pending Approval
              </>
            )}
          </Badge>
        </div>

        {/* Main Review Card */}
        <Card>
          <CardHeader>
            <div className='flex items-start gap-4'>
              {/* User Avatar */}
              <Avatar className='h-16 w-16'>
                <AvatarImage src={review.user?.avatarUrl || undefined} />
                <AvatarFallback className='text-lg'>{getUserInitials(review.user?.name || null)}</AvatarFallback>
              </Avatar>

              {/* User Info and Rating */}
              <div className='flex-1'>
                <div className='flex items-start justify-between'>
                  <div>
                    <CardTitle className='text-xl'>{review.user?.name || 'Anonymous User'}</CardTitle>
                    <CardDescription className='mt-1'>{review.user?.email}</CardDescription>
                  </div>
                  <div className='text-right'>{renderStars(review.rating)}</div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className='space-y-6'>
            {/* Facility Information */}
            <div className='space-y-2'>
              <h3 className='flex items-center gap-2 text-lg font-semibold'>
                <Building2 className='h-5 w-5' />
                Facility Details
              </h3>
              <div className='bg-muted/50 rounded-lg p-4'>
                <div className='text-lg font-medium'>{review.facility?.name}</div>
                {review.facility?.shortLocation && (
                  <div className='text-muted-foreground mt-1 flex items-center gap-1'>
                    <MapPin className='h-4 w-4' />
                    {review.facility.shortLocation}
                  </div>
                )}
                {review.facility?.avgRating && (
                  <div className='mt-2 flex items-center gap-1'>
                    <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                    <span className='text-muted-foreground text-sm'>
                      Average Rating: {review.facility.avgRating.toFixed(1)}/5
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Review Comment */}
            <div className='space-y-3'>
              <h3 className='flex items-center gap-2 text-lg font-semibold'>
                <MessageSquare className='h-5 w-5' />
                Review Comment
              </h3>
              {review.comment ? (
                <div className='bg-muted/50 rounded-lg p-4'>
                  <p className='text-foreground leading-relaxed whitespace-pre-wrap'>{review.comment}</p>
                </div>
              ) : (
                <div className='text-muted-foreground italic'>No comment provided with this review.</div>
              )}
            </div>

            <Separator />

            {/* Review Metadata */}
            <div className='space-y-3'>
              <h3 className='flex items-center gap-2 text-lg font-semibold'>
                <Calendar className='h-5 w-5' />
                Review Information
              </h3>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <div className='text-muted-foreground text-sm font-medium'>Submitted</div>
                  <div className='text-sm'>
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className='text-muted-foreground text-xs'>
                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                  </div>
                </div>

                <div className='space-y-2'>
                  <div className='text-muted-foreground text-sm font-medium'>Status</div>
                  <div className='flex items-center gap-2'>
                    {review.isApproved ? (
                      <Badge variant='default' className='flex items-center gap-1'>
                        <CheckCircle2 className='h-3 w-3' />
                        Approved & Published
                      </Badge>
                    ) : (
                      <Badge variant='secondary' className='flex items-center gap-1'>
                        <Clock className='h-3 w-3' />
                        Pending Admin Approval
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Information */}
            {review.bookingId && (
              <>
                <Separator />
                <div className='space-y-2'>
                  <h3 className='text-lg font-semibold'>Related Booking</h3>
                  <div className='text-muted-foreground text-sm'>
                    Booking ID: <code className='bg-muted rounded px-1 py-0.5'>{review.bookingId}</code>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className='mt-6 flex justify-end'>
          <Button variant='outline' onClick={() => router.push('/owner/reviews')}>
            View All Reviews
          </Button>
        </div>
      </div>
    </div>
  );
}
