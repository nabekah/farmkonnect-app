import React from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Lock } from "lucide-react";

interface AccessControlWrapperProps {
  farmId: string;
  requiredPermission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AccessControlWrapper: React.FC<AccessControlWrapperProps> = ({
  farmId,
  requiredPermission,
  children,
  fallback
}) => {
  const { data: hasPermission, isLoading } = trpc.rbac.hasPermission.useQuery(
    { farmId, permission: requiredPermission },
    { enabled: !!farmId }
  );

  if (isLoading) {
    return <div className="animate-pulse h-32 bg-gray-200 rounded-lg" />;
  }

  if (!hasPermission) {
    return (
      fallback || (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-900">Access Restricted</p>
                <p className="text-sm text-yellow-700">
                  You don't have permission to access this feature. Contact your farm manager for access.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    );
  }

  return <>{children}</>;
};
