import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, MapPin, Shield, Trash2, Plus } from "lucide-react";

interface SecuritySettingsProps {
  farmId: string;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ farmId }) => {
  const [newIP, setNewIP] = useState("");
  const [ipDescription, setIPDescription] = useState("");
  const [zoneName, setZoneName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radius, setRadius] = useState("1000");

  const { data: whitelistedIPs = [], refetch: refetchIPs } = trpc.securityControls.getWhitelistedIPs.useQuery(
    { farmId },
    { enabled: !!farmId }
  );

  const { data: geofences = [], refetch: refetchGeofences } = trpc.securityControls.getGeofences.useQuery(
    { farmId },
    { enabled: !!farmId }
  );

  const addIPMutation = trpc.securityControls.addIPToWhitelist.useMutation({
    onSuccess: () => {
      refetchIPs();
      setNewIP("");
      setIPDescription("");
    }
  });

  const removeIPMutation = trpc.securityControls.removeIPFromWhitelist.useMutation({
    onSuccess: () => refetchIPs()
  });

  const createGeofenceMutation = trpc.securityControls.createGeofence.useMutation({
    onSuccess: () => {
      refetchGeofences();
      setZoneName("");
      setLatitude("");
      setLongitude("");
      setRadius("1000");
    }
  });

  const handleAddIP = async () => {
    if (!newIP.trim()) {
      alert("Please enter an IP address");
      return;
    }
    try {
      await addIPMutation.mutateAsync({
        farmId,
        ipAddress: newIP,
        description: ipDescription
      });
    } catch (error) {
      console.error("Error adding IP:", error);
    }
  };

  const handleRemoveIP = async (ipId: number) => {
    try {
      await removeIPMutation.mutateAsync({ ipId });
    } catch (error) {
      console.error("Error removing IP:", error);
    }
  };

  const handleCreateGeofence = async () => {
    if (!zoneName.trim() || !latitude || !longitude) {
      alert("Please fill in all required fields");
      return;
    }
    try {
      await createGeofenceMutation.mutateAsync({
        farmId,
        zoneName,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radiusMeters: parseInt(radius)
      });
    } catch (error) {
      console.error("Error creating geofence:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="ip" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ip">
            <Shield className="h-4 w-4 mr-2" />
            IP Whitelist
          </TabsTrigger>
          <TabsTrigger value="geofence">
            <MapPin className="h-4 w-4 mr-2" />
            Geofencing
          </TabsTrigger>
        </TabsList>

        {/* IP Whitelist Tab */}
        <TabsContent value="ip" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>IP Whitelist Management</CardTitle>
              <CardDescription>Control which IP addresses can access this farm</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add IP Form */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-sm">Add IP Address</h3>
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="192.168.1.100 or 192.168.1.0/24"
                    value={newIP}
                    onChange={(e) => setNewIP(e.target.value)}
                  />
                  <Input
                    type="text"
                    placeholder="Description (optional)"
                    value={ipDescription}
                    onChange={(e) => setIPDescription(e.target.value)}
                  />
                  <Button
                    onClick={handleAddIP}
                    disabled={addIPMutation.isPending}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add IP
                  </Button>
                </div>
              </div>

              {/* IP List */}
              {whitelistedIPs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2 text-yellow-500" />
                  <p>No whitelisted IPs yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {whitelistedIPs.map((ip: any) => (
                    <div
                      key={ip.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <p className="font-mono text-sm font-medium">{ip.ipAddress}</p>
                        {ip.description && (
                          <p className="text-xs text-gray-600">{ip.description}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          Last used: {ip.lastUsedAt ? new Date(ip.lastUsedAt).toLocaleDateString() : "Never"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {ip.isActive && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveIP(ip.id)}
                          disabled={removeIPMutation.isPending}
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
        </TabsContent>

        {/* Geofencing Tab */}
        <TabsContent value="geofence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geofence Zones</CardTitle>
              <CardDescription>Define geographic boundaries for farm access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Create Geofence Form */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-sm">Create Geofence Zone</h3>
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Zone name (e.g., Main Farm Area)"
                    value={zoneName}
                    onChange={(e) => setZoneName(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Latitude"
                      step="0.00001"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Longitude"
                      step="0.00001"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                    />
                  </div>
                  <Input
                    type="number"
                    placeholder="Radius (meters)"
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                  />
                  <Button
                    onClick={handleCreateGeofence}
                    disabled={createGeofenceMutation.isPending}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Zone
                  </Button>
                </div>
              </div>

              {/* Geofences List */}
              {geofences.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-2 text-blue-500" />
                  <p>No geofence zones created yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {geofences.map((zone: any) => (
                    <div
                      key={zone.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{zone.zoneName}</p>
                        <p className="text-xs text-gray-600">
                          {zone.latitude}, {zone.longitude} (Radius: {zone.radiusMeters}m)
                        </p>
                        {zone.alertOnExit && (
                          <Badge className="mt-1 bg-blue-100 text-blue-800 text-xs">
                            Alert on exit
                          </Badge>
                        )}
                      </div>
                      <div>
                        {zone.isActive && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
