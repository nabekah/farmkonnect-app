import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, DollarSign, TrendingUp, TrendingDown, Trash2, Edit2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function FarmFinance() {
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
  const [showExpense, setShowExpense] = useState(false);
  const [showRevenue, setShowRevenue] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
  const [editingRevenueId, setEditingRevenueId] = useState<number | null>(null);

  // Fetch farms
  const { data: farms = [] } = trpc.farms.list.useQuery();

  // Set first farm as default
  useMemo(() => {
    if (farms.length > 0 && !selectedFarmId) {
      setSelectedFarmId(farms[0].id);
    }
  }, [farms, selectedFarmId]);

  // Fetch expenses
  const { data: expenses = [], isLoading: expensesLoading, refetch: refetchExpenses } = trpc.financial.expenses.list.useQuery(
    selectedFarmId ? { farmId: selectedFarmId } : { farmId: 0 },
    { enabled: !!selectedFarmId }
  );

  // Fetch revenues
  const { data: revenues = [], isLoading: revenuesLoading, refetch: refetchRevenues } = trpc.financial.revenue.list.useQuery(
    selectedFarmId ? { farmId: selectedFarmId } : { farmId: 0 },
    { enabled: !!selectedFarmId }
  );

  // Mutations
  const createExpense = trpc.financial.expenses.create.useMutation({
    onSuccess: () => {
      refetchExpenses();
      setShowExpense(false);
    },
  });

  const updateExpense = trpc.financial.expenses.update.useMutation({
    onSuccess: () => {
      refetchExpenses();
      setEditingExpenseId(null);
    },
  });

  const deleteExpense = trpc.financial.expenses.delete.useMutation({
    onSuccess: () => {
      refetchExpenses();
    },
  });

  const createRevenue = trpc.financial.revenue.create.useMutation({
    onSuccess: () => {
      refetchRevenues();
      setShowRevenue(false);
    },
  });

  const updateRevenue = trpc.financial.revenue.update.useMutation({
    onSuccess: () => {
      refetchRevenues();
      setEditingRevenueId(null);
    },
  });

  const deleteRevenue = trpc.financial.revenue.delete.useMutation({
    onSuccess: () => {
      refetchRevenues();
    },
  });

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount?.toString() || "0") || 0), 0);
  const totalRevenue = revenues.reduce((sum, r) => sum + (parseFloat(r.amount?.toString() || "0") || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0";

  const expensesByCategory = expenses.reduce((acc: Record<string, number>, e) => {
    const cat = e.category || "Other";
    acc[cat] = (acc[cat] || 0) + (parseFloat(e.amount?.toString() || "0") || 0);
    return acc;
  }, {});

  const revenueBySource = revenues.reduce((acc: Record<string, number>, r) => {
    const src = r.source || "Other";
    acc[src] = (acc[src] || 0) + (parseFloat(r.amount?.toString() || "0") || 0);
    return acc;
  }, {});

  const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFarmId) return;

    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get("amount") as string);

    if (editingExpenseId) {
      await updateExpense.mutateAsync({
        id: editingExpenseId,
        category: (formData.get("category") as any) || undefined,
        amount,
        description: (formData.get("description") as string) || undefined,
        vendor: (formData.get("vendor") as string) || undefined,
      });
    } else {
      await createExpense.mutateAsync({
        farmId: selectedFarmId,
        category: (formData.get("category") as any) || "other",
        amount,
        expenseDate: new Date(formData.get("date") as string),
        description: (formData.get("description") as string) || undefined,
        vendor: (formData.get("vendor") as string) || undefined,
      });
    }
    (e.target as HTMLFormElement).reset();
  };

  const handleAddRevenue = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFarmId) return;

    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get("amount") as string);

    if (editingRevenueId) {
      await updateRevenue.mutateAsync({
        id: editingRevenueId,
        amount,
        buyer: (formData.get("buyer") as string) || undefined,
        quantity: (formData.get("quantity") as string) || undefined,
        notes: (formData.get("notes") as string) || undefined,
      });
    } else {
      await createRevenue.mutateAsync({
        farmId: selectedFarmId,
        source: (formData.get("source") as any) || "other",
        amount,
        saleDate: new Date(formData.get("date") as string),
        buyer: (formData.get("buyer") as string) || undefined,
        quantity: (formData.get("quantity") as string) || undefined,
        notes: (formData.get("notes") as string) || undefined,
      });
    }
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <DollarSign className="w-8 h-8" />
            Farm Finance
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">Track expenses and revenue</p>
        </div>
        <div className="flex flex-col gap-2">
          <Select value={selectedFarmId?.toString() || ""} onValueChange={(val) => setSelectedFarmId(parseInt(val))}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Select farm" />
            </SelectTrigger>
            <SelectContent>
              {farms.map((farm) => (
                <SelectItem key={farm.id} value={farm.id.toString()}>
                  {farm.farmName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              ₵{totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              ₵{totalExpenses.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              ₵{netProfit.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${parseFloat(profitMargin) >= 0 ? "text-green-600" : "text-red-600"}`}>
              {profitMargin}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Buttons */}
      <div className="flex flex-col gap-2 md:flex-row">
        <Dialog open={showExpense} onOpenChange={setShowExpense}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingExpenseId ? "Edit Expense" : "Record Expense"}</DialogTitle>
              <DialogDescription>Add a farm expense</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue="seeds">
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seeds">Seeds/Seedlings</SelectItem>
                    <SelectItem value="fertilizer">Fertilizer</SelectItem>
                    <SelectItem value="pesticides">Pesticides</SelectItem>
                    <SelectItem value="labor">Labor</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="water">Water/Irrigation</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (GHS)</Label>
                <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Details about the expense..." />
              </div>
              <Button type="submit" className="w-full" disabled={createExpense.isPending || updateExpense.isPending}>
                {createExpense.isPending || updateExpense.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Record Expense"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showRevenue} onOpenChange={setShowRevenue}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Revenue
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRevenueId ? "Edit Revenue" : "Record Revenue"}</DialogTitle>
              <DialogDescription>Add farm income</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddRevenue} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Select name="source" defaultValue="crop_sale">
                  <SelectTrigger id="source">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crop_sale">Crop Sale</SelectItem>
                    <SelectItem value="livestock_sale">Livestock Sale</SelectItem>
                    <SelectItem value="produce_sale">Produce Sale</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (GHS)</Label>
                <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buyer">Buyer</Label>
                <Input id="buyer" name="buyer" placeholder="Buyer name" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" name="quantity" type="number" placeholder="100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input id="unit" name="unit" placeholder="kg" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createRevenue.isPending || updateRevenue.isPending}>
                {createRevenue.isPending || updateRevenue.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Record Revenue"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>Farm expenses by category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {expensesLoading ? (
              <p className="text-center text-muted-foreground py-4">Loading...</p>
            ) : Object.entries(expensesByCategory).length > 0 ? (
              Object.entries(expensesByCategory).map(([category, amount]: [string, any]) => (
                <div key={category} className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm font-medium">{category}</span>
                  <span className="font-semibold">₵{amount.toFixed(2)}</span>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No expenses recorded yet</p>
            )}
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Farm income by source</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {revenuesLoading ? (
              <p className="text-center text-muted-foreground py-4">Loading...</p>
            ) : Object.entries(revenueBySource).length > 0 ? (
              Object.entries(revenueBySource).map(([source, amount]: [string, any]) => (
                <div key={source} className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm font-medium">{source}</span>
                  <span className="font-semibold">₵{amount.toFixed(2)}</span>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No revenue recorded yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {[...expenses, ...revenues]
              .sort((a, b) => {
                const dateA = (a as any).expenseDate || (a as any).saleDate;
                const dateB = (b as any).expenseDate || (b as any).saleDate;
                return new Date(dateB).getTime() - new Date(dateA).getTime();
              })
              .slice(0, 10)
              .map((transaction: any) => {
                const transDate = transaction.expenseDate || transaction.saleDate;
                return (
                  <div key={`${transaction.category || transaction.source}-${transaction.id}`} className="flex justify-between items-start pb-3 border-b text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{transaction.category || transaction.source}</p>
                      <p className="text-xs text-muted-foreground">{new Date(transDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${transaction.category ? "text-red-600" : "text-green-600"}`}>
                        {transaction.category ? "-" : "+"}₵{Math.abs(parseFloat(transaction.amount?.toString() || "0")).toFixed(2)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (transaction.category) {
                            setEditingExpenseId(transaction.id);
                            setShowExpense(true);
                          } else {
                            setEditingRevenueId(transaction.id);
                            setShowRevenue(true);
                          }
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (transaction.category) {
                            deleteExpense.mutate({ id: transaction.id });
                          } else {
                            deleteRevenue.mutate({ id: transaction.id });
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            {expenses.length === 0 && revenues.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No transactions yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
