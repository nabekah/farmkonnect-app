import { useWebSocket } from '@/hooks/useWebSocket';
import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

/**
 * WebSocket Reconnection UI Component
 * Shows connection status and reconnection feedback
 */
export function WebSocketReconnectionUI() {
  const { isConnected, isReconnecting } = useWebSocket();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasDisconnected, setWasDisconnected] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      setWasDisconnected(true);
      setShowReconnected(false);
    } else if (wasDisconnected && !isReconnecting) {
      // Show reconnected message briefly
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasDisconnected(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, isReconnecting, wasDisconnected]);

  // Don't show anything if connected and not reconnecting
  if (isConnected && !showReconnected) {
    return null;
  }

  if (showReconnected) {
    return (
      <div className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm font-medium animate-in fade-in">
        <Wifi className="h-4 w-4" />
        <span>Connection restored</span>
      </div>
    );
  }

  if (isReconnecting) {
    return (
      <div className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium animate-in fade-in">
        <Wifi className="h-4 w-4 animate-pulse" />
        <span>Reconnecting...</span>
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm font-medium animate-in fade-in">
      <WifiOff className="h-4 w-4" />
      <span>Connection lost</span>
    </div>
  );
}
