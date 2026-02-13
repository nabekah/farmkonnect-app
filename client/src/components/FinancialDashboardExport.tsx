import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  Loader,
} from 'lucide-react';

interface FinancialDashboardExportProps {
  farmId: number;
}

interface ExportOption {
  id: string;
  name: string;
  description: string;
  format: 'pdf' | 'excel';
  icon: React.ReactNode;
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: 'summary',
    name: 'Financial Summary',
    description: 'Revenue, expenses, profit, and key metrics',
    format: 'pdf',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: 'detailed',
    name: 'Detailed Report',
    description: 'All transactions with categories and dates',
    format: 'excel',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: 'charts',
    name: 'Charts & Visualizations',
    description: 'Dashboard charts, trends, and comparisons',
    format: 'pdf',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: 'tax',
    name: 'Tax Report',
    description: 'Income and expense summary for tax purposes',
    format: 'excel',
    icon: <FileText className="w-5 h-5" />,
  },
];

export function FinancialDashboardExport({ farmId }: FinancialDashboardExportProps) {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(false);

  const handleExport = async () => {
    if (!selectedOption) return;

    setIsExporting(true);
    setExportStatus('exporting');

    try {
      // Simulate export process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const option = EXPORT_OPTIONS.find((o) => o.id === selectedOption);
      const filename = `financial-${option?.id}-${new Date().toISOString().split('T')[0]}.${option?.format}`;

      // In a real implementation, this would call a backend API to generate the file
      console.log('Exporting:', {
        option: selectedOption,
        format: option?.format,
        startDate,
        endDate,
        includeCharts,
        includeNotes,
        filename,
      });

      setExportStatus('success');

      setTimeout(() => {
        setIsExportOpen(false);
        setExportStatus('idle');
        setSelectedOption(null);
      }, 1500);
    } catch (error) {
      setExportStatus('error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Financial Dashboard
          </CardTitle>
          <CardDescription>
            Generate and download financial reports in PDF or Excel format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EXPORT_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setSelectedOption(option.id);
                  setIsExportOpen(true);
                }}
                className="border rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="text-blue-600">{option.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{option.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {option.format.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Recent Exports */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Recent Exports</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Financial Summary</p>
                  <p className="text-xs text-gray-500">Generated on Feb 10, 2026</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Detailed Report (Jan 2026)</p>
                  <p className="text-xs text-gray-500">Generated on Feb 5, 2026</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Tax Report (2025)</p>
                  <p className="text-xs text-gray-500">Generated on Jan 31, 2026</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Configuration Dialog */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Export {EXPORT_OPTIONS.find((o) => o.id === selectedOption)?.name}
            </DialogTitle>
          </DialogHeader>

          {exportStatus === 'exporting' && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-gray-600">Generating your report...</p>
            </div>
          )}

          {exportStatus === 'success' && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
              <p className="text-gray-600 text-center">
                Your report has been generated successfully!
              </p>
            </div>
          )}

          {exportStatus === 'error' && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <AlertCircle className="w-12 h-12 text-red-600" />
              <p className="text-gray-600 text-center">
                Failed to generate report. Please try again.
              </p>
            </div>
          )}

          {exportStatus === 'idle' && (
            <div className="space-y-6">
              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeCharts}
                    onChange={(e) => setIncludeCharts(e.target.checked)}
                  />
                  <span className="text-sm">Include charts and visualizations</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeNotes}
                    onChange={(e) => setIncludeNotes(e.target.checked)}
                  />
                  <span className="text-sm">Include transaction notes</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsExportOpen(false)}
                  disabled={isExporting}
                >
                  Cancel
                </Button>
                <Button onClick={handleExport} disabled={isExporting}>
                  {isExporting ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
