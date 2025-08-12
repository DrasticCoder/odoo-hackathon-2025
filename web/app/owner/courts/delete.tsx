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
import { Court } from '@/types/owner.types';

interface DeleteCourtDialogProps {
  court: Court | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (court: Court) => Promise<void>;
}

export function DeleteCourtDialog({ court, isOpen, onClose, onConfirm }: DeleteCourtDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!court) return;

    setIsDeleting(true);
    try {
      await onConfirm(court);
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!court) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2'>
            <Trash2 className='text-destructive h-5 w-5' />
            Delete Court
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <span className='text-foreground font-semibold'>{court.name}</span>?
            <br />
            <br />
            This action cannot be undone. This will permanently delete the court and remove all associated data
            including bookings and availability slots.
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
                Delete Court
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface DeleteCourtButtonProps {
  court: Court;
  onDelete: (court: Court) => Promise<void>;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function DeleteCourtButton({
  court,
  onDelete,
  size = 'sm',
  variant = 'outline',
  className,
  onClick,
}: DeleteCourtButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
    }
    setIsDialogOpen(true);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        className={`text-destructive hover:text-destructive ${className || ''}`}
      >
        <Trash2 className='h-3 w-3' />
      </Button>

      <DeleteCourtDialog
        court={court}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={onDelete}
      />
    </>
  );
}
