import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Trash2, Check, AlertCircle, Activity, Zap } from "lucide-react";

const notificationTypeIcons: Record<string, React.ReactNode> = {
  vaccination_due: <AlertCircle className="h-4 w-4 text-blue-500" />,
  vaccination_overdue: <AlertCircle className="h-4 w-4 text-red-500" />,
  breeding_due: <Activity className="h-4 w-4 text-green-500" />,
  breeding_overdue: <AlertCircle className="h-4 w-4 text-orange-500" />,
  health_alert: <AlertCircle className="h-4 w-4 text-red-500" />,
  performance_alert: <Activity className="h-4 w-4 text-yellow-500" />,
  feed_low: <Zap className="h-4 w-4 text-orange-500" />,
  task_reminder: <Bell className="h-4 w-4 text-blue-500" />,
  system_alert: <AlertCircle className="h-4 w-4 text-gray-500" />,
};

const priorityColors: Record<string, string> = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const { data: allNotifications = [], refetch: refetchAll } = trpc.notifications.getAll.useQuery({ limit: 100 });
  const { data: unreadNotifications = [] } = trpc.notifications.getUnread.useQuery();
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation();
  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation();
  const deleteNotificationMutation = trpc.notifications.delete.useMutation();

  const unreadCount = unreadNotifications.length;

  const handleMarkAsRead = async (id: number) => {
    await markAsReadMutation.mutateAsync({ id });
    refetchAll();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsReadMutation.mutateAsync();
    refetchAll();
  };

  const handleDelete = async (id: number) => {
    await deleteNotificationMutation.mutateAsync({ id });
    refetchAll();
  };

  const filteredNotifications = allNotifications.filter((notif: any) => {
    if (selectedFilter === "unread") return !notif.isRead;
    if (selectedFilter === "critical") return notif.priority === "critical";
    if (selectedFilter === "high") return notif.priority === "high";
    return true;
  });

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 hover:bg-accent rounded-lg transition-colors"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <div className="flex items-center justify-between w-full">
              <DialogTitle>Notifications</DialogTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs"
                >
                  Mark all as read
                </Button>
              )}
            </div>
          </DialogHeader>

          <Tabs value={selectedFilter} onValueChange={setSelectedFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
              <TabsTrigger value="critical">Critical</TabsTrigger>
              <TabsTrigger value="high">High</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedFilter} className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                {filteredNotifications.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>No notifications</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredNotifications.map((notif: any) => (
                      <div
                        key={notif.id}
                        className={`p-3 rounded-lg border transition-colors ${
                          notif.isRead
                            ? "bg-background border-border"
                            : "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {notificationTypeIcons[notif.type] || <Bell className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-sm truncate">{notif.title}</h4>
                              <Badge className={priorityColors[notif.priority] || "bg-gray-100"}>
                                {notif.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{notif.message}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-muted-foreground">
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </span>
                              {notif.actionUrl && (
                                <a
                                  href={notif.actionUrl}
                                  className="text-xs text-blue-500 hover:underline"
                                  onClick={() => setIsOpen(false)}
                                >
                                  View
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {!notif.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notif.id)}
                                title="Mark as read"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(notif.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
