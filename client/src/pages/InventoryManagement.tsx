import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Package, TrendingDown, Calendar, Truck, Plus, Trash2, Edit2, Download } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export function InventoryManagement() {
  const [farmId, setFarmId] = useState<number>(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState<number | null>(null);

  // Form states
  const [addFormData, setAddFormData] = useState({
    fertilizerType: '',
    currentStock: '',
    reorderPoint: '',
    reorderQuantity: '',
    supplier: '',
    supplierContact: '',
    storageLocation: '',
  });

  const [transactionFormData, setTransactionFormData] = useState({
    transactionType: 'usage' as const,
    quantity: '',
    cost: '',
    reason: '',
  });

  // Queries
  const { data: inventory = [] } = trpc.fertilizerManagement.inventory.getByFarm.useQuery({ farmId });
  const { data: lowStockItems = [] } = trpc.fertilizerManagement.inventory.getLowStockItems.useQuery({ farmId });
  const { data: expiringItems = [] } = trpc.fertilizerManagement.inventory.getExpiringItems.useQuery({ farmId, daysThreshold: 30 });
  const { data: inventoryValue = 0 } = trpc.fertilizerManagement.inventory.getInventoryValue.useQuery({ farmId });

  // Mutations
  const upsertMutation = trpc.fertilizerManagement.inventory.upsert.useMutation({
    onSuccess: () => {
      setIsAddDialogOpen(false);
      setAddFormData({
        fertilizerType: '',
        currentStock: '',
        reorderPoint: '',
        reorderQuantity: '',
        supplier: '',
        supplierContact: '',
        storageLocation: '',
      });
    },
  });

  const transactionMutation = trpc.fertilizerManagement.inventory.recordTransaction.useMutation({
    onSuccess: () => {
      setIsTransactionDialogOpen(false);
      setTransactionFormData({
        transactionType: 'usage',
        quantity: '',
        cost: '',
        reason: '',
      });
      setSelectedInventoryId(null);
    },
  });

  // Handlers
  const handleAddInventory = (e: React.FormEvent) => {
    e.preventDefault();
    upsertMutation.mutate({
      farmId,
      fertilizerType: addFormData.fertilizerType,
      currentStock: parseFloat(addFormData.currentStock),
      reorderPoint: parseFloat(addFormData.reorderPoint),
      reorderQuantity: parseFloat(addFormData.reorderQuantity),
      supplier: addFormData.supplier,
      supplierContact: addFormData.supplierContact,
      storageLocation: addFormData.storageLocation,
    });
  };

  const handleRecordTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInventoryId) return;

    transactionMutation.mutate({
      inventoryId: selectedInventoryId,
      transactionType: transactionFormData.transactionType,
      quantity: parseFloat(transactionFormData.quantity),
      cost: transactionFormData.cost ? parseFloat(transactionFormData.cost) : undefined,
      reason: transactionFormData.reason,
    });
  };

  // Computed values
  const totalItems = inventory.length;
  const lowStockCount = lowStockItems.length;
  const expiringCount = expiringItems.length;
  const totalQuantity = inventory.reduce((sum, item) => sum + item.currentStock, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Fertilizer Inventory Management</h1>
          <p className="text-gray-600">Track stock levels, manage reorders, and monitor expiry dates</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Inventory Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
              <DialogDescription>Add a new fertilizer item to your inventory</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddInventory} className="space-y-4">
              <div>
                <Label>Fertilizer Type</Label>
                <Input
                  value={addFormData.fertilizerType}
                  onChange={(e) => setAddFormData({ ...addFormData, fertilizerType: e.target.value })}
                  placeholder="e.g., Urea, DAP, NPK"
                  required
                />
              </div>
              <div>
                <Label>Current Stock (kg)</Label>
                <Input
                  type="number"
                  value={addFormData.currentStock}
                  onChange={(e) => setAddFormData({ ...addFormData, currentStock: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <Label>Reorder Point (kg)</Label>
                <Input
                  type="number"
                  value={addFormData.reorderPoint}
                  onChange={(e) => setAddFormData({ ...addFormData, reorderPoint: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <Label>Reorder Quantity (kg)</Label>
                <Input
                  type="number"
                  value={addFormData.reorderQuantity}
                  onChange={(e) => setAddFormData({ ...addFormData, reorderQuantity: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <Label>Supplier</Label>
                <Input
                  value={addFormData.supplier}
                  onChange={(e) => setAddFormData({ ...addFormData, supplier: e.target.value })}
                  placeholder="Supplier name"
                />
              </div>
              <div>
                <Label>Supplier Contact</Label>
                <Input
                  value={addFormData.supplierContact}
                  onChange={(e) => setAddFormData({ ...addFormData, supplierContact: e.target.value })}
                  placeholder="Phone or email"
                />
              </div>
              <div>
                <Label>Storage Location</Label>
                <Input
                  value={addFormData.storageLocation}
                  onChange={(e) => setAddFormData({ ...addFormData, storageLocation: e.target.value })}
                  placeholder="e.g., Warehouse A, Shed 2"
                />
              </div>
              <Button type="submit" className="w-full">
                Add Item
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-gray-500 mt-1">In inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {lowStockCount}
            </div>
            <p className="text-xs text-gray-500 mt-1">Items below reorder point</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${expiringCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {expiringCount}
            </div>
            <p className="text-xs text-gray-500 mt-1">Within 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Inventory Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${inventoryValue.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">Total stock value</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {lowStockCount > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-900">
              <AlertCircle className="w-4 h-4" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-800">
              {lowStockCount} item(s) have fallen below their reorder point. Consider placing orders to maintain optimal stock levels.
            </p>
          </CardContent>
        </Card>
      )}

      {expiringCount > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-900">
              <AlertCircle className="w-4 h-4" />
              Expiry Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-800">
              {expiringCount} item(s) will expire within 30 days. Prioritize using these items or dispose of them properly.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Inventory Items</CardTitle>
              <CardDescription>Complete list of fertilizers in stock</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fertilizer Type</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Reorder Point</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Storage Location</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.fertilizerType}</TableCell>
                        <TableCell>{item.currentStock} kg</TableCell>
                        <TableCell>{item.reorderPoint} kg</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.isLowStock ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {item.isLowStock ? 'Low Stock' : 'In Stock'}
                          </span>
                        </TableCell>
                        <TableCell>{item.supplier || '-'}</TableCell>
                        <TableCell>{item.storageLocation || '-'}</TableCell>
                        <TableCell>
                          <Dialog open={isTransactionDialogOpen && selectedInventoryId === item.id} onOpenChange={(open) => {
                            if (!open) setSelectedInventoryId(null);
                            setIsTransactionDialogOpen(open);
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedInventoryId(item.id)}
                              >
                                Record Transaction
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Record Transaction</DialogTitle>
                                <DialogDescription>Record a stock transaction for {item.fertilizerType}</DialogDescription>
                              </DialogHeader>
                              <form onSubmit={handleRecordTransaction} className="space-y-4">
                                <div>
                                  <Label>Transaction Type</Label>
                                  <Select value={transactionFormData.transactionType} onValueChange={(value: any) => setTransactionFormData({ ...transactionFormData, transactionType: value })}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="purchase">Purchase</SelectItem>
                                      <SelectItem value="usage">Usage</SelectItem>
                                      <SelectItem value="adjustment">Adjustment</SelectItem>
                                      <SelectItem value="damage">Damage</SelectItem>
                                      <SelectItem value="expiry">Expiry</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Quantity (kg)</Label>
                                  <Input
                                    type="number"
                                    value={transactionFormData.quantity}
                                    onChange={(e) => setTransactionFormData({ ...transactionFormData, quantity: e.target.value })}
                                    placeholder="0"
                                    required
                                  />
                                </div>
                                <div>
                                  <Label>Cost (Optional)</Label>
                                  <Input
                                    type="number"
                                    value={transactionFormData.cost}
                                    onChange={(e) => setTransactionFormData({ ...transactionFormData, cost: e.target.value })}
                                    placeholder="0"
                                  />
                                </div>
                                <div>
                                  <Label>Reason (Optional)</Label>
                                  <Input
                                    value={transactionFormData.reason}
                                    onChange={(e) => setTransactionFormData({ ...transactionFormData, reason: e.target.value })}
                                    placeholder="e.g., Field application, storage damage"
                                  />
                                </div>
                                <Button type="submit" className="w-full">
                                  Record Transaction
                                </Button>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low-stock">
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Items</CardTitle>
              <CardDescription>Items below reorder point - action required</CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockItems.length > 0 ? (
                <div className="space-y-3">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.fertilizerType}</p>
                        <p className="text-sm text-gray-600">Current: {item.currentStock} kg | Reorder: {item.reorderQuantity} kg</p>
                        {item.supplier && <p className="text-sm text-gray-600">Supplier: {item.supplier}</p>}
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Truck className="w-4 h-4" />
                        Order Now
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No low stock items</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiring">
          <Card>
            <CardHeader>
              <CardTitle>Expiring Soon</CardTitle>
              <CardDescription>Items expiring within 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {expiringItems.length > 0 ? (
                <div className="space-y-3">
                  {expiringItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-4 border rounded-lg bg-red-50">
                      <div>
                        <p className="font-medium">{item.fertilizerType}</p>
                        <p className="text-sm text-gray-600">Expires in: {item.daysUntilExpiry} days</p>
                        <p className="text-sm text-gray-600">Current stock: {item.currentStock} kg</p>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Use First
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No items expiring soon</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
