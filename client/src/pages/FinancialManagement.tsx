import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  FileText,
  Plus,
  Download,
  Calendar,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Activity,
  Pill,
  Stethoscope,
  Shield,
  TrendingUpIcon,
  Bell,
  Settings,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * Financial Management & Accounting Component
 * Comprehensive farm financial management and reporting with veterinary integration
 */
export const FinancialManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<
    "dashboard" | "expenses" | "revenue" | "budget" | "forecast" | "reports" | "tax" | "veterinary" | "insurance" | "alerts" | "export"
  >("dashboard");
  const [timeRange, setTimeRange] = useState<"month" | "quarter" | "year">("month");
  const [selectedFarmId, setSelectedFarmId] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showBudgetAlerts, setShowBudgetAlerts] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv" | "excel">("pdf");

  // Mock farms data
  const farms = [
    { id: 1, name: "Main Farm - Accra" },
    { id: 2, name: "North Farm - Kumasi" },
    { id: 3, name: "East Farm - Koforidua" },
  ];

  // Expense categories
  const expenseCategories = [
    { value: "all", label: "All Categories" },
    { value: "equipment", label: "Equipment Maintenance" },
    { value: "inputs", label: "Inputs" },
    { value: "labor", label: "Labor" },
    { value: "utilities", label: "Utilities" },
    { value: "veterinary", label: "Veterinary" },
  ];

  // Budget Alerts
  const budgetAlerts = [
    { id: 1, category: "Equipment", threshold: 5000, current: 4800, status: "warning", message: "Approaching budget limit" },
    { id: 2, category: "Labor", threshold: 8000, current: 7200, status: "ok", message: "Within budget" },
    { id: 3, category: "Inputs", threshold: 6000, current: 6500, status: "exceeded", message: "Budget exceeded by ₵500" },
    { id: 4, category: "Utilities", threshold: 2000, current: 1800, status: "ok", message: "Well within budget" },
  ];

  // Export function
  const handleExport = (format: "pdf" | "csv" | "excel") => {
    setExportFormat(format);
    const timestamp = new Date().toLocaleDateString();
    const filename = `Financial_Report_${selectedFarmId}_${timestamp}.${format === "csv" ? "csv" : format === "excel" ? "xlsx" : "pdf"}`;
    
    // Mock export - in real app, would call backend API
    console.log(`Exporting ${filename} in ${format.toUpperCase()} format`);
    alert(`Exporting financial report as ${format.toUpperCase()}...`);
  };

  // Mock dashboard data
  const dashboard = {
    totalIncome: 125000,
    totalExpenses: 78000,
    netProfit: 47000,
    profitMargin: 37.6,
    cashFlow: 45000,
    outstandingPayments: 12000,
    pendingInvoices: 8500,
    cropExpenses: 35000,
    livestockExpenses: 28000,
    veterinaryExpenses: 15000,
    metrics: {
      cropROI: "2.5x",
      livestockROI: "1.8x",
      veterinaryROI: "3.2x",
    },
  };

  // Mock expenses data
  const expenses = [
    { id: 1, description: "Fertilizer Purchase", category: "inputs", vendor: "AgroSupply Co", amount: 2500, date: "2026-02-05", status: "paid" },
    { id: 2, description: "Equipment Repair", category: "equipment", vendor: "Farm Tech", amount: 1200, date: "2026-02-04", status: "pending" },
    { id: 3, description: "Labor Payment", category: "labor", vendor: "Workers", amount: 3000, date: "2026-02-03", status: "paid" },
    { id: 4, description: "Water Pump Maintenance", category: "utilities", vendor: "Maintenance Co", amount: 800, date: "2026-02-02", status: "paid" },
    { id: 5, description: "Veterinary Consultation", category: "veterinary", vendor: "Vet Clinic", amount: 500, date: "2026-02-01", status: "paid" },
  ];

  // Mock revenue data
  const revenue = [
    { id: 1, product: "Maize", quantity: 500, unit: "bags", unitPrice: 150, totalAmount: 75000, date: "2026-01-30" },
    { id: 2, product: "Tomatoes", quantity: 200, unit: "crates", unitPrice: 120, totalAmount: 24000, date: "2026-01-28" },
    { id: 3, product: "Chicken Eggs", quantity: 1000, unit: "crates", unitPrice: 8, totalAmount: 8000, date: "2026-01-25" },
    { id: 4, product: "Cattle", quantity: 2, unit: "heads", unitPrice: 9000, totalAmount: 18000, date: "2026-01-20" },
  ];

  // Mock veterinary expenses
  const veterinaryExpenses = [
    { id: 1, animal: "Cattle", treatment: "Vaccination", cost: 5000, date: "2026-02-05", status: "completed" },
    { id: 2, animal: "Poultry", treatment: "Disease Treatment", cost: 3500, date: "2026-02-03", status: "completed" },
    { id: 3, animal: "Goats", treatment: "Deworming", cost: 2000, date: "2026-02-01", status: "pending" },
  ];

  // Mock insurance data
  const insuranceData = {
    totalPremium: 8500,
    coverage: {
      "Crop Insurance": 4000,
      "Livestock Insurance": 3000,
      "Equipment Insurance": 1500,
    },
    claims: [
      { id: 1, type: "Drought Damage", amount: 15000, date: "2026-01-15", status: "approved", payoutDate: "2026-02-05" },
      { id: 2, type: "Pest Infestation", amount: 8000, date: "2026-01-20", status: "pending" },
    ],
  };

  // Mock budget data
  const budgetData = {
    categories: [
      { name: "Equipment", budgeted: 10000, actual: 8500, variance: 1500 },
      { name: "Inputs", budgeted: 15000, actual: 14200, variance: 800 },
      { name: "Labor", budgeted: 20000, actual: 19500, variance: 500 },
      { name: "Utilities", budgeted: 5000, actual: 4200, variance: 800 },
      { name: "Veterinary", budgeted: 2000, actual: 1600, variance: 400 },
      { name: "Insurance", budgeted: 1500, actual: 1500, variance: 0 },
    ],
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Financial Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowBudgetAlerts(!showBudgetAlerts)}>
            <Bell className="w-4 h-4 mr-2" />
            Budget Alerts
          </Button>
          <Button variant="outline" size="sm" onClick={() => setViewMode("export")}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Farm & Category Selectors */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Select Farm</label>
          <Select value={selectedFarmId.toString()} onValueChange={(val) => setSelectedFarmId(parseInt(val))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {farms.map((farm) => (
                <SelectItem key={farm.id} value={farm.id.toString()}>
                  {farm.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Expense Category</label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {expenseCategories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Budget Alerts Panel */}
      {showBudgetAlerts && (
        <Card className="p-6 border-orange-200 bg-orange-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Budget Alerts
            </h2>
            <Button size="sm" variant="ghost" onClick={() => setShowBudgetAlerts(false)}>×</Button>
          </div>
          <div className="space-y-3">
            {budgetAlerts.map((alert) => (
              <div key={alert.id} className={`p-3 rounded-lg border ${
                alert.status === "exceeded" ? "bg-red-50 border-red-200" :
                alert.status === "warning" ? "bg-yellow-50 border-yellow-200" :
                "bg-green-50 border-green-200"
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{alert.category}</p>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₵{alert.current.toLocaleString()} / ₵{alert.threshold.toLocaleString()}</p>
                    <p className={`text-xs ${
                      alert.status === "exceeded" ? "text-red-600" :
                      alert.status === "warning" ? "text-yellow-600" :
                      "text-green-600"
                    }`}>
                      {Math.round((alert.current / alert.threshold) * 100)}% used
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Export Report View */}
      {viewMode === "export" && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Export Financial Report</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Export Format</label>
              <div className="flex gap-3">
                <Button
                  variant={exportFormat === "pdf" ? "default" : "outline"}
                  onClick={() => handleExport("pdf")}
                  className="flex-1"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  PDF Report
                </Button>
                <Button
                  variant={exportFormat === "csv" ? "default" : "outline"}
                  onClick={() => handleExport("csv")}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  CSV Export
                </Button>
                <Button
                  variant={exportFormat === "excel" ? "default" : "outline"}
                  onClick={() => handleExport("excel")}
                  className="flex-1"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Excel Sheet
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Include in Report</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Income & Expenses</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Budget Analysis</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Veterinary Costs</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Insurance Claims</span>
                </label>
              </div>
            </div>
            <Button className="w-full" onClick={() => {
              alert(`Report exported as ${exportFormat.toUpperCase()}`);
              setViewMode("dashboard");
            }}>
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </div>
        </Card>
      )}

      {/* Dashboard View */}
      {viewMode === "dashboard" && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Income</p>
                  <p className="text-2xl font-bold">₵{dashboard.totalIncome.toLocaleString()}</p>
                  <p className="text-green-600 text-sm flex items-center mt-2">
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    +12% from last month
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Expenses</p>
                  <p className="text-2xl font-bold">₵{dashboard.totalExpenses.toLocaleString()}</p>
                  <p className="text-red-600 text-sm flex items-center mt-2">
                    <ArrowDownLeft className="w-4 h-4 mr-1" />
                    +8% from last month
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Net Profit</p>
                  <p className="text-2xl font-bold">₵{dashboard.netProfit.toLocaleString()}</p>
                  <p className="text-blue-600 text-sm flex items-center mt-2">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {dashboard.profitMargin}% margin
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Crop Expenses</p>
                  <p className="text-2xl font-bold">₵{dashboard.cropExpenses.toLocaleString()}</p>
                  <p className="text-purple-600 text-sm flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    ROI: {dashboard.metrics.cropROI}
                  </p>
                </div>
                <Pill className="w-8 h-8 text-purple-600" />
              </div>
            </Card>
          </div>

          {/* Expense & Revenue Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Livestock Expenses</p>
                  <p className="text-2xl font-bold">₵{dashboard.livestockExpenses.toLocaleString()}</p>
                  <p className="text-orange-600 text-sm flex items-center mt-2">
                    <Activity className="w-4 h-4 mr-1" />
                    ROI: {dashboard.metrics.livestockROI}x
                  </p>
                </div>
                <Activity className="w-8 h-8 text-orange-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Veterinary Expenses</p>
                  <p className="text-2xl font-bold">₵{dashboard.veterinaryExpenses.toLocaleString()}</p>
                  <p className="text-purple-600 text-sm flex items-center mt-2">
                    <Activity className="w-4 h-4 mr-1" />
                    ROI: {dashboard.metrics.veterinaryROI}x
                  </p>
                </div>
                <Stethoscope className="w-8 h-8 text-purple-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Cash Flow</p>
                  <p className="text-2xl font-bold text-green-600">₵{dashboard.cashFlow.toLocaleString()}</p>
                  <p className="text-gray-600 text-xs mt-2">Available for operations</p>
                </div>
                <PieChart className="w-8 h-8 text-green-600" />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Expenses View */}
      {viewMode === "expenses" && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Expense Tracking</h2>
          <div className="space-y-3">
            {expenses
              .filter(
                (expense) =>
                  selectedCategory === "all" ||
                  expense.category.toLowerCase().includes(selectedCategory)
              )
              .map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{expense.description}</p>
                  <p className="text-sm text-gray-600">{expense.category} • {expense.vendor}</p>
                  <p className="text-xs text-gray-500">{expense.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₵{expense.amount.toLocaleString()}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      expense.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {expense.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Revenue View */}
      {viewMode === "revenue" && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Revenue Tracking</h2>
          <div className="space-y-3">
            {revenue.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{item.product}</p>
                  <p className="text-sm text-gray-600">{item.quantity} {item.unit} @ ₵{item.unitPrice}/unit</p>
                  <p className="text-xs text-gray-500">{item.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">₵{item.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Budget View */}
      {viewMode === "budget" && (
        <div className="space-y-6">
          {/* Monthly Comparison Chart */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Monthly Budget Comparison</h2>
            <div className="space-y-4">
              {[
                { month: "January", budgeted: 25000, actual: 23500 },
                { month: "February", budgeted: 26000, actual: 24800 },
                { month: "March", budgeted: 27000, actual: 25200 },
                { month: "April", budgeted: 28000, actual: 26500 },
              ].map((monthData) => (
                <div key={monthData.month} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">{monthData.month}</p>
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-600">Budgeted: ₵{monthData.budgeted.toLocaleString()}</span>
                      <span className="font-medium">Actual: ₵{monthData.actual.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 h-6">
                    <div className="flex-1 bg-blue-200 rounded" style={{ width: "100%" }}>
                      <div className="bg-blue-600 h-full rounded" style={{ width: `${(monthData.actual / monthData.budgeted) * 100}%` }}></div>
                    </div>
                    <span className="text-sm text-green-600 font-medium min-w-fit">-₵{(monthData.budgeted - monthData.actual).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Category Budget Details */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Budget by Category</h2>
            <div className="space-y-4">
              {budgetData.categories.map((category) => (
              <div key={category.name}>
                <div className="flex justify-between mb-2">
                  <p className="font-medium">{category.name}</p>
                  <p className="text-sm text-gray-600">
                    ₵{category.actual} / ₵{category.budgeted}
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(category.actual / category.budgeted) * 100}%` }}
                  ></div>
                </div>
                {category.variance > 0 && (
                  <p className="text-xs text-green-600 mt-1">Under budget by ₵{category.variance}</p>
                )}
              </div>
            ))}
            </div>
          </Card>
        </div>
      )}

      {/* Veterinary View */}
      {viewMode === "veterinary" && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Veterinary Expenses & ROI</h2>
          <div className="space-y-3">
            {veterinaryExpenses.map((expense) => (
              <div key={expense.id} className="p-4 border rounded-lg bg-purple-50">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium">{expense.animal}</p>
                    <p className="text-sm text-gray-600">{expense.treatment}</p>
                  </div>
                  <p className="font-bold text-purple-600">₵{expense.cost.toLocaleString()}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">{expense.date}</p>
                  <span className={`text-xs px-2 py-1 rounded ${
                    expense.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {expense.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Insurance View */}
      {viewMode === "insurance" && (
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Insurance Management</h2>

            {/* Coverage Breakdown */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Monthly Premiums</h3>
              <div className="space-y-2">
                {Object.entries(insuranceData.coverage).map(([type, amount]) => (
                  <div key={type} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <p className="text-sm">{type}</p>
                    <p className="font-medium">₵{amount}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded mt-3 border border-blue-200">
                <p className="font-medium">Total Premium</p>
                <p className="font-bold text-blue-600">₵{insuranceData.totalPremium}</p>
              </div>
            </div>

            {/* Claims */}
            <div>
              <h3 className="font-medium mb-3">Claims Status</h3>
              <div className="space-y-3">
                {insuranceData.claims.map((claim) => (
                  <div key={claim.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{claim.type}</p>
                        <p className="text-sm text-gray-600">Filed: {claim.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">₵{claim.amount.toLocaleString()}</p>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            claim.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {claim.status}
                        </span>
                      </div>
                    </div>
                    {claim.payoutDate && (
                      <p className="text-xs text-gray-600 mt-2">Payout: {claim.payoutDate}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* View Selector Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={viewMode === "dashboard" ? "default" : "outline"}
          onClick={() => setViewMode("dashboard")}
        >
          Dashboard
        </Button>
        <Button
          variant={viewMode === "expenses" ? "default" : "outline"}
          onClick={() => setViewMode("expenses")}
        >
          Expenses
        </Button>
        <Button
          variant={viewMode === "revenue" ? "default" : "outline"}
          onClick={() => setViewMode("revenue")}
        >
          Revenue
        </Button>
        <Button
          variant={viewMode === "budget" ? "default" : "outline"}
          onClick={() => setViewMode("budget")}
        >
          Budget
        </Button>
        <Button
          variant={viewMode === "veterinary" ? "default" : "outline"}
          onClick={() => setViewMode("veterinary")}
        >
          Veterinary
        </Button>
        <Button
          variant={viewMode === "insurance" ? "default" : "outline"}
          onClick={() => setViewMode("insurance")}
        >
          Insurance
        </Button>
      </div>
    </div>
  );
};

export default FinancialManagement;
