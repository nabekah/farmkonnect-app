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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertCircle, CheckCircle, Upload } from 'lucide-react';

interface ExpenseReconciliationProps {
  farmId: number;
}

export function ExpenseReconciliation({ farmId }: ExpenseReconciliationProps) {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState(false);
  const [reconciliationResults, setReconciliationResults] = useState<any[]>([]);

  const { data: expenses } = trpc.financialAnalysis.getExpenses.useQuery(
    { farmId: farmId.toString() },
    { enabled: !!farmId }
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      setImportErrors([]);
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map((h) => h.trim());
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split(',').map((v) => v.trim());
      const record: any = {};
      headers.forEach((header, index) => {
        record[header] = values[index];
      });
      records.push(record);
    }

    return records;
  };

  const handleImport = async () => {
    if (!csvFile) {
      setImportErrors(['Please select a file']);
      return;
    }

    try {
      const text = await csvFile.text();
      const bankStatements = parseCSV(text);

      // Reconcile with existing expenses
      const errors: string[] = [];
      const matched: any[] = [];
      const unmatched: any[] = [];

      bankStatements.forEach((statement, index) => {
        const amount = parseFloat(statement.amount);
        const date = new Date(statement.date);

        // Find matching expense
        const matchingExpense = expenses?.find(
          (exp: any) =>
            Math.abs(parseFloat(exp.amount) - amount) < 0.01 &&
            new Date(exp.expenseDate).toDateString() === date.toDateString()
        );

        if (matchingExpense) {
          matched.push({
            bankStatement: statement,
            expense: matchingExpense,
            status: 'matched',
          });
        } else {
          unmatched.push({
            ...statement,
            status: 'unmatched',
            suggestion: `No matching expense found for ${statement.description} (${amount})`,
          });
        }
      });

      setReconciliationResults([...matched, ...unmatched]);
      setImportSuccess(true);

      if (unmatched.length > 0) {
        setImportErrors([
          `${unmatched.length} transactions could not be automatically matched. Please review manually.`,
        ]);
      }

      setTimeout(() => {
        setIsImportOpen(false);
        setCsvFile(null);
      }, 2000);
    } catch (error: any) {
      setImportErrors([error.message || 'Failed to process file']);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bank Statement Reconciliation</CardTitle>
          <CardDescription>
            Import bank statements and match them with recorded expenses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => setIsImportOpen(true)}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Import Bank Statement
          </Button>

          {reconciliationResults.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reconciliationResults.map((result, index) => (
                    <TableRow
                      key={index}
                      className={
                        result.status === 'matched'
                          ? 'bg-green-50'
                          : 'bg-yellow-50'
                      }
                    >
                      <TableCell>
                        {result.bankStatement?.date || result.date}
                      </TableCell>
                      <TableCell>
                        {result.bankStatement?.description ||
                          result.description}
                      </TableCell>
                      <TableCell>
                        {result.bankStatement?.amount || result.amount}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {result.status === 'matched' ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-600">
                                Matched
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 text-yellow-600" />
                              <span className="text-sm text-yellow-600">
                                Unmatched
                              </span>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Import Bank Statement</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csvFile">CSV File</Label>
              <Input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
              />
              <p className="text-xs text-gray-500">
                Required columns: date, description, amount
              </p>
            </div>

            {importErrors.length > 0 && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-600">
                  {importErrors.map((error, idx) => (
                    <p key={idx}>{error}</p>
                  ))}
                </div>
              </div>
            )}

            {importSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm text-green-600">
                  Reconciliation completed successfully!
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsImportOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={!csvFile}>
                Reconcile
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
