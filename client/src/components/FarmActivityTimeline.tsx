import { trpc } from "@/lib/trpc";
import { Loader2, Sprout, Heart, CloudRain, Wheat, Apple, Activity } from "lucide-react";

const activityIcons: Record<string, any> = {
  crop_planting: Sprout,
  livestock_addition: Heart,
  weather_alert: CloudRain,
  harvest: Wheat,
  feeding: Apple,
  health_check: Activity,
  other: Activity,
};

const activityColors: Record<string, string> = {
  crop_planting: "text-green-600 bg-green-50 dark:bg-green-950",
  livestock_addition: "text-blue-600 bg-blue-50 dark:bg-blue-950",
  weather_alert: "text-orange-600 bg-orange-50 dark:bg-orange-950",
  harvest: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950",
  feeding: "text-purple-600 bg-purple-50 dark:bg-purple-950",
  health_check: "text-red-600 bg-red-50 dark:bg-red-950",
  other: "text-gray-600 bg-gray-50 dark:bg-gray-950",
};

export function FarmActivityTimeline({ farmId }: { farmId: number }) {
  const { data: activities = [], isLoading } = trpc.farms.getActivities.useQuery({ farmId });

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        No activities recorded yet
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[300px] overflow-y-auto">
      {activities.slice(-10).reverse().map((activity: any) => {
        const Icon = activityIcons[activity.activityType] || Activity;
        const colorClass = activityColors[activity.activityType] || activityColors.other;
        
        return (
          <div key={activity.id} className="flex gap-3 items-start">
            <div className={`p-2 rounded-full ${colorClass}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{activity.title}</p>
              {activity.description && (
                <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(activity.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
