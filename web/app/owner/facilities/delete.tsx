'use client';

import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { Facility } from '@/types/owner.types';

interface DeleteFacilityDialogProps {
  facility: Facility | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (facility: Facility) => Promise<void>;
}

export function DeleteFacilityDialog({ facility, isOpen, onClose, onConfirm }: DeleteFacilityDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!facility) return;

    setIsDeleting(true);
    try {
      await onConfirm(facility);
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!facility) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2'>
            <Trash2 className='text-destructive h-5 w-5' />
            Delete Facility
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <span className='text-foreground font-semibold'>{facility.name}</span>?
            <br />
            <br />
            This action cannot be undone. This will permanently delete the facility and remove all associated data
            including courts, bookings, and reviews.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {isDeleting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className='mr-2 h-4 w-4' />
                Delete Facility
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface DeleteFacilityButtonProps {
  facility: Facility;
  onDelete: (facility: Facility) => Promise<void>;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export function DeleteFacilityButton({
  facility,
  onDelete,
  size = 'sm',
  variant = 'outline',
}: DeleteFacilityButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsDialogOpen(true)}
        className='text-destructive hover:text-destructive'
      >
        <Trash2 className='h-3 w-3' />
      </Button>

      <DeleteFacilityDialog
        facility={facility}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={onDelete}
      />
    </>
  );
}
