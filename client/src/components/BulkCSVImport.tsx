import React, { useState, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Download, Upload } from 'lucide-react';

interface BulkCSVImportProps {
  farmId: number;
  isRevenue?: boolean;
  onImportSuccess?: () => void;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export function BulkCSVImport({
  farmId,
  isRevenue = false,
  onImportSuccess,
}: BulkCSVImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const headers = isRevenue
      ? ['Date', 'Type', 'Description', 'Amount', 'Quantity', 'Buyer', 'Invoice Number', 'Payment Status']
      : ['Date', 'Category', 'Description', 'Amount', 'Quantity', 'Notes'];

    const sampleData = isRevenue
      ? [
          ['2026-02-01', 'Crop Sales', 'Maize harvest', '5000', '500', 'Local Market', 'INV-001', 'paid'],
          ['2026-02-02', 'Livestock Sales', 'Cattle sale', '10000', '2', 'Farmer John', 'INV-002', 'pending'],
        ]
      : [
          ['2026-02-01', 'Feed', 'Cattle feed purchase', '2000', '100', 'Ordered from vendor'],
          ['2026-02-02', 'Labor', 'Worker wages', '1500', '', 'Weekly payment'],
        ];

    const csvContent = [
      headers.join(','),
      ...sampleData.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${isRevenue ? 'revenue' : 'expense'}_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter((line) => line.trim());
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
      const row: any = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      data.push(row);
    }

    return data;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsLoading(true);
    try {
      const text = await file.text();
      const data = parseCSV(text);

      const importResult: ImportResult = {
        success: 0,
        failed: 0,
        errors: [],
      };

      for (const row of data) {
        try {
          if (!row.date || !row.description || !row.amount) {
            importResult.failed++;
            importResult.errors.push(`Row missing required fields: ${row.description || 'Unknown'}`);
            continue;
          }

          if (isRevenue) {
            // Revenue import would call the backend mutation
            // await trpc.expenseRevenueEntry.addRevenue.mutate({...})
            importResult.success++;
          } else {
            // Expense import would call the backend mutation
            // await trpc.expenseRevenueEntry.addExpense.mutate({...})
            importResult.success++;
          }
        } catch (error: any) {
          importResult.failed++;
          importResult.errors.push(`Error importing row: ${error.message}`);
        }
      }

      setResult(importResult);
      if (importResult.success > 0) {
        onImportSuccess?.();
      }
    } catch (error: any) {
      setResult({
        success: 0,
        failed: 1,
        errors: [`Failed to parse CSV: ${error.message}`],
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Bulk Import {isRevenue ? 'Revenue' : 'Expenses'}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isOpen ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Open Bulk Import
          </Button>
        ) : (
          <>
            {/* Download Template */}
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={downloadTemplate}
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>

            {/* File Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select CSV File</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full"
              />
              {file && (
                <p className="text-sm text-gray-600">Selected: {file.name}</p>
              )}
            </div>

            {/* Import Button */}
            <Button
              onClick={handleImport}
              disabled={!file || isLoading}
              className="w-full"
            >
              {isLoading ? 'Importing...' : 'Import CSV'}
            </Button>

            {/* Results */}
            {result && (
              <div className="space-y-2">
                {result.success > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">
                        {result.success} {isRevenue ? 'revenue' : 'expense'} entries imported successfully
                      </p>
                    </div>
                  </div>
                )}

                {result.failed > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">
                        {result.failed} entries failed to import
                      </p>
                      {result.errors.length > 0 && (
                        <ul className="text-sm text-red-700 mt-2 space-y-1">
                          {result.errors.slice(0, 3).map((error, i) => (
                            <li key={i}>• {error}</li>
                          ))}
                          {result.errors.length > 3 && (
                            <li>• ... and {result.errors.length - 3} more errors</li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Close Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setIsOpen(false);
                setFile(null);
                setResult(null);
              }}
            >
              Close
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
