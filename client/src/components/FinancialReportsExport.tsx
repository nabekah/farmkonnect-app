import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Download, Calendar } from "lucide-react";
import { toast } from "sonner";

interface FinancialReportsExportProps {
  farmId: string;
  farmName: string;
  startDate: Date;
  endDate: Date;
}

export const FinancialReportsExport: React.FC<FinancialReportsExportProps> = ({
  farmId,
  farmName,
  startDate,
  endDate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reportType, setReportType] = useState<"summary" | "detailed" | "comparison">("summary");
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  const [isExporting, setIsExporting] = useState(false);

  // Fetch financial data
  const { data: summary } = trpc.financialManagement.getFinancialSummary.useQuery(
    { farmId, startDate, endDate },
    { enabled: !!farmId }
  );

  const { data: expenses = [] } = trpc.financialManagement.getExpenses.useQuery(
    { farmId, startDate, endDate },
    { enabled: !!farmId }
  );

  const { data: revenue = [] } = trpc.financialManagement.getRevenue.useQuery(
    { farmId, startDate, endDate },
    { enabled: !!farmId }
  );

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Prepare report data
      const reportData = {
        farmName,
        reportType,
        exportFormat,
        dateRange: {
          start: startDate.toLocaleDateString('en-US'),
          end: endDate.toLocaleDateString('en-US')
        },
        summary: {
          totalRevenue: summary?.totalRevenue || 0,
          totalExpenses: summary?.totalExpenses || 0,
          profit: summary?.profit || 0,
          profitMargin: summary?.profitMargin || 0
        },
        expenses: expenses.map((exp: any) => ({
          date: exp.expenseDate,
          type: exp.expenseType,
          description: exp.description,
          amount: exp.amount,
          vendor: exp.vendor
        })),
        revenue: revenue.map((rev: any) => ({
          date: rev.revenueDate,
          type: rev.revenueType,
          description: rev.description,
          amount: rev.amount,
          buyer: rev.buyer
        }))
      };

      if (exportFormat === 'pdf') {
        // Generate PDF
        const csvContent = generateCSV(reportData);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${farmName}_financial_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Report exported successfully!');
      } else if (exportFormat === 'excel') {
        // Generate Excel
        const csvContent = generateCSV(reportData);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${farmName}_financial_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Report exported successfully!');
      }

      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to export report');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const generateCSV = (data: any) => {
    let csv = '';

    // Header
    csv += `Financial Report - ${data.farmName}\n`;
    csv += `Report Type: ${data.reportType}\n`;
    csv += `Date Range: ${data.dateRange.start} to ${data.dateRange.end}\n\n`;

    // Summary
    csv += 'FINANCIAL SUMMARY\n';
    csv += 'Total Revenue,Total Expenses,Profit,Profit Margin %\n';
    csv += `${data.summary.totalRevenue},${data.summary.totalExpenses},${data.summary.profit},${data.summary.profitMargin}\n\n`;

    // Expenses
    csv += 'EXPENSES\n';
    csv += 'Date,Type,Description,Amount,Vendor\n';
    data.expenses.forEach((exp: any) => {
      csv += `${exp.date},"${exp.type}","${exp.description}",${exp.amount},"${exp.vendor}"\n`;
    });

    csv += '\n';

    // Revenue
    csv += 'REVENUE\n';
    csv += 'Date,Type,Description,Amount,Buyer\n';
    data.revenue.forEach((rev: any) => {
      csv += `${rev.date},"${rev.type}","${rev.description}",${rev.amount},"${rev.buyer}"\n`;
    });

    return csv;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileDown className="h-5 w-5" />
              Export Financial Reports
            </CardTitle>
            <CardDescription>Generate and download financial reports in PDF or Excel format</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Financial Report</DialogTitle>
          <DialogDescription>
            Select report type and format to export your financial data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Farm and Date Info */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Farm</Label>
            <p className="text-sm text-gray-600">{farmName}</p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date Range
            </Label>
            <p className="text-sm text-gray-600">
              {startDate.toLocaleDateString('en-US')} to {endDate.toLocaleDateString('en-US')}
            </p>
          </div>

          {/* Report Type */}
          <div className="space-y-2">
            <Label htmlFor="report-type">Report Type</Label>
            <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
              <SelectTrigger id="report-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Summary Report</SelectItem>
                <SelectItem value="detailed">Detailed Report</SelectItem>
                <SelectItem value="comparison">Comparison Report</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {reportType === 'summary' && 'Overview of revenue, expenses, and profit'}
              {reportType === 'detailed' && 'Complete breakdown of all transactions'}
              {reportType === 'comparison' && 'Comparison with previous periods'}
            </p>
          </div>

          {/* Export Format */}
          <div className="space-y-2">
            <Label htmlFor="export-format">Export Format</Label>
            <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
              <SelectTrigger id="export-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="excel">Excel Spreadsheet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Report Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Report Preview</Label>
            <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-1">
              <p><strong>Total Revenue:</strong> GHS {(summary?.totalRevenue || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
              <p><strong>Total Expenses:</strong> GHS {(summary?.totalExpenses || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
              <p><strong>Net Profit:</strong> GHS {(summary?.profit || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
              <p><strong>Profit Margin:</strong> {(summary?.profitMargin || 0).toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-2">
                {expenses.length} expense records | {revenue.length} revenue records
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? 'Exporting...' : 'Export Report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FinancialReportsExport;
