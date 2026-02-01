import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MapPin, Truck, Clock, Edit2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export function DeliveryZoneManager() {
  const [showForm, setShowForm] = useState(false);
  const [editingZone, setEditingZone] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    region: "",
    shippingCost: "",
    estimatedDays: "",
  });

  const utils = trpc.useUtils();
  const { data: zones = [], isLoading } = trpc.marketplace.getDeliveryZones.useQuery();

  const createZone = trpc.marketplace.createDeliveryZone.useMutation({
    onSuccess: () => {
      toast.success("Delivery zone added!");
      resetForm();
      utils.marketplace.getDeliveryZones.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add zone");
    },
  });

  const updateZone = trpc.marketplace.updateDeliveryZone.useMutation({
    onSuccess: () => {
      toast.success("Zone updated!");
      resetForm();
      utils.marketplace.getDeliveryZones.invalidate();
    },
  });

  const deleteZone = trpc.marketplace.deleteDeliveryZone.useMutation({
    onSuccess: () => {
      toast.success("Zone deleted");
      utils.marketplace.getDeliveryZones.invalidate();
    },
  });

  const resetForm = () => {
    setFormData({ name: "", region: "", shippingCost: "", estimatedDays: "" });
    setShowForm(false);
    setEditingZone(null);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.region || !formData.shippingCost || !formData.estimatedDays) {
      toast.error("Please fill in all fields");
      return;
    }

    if (editingZone) {
      updateZone.mutate({
        zoneId: editingZone,
        ...formData,
        estimatedDays: parseInt(formData.estimatedDays),
      });
    } else {
      createZone.mutate({
        ...formData,
        estimatedDays: parseInt(formData.estimatedDays),
      });
    }
  };

  const handleEdit = (zone: any) => {
    setFormData({
      name: zone.name,
      region: zone.region,
      shippingCost: zone.shippingCost,
      estimatedDays: zone.estimatedDays.toString(),
    });
    setEditingZone(zone.id);
    setShowForm(true);
  };

  const toggleZoneStatus = (zoneId: number, currentStatus: boolean) => {
    updateZone.mutate({
      zoneId,
      isActive: !currentStatus,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Delivery Zones</h2>
            <p className="text-sm text-muted-foreground">Manage shipping costs and delivery times by region</p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Zone
            </Button>
          )}
        </div>

        {showForm && (
          <div className="mb-6 p-4 border rounded-lg space-y-4">
            <h3 className="font-semibold">
              {editingZone ? "Edit Delivery Zone" : "New Delivery Zone"}
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Zone Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Greater Accra"
                />
              </div>
              <div>
                <Label>Region</Label>
                <Input
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="e.g., Accra Metropolitan"
                />
              </div>
              <div>
                <Label>Shipping Cost (GH₵)</Label>
                <Input
                  type="number"
                  value={formData.shippingCost}
                  onChange={(e) => setFormData({ ...formData, shippingCost: e.target.value })}
                  placeholder="e.g., 25.00"
                  step="0.01"
                />
              </div>
              <div>
                <Label>Estimated Delivery (Days)</Label>
                <Input
                  type="number"
                  value={formData.estimatedDays}
                  onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })}
                  placeholder="e.g., 2"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSubmit} 
                disabled={createZone.isPending || updateZone.isPending}
              >
                {createZone.isPending || updateZone.isPending 
                  ? "Saving..." 
                  : editingZone ? "Update Zone" : "Add Zone"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading zones...</p>
        ) : zones.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No delivery zones configured yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {zones.map((zone) => (
              <Card key={zone.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {zone.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{zone.region}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={zone.isActive}
                      onCheckedChange={() => toggleZoneStatus(zone.id, zone.isActive)}
                    />
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="w-4 h-4 text-muted-foreground" />
                    <span>GH₵{zone.shippingCost} shipping</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{zone.estimatedDays} days delivery</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(zone)}
                    className="flex-1"
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteZone.mutate({ zoneId: zone.id })}
                    disabled={deleteZone.isPending}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6 bg-muted">
        <h3 className="font-semibold mb-3">Ghana Delivery Zones Guide</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium mb-2">Major Cities (1-2 days)</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Greater Accra: GH₵20-30</li>
              <li>• Kumasi (Ashanti): GH₵30-40</li>
              <li>• Takoradi (Western): GH₵35-45</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-2">Regional Areas (3-5 days)</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Northern Region: GH₵50-70</li>
              <li>• Upper East/West: GH₵60-80</li>
              <li>• Volta Region: GH₵40-50</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
