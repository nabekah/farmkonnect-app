import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Plus, Trash2, Edit, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Chemical {
  id: string;
  name: string;
  activeIngredient: string;
  concentration: string;
  quantity: number;
  unit: string;
  cost: number;
  expiryDate: string;
  storageLocation: string;
  status: 'in-stock' | 'low-stock' | 'expired' | 'expiring-soon';
  toxicity: 'low' | 'medium' | 'high';
  environmentalImpact: 'low' | 'medium' | 'high';
}

interface UsageRecord {
  date: string;
  chemical: string;
  quantity: number;
  field: string;
  cost: number;
}

export function ChemicalInventoryUI() {
  const [chemicals, setChemicals] = useState<Chemical[]>([
    {
      id: '1',
      name: 'Tricyclazole',
      activeIngredient: 'Tricyclazole 75% WP',
      concentration: '75%',
      quantity: 8,
      unit: 'liters',
      cost: 2500,
      expiryDate: '2026-08-15',
      storageLocation: 'Shed A',
      status: 'low-stock',
      toxicity: 'medium',
      environmentalImpact: 'low',
    },
    {
      id: '2',
      name: 'Carbofuran',
      activeIngredient: 'Carbofuran 3% CG',
      concentration: '3%',
      quantity: 25,
      unit: 'kg',
      cost: 3500,
      expiryDate: '2027-02-20',
      storageLocation: 'Shed B',
      status: 'in-stock',
      toxicity: 'high',
      environmentalImpact: 'medium',
    },
    {
      id: '3',
      name: 'Propiconazole',
      activeIngredient: 'Propiconazole 25% EC',
      concentration: '25%',
      quantity: 5,
      unit: 'liters',
      cost: 1800,
      expiryDate: '2026-05-10',
      storageLocation: 'Shed A',
      status: 'expiring-soon',
      toxicity: 'low',
      environmentalImpact: 'low',
    },
  ]);

  const [usageRecords] = useState<UsageRecord[]>([
    { date: '2026-02-10', chemical: 'Tricyclazole', quantity: 2, field: 'Field 1', cost: 625 },
    { date: '2026-02-08', chemical: 'Carbofuran', quantity: 5, field: 'Field 2', cost: 700 },
    { date: '2026-02-05', chemical: 'Propiconazole', quantity: 1.5, field: 'Field 3', cost: 450 },
  ]);

  const [selectedChemical, setSelectedChemical] = useState<Chemical | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'in-stock': 'bg-green-100 text-green-800',
      'low-stock': 'bg-yellow-100 text-yellow-800',
      'expiring-soon': 'bg-orange-100 text-orange-800',
      'expired': 'bg-red-100 text-red-800',
    };
    return colors[status] || colors['in-stock'];
  };

  const getToxicityColor = (toxicity: string) => {
    const colors: Record<string, string> = {
      'low': 'text-green-600',
      'medium': 'text-orange-600',
      'high': 'text-red-600',
    };
    return colors[toxicity] || colors['low'];
  };

  const inventoryValue = chemicals.reduce((sum, c) => sum + (c.quantity * c.cost / 100), 0);
  const lowStockCount = chemicals.filter(c => c.status === 'low-stock').length;
  const expiringCount = chemicals.filter(c => c.status === 'expiring-soon' || c.status === 'expired').length;

  const usageByChemical = chemicals.map(c => ({
    name: c.name,
    usage: usageRecords.filter(r => r.chemical === c.name).length,
    cost: usageRecords.filter(r => r.chemical === c.name).reduce((sum, r) => sum + r.cost, 0),
  }));

  const inventoryStatus = [
    { name: 'In Stock', value: chemicals.filter(c => c.status === 'in-stock').length, fill: '#10b981' },
    { name: 'Low Stock', value: chemicals.filter(c => c.status === 'low-stock').length, fill: '#f59e0b' },
    { name: 'Expiring', value: chemicals.filter(c => c.status === 'expiring-soon' || c.status === 'expired').length, fill: '#ef4444' },
  ];

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Chemical Inventory</h1>
          <p className="text-gray-600 mt-1">Track pesticide and fungicide inventory with safety compliance</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Chemical
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-3xl font-bold text-blue-600">₹{inventoryValue.toFixed(0)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-3xl font-bold text-green-600">{chemicals.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-3xl font-bold text-yellow-600">{lowStockCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-1" />
              <p className="text-sm text-gray-600">Expiring</p>
              <p className="text-3xl font-bold text-red-600">{expiringCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {expiringCount > 0 && (
        <Alert className="border-red-300 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {expiringCount} chemical(s) expiring soon or already expired. Review and dispose safely.
          </AlertDescription>
        </Alert>
      )}

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inventory Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={inventoryStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {inventoryStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Usage by Chemical</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usageByChemical}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="usage" fill="#3b82f6" name="Usage Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Add Chemical Form */}
      {showAddForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">Add New Chemical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Chemical Name</label>
                <input type="text" placeholder="e.g., Tricyclazole" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Active Ingredient</label>
                <input type="text" placeholder="e.g., Tricyclazole 75% WP" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input type="number" placeholder="10" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unit</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>liters</option>
                  <option>kg</option>
                  <option>ml</option>
                  <option>grams</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cost</label>
                <input type="number" placeholder="2500" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expiry Date</label>
                <input type="date" className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button className="flex-1">Save Chemical</Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chemical List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Inventory Items ({chemicals.length})</CardTitle>
          <CardDescription>Click on a chemical to view details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {chemicals.map(chemical => (
              <div
                key={chemical.id}
                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition"
                onClick={() => setSelectedChemical(chemical)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{chemical.name}</p>
                      <Badge className={getStatusColor(chemical.status)}>
                        {chemical.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{chemical.activeIngredient}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">{chemical.quantity} {chemical.unit}</p>
                    <p className="text-xs text-gray-600">₹{chemical.cost}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs mt-3">
                  <div>
                    <p className="text-gray-600">Storage</p>
                    <p className="font-medium">{chemical.storageLocation}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Expiry</p>
                    <p className="font-medium">{new Date(chemical.expiryDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Toxicity</p>
                    <p className={`font-medium ${getToxicityColor(chemical.toxicity)}`}>
                      {chemical.toxicity.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Env. Impact</p>
                    <p className={`font-medium ${getToxicityColor(chemical.environmentalImpact)}`}>
                      {chemical.environmentalImpact.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Chemical Details */}
      {selectedChemical && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{selectedChemical.name} - Details</CardTitle>
                <CardDescription>{selectedChemical.activeIngredient}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <Edit className="w-4 h-4" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="gap-1 text-red-600">
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-600">Current Stock</p>
                <p className="text-2xl font-bold text-blue-600">{selectedChemical.quantity}</p>
                <p className="text-xs text-gray-600">{selectedChemical.unit}</p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-600">Unit Cost</p>
                <p className="text-2xl font-bold text-green-600">₹{selectedChemical.cost}</p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-purple-600">₹{(selectedChemical.quantity * selectedChemical.cost / 100).toFixed(0)}</p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold mb-2">Safety & Compliance</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Toxicity Level</span>
                  <span className={`font-semibold ${getToxicityColor(selectedChemical.toxicity)}`}>
                    {selectedChemical.toxicity.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Environmental Impact</span>
                  <span className={`font-semibold ${getToxicityColor(selectedChemical.environmentalImpact)}`}>
                    {selectedChemical.environmentalImpact.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Storage Location</span>
                  <span className="font-semibold">{selectedChemical.storageLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expiry Date</span>
                  <span className="font-semibold">{new Date(selectedChemical.expiryDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" variant="outline">Record Usage</Button>
              <Button className="flex-1 flex items-center gap-1" variant="outline">
                <Download className="w-4 h-4" /> Download SDS
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Usage Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {usageRecords.map((record, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{record.chemical}</p>
                  <p className="text-xs text-gray-600">{record.field} • {record.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{record.quantity} {record.chemical === 'Carbofuran' ? 'kg' : 'liters'}</p>
                  <p className="text-xs text-gray-600">₹{record.cost}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
