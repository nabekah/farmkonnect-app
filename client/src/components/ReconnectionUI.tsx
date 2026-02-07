import { useEffect, useState } from 'react';
import { Wifi, WifiOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReconnectionUIProps {
  isConnected: boolean;
  isReconnecting: boolean;
  reconnectAttempt?: number;
  maxReconnectAttempts?: number;
}

/**
 * Reconnection UI Component
 * Displays visual feedback during WebSocket reconnection attempts
 * Shows connection status, attempt count, and estimated time
 */
export function ReconnectionUI({
  isConnected,
  isReconnecting,
  reconnectAttempt = 0,
  maxReconnectAttempts = 10,
}: ReconnectionUIProps) {
  const [showUI, setShowUI] = useState(false);
  const [displayMessage, setDisplayMessage] = useState('');

  useEffect(() => {
    if (isReconnecting) {
      setShowUI(true);
      setDisplayMessage(`Reconnecting... (Attempt ${reconnectAttempt}/${maxReconnectAttempts})`);
    } else if (isConnected) {
      setDisplayMessage('Connection restored');
      // Auto-hide after 3 seconds when reconnected
      const timer = setTimeout(() => {
        setShowUI(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowUI(true);
      setDisplayMessage('Connection lost');
    }
  }, [isConnected, isReconnecting, reconnectAttempt, maxReconnectAttempts]);

  if (!showUI) {
    return null;
  }

  const isFailedReconnection = !isConnected && !isReconnecting && reconnectAttempt > 0;
  const reconnectionProgress = (reconnectAttempt / maxReconnectAttempts) * 100;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div
        className={cn(
          'rounded-lg shadow-lg border p-4 transition-all duration-300',
          isConnected
            ? 'bg-green-50 border-green-200'
            : isReconnecting
            ? 'bg-yellow-50 border-yellow-200'
            : 'bg-red-50 border-red-200'
        )}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {isConnected ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 animate-bounce" />
            ) : isReconnecting ? (
              <Loader2 className="h-5 w-5 text-yellow-600 animate-spin" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3
              className={cn(
                'font-semibold text-sm mb-1',
                isConnected
                  ? 'text-green-900'
                  : isReconnecting
                  ? 'text-yellow-900'
                  : 'text-red-900'
              )}
            >
              {isConnected ? 'Connected' : isReconnecting ? 'Reconnecting' : 'Disconnected'}
            </h3>

            <p
              className={cn(
                'text-xs mb-2',
                isConnected
                  ? 'text-green-700'
                  : isReconnecting
                  ? 'text-yellow-700'
                  : 'text-red-700'
              )}
            >
              {displayMessage}
            </p>

            {/* Progress Bar */}
            {isReconnecting && (
              <div className="w-full bg-yellow-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-yellow-600 h-full transition-all duration-500"
                  style={{ width: `${reconnectionProgress}%` }}
                />
              </div>
            )}

            {/* Additional Info */}
            {isReconnecting && reconnectAttempt > 3 && (
              <p className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Multiple reconnection attempts - check your internet connection
              </p>
            )}

            {isFailedReconnection && (
              <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Failed to reconnect. Please refresh the page.
              </p>
            )}
          </div>

          {/* Close Button */}
          {(isConnected || isFailedReconnection) && (
            <button
              onClick={() => setShowUI(false)}
              className={cn(
                'flex-shrink-0 text-lg leading-none opacity-50 hover:opacity-100 transition-opacity',
                isConnected ? 'text-green-600' : 'text-red-600'
              )}
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
