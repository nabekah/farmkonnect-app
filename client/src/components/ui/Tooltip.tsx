import { forwardRef, useState, useCallback, ReactNode, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
export type TooltipTrigger = 'hover' | 'click' | 'focus' | 'manual';

export interface TooltipProps {
  /**
   * Tooltip content
   */
  content: ReactNode;
  /**
   * Children element that triggers the tooltip
   */
  children: ReactNode;
  /**
   * Tooltip position
   */
  position?: TooltipPosition;
  /**
   * Trigger type
   */
  trigger?: TooltipTrigger;
  /**
   * Delay before showing tooltip (ms)
   */
  delayShow?: number;
  /**
   * Delay before hiding tooltip (ms)
   */
  delayHide?: number;
  /**
   * Show arrow indicator
   */
  showArrow?: boolean;
  /**
   * Custom className
   */
  className?: string;
  /**
   * Disabled state
   */
  disabled?: boolean;
  /**
   * Max width of tooltip
   */
  maxWidth?: number;
  /**
   * Custom background color
   */
  bgColor?: string;
  /**
   * Custom text color
   */
  textColor?: string;
}

/**
 * Tooltip Component
 * 
 * Displays helpful text on hover, click, or focus
 */
export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      content,
      children,
      position = 'top',
      trigger = 'hover',
      delayShow = 200,
      delayHide = 0,
      showArrow = true,
      className = '',
      disabled = false,
      maxWidth = 200,
      bgColor = 'bg-gray-900',
      textColor = 'text-white',
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(false);
    const showTimeoutRef = useRef<NodeJS.Timeout>();
    const hideTimeoutRef = useRef<NodeJS.Timeout>();
    const triggerRef = useRef<HTMLDivElement>(null);

    const show = useCallback(() => {
      if (disabled) return;
      clearTimeout(hideTimeoutRef.current);
      showTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delayShow);
    }, [disabled, delayShow]);

    const hide = useCallback(() => {
      clearTimeout(showTimeoutRef.current);
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, delayHide);
    }, [delayHide]);

    const handleMouseEnter = () => {
      if (trigger === 'hover' || trigger === 'manual') show();
    };

    const handleMouseLeave = () => {
      if (trigger === 'hover') hide();
    };

    const handleClick = () => {
      if (trigger === 'click') {
        setIsVisible(!isVisible);
      }
    };

    const handleFocus = () => {
      if (trigger === 'focus') show();
    };

    const handleBlur = () => {
      if (trigger === 'focus') hide();
    };

    useEffect(() => {
      return () => {
        clearTimeout(showTimeoutRef.current);
        clearTimeout(hideTimeoutRef.current);
      };
    }, []);

    const getPositionClasses = () => {
      const baseClasses = 'absolute z-50 pointer-events-none';
      const positionMap: Record<TooltipPosition, string> = {
        'top': 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        'bottom': 'top-full left-1/2 -translate-x-1/2 mt-2',
        'left': 'right-full top-1/2 -translate-y-1/2 mr-2',
        'right': 'left-full top-1/2 -translate-y-1/2 ml-2',
        'top-start': 'bottom-full left-0 mb-2',
        'top-end': 'bottom-full right-0 mb-2',
        'bottom-start': 'top-full left-0 mt-2',
        'bottom-end': 'top-full right-0 mt-2',
        'left-start': 'right-full top-0 mr-2',
        'left-end': 'right-full bottom-0 mr-2',
        'right-start': 'left-full top-0 ml-2',
        'right-end': 'left-full bottom-0 ml-2',
      };
      return `${baseClasses} ${positionMap[position]}`;
    };

    const getArrowClasses = () => {
      const arrowMap: Record<TooltipPosition, string> = {
        'top': 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-t-gray-900 border-t-4 border-x-4 border-x-transparent',
        'bottom': 'top-0 left-1/2 -translate-x-1/2 -translate-y-full border-b-gray-900 border-b-4 border-x-4 border-x-transparent',
        'left': 'right-0 top-1/2 -translate-y-1/2 translate-x-full border-l-gray-900 border-l-4 border-y-4 border-y-transparent',
        'right': 'left-0 top-1/2 -translate-y-1/2 -translate-x-full border-r-gray-900 border-r-4 border-y-4 border-y-transparent',
        'top-start': 'bottom-0 left-2 translate-y-full border-t-gray-900 border-t-4 border-x-4 border-x-transparent',
        'top-end': 'bottom-0 right-2 translate-y-full border-t-gray-900 border-t-4 border-x-4 border-x-transparent',
        'bottom-start': 'top-0 left-2 -translate-y-full border-b-gray-900 border-b-4 border-x-4 border-x-transparent',
        'bottom-end': 'top-0 right-2 -translate-y-full border-b-gray-900 border-b-4 border-x-4 border-x-transparent',
        'left-start': 'right-0 top-2 translate-x-full border-l-gray-900 border-l-4 border-y-4 border-y-transparent',
        'left-end': 'right-0 bottom-2 translate-x-full border-l-gray-900 border-l-4 border-y-4 border-y-transparent',
        'right-start': 'left-0 top-2 -translate-x-full border-r-gray-900 border-r-4 border-y-4 border-y-transparent',
        'right-end': 'left-0 bottom-2 -translate-x-full border-r-gray-900 border-r-4 border-y-4 border-y-transparent',
      };
      return arrowMap[position];
    };

    return (
      <div
        ref={triggerRef}
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {/* Trigger element */}
        <div
          onFocus={handleFocus}
          onBlur={handleBlur}
          tabIndex={trigger === 'focus' ? 0 : -1}
        >
          {children}
        </div>

        {/* Tooltip content */}
        {isVisible && (
          <div
            ref={ref}
            className={cn(
              getPositionClasses(),
              bgColor,
              textColor,
              'px-3 py-2 rounded-md text-sm font-medium shadow-lg transition-opacity duration-200',
              'pointer-events-auto',
              className
            )}
            style={{ maxWidth: `${maxWidth}px` }}
            role="tooltip"
          >
            {content}

            {/* Arrow */}
            {showArrow && (
              <div
                className={cn(
                  'absolute w-0 h-0',
                  getArrowClasses()
                )}
              />
            )}
          </div>
        )}
      </div>
    );
  }
);

Tooltip.displayName = 'Tooltip';

/**
 * TooltipGroup Component
 * 
 * Wrapper for managing multiple tooltips
 */
export interface TooltipGroupProps {
  /**
   * Children elements
   */
  children: ReactNode;
  /**
   * Custom className
   */
  className?: string;
}

export const TooltipGroup = forwardRef<HTMLDivElement, TooltipGroupProps>(
  (
    {
      children,
      className = '',
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('flex gap-2', className)}
      >
        {children}
      </div>
    );
  }
);

TooltipGroup.displayName = 'TooltipGroup';
