import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

interface BudgetLineItem {
  id?: string;
  expenseType: string;
  budgetedAmount: number;
  description: string;
}

interface BudgetCreationFormProps {
  farmId: string;
  onBudgetCreated?: () => void;
}

const EXPENSE_TYPES = [
  { value: "feed", label: "Animal Feed" },
  { value: "labor", label: "Labor Costs" },
  { value: "equipment", label: "Equipment & Maintenance" },
  { value: "utilities", label: "Utilities" },
  { value: "fertilizer", label: "Fertilizer & Soil" },
  { value: "pesticide", label: "Pesticides & Herbicides" },
  { value: "seeds", label: "Seeds & Seedlings" },
  { value: "water", label: "Water & Irrigation" },
  { value: "veterinary", label: "Veterinary Services" },
  { value: "transport", label: "Transport & Logistics" },
  { value: "storage", label: "Storage & Processing" },
  { value: "other", label: "Other Expenses" },
];

/**
 * Budget Creation Form Component
 * Allows users to create budgets with line items by expense category
 */
export const BudgetCreationForm: React.FC<BudgetCreationFormProps> = ({ farmId, onBudgetCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [budgetName, setBudgetName] = useState("");
  const [budgetType, setBudgetType] = useState("monthly");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0]
  );
  const [lineItems, setLineItems] = useState<BudgetLineItem[]>([
    { expenseType: "feed", budgetedAmount: 0, description: "" },
  ]);

  const createBudgetMutation = trpc.financialManagement.createBudget.useMutation({
    onSuccess: () => {
      toast.success("Budget created successfully");
      resetForm();
      setIsOpen(false);
      onBudgetCreated?.();
    },
    onError: (error) => {
      toast.error(`Failed to create budget: ${error.message}`);
    },
  });

  const resetForm = () => {
    setBudgetName("");
    setBudgetType("monthly");
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0]);
    setLineItems([{ expenseType: "feed", budgetedAmount: 0, description: "" }]);
  };

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { expenseType: "other", budgetedAmount: 0, description: "" }]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const handleLineItemChange = (index: number, field: keyof BudgetLineItem, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const handleCreateBudget = async () => {
    if (!budgetName.trim()) {
      toast.error("Budget name is required");
      return;
    }

    if (lineItems.some((item) => item.budgetedAmount <= 0)) {
      toast.error("All budget amounts must be greater than 0");
      return;
    }

    const totalBudget = lineItems.reduce((sum, item) => sum + item.budgetedAmount, 0);

    createBudgetMutation.mutate({
      farmId,
      budgetName: budgetName.trim(),
      budgetType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalBudget,
      currency: "GHS",
      lineItems: lineItems.map((item) => ({
        expenseType: item.expenseType,
        budgetedAmount: item.budgetedAmount,
        description: item.description,
      })),
    });
  };

  const totalBudget = lineItems.reduce((sum, item) => sum + (item.budgetedAmount || 0), 0);
  const getExpenseTypeLabel = (type: string) => EXPENSE_TYPES.find((t) => t.value === type)?.label || type;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Budget</DialogTitle>
          <DialogDescription>Set up a new budget with expense categories and allocations</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Budget Header Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget-name">Budget Name</Label>
              <Input
                id="budget-name"
                placeholder="e.g., Q1 2026 Operations"
                value={budgetName}
                onChange={(e) => setBudgetName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget-type">Budget Type</Label>
              <Select value={budgetType} onValueChange={setBudgetType}>
                <SelectTrigger id="budget-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="custom">Custom Period</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Budget Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Budget Line Items</Label>
              <Button variant="outline" size="sm" onClick={handleAddLineItem} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Category
              </Button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {lineItems.map((item, index) => (
                <Card key={index} className="p-4 flex gap-4 items-end">
                  <div className="flex-1">
                    <Label className="text-sm">Expense Category</Label>
                    <Select value={item.expenseType} onValueChange={(value) => handleLineItemChange(index, "expenseType", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPENSE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <Label className="text-sm">Amount (GHS)</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={item.budgetedAmount || ""}
                      onChange={(e) => handleLineItemChange(index, "budgetedAmount", parseFloat(e.target.value) || 0)}
                      className="mt-1"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="flex-1">
                    <Label className="text-sm">Description (Optional)</Label>
                    <Input
                      placeholder="Notes..."
                      value={item.description}
                      onChange={(e) => handleLineItemChange(index, "description", e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveLineItem(index)}
                    disabled={lineItems.length === 1}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          {/* Budget Summary */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Budget Allocation</p>
                <p className="text-2xl font-bold text-blue-600">GH₵ {totalBudget.toLocaleString("en-GH", { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-blue-600">{lineItems.length}</p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBudget} disabled={createBudgetMutation.isPending} className="gap-2">
              <Save className="w-4 h-4" />
              {createBudgetMutation.isPending ? "Creating..." : "Create Budget"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
