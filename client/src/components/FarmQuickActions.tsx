import { useLocation } from "wouter";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Plus, Eye, BarChart3, FileUp } from "lucide-react";

export function FarmQuickActions() {
  const [, setLocation] = useLocation();

  const quickActions = [
    {
      icon: Plus,
      label: "Register Animals",
      description: "Add new livestock to your farm",
      action: () => setLocation("/bulk-animal-registration"),
      color: "bg-blue-50 dark:bg-blue-950",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: Eye,
      label: "View Inventory",
      description: "Check your animal inventory",
      action: () => setLocation("/animal-inventory"),
      color: "bg-green-50 dark:bg-green-950",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      icon: BarChart3,
      label: "Animal Analytics",
      description: "View herd statistics and trends",
      action: () => setLocation("/animal-analytics"),
      color: "bg-purple-50 dark:bg-purple-950",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      icon: FileUp,
      label: "Import from CSV",
      description: "Bulk import animals from file",
      action: () => setLocation("/bulk-animal-registration?mode=csv"),
      color: "bg-orange-50 dark:bg-orange-950",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
        <CardDescription>Fast access to common livestock management tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <button
                key={action.label}
                onClick={action.action}
                className={`p-4 rounded-lg border border-transparent transition-all hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 ${action.color}`}
              >
                <div className="flex flex-col items-start gap-2">
                  <IconComponent className={`h-6 w-6 ${action.iconColor}`} />
                  <div className="text-left">
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {action.label}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {action.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
