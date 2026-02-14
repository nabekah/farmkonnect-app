import { forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Base Skeleton Component
 */
export interface SkeletonProps {
  /**
   * Width of skeleton
   */
  width?: string | number;
  /**
   * Height of skeleton
   */
  height?: string | number;
  /**
   * Border radius
   */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /**
   * Custom className
   */
  className?: string;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      width,
      height = 20,
      rounded = 'md',
      className = '',
    },
    ref
  ) => {
    const roundedClasses = {
      'none': '',
      'sm': 'rounded-sm',
      'md': 'rounded-md',
      'lg': 'rounded-lg',
      'full': 'rounded-full',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700',
          roundedClasses[rounded],
          className
        )}
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
        }}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

/**
 * Card Skeleton Component
 */
export interface CardSkeletonProps {
  /**
   * Number of lines to show
   */
  lines?: number;
  /**
   * Show image placeholder
   */
  showImage?: boolean;
  /**
   * Image height
   */
  imageHeight?: number;
  /**
   * Custom className
   */
  className?: string;
}

export const CardSkeleton = forwardRef<HTMLDivElement, CardSkeletonProps>(
  (
    {
      lines = 3,
      showImage = true,
      imageHeight = 200,
      className = '',
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('p-4 rounded-lg border border-border', className)}
      >
        {/* Image */}
        {showImage && (
          <Skeleton height={imageHeight} className="w-full mb-4" />
        )}

        {/* Title */}
        <Skeleton height={24} width="60%" className="mb-3" />

        {/* Lines */}
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            height={16}
            width={i === lines - 1 ? '80%' : '100%'}
            className={cn('mb-2', i === lines - 1 && 'mb-0')}
          />
        ))}
      </div>
    );
  }
);

CardSkeleton.displayName = 'CardSkeleton';

/**
 * Table Skeleton Component
 */
export interface TableSkeletonProps {
  /**
   * Number of rows
   */
  rows?: number;
  /**
   * Number of columns
   */
  columns?: number;
  /**
   * Show header
   */
  showHeader?: boolean;
  /**
   * Custom className
   */
  className?: string;
}

export const TableSkeleton = forwardRef<HTMLDivElement, TableSkeletonProps>(
  (
    {
      rows = 5,
      columns = 4,
      showHeader = true,
      className = '',
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('w-full', className)}
      >
        {/* Header */}
        {showHeader && (
          <div className="flex gap-4 mb-4 pb-4 border-b border-border">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton
                key={`header-${i}`}
                height={20}
                width={`${100 / columns}%`}
              />
            ))}
          </div>
        )}

        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="flex gap-4 mb-3 pb-3 border-b border-border last:border-0"
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={`cell-${rowIndex}-${colIndex}`}
                height={16}
                width={`${100 / columns}%`}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }
);

TableSkeleton.displayName = 'TableSkeleton';

/**
 * Form Skeleton Component
 */
export interface FormSkeletonProps {
  /**
   * Number of fields
   */
  fields?: number;
  /**
   * Show submit button
   */
  showButton?: boolean;
  /**
   * Custom className
   */
  className?: string;
}

export const FormSkeleton = forwardRef<HTMLDivElement, FormSkeletonProps>(
  (
    {
      fields = 4,
      showButton = true,
      className = '',
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('space-y-4', className)}
      >
        {/* Fields */}
        {Array.from({ length: fields }).map((_, i) => (
          <div key={`field-${i}`} className="space-y-2">
            {/* Label */}
            <Skeleton height={16} width="30%" className="mb-2" />

            {/* Input */}
            <Skeleton height={40} width="100%" />
          </div>
        ))}

        {/* Button */}
        {showButton && (
          <Skeleton height={40} width="100%" className="mt-6" />
        )}
      </div>
    );
  }
);

FormSkeleton.displayName = 'FormSkeleton';

/**
 * List Skeleton Component
 */
export interface ListSkeletonProps {
  /**
   * Number of items
   */
  items?: number;
  /**
   * Show avatar
   */
  showAvatar?: boolean;
  /**
   * Custom className
   */
  className?: string;
}

