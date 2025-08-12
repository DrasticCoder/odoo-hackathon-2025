'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X, Clock, Building2, IndianRupee, MapPin, AlertCircle, Calendar } from 'lucide-react';
import { OwnerService } from '@/services/owner.service';
import type { Court } from '@/types/owner.types';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function CourtApprovalsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    court: Court | null;
    action: 'approve' | 'reject';
  }>({ open: false, court: null, action: 'approve' });

  useEffect(() => {
    loadPendingCourts();
  }, []);

  const loadPendingCourts = async () => {
    setIsLoading(true);
    try {
      const response = await OwnerService.getPendingCourts();
      if (response.data) {
        setCourts(response.data);
      } else if (response.error) {
        toast.error(response.error.message);
      }
    } catch (error) {
      toast.error('Failed to load pending courts');
      console.error('Error loading pending courts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (court: Court) => {
    setActionLoading(court.id);
    try {
      const response = await OwnerService.approveCourt(court.id);
      if (response.data) {
        toast.success(`Court "${court.name}" has been approved`);
        setCourts(courts.filter((c) => c.id !== court.id));
      } else if (response.error) {
        toast.error(response.error.message);
      }
    } catch (error) {
      toast.error('Failed to approve court');
      console.error('Error approving court:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (court: Court) => {
    setActionLoading(court.id);
    try {
      const response = await OwnerService.rejectCourt(court.id);
      if (response.data) {
        toast.success(`Court "${court.name}" has been rejected`);
        setCourts(courts.filter((c) => c.id !== court.id));
      } else if (response.error) {
        toast.error(response.error.message);
      }
    } catch (error) {
      toast.error('Failed to reject court');
      console.error('Error rejecting court:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const openConfirmDialog = (court: Court, action: 'approve' | 'reject') => {
    setConfirmDialog({ open: true, court, action });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, court: null, action: 'approve' });
  };

  const confirmAction = async () => {
    if (!confirmDialog.court) return;

    if (confirmDialog.action === 'approve') {
      await handleApprove(confirmDialog.court);
    } else {
      await handleReject(confirmDialog.court);
    }
    closeConfirmDialog();
  };

  if (isLoading) {
    return (
      <div className='container mx-auto p-6'>
        <div className='space-y-6'>
          <div className='space-y-2'>
            <div className='bg-muted h-8 w-64 animate-pulse rounded'></div>
            <div className='bg-muted h-4 w-96 animate-pulse rounded'></div>
          </div>
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
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold tracking-tight'>Court Approvals</h1>
        <p className='text-muted-foreground mt-2'>Review and approve court submissions from facility owners</p>
      </div>

      {/* Stats */}
      <div className='mb-6'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <Clock className='h-5 w-5 text-orange-500' />
                <span className='text-sm font-medium'>Pending Approvals:</span>
                <Badge variant='secondary'>{courts.length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courts List */}
      {courts.length === 0 ? (
        <Card>
          <CardContent className='py-16 text-center'>
            <div className='text-muted-foreground mb-4'>
              <Check className='mx-auto h-16 w-16' />
            </div>
            <h3 className='mb-2 text-xl font-semibold'>All caught up!</h3>
            <p className='text-muted-foreground'>There are no courts waiting for approval at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {courts.map((court) => (
            <Card key={court.id} className='transition-all hover:shadow-md'>
              <CardHeader>
                <div className='flex items-start gap-3'>
                  <Avatar className='h-12 w-12'>
                    <AvatarImage src={court.photos?.[0]?.url} alt={court.name} />
                    <AvatarFallback className='bg-primary text-primary-foreground'>
                      {court.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='min-w-0 flex-1'>
                    <CardTitle className='text-lg'>{court.name}</CardTitle>
                    <CardDescription className='mt-1 flex items-center gap-1'>
                      <Building2 className='h-3 w-3' />
                      {court.facility?.name}
                    </CardDescription>
                    {court.facility?.shortLocation && (
                      <CardDescription className='mt-1 flex items-center gap-1'>
                        <MapPin className='h-3 w-3' />
                        {court.facility.shortLocation}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Court Details */}
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <span className='text-muted-foreground'>Sport:</span>
                    <div className='mt-1'>
                      <Badge variant='outline'>{court.sportType}</Badge>
                    </div>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Price/Hour:</span>
                    <div className='mt-1 flex items-center gap-1'>
                      <IndianRupee className='h-3 w-3' />
                      <span className='font-medium'>₹{court.pricePerHour}</span>
                    </div>
                  </div>
                </div>

                {/* Submission Date */}
                <div className='text-sm'>
                  <span className='text-muted-foreground'>Submitted:</span>
                  <div className='mt-1 flex items-center gap-1'>
                    <Calendar className='h-3 w-3' />
                    <span>{new Date(court.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Status */}
                <div className='flex items-center gap-2'>
                  <Badge variant='secondary' className='flex items-center gap-1'>
                    <Clock className='h-3 w-3' />
                    Pending Approval
                  </Badge>
                </div>

                {/* Actions */}
                <div className='flex gap-2 pt-2'>
                  <Button
                    size='sm'
                    className='flex-1'
                    onClick={() => openConfirmDialog(court, 'approve')}
                    disabled={actionLoading === court.id}
                  >
                    <Check className='mr-1 h-3 w-3' />
                    Approve
                  </Button>
                  <Button
                    variant='destructive'
                    size='sm'
                    className='flex-1'
                    onClick={() => openConfirmDialog(court, 'reject')}
                    disabled={actionLoading === court.id}
                  >
                    <X className='mr-1 h-3 w-3' />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={closeConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              <AlertCircle className='h-5 w-5' />
              Confirm {confirmDialog.action === 'approve' ? 'Approval' : 'Rejection'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {confirmDialog.action} the court &quot;{confirmDialog.court?.name}&quot;?
              {confirmDialog.action === 'approve'
                ? ' This will make it visible to users for booking.'
                : ' This will prevent users from seeing or booking this court.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={confirmDialog.action === 'reject' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {confirmDialog.action === 'approve' ? 'Approve' : 'Reject'} Court
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
