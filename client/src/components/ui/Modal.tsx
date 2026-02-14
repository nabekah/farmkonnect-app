import { forwardRef, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  /**
   * Modal title
   */
  title?: string;
  /**
   * Modal content
   */
  children: ReactNode;
  /**
   * Footer content (buttons, etc)
   */
  footer?: ReactNode;
  /**
   * Is modal open
   */
  isOpen: boolean;
  /**
   * Callback when modal should close
   */
  onClose: () => void;
  /**
   * Modal size
   */
  size?: ModalSize;
  /**
   * Show close button
   */
  showCloseButton?: boolean;
  /**
   * Close on backdrop click
   */
  closeOnBackdropClick?: boolean;
  /**
   * Close on escape key
   */
  closeOnEscape?: boolean;
  /**
   * Custom className
   */
  className?: string;
  /**
   * Backdrop className
   */
  backdropClassName?: string;
}

/**
 * Modal Component
 * 
 * Dialog modal with backdrop, animations, and focus management
 */
export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      title,
      children,
      footer,
      isOpen,
      onClose,
      size = 'md',
      showCloseButton = true,
      closeOnBackdropClick = true,
      closeOnEscape = true,
      className = '',
      backdropClassName = '',
    },
    ref
  ) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    const sizeClasses: Record<ModalSize, string> = {
      'sm': 'max-w-sm',
      'md': 'max-w-md',
      'lg': 'max-w-lg',
      'xl': 'max-w-xl',
      'full': 'max-w-full mx-4',
    };

    // Handle escape key
    useEffect(() => {
      if (!isOpen || !closeOnEscape) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, closeOnEscape, onClose]);

    // Handle focus management
    useEffect(() => {
      if (isOpen) {
        previousActiveElement.current = document.activeElement as HTMLElement;
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        // Focus first focusable element in modal
        setTimeout(() => {
          const focusable = modalRef.current?.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) as HTMLElement;
          focusable?.focus();
        }, 0);
      } else {
        // Restore body scroll
        document.body.style.overflow = 'unset';
        // Restore focus
        previousActiveElement.current?.focus();
      }

      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isOpen]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnBackdropClick && e.target === e.currentTarget) {
        onClose();
      }
    };

    if (!isOpen) return null;

    return (
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center',
          'animate-in fade-in duration-200'
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            'absolute inset-0 bg-black/50 backdrop-blur-sm',
            'animate-in fade-in duration-200',
            backdropClassName
          )}
          onClick={handleBackdropClick}
        />

        {/* Modal */}
        <div
          ref={ref || modalRef}
          className={cn(
            'relative bg-background rounded-lg shadow-lg border border-border',
            'w-full',
            sizeClasses[size],
            'animate-in zoom-in-95 fade-in duration-200',
            'max-h-[90vh] overflow-y-auto',
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-border">
              {title && (
                <h2 id="modal-title" className="text-lg font-semibold">
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="border-t border-border p-6 bg-muted/50 rounded-b-lg">
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';

/**
 * useModal Hook
 * 
 * Manage modal state
 */
export function useModal(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

/**
 * Dialog Component (Alias for Modal with different semantics)
 */
export interface DialogProps extends Omit<ModalProps, 'isOpen' | 'onClose'> {
  /**
   * Is dialog open
   */
  open: boolean;
  /**
   * Callback when dialog should close
   */
  onOpenChange: (open: boolean) => void;
}

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  (
    {
      open,
      onOpenChange,
      ...props
    },
    ref
  ) => {
    return (
      <Modal
        ref={ref}
        isOpen={open}
        onClose={() => onOpenChange(false)}
        {...props}
      />
    );
  }
);

Dialog.displayName = 'Dialog';

/**
 * AlertDialog Component
 * 
 * Specialized dialog for alerts and confirmations
 */
export interface AlertDialogProps {
  /**
   * Dialog title
   */
  title: string;
  /**
   * Dialog description
   */
  description?: string;
  /**
   * Is dialog open
   */
  isOpen: boolean;
  /**
   * Callback when dialog closes
   */
  onClose: () => void;
  /**
   * Primary action button label
   */
  actionLabel?: string;
  /**
   * Primary action callback
   */
  onAction?: () => void;
  /**
   * Cancel button label
   */
  cancelLabel?: string;
  /**
   * Action button variant
   */
  actionVariant?: 'default' | 'destructive';
  /**
   * Is action loading
   */
  isLoading?: boolean;
}

export const AlertDialog = forwardRef<HTMLDivElement, AlertDialogProps>(
  (
    {
      title,
      description,
      isOpen,
      onClose,
      actionLabel = 'Confirm',
      onAction,
      cancelLabel = 'Cancel',
      actionVariant = 'default',
      isLoading = false,
    },
    ref
  ) => {
    return (
      <Modal
        ref={ref}
        title={title}
        isOpen={isOpen}
        onClose={onClose}
        size="sm"
        footer={
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-md border border-input hover:bg-muted transition-colors disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onAction}
              disabled={isLoading}
              className={cn(
                'px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50',
                actionVariant === 'destructive'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              {isLoading ? 'Loading...' : actionLabel}
            </button>
          </div>
        }
      >
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </Modal>
    );
  }
);

AlertDialog.displayName = 'AlertDialog';
