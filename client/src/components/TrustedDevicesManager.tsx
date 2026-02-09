import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Smartphone, Trash2, Lock } from "lucide-react";

interface TrustedDevicesManagerProps {
  farmId: string;
}

export const TrustedDevicesManager: React.FC<TrustedDevicesManagerProps> = ({ farmId }) => {
  const { data: devices = [], refetch: refetchDevices } = trpc.deviceFingerprinting.getTrustedDevices.useQuery(
    { farmId },
    { enabled: !!farmId }
  );

  const verifyDeviceMutation = trpc.deviceFingerprinting.verifyDevice.useMutation({
    onSuccess: () => refetchDevices()
  });

  const removeDeviceMutation = trpc.deviceFingerprinting.removeDevice.useMutation({
    onSuccess: () => refetchDevices()
  });

  const handleVerifyDevice = async (deviceId: number) => {
    try {
      await verifyDeviceMutation.mutateAsync({ deviceId });
    } catch (error) {
      console.error("Error verifying device:", error);
    }
  };

  const handleRemoveDevice = async (deviceId: number) => {
    if (confirm("Are you sure you want to remove this device?")) {
      try {
        await removeDeviceMutation.mutateAsync({ deviceId });
      } catch (error) {
        console.error("Error removing device:", error);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trusted Devices</CardTitle>
        <CardDescription>Manage devices that can access your farm account</CardDescription>
      </CardHeader>
      <CardContent>
        {devices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Smartphone className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No devices registered yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {devices.map((device: any) => (
              <div
                key={device.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Smartphone className="h-4 w-4 text-gray-600" />
                    <p className="font-medium">{device.deviceName}</p>
                    {device.isVerified ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Unverified
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {device.browserType} on {device.osType}
                  </p>
                  <p className="text-xs text-gray-500">
                    IP: {device.ipAddress} • Last seen: {new Date(device.lastSeenAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!device.isVerified && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerifyDevice(device.id)}
                      disabled={verifyDeviceMutation.isPending}
                    >
                      <Lock className="h-4 w-4 mr-1" />
                      Verify
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveDevice(device.id)}
                    disabled={removeDeviceMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
