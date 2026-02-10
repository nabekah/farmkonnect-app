import { jsPDF } from "jspdf";
import { Parser } from "json2csv";
import * as XLSX from "xlsx";

export interface ExportOptions {
  farmId: number;
  format: "pdf" | "csv" | "excel";
  sections: {
    incomeExpenses: boolean;
    budgetAnalysis: boolean;
    veterinaryCosts: boolean;
    insuranceClaims: boolean;
  };
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

export interface FinancialReportData {
  farmName: string;
  reportDate: string;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  expenses: Array<{
    description: string;
    category: string;
    amount: number;
    date: string;
  }>;
  revenue: Array<{
    product: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    date: string;
  }>;
  budgetData: Array<{
    category: string;
    budgeted: number;
    actual: number;
    variance: number;
  }>;
  veterinaryExpenses: Array<{
    animal: string;
    treatment: string;
    cost: number;
    date: string;
  }>;
  insuranceClaims: Array<{
    type: string;
    amount: number;
    status: string;
    date: string;
  }>;
}

/**
 * Generate PDF financial report
 */
export async function generatePDFReport(
  data: FinancialReportData,
  options: ExportOptions
): Promise<Buffer> {
  const doc = new jsPDF();
  let yPosition = 20;

  // Title
  doc.setFontSize(18);
  doc.text("Financial Report", 20, yPosition);
  yPosition += 10;

  // Farm Info
  doc.setFontSize(12);
  doc.text(`Farm: ${data.farmName}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Report Date: ${data.reportDate}`, 20, yPosition);
  yPosition += 12;

  // Summary Section
  doc.setFontSize(14);
  doc.text("Financial Summary", 20, yPosition);
  yPosition += 8;

  doc.setFontSize(11);
  doc.text(`Total Income: ₵${data.totalIncome.toLocaleString()}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Total Expenses: ₵${data.totalExpenses.toLocaleString()}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Net Profit: ₵${data.netProfit.toLocaleString()}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Profit Margin: ${data.profitMargin}%`, 20, yPosition);
  yPosition += 12;

  // Income & Expenses Section
  if (options.sections.incomeExpenses) {
    doc.setFontSize(14);
    doc.text("Income & Expenses", 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.text("Revenue:", 20, yPosition);
    yPosition += 5;

    data.revenue.forEach((item) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(
        `${item.product}: ₵${item.totalAmount.toLocaleString()} (${item.quantity} ${item.quantity > 1 ? "units" : "unit"})`,
        25,
        yPosition
      );
      yPosition += 5;
    });

    yPosition += 5;
    doc.text("Expenses:", 20, yPosition);
    yPosition += 5;

    data.expenses.forEach((item) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(
        `${item.description} (${item.category}): ₵${item.amount.toLocaleString()}`,
        25,
        yPosition
      );
      yPosition += 5;
    });

    yPosition += 7;
  }

  // Budget Analysis Section
  if (options.sections.budgetAnalysis) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.text("Budget Analysis", 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    data.budgetData.forEach((item) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      const percentage = ((item.actual / item.budgeted) * 100).toFixed(1);
      doc.text(
        `${item.category}: ₵${item.actual} / ₵${item.budgeted} (${percentage}%) - Variance: ₵${item.variance}`,
        25,
        yPosition
      );
      yPosition += 5;
    });

    yPosition += 7;
  }

  // Veterinary Section
  if (options.sections.veterinaryCosts && data.veterinaryExpenses.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.text("Veterinary Expenses", 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    data.veterinaryExpenses.forEach((item) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(
        `${item.animal} - ${item.treatment}: ₵${item.cost.toLocaleString()}`,
        25,
        yPosition
      );
      yPosition += 5;
    });

    yPosition += 7;
  }

  // Insurance Section
  if (options.sections.insuranceClaims && data.insuranceClaims.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.text("Insurance Claims", 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    data.insuranceClaims.forEach((item) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(
        `${item.type}: ₵${item.amount.toLocaleString()} (${item.status})`,
        25,
        yPosition
      );
      yPosition += 5;
    });
  }

  return Buffer.from(doc.output("arraybuffer"));
}

/**
 * Generate CSV financial report
 */
