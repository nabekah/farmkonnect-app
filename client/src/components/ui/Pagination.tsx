import { forwardRef, ReactNode } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  /**
   * Current page (1-indexed)
   */
  currentPage: number;
  /**
   * Total number of pages
   */
  totalPages: number;
  /**
   * Callback when page changes
   */
  onPageChange: (page: number) => void;
  /**
   * Show first/last page buttons
   */
  showFirstLast?: boolean;
  /**
   * Number of page buttons to show around current page
   */
  siblingCount?: number;
  /**
   * Custom className
   */
  className?: string;
  /**
   * Is pagination disabled
   */
  disabled?: boolean;
}

/**
 * Generate page numbers to display
 */
function getPaginationPages(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | string)[] {
  const pages: (number | string)[] = [];
  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);

  // Add first page
  pages.push(1);

  // Add left ellipsis if needed
  if (leftSibling > 2) {
    pages.push('...');
  }

  // Add sibling pages
  for (let i = leftSibling; i <= rightSibling; i++) {
    if (i !== 1 && i !== totalPages) {
      pages.push(i);
    }
  }

  // Add right ellipsis if needed
  if (rightSibling < totalPages - 1) {
    pages.push('...');
  }

  // Add last page if more than 1 page
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

/**
 * Pagination Component
 * 
 * Navigation for paginated content
 */
export const Pagination = forwardRef<HTMLDivElement, PaginationProps>(
  (
    {
      currentPage,
      totalPages,
      onPageChange,
      showFirstLast = true,
      siblingCount = 1,
      className = '',
      disabled = false,
    },
    ref
  ) => {
    const pages = getPaginationPages(currentPage, totalPages, siblingCount);
    const canGoPrevious = currentPage > 1;
    const canGoNext = currentPage < totalPages;

    const handlePageClick = (page: number) => {
      if (!disabled && page !== currentPage) {
        onPageChange(page);
      }
    };

    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center gap-1', className)}
      >
        {/* First page button */}
        {showFirstLast && (
          <button
            onClick={() => handlePageClick(1)}
            disabled={!canGoPrevious || disabled}
            className={cn(
              'p-2 rounded-md border border-input transition-colors',
              'hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        )}

        {/* Previous button */}
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={!canGoPrevious || disabled}
          className={cn(
            'p-2 rounded-md border border-input transition-colors',
            'hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pages.map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <span className="px-2 py-1 text-muted-foreground">...</span>
              ) : (
                <button
                  onClick={() => handlePageClick(page as number)}
                  disabled={disabled}
                  className={cn(
                    'min-w-10 h-10 rounded-md border transition-colors',
                    page === currentPage
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-input hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {page}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={!canGoNext || disabled}
          className={cn(
            'p-2 rounded-md border border-input transition-colors',
            'hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Last page button */}
        {showFirstLast && (
          <button
            onClick={() => handlePageClick(totalPages)}
            disabled={!canGoNext || disabled}
            className={cn(
              'p-2 rounded-md border border-input transition-colors',
              'hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

Pagination.displayName = 'Pagination';

/**
 * PaginationInfo Component
 * 
 * Display pagination information
 */
export interface PaginationInfoProps {
  /**
   * Current page (1-indexed)
   */
  currentPage: number;
  /**
   * Total number of pages
   */
  totalPages: number;
  /**
   * Total number of items
   */
  totalItems: number;
  /**
   * Items per page
   */
  itemsPerPage: number;
  /**
   * Custom className
   */
  className?: string;
}

export const PaginationInfo = forwardRef<HTMLDivElement, PaginationInfoProps>(
  (
    {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      className = '',
    },
    ref
  ) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
      <div
        ref={ref}
        className={cn('text-sm text-muted-foreground', className)}
      >
        Showing {startItem} to {endItem} of {totalItems} items
      </div>
    );
  }
);

PaginationInfo.displayName = 'PaginationInfo';

/**
 * PaginationControls Component
 * 
 * Combined pagination with items per page selector
 */
export interface PaginationControlsProps {
  /**
   * Current page (1-indexed)
   */
  currentPage: number;
  /**
   * Total number of pages
   */
  totalPages: number;
  /**
   * Callback when page changes
   */
  onPageChange: (page: number) => void;
  /**
   * Items per page options
   */
  itemsPerPageOptions?: number[];
  /**
   * Current items per page
   */
  itemsPerPage?: number;
  /**
   * Callback when items per page changes
   */
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  /**
   * Total number of items
   */
  totalItems?: number;
  /**
   * Show info text
   */
  showInfo?: boolean;
  /**
   * Custom className
   */
  className?: string;
}

export const PaginationControls = forwardRef<HTMLDivElement, PaginationControlsProps>(
  (
    {
      currentPage,
      totalPages,
      onPageChange,
      itemsPerPageOptions = [10, 25, 50, 100],
      itemsPerPage = 10,
      onItemsPerPageChange,
      totalItems = 0,
      showInfo = true,
      className = '',
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-between gap-4 flex-wrap', className)}
      >
        {/* Items per page selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="items-per-page" className="text-sm font-medium">
            Items per page:
          </label>
          <select
            id="items-per-page"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange?.(Number(e.target.value))}
            className="px-2 py-1 rounded-md border border-input bg-background text-sm"
          >
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Info */}
        {showInfo && totalItems > 0 && (
          <PaginationInfo
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          showFirstLast={totalPages > 5}
        />
      </div>
    );
  }
);

PaginationControls.displayName = 'PaginationControls';

/**
 * usePagination Hook
 * 
 * Manage pagination state
 */
export interface UsePaginationOptions {
  /**
   * Initial page
   */
  initialPage?: number;
  /**
   * Initial items per page
   */
  initialItemsPerPage?: number;
  /**
   * Total number of items
   */
  totalItems: number;
}

export function usePagination({
  initialPage = 1,
  initialItemsPerPage = 10,
  totalItems,
}: UsePaginationOptions) {
  const [currentPage, setCurrentPage] = React.useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = React.useState(initialItemsPerPage);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    startIndex,
    endIndex,
    handlePageChange,
    handleItemsPerPageChange,
  };
}

// Import React for usePagination
import React from 'react';
