import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { PerformanceAlert, getAlertColor } from '@/lib/performanceAlerts';

interface PerformanceAlertsProps {
  alerts: PerformanceAlert[];
  onDismiss?: (alertId: string) => void;
}

export function PerformanceAlerts({ alerts, onDismiss }: PerformanceAlertsProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const visibleAlerts = useMemo(() => {
    return alerts.filter((alert) => !dismissedAlerts.has(alert.id));
  }, [alerts, dismissedAlerts]);

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts((prev) => new Set([...prev, alertId]));
    onDismiss?.(alertId);
  };

  if (visibleAlerts.length === 0) {
    return null;
  }

  const errorAlerts = visibleAlerts.filter((a) => a.type === 'error');
  const warningAlerts = visibleAlerts.filter((a) => a.type === 'warning');
  const infoAlerts = visibleAlerts.filter((a) => a.type === 'info');

  return (
    <Card className="mb-6 border-l-4 border-l-red-500">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <CardTitle>Performance Alerts</CardTitle>
          </div>
          <span className="text-sm text-muted-foreground">
            {visibleAlerts.length} alert{visibleAlerts.length !== 1 ? 's' : ''}
          </span>
        </div>
        <CardDescription>
          {errorAlerts.length > 0 && `${errorAlerts.length} critical`}
          {errorAlerts.length > 0 && warningAlerts.length > 0 && ', '}
          {warningAlerts.length > 0 && `${warningAlerts.length} warning`}
          {(errorAlerts.length > 0 || warningAlerts.length > 0) && infoAlerts.length > 0 && ', '}
          {infoAlerts.length > 0 && `${infoAlerts.length} info`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Error Alerts */}
          {errorAlerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} onDismiss={handleDismiss} />
          ))}

          {/* Warning Alerts */}
          {warningAlerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} onDismiss={handleDismiss} />
          ))}

          {/* Info Alerts */}
          {infoAlerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} onDismiss={handleDismiss} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface AlertItemProps {
  alert: PerformanceAlert;
  onDismiss: (alertId: string) => void;
}

function AlertItem({ alert, onDismiss }: AlertItemProps) {
  const getIcon = () => {
    switch (alert.type) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (alert.type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${getBgColor()}`}>
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{alert.title}</p>
        <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
        <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
          <span>Worker ID: {alert.userId}</span>
          <span>•</span>
          <span>{alert.timestamp.toLocaleTimeString()}</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDismiss(alert.id)}
        className="flex-shrink-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
