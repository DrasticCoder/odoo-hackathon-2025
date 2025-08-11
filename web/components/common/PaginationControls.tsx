'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PaginationControlsProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  isLoading?: boolean;
}

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

export function PaginationControls({ meta, onPageChange, onLimitChange, isLoading = false }: PaginationControlsProps) {
  const { page, limit, total, totalPages, hasNext, hasPrev } = meta;

  // Generate page numbers to show
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      range.push(i);
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (page + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && !isLoading) {
      onPageChange(newPage);
    }
  };

  const handleLimitChange = (newLimit: string) => {
    if (!isLoading) {
      onLimitChange(parseInt(newLimit));
    }
  };

  if (total === 0) {
    return null;
  }

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
      {/* Results info */}
      <div className='text-muted-foreground text-sm'>
        Showing {startItem.toLocaleString()} to {endItem.toLocaleString()} of {total.toLocaleString()} results
      </div>

      {/* Pagination controls */}
      <div className='flex items-center gap-2'>
        {/* Items per page selector */}
        <div className='flex items-center gap-2'>
          <span className='text-muted-foreground text-sm'>Show</span>
          <Select value={limit.toString()} onValueChange={handleLimitChange}>
            <SelectTrigger className='w-20'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className='text-muted-foreground text-sm'>per page</span>
        </div>

        {/* Page navigation */}
        {totalPages > 1 && (
          <div className='flex items-center gap-1'>
            {/* First page */}
            <Button
              variant='outline'
              size='sm'
              onClick={() => handlePageChange(1)}
              disabled={!hasPrev || isLoading}
              className='h-8 w-8 p-0'
            >
              <ChevronsLeft className='h-4 w-4' />
            </Button>

            {/* Previous page */}
            <Button
              variant='outline'
              size='sm'
              onClick={() => handlePageChange(page - 1)}
              disabled={!hasPrev || isLoading}
              className='h-8 w-8 p-0'
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>

            {/* Page numbers */}
            <div className='flex items-center gap-1'>
              {getVisiblePages().map((pageNum, index) => (
                <div key={index}>
                  {pageNum === '...' ? (
                    <div className='flex h-8 w-8 items-center justify-center'>
                      <MoreHorizontal className='h-4 w-4' />
                    </div>
                  ) : (
                    <Button
                      variant={pageNum === page ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => handlePageChange(pageNum as number)}
                      disabled={isLoading}
                      className='h-8 w-8 p-0'
                    >
                      {pageNum}
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Next page */}
            <Button
              variant='outline'
              size='sm'
              onClick={() => handlePageChange(page + 1)}
              disabled={!hasNext || isLoading}
              className='h-8 w-8 p-0'
            >
              <ChevronRight className='h-4 w-4' />
            </Button>

            {/* Last page */}
            <Button
              variant='outline'
              size='sm'
              onClick={() => handlePageChange(totalPages)}
              disabled={!hasNext || isLoading}
              className='h-8 w-8 p-0'
            >
              <ChevronsRight className='h-4 w-4' />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