export const ListSkeleton = forwardRef<HTMLDivElement, ListSkeletonProps>(
  (
    {
      items = 5,
      showAvatar = true,
      className = '',
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('space-y-3', className)}
      >
        {Array.from({ length: items }).map((_, i) => (
          <div key={`item-${i}`} className="flex gap-3">
            {/* Avatar */}
            {showAvatar && (
              <Skeleton height={40} width={40} rounded="full" className="flex-shrink-0" />
            )}

            {/* Content */}
            <div className="flex-1 space-y-2">
              <Skeleton height={16} width="40%" />
              <Skeleton height={14} width="70%" />
            </div>
          </div>
        ))}
      </div>
    );
  }
);

ListSkeleton.displayName = 'ListSkeleton';

/**
 * Grid Skeleton Component
 */
export interface GridSkeletonProps {
  /**
   * Number of items
   */
  items?: number;
  /**
   * Number of columns
   */
  columns?: number;
  /**
   * Custom className
   */
  className?: string;
}

export const GridSkeleton = forwardRef<HTMLDivElement, GridSkeletonProps>(
  (
    {
      items = 6,
      columns = 3,
      className = '',
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'grid gap-4',
          `grid-cols-${columns}`,
          className
        )}
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: items }).map((_, i) => (
          <CardSkeleton key={`grid-item-${i}`} lines={2} />
        ))}
      </div>
    );
  }
);

GridSkeleton.displayName = 'GridSkeleton';

/**
 * Profile Skeleton Component
 */
export interface ProfileSkeletonProps {
  /**
   * Show header image
   */
  showHeaderImage?: boolean;
  /**
   * Custom className
   */
  className?: string;
}

export const ProfileSkeleton = forwardRef<HTMLDivElement, ProfileSkeletonProps>(
  (
    {
      showHeaderImage = true,
      className = '',
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('space-y-4', className)}
      >
        {/* Header image */}
        {showHeaderImage && (
          <Skeleton height={200} width="100%" />
        )}

        {/* Avatar */}
        <div className="flex justify-center -mt-12 mb-4">
          <Skeleton height={100} width={100} rounded="full" />
        </div>

        {/* Name */}
        <div className="text-center">
          <Skeleton height={24} width="40%" className="mx-auto mb-2" />
          <Skeleton height={16} width="50%" className="mx-auto" />
        </div>

        {/* Stats */}
        <div className="flex justify-around gap-4 py-4 border-y border-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`stat-${i}`} className="text-center flex-1">
              <Skeleton height={20} width="60%" className="mx-auto mb-2" />
              <Skeleton height={14} width="80%" className="mx-auto" />
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Skeleton height={16} width="100%" />
          <Skeleton height={16} width="95%" />
          <Skeleton height={16} width="85%" />
        </div>
      </div>
    );
  }
);

ProfileSkeleton.displayName = 'ProfileSkeleton';

/**
 * Chat Skeleton Component
 */
export interface ChatSkeletonProps {
  /**
   * Number of messages
   */
  messages?: number;
  /**
   * Custom className
   */
  className?: string;
}

export const ChatSkeleton = forwardRef<HTMLDivElement, ChatSkeletonProps>(
  (
    {
      messages = 5,
      className = '',
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('space-y-4', className)}
      >
        {Array.from({ length: messages }).map((_, i) => {
          const isRight = i % 2 === 0;
          return (
            <div
              key={`message-${i}`}
              className={cn('flex gap-2', isRight && 'flex-row-reverse')}
            >
              {/* Avatar */}
              <Skeleton height={32} width={32} rounded="full" className="flex-shrink-0" />

              {/* Message */}
              <div className="flex-1">
                <Skeleton
                  height={16}
                  width={isRight ? '60%' : '40%'}
                  className={cn('mb-2', isRight && 'ml-auto')}
                />
                <Skeleton
                  height={40}
                  width={isRight ? '70%' : '80%'}
                  className={cn(isRight && 'ml-auto')}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);

ChatSkeleton.displayName = 'ChatSkeleton';
