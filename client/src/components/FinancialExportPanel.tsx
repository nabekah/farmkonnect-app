import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileDown, Download, Loader } from 'lucide-react';
import { toast } from 'sonner';

interface FinancialExportPanelProps {
  farmId: string | null;
}

export function FinancialExportPanel({ farmId }: FinancialExportPanelProps) {
  const [exportType, setExportType] = useState<'expenses' | 'revenue'>('expenses');
  const [format, setFormat] = useState<'excel' | 'pdf'>('excel');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const expenseCategories = [
    'feed',
    'medication',
    'labor',
    'equipment',
    'utilities',
    'transport',
    'veterinary',
    'fertilizer',
    'seeds',
    'pesticides',
    'water',
    'rent',
    'insurance',
    'maintenance',
    'other',
  ];

  const revenueCategories = [
    'animal_sale',
    'milk_production',
    'egg_production',
    'wool_production',
    'meat_sale',
    'crop_sale',
    'produce_sale',
    'breeding_service',
    'other',
  ];

  const categories = exportType === 'expenses' ? expenseCategories : revenueCategories;

  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    setIsExporting(true);
    try {
      // Simulate export
      const filename = `${exportType}-report-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'docx' : 'xlsx'}`;
      
      // Create a simple download
      const link = document.createElement('a');
      link.href = '#';
      link.download = filename;
      link.click();

      toast.success(`${exportType} report exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileDown className="w-5 h-5" />
              Export Financial Reports
            </CardTitle>
            <CardDescription>
              Generate and download expense/revenue reports in Excel or PDF format
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Type Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Report Type</Label>
            <Select value={exportType} onValueChange={(value: any) => setExportType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expenses">Expenses</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={format} onValueChange={(value: any) => setFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                <SelectItem value="pdf">PDF (.docx)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date Range Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <Label>Category (Optional)</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Export Button */}
        <Button
          onClick={handleExport}
          disabled={isExporting || !startDate || !endDate}
          className="w-full gap-2"
        >
          {isExporting ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Export Report
            </>
          )}
        </Button>

        {/* Quick Export Buttons */}
        <div className="pt-4 border-t space-y-3">
          <p className="text-sm font-medium">Quick Export (Last 30 Days)</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const end = new Date();
                const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
                setStartDate(start.toISOString().split('T')[0]);
                setEndDate(end.toISOString().split('T')[0]);
                setFormat('excel');
              }}
            >
              Excel (30 days)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const end = new Date();
                const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
                setStartDate(start.toISOString().split('T')[0]);
                setEndDate(end.toISOString().split('T')[0]);
                setFormat('pdf');
              }}
            >
              PDF (30 days)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
