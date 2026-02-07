import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Clock, X } from "lucide-react";
import { ProgressNotification } from "@/lib/notificationService";

interface BulkOperationProgressProps {
  notifications: ProgressNotification[];
  onDismiss: (id: string) => void;
}

export function BulkOperationProgress({ notifications, onDismiss }: BulkOperationProgressProps) {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 space-y-2 max-w-md z-50">
      {notifications.map((notification) => {
        const progress = (notification.current / notification.total) * 100;
        const isCompleted = notification.status === "completed";
        const isFailed = notification.status === "failed";
        const isInProgress = notification.status === "in-progress";

        return (
          <Card key={notification.id} className="shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {isCompleted && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {isFailed && <AlertCircle className="w-5 h-5 text-red-600" />}
                  {isInProgress && <Clock className="w-5 h-5 text-blue-600 animate-spin" />}
                  <div>
                    <CardTitle className="text-sm">{notification.title}</CardTitle>
                    {notification.message && (
                      <CardDescription className="text-xs mt-1">{notification.message}</CardDescription>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDismiss(notification.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-2">
              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {notification.current} of {notification.total}
                  </span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <Badge
                  variant={
                    isCompleted
                      ? "default"
                      : isFailed
                        ? "destructive"
                        : isInProgress
                          ? "secondary"
                          : "outline"
                  }
                  className="text-xs"
                >
                  {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                </Badge>

                {isCompleted && (
                  <span className="text-xs text-green-600 font-medium">Completed</span>
                )}
                {isFailed && (
                  <span className="text-xs text-red-600 font-medium">Failed</span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
