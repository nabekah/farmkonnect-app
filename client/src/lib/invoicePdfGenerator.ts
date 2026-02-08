// PDF generation utility - using simple text format for now

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  clientName: string;
  items: InvoiceItem[];
  totalAmount: number;
  dueDate: Date;
  notes?: string;
  farmName?: string;
  createdAt?: Date;
}

export const generateInvoicePDF = (invoice: InvoiceData) => {
  // Generate simple text invoice
  const lines: string[] = [];
  lines.push("=".repeat(60));
  lines.push("INVOICE".padEnd(40) + "Invoice #: " + invoice.invoiceNumber);
  lines.push("=".repeat(60));
  lines.push("");
  lines.push("FROM: " + (invoice.farmName || "Farm"));
  lines.push("Ghana");
  lines.push("");
  lines.push("BILL TO: " + invoice.clientName);
  lines.push("");
  lines.push("Date: " + new Date(invoice.createdAt || new Date()).toLocaleDateString());
  lines.push("Due Date: " + new Date(invoice.dueDate).toLocaleDateString());
  lines.push("");
  lines.push("-".repeat(60));
  lines.push("DESCRIPTION".padEnd(30) + "QTY".padEnd(10) + "UNIT PRICE".padEnd(15) + "AMOUNT");
  lines.push("-".repeat(60));
  
  invoice.items.forEach(item => {
    lines.push(
      item.description.substring(0, 30).padEnd(30) +
      item.quantity.toString().padEnd(10) +
      "₵" + item.unitPrice.toFixed(2).padEnd(14) +
      "₵" + item.amount.toFixed(2)
    );
  });
  
  lines.push("-".repeat(60));
  lines.push("TOTAL".padEnd(50) + "₵" + invoice.totalAmount.toFixed(2));
  lines.push("-".repeat(60));
  
  if (invoice.notes) {
    lines.push("");
    lines.push("NOTES:");
    lines.push(invoice.notes);
  }
  
  lines.push("");
  lines.push("Thank you for your business!");
  
  const textContent = lines.join("\n");
  const blob = new Blob([textContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice-${invoice.invoiceNumber}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

export const generateTaxReportPDF = (farmName: string, taxableIncome: number, expenses: number) => {
  const lines: string[] = [];
  lines.push("=".repeat(60));
  lines.push("TAX REPORT - GHANA");
  lines.push("=".repeat(60));
  lines.push("");
  lines.push("Farm Name: " + farmName);
  lines.push("Report Date: " + new Date().toLocaleDateString());
  lines.push("");
  lines.push("-".repeat(60));
  lines.push("FINANCIAL SUMMARY");
  lines.push("-".repeat(60));
  lines.push("Gross Income: ₵" + taxableIncome.toFixed(2));
  lines.push("Deductible Expenses: ₵" + expenses.toFixed(2));
  lines.push("Taxable Income: ₵" + Math.max(0, taxableIncome - expenses).toFixed(2));
  lines.push("");
  lines.push("-".repeat(60));
  lines.push("TAX CALCULATION (Ghana - 15% Standard Rate)");
  lines.push("-".repeat(60));
  
  const netIncome = Math.max(0, taxableIncome - expenses);
  const taxAmount = netIncome * 0.15;
  
  lines.push("Taxable Income: ₵" + netIncome.toFixed(2));
  lines.push("Tax Rate: 15%");
  lines.push("Estimated Tax Due: ₵" + taxAmount.toFixed(2));
  lines.push("");
  lines.push("-".repeat(60));
  lines.push("COMPLIANCE INFORMATION");
  lines.push("-".repeat(60));
  lines.push("Ghana Revenue Authority (GRA) Filing Deadline: December 31");
  lines.push("Tax Year: January 1 - December 31");
  lines.push("Payment Due: On or before March 31 of following year");
  lines.push("");
  lines.push("Note: This is an estimated tax report for planning purposes.");
  lines.push("Please consult with a tax professional for accurate calculations.");
  
  const textContent = lines.join("\n");
  const blob = new Blob([textContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tax-report-${new Date().getFullYear()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};
