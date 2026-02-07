import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Plus, Pill, TrendingDown } from "lucide-react";
import { toast } from "sonner";

interface MedicationTrackingPanelProps {
  farmId?: number;
  animalId?: number;
}

export function MedicationTrackingPanel({ farmId, animalId }: MedicationTrackingPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    medicationName: "",
    medicationType: "antibiotic" as const,
    quantity: 0,
    unit: "",
    expirationDate: "",
    cost: 0,
    supplier: "",
    notes: "",
  });

  const { data: inventory, refetch: refetchInventory } = trpc.medicationTracking.getMedicationInventory.useQuery({
    farmId,
  });

  const { data: stats } = trpc.medicationTracking.getMedicationStats.useQuery({ farmId });

  const addMedicationMutation = trpc.medicationTracking.addMedication.useMutation({
    onSuccess: () => {
      toast.success("Medication added to inventory");
      setFormData({
        medicationName: "",
        medicationType: "antibiotic",
        quantity: 0,
        unit: "",
        expirationDate: "",
        cost: 0,
        supplier: "",
        notes: "",
      });
      setIsOpen(false);
      refetchInventory();
    },
  });

  const handleAddMedication = () => {
    if (!formData.medicationName || !formData.quantity || !formData.expirationDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    addMedicationMutation.mutate({
      farmId,
      medicationName: formData.medicationName,
      medicationType: formData.medicationType,
      quantity: formData.quantity,
      unit: formData.unit,
      expirationDate: formData.expirationDate,
      cost: formData.cost,
      supplier: formData.supplier,
      notes: formData.notes,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      case "expiring_soon":
        return <Badge variant="secondary" className="bg-yellow-100">Expiring Soon</Badge>;
      case "low_stock":
        return <Badge variant="secondary" className="bg-orange-100">Low Stock</Badge>;
      default:
        return <Badge variant="outline">OK</Badge>;
    }
  };

  const medicationsList = inventory || [];
  const expiredCount = medicationsList.filter((m: any) => m.status === "expired").length;
  const expiringCount = medicationsList.filter((m: any) => m.status === "expiring_soon").length;
  const lowStockCount = medicationsList.filter((m: any) => m.status === "low_stock").length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Medication Inventory</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Medication to Inventory</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold">Medication Name</label>
                <input
                  type="text"
                  placeholder="e.g., Amoxicillin"
                  value={formData.medicationName}
                  onChange={(e) => setFormData({ ...formData, medicationName: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Type</label>
                <select
                  value={formData.medicationType}
                  onChange={(e) => setFormData({ ...formData, medicationType: e.target.value as any })}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="antibiotic">Antibiotic</option>
                  <option value="vaccine">Vaccine</option>
                  <option value="supplement">Supplement</option>
                  <option value="treatment">Treatment</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-semibold">Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">Unit</label>
                  <input
                    type="text"
                    placeholder="ml, tablets, vials"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold">Expiration Date</label>
                <input
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-semibold">Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">Supplier</label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border rounded px-2 py-1 h-20"
                />
              </div>
              <Button
                onClick={handleAddMedication}
                disabled={addMedicationMutation.isPending}
                className="w-full"
              >
                Add to Inventory
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alert Cards */}
      {(expiredCount > 0 || expiringCount > 0 || lowStockCount > 0) && (
        <div className="grid grid-cols-3 gap-2">
          {expiredCount > 0 && (
            <Card className="p-3 bg-red-50 border-red-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-xs font-semibold text-red-600">{expiredCount} Expired</p>
                </div>
              </div>
            </Card>
          )}
          {expiringCount > 0 && (
            <Card className="p-3 bg-yellow-50 border-yellow-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-xs font-semibold text-yellow-600">{expiringCount} Expiring</p>
                </div>
              </div>
            </Card>
          )}
          {lowStockCount > 0 && (
            <Card className="p-3 bg-orange-50 border-orange-200">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-xs font-semibold text-orange-600">{lowStockCount} Low Stock</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Inventory List */}
      {medicationsList.length === 0 ? (
        <Card className="p-6 text-center">
          <Pill className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No medications in inventory</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {medicationsList.map((med: any) => (
            <Card key={med.id} className="p-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">{med.medicationName}</p>
                    {getStatusBadge(med.status)}
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Type: {med.medicationType}</p>
                    <p>Quantity: {med.quantity} {med.unit}</p>
                    <p>Expires: {new Date(med.expirationDate).toLocaleDateString()}</p>
                    {med.supplier && <p>Supplier: {med.supplier}</p>}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <Card className="p-4 bg-blue-50">
          <p className="font-semibold text-sm mb-2">Inventory Summary</p>
          <div className="text-xs text-gray-600 space-y-1">
            <p>Total Medications: {stats.costAnalysis?.totalMedications || 0}</p>
            <p>Total Inventory Cost: ${stats.costAnalysis?.totalInventoryCost?.toFixed(2) || "0.00"}</p>
            <p>Average Cost per Item: ${stats.costAnalysis?.avgMedicationCost?.toFixed(2) || "0.00"}</p>
          </div>
        </Card>
      )}
    </div>
  );
}
