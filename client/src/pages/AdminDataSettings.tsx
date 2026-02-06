import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, Plus, Trash2, Edit2, Download, Upload, Check, X } from 'lucide-react';
import { exportToCSV, parseCSV } from '@/utils/csvUtils';
import { useState, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { ValidationRulesManager } from '@/components/ValidationRulesManager';

// Mock data for reference lists
const ANIMAL_TYPES = [
  { id: 1, name: 'Cattle', description: 'Beef and dairy cattle' },
  { id: 2, name: 'Sheep', description: 'Wool and meat sheep' },
  { id: 3, name: 'Goat', description: 'Dairy and meat goats' },
  { id: 4, name: 'Pig', description: 'Pork production' },
  { id: 5, name: 'Chicken', description: 'Egg and meat production' },
  { id: 6, name: 'Duck', description: 'Egg and meat production' },
];

const CROP_TYPES = [
  { id: 1, name: 'Maize', description: 'Corn for grain and silage' },
  { id: 2, name: 'Wheat', description: 'Grain crop' },
  { id: 3, name: 'Rice', description: 'Staple grain crop' },
  { id: 4, name: 'Beans', description: 'Legume crop' },
  { id: 5, name: 'Tomato', description: 'Vegetable crop' },
  { id: 6, name: 'Cabbage', description: 'Leafy vegetable' },
];

const DISEASE_TYPES = [
  { id: 1, name: 'Foot and Mouth Disease', description: 'Viral disease affecting livestock' },
  { id: 2, name: 'Mastitis', description: 'Infection of udders in dairy cattle' },
  { id: 3, name: 'Anthrax', description: 'Bacterial disease affecting livestock' },
  { id: 4, name: 'Brucellosis', description: 'Infectious disease in animals' },
  { id: 5, name: 'Powdery Mildew', description: 'Fungal disease affecting crops' },
  { id: 6, name: 'Leaf Rust', description: 'Fungal disease affecting crops' },
];

const TREATMENT_TYPES = [
  { id: 1, name: 'Vaccination', description: 'Preventive vaccination' },
  { id: 2, name: 'Antibiotic', description: 'Antibiotic treatment' },
  { id: 3, name: 'Anthelmintic', description: 'Parasite treatment' },
  { id: 4, name: 'Pesticide', description: 'Pest control treatment' },
  { id: 5, name: 'Fungicide', description: 'Fungal disease treatment' },
  { id: 6, name: 'Herbicide', description: 'Weed control treatment' },
];

const FERTILIZER_TYPES = [
  { id: 1, name: 'NPK 10-10-10', description: 'Balanced fertilizer' },
  { id: 2, name: 'Urea', description: 'Nitrogen fertilizer' },
  { id: 3, name: 'DAP', description: 'Diammonium phosphate' },
  { id: 4, name: 'Manure', description: 'Organic fertilizer' },
  { id: 5, name: 'Compost', description: 'Organic compost' },
  { id: 6, name: 'Lime', description: 'pH adjustment' },
];

const DATA_SETS: Record<string, { data: any[]; name: string }> = {
  animals: { data: ANIMAL_TYPES, name: 'Animal Types' },
  crops: { data: CROP_TYPES, name: 'Crop Types' },
  diseases: { data: DISEASE_TYPES, name: 'Disease Types' },
  treatments: { data: TREATMENT_TYPES, name: 'Treatment Types' },
  fertilizers: { data: FERTILIZER_TYPES, name: 'Fertilizer Types' },
};

export default function AdminDataSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('animals');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newItem, setNewItem] = useState({ name: '', description: '' });
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Access Denied</h3>
                <p className="text-red-700 text-sm mt-1">
                  Only administrators can access this page.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleExportCSV = (tabKey: string) => {
    const dataset = DATA_SETS[tabKey];
    if (dataset) {
      exportToCSV(dataset.data, dataset.name);
    }
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportMessage('');

    try {
      const data = await parseCSV(file);
      console.log('Imported data:', data);
      setImportMessage(`Successfully imported ${data.length} records`);
      
      // TODO: Call API to save imported data
      setTimeout(() => {
        setImportMessage('');
        setIsImporting(false);
      }, 3000);
    } catch (error) {
      setImportMessage(`Error: ${error instanceof Error ? error.message : 'Failed to import'}`);
      setIsImporting(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderDataTable = (data: any[], type: string, tabKey: string) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h3 className="text-lg font-semibold">{type} List</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleExportCSV(tabKey)}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            className="hidden"
          />
          <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New {type}</DialogTitle>
                <DialogDescription>
                  Enter the details for the new {type.toLowerCase()} entry.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    placeholder="Enter name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    placeholder="Enter description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  />
                </div>
                <Button
                  onClick={() => {
                    // TODO: Call API to save
                    setNewItem({ name: '', description: '' });
                    setIsAddingNew(false);
                  }}
                  className="w-full"
                >
                  Save
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {importMessage && (
        <div className={`p-3 rounded-lg text-sm ${importMessage.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {importMessage}
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">Description</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-t hover:bg-muted/50">
                <td className="px-4 py-3 font-medium">{item.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.description}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(item.id)}
                      className="gap-1"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Data Settings</h1>
          <p className="text-muted-foreground">
            Manage system reference data and supporting lists for the application. You can import/export data using CSV files.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="animals">Animal Types</TabsTrigger>
            <TabsTrigger value="crops">Crop Types</TabsTrigger>
            <TabsTrigger value="diseases">Diseases</TabsTrigger>
            <TabsTrigger value="treatments">Treatments</TabsTrigger>
            <TabsTrigger value="fertilizers">Fertilizers</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="validation">Validation Rules</TabsTrigger>
          </TabsList>

          <TabsContent value="animals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Animal Types</CardTitle>
                <CardDescription>
                  Manage the types of animals that can be added to farms.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderDataTable(ANIMAL_TYPES, 'Animal Type', 'animals')}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crops" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Crop Types</CardTitle>
                <CardDescription>
                  Manage the types of crops that can be grown.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderDataTable(CROP_TYPES, 'Crop Type', 'crops')}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diseases" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Disease Types</CardTitle>
                <CardDescription>
                  Manage disease types for livestock and crop health tracking.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderDataTable(DISEASE_TYPES, 'Disease Type', 'diseases')}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="treatments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Treatment Types</CardTitle>
                <CardDescription>
                  Manage treatment types for animals and crops.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderDataTable(TREATMENT_TYPES, 'Treatment Type', 'treatments')}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fertilizers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fertilizer Types</CardTitle>
                <CardDescription>
                  Manage fertilizer types available for crop management.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderDataTable(FERTILIZER_TYPES, 'Fertilizer Type', 'fertilizers')}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Types</CardTitle>
                <CardDescription>
                  Manage equipment types for farm asset management.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Equipment types management coming soon.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="validation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Validation Rules</CardTitle>
                <CardDescription>
                  Manage data validation rules for form fields across the application.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ValidationRulesManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