export async function generateCSVReport(
  data: FinancialReportData,
  options: ExportOptions
): Promise<string> {
  const rows: any[] = [];

  // Add summary
  rows.push({
    Section: "Financial Summary",
    Category: "Total Income",
    Amount: data.totalIncome,
  });
  rows.push({
    Section: "Financial Summary",
    Category: "Total Expenses",
    Amount: data.totalExpenses,
  });
  rows.push({
    Section: "Financial Summary",
    Category: "Net Profit",
    Amount: data.netProfit,
  });
  rows.push({
    Section: "Financial Summary",
    Category: "Profit Margin",
    Amount: `${data.profitMargin}%`,
  });

  // Add revenue
  if (options.sections.incomeExpenses) {
    data.revenue.forEach((item) => {
      rows.push({
        Section: "Revenue",
        Category: item.product,
        Quantity: item.quantity,
        UnitPrice: item.unitPrice,
        Amount: item.totalAmount,
        Date: item.date,
      });
    });

    // Add expenses
    data.expenses.forEach((item) => {
      rows.push({
        Section: "Expenses",
        Category: item.category,
        Description: item.description,
        Amount: item.amount,
        Date: item.date,
      });
    });
  }

  // Add budget data
  if (options.sections.budgetAnalysis) {
    data.budgetData.forEach((item) => {
      rows.push({
        Section: "Budget",
        Category: item.category,
        Budgeted: item.budgeted,
        Actual: item.actual,
        Variance: item.variance,
      });
    });
  }

  // Add veterinary expenses
  if (options.sections.veterinaryCosts) {
    data.veterinaryExpenses.forEach((item) => {
      rows.push({
        Section: "Veterinary",
        Animal: item.animal,
        Treatment: item.treatment,
        Cost: item.cost,
        Date: item.date,
      });
    });
  }

  // Add insurance claims
  if (options.sections.insuranceClaims) {
    data.insuranceClaims.forEach((item) => {
      rows.push({
        Section: "Insurance",
        Type: item.type,
        Amount: item.amount,
        Status: item.status,
        Date: item.date,
      });
    });
  }

  const parser = new Parser();
  return parser.parse(rows);
}

/**
 * Generate Excel financial report
 */
export async function generateExcelReport(
  data: FinancialReportData,
  options: ExportOptions
): Promise<Buffer> {
  const workbook = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ["Farm Financial Report"],
    ["Farm Name", data.farmName],
    ["Report Date", data.reportDate],
    [],
    ["Financial Summary"],
    ["Total Income", data.totalIncome],
    ["Total Expenses", data.totalExpenses],
    ["Net Profit", data.netProfit],
    ["Profit Margin (%)", data.profitMargin],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // Revenue sheet
  if (options.sections.incomeExpenses) {
    const revenueData = [
      ["Product", "Quantity", "Unit Price", "Total Amount", "Date"],
      ...data.revenue.map((item) => [
        item.product,
        item.quantity,
        item.unitPrice,
        item.totalAmount,
        item.date,
      ]),
    ];

    const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData);
    XLSX.utils.book_append_sheet(workbook, revenueSheet, "Revenue");

    // Expenses sheet
    const expenseData = [
      ["Description", "Category", "Amount", "Date", "Status"],
      ...data.expenses.map((item) => [
        item.description,
        item.category,
        item.amount,
        item.date,
        "Recorded",
      ]),
    ];

    const expenseSheet = XLSX.utils.aoa_to_sheet(expenseData);
    XLSX.utils.book_append_sheet(workbook, expenseSheet, "Expenses");
  }

  // Budget sheet
  if (options.sections.budgetAnalysis) {
    const budgetData = [
      ["Category", "Budgeted", "Actual", "Variance", "Percentage Used"],
      ...data.budgetData.map((item) => [
        item.category,
        item.budgeted,
        item.actual,
        item.variance,
        `${((item.actual / item.budgeted) * 100).toFixed(1)}%`,
      ]),
    ];

    const budgetSheet = XLSX.utils.aoa_to_sheet(budgetData);
    XLSX.utils.book_append_sheet(workbook, budgetSheet, "Budget");
  }

  // Veterinary sheet
  if (options.sections.veterinaryCosts && data.veterinaryExpenses.length > 0) {
    const vetData = [
      ["Animal", "Treatment", "Cost", "Date"],
      ...data.veterinaryExpenses.map((item) => [
        item.animal,
        item.treatment,
        item.cost,
        item.date,
      ]),
    ];

    const vetSheet = XLSX.utils.aoa_to_sheet(vetData);
    XLSX.utils.book_append_sheet(workbook, vetSheet, "Veterinary");
  }

  // Insurance sheet
  if (options.sections.insuranceClaims && data.insuranceClaims.length > 0) {
    const insuranceData = [
      ["Type", "Amount", "Status", "Date"],
      ...data.insuranceClaims.map((item) => [
        item.type,
        item.amount,
        item.status,
        item.date,
      ]),
    ];

    const insuranceSheet = XLSX.utils.aoa_to_sheet(insuranceData);
    XLSX.utils.book_append_sheet(workbook, insuranceSheet, "Insurance");
  }

  return Buffer.from(XLSX.write(workbook, { bookType: "xlsx", type: "array" }));
}
