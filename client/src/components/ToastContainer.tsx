import { useToast } from '@/contexts/ToastContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Button } from './ui/button';

/**
 * Individual Toast Component
 */
function ToastItem({
  id,
  type,
  title,
  message,
  action,
  onDismiss,
}: {
  id: string;
  type: string;
  title: string;
  message: string;
  action?: { label: string; onClick: () => void };
  onDismiss: () => void;
}) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-900';
    }
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-right ${getStyles()}`}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-sm opacity-90 mt-1">{message}</p>
        {action && (
          <Button
            size="sm"
            variant="ghost"
            onClick={action.onClick}
            className="mt-2 h-8"
          >
            {action.label}
          </Button>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 p-1 hover:bg-black/10 rounded transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Toast Container Component
 * Displays all active toasts
 */
export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md pointer-events-auto">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          action={toast.action}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
