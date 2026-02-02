import { getDb } from "../db";
import { farms, farmExpenses, farmRevenue, animals, animalHealthRecords, cropCycles, fertilizerApplications } from "../../drizzle/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { PDFDocument, PDFPage, rgb } from "pdf-lib";
import * as XLSX from "xlsx";

export interface ReportData {
  farmId: number;
  reportType: "financial" | "livestock" | "complete";
  startDate: Date;
  endDate: Date;
}

interface FinancialData {
  farmName: string;
  period: string;
  totalExpenses: number;
  totalRevenue: number;
  netProfit: number;
  expensesByCategory: Record<string, number>;
  revenueBySource: Record<string, number>;
}

interface LivestockData {
  farmName: string;
  totalAnimals: number;
  activeAnimals: number;
  animalsByType: Record<string, number>;
  healthRecords: number;
  recentIllnesses: number;
}

interface CompleteReportData {
  farm: FinancialData;
  livestock: LivestockData;
  crops: {
    activeCycles: number;
    totalArea: number;
    recentApplications: number;
  };
}

/**
 * Generate financial report data
 */
async function generateFinancialData(
  farmId: number,
  startDate: Date,
  endDate: Date
): Promise<FinancialData> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const farm = await db.select().from(farms).where(eq(farms.id, farmId)).limit(1);
  if (!farm.length) throw new Error("Farm not found");

  const expenses = await db
    .select()
    .from(farmExpenses)
    .where(
      and(
        eq(farmExpenses.farmId, farmId),
        gte(farmExpenses.expenseDate, startDate),
        lte(farmExpenses.expenseDate, endDate)
      )
    );

  const revenue = await db
    .select()
    .from(farmRevenue)
    .where(
      and(
        eq(farmRevenue.farmId, farmId),
        gte(farmRevenue.saleDate, startDate),
        lte(farmRevenue.saleDate, endDate)
      )
    );

  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || "0"), 0);
  const totalRevenue = revenue.reduce((sum, r) => sum + parseFloat(r.amount || "0"), 0);

  const expensesByCategory: Record<string, number> = {};
  expenses.forEach((e) => {
    expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + parseFloat(e.amount || "0");
  });

  const revenueBySource: Record<string, number> = {};
  revenue.forEach((r) => {
    revenueBySource[r.source] = (revenueBySource[r.source] || 0) + parseFloat(r.amount || "0");
  });

  return {
    farmName: farm[0].farmName,
    period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
    totalExpenses,
    totalRevenue,
    netProfit: totalRevenue - totalExpenses,
    expensesByCategory,
    revenueBySource,
  };
}

/**
 * Generate livestock report data
 */
async function generateLivestockData(farmId: number): Promise<LivestockData> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const farm = await db.select().from(farms).where(eq(farms.id, farmId)).limit(1);
  if (!farm.length) throw new Error("Farm not found");

  const animalsList = await db.select().from(animals).where(eq(animals.farmId, farmId));

  const healthRecords = await db
    .select()
    .from(animalHealthRecords)
    .where(eq(animalHealthRecords.animalId, animalsList.length > 0 ? animalsList[0].id : 0));

  const animalsByType: Record<string, number> = {};
  animalsList.forEach((a) => {
    const type = a.breed || "Unknown";
    animalsByType[type] = (animalsByType[type] || 0) + 1;
  });

  const recentIllnesses = healthRecords.filter((h) => h.eventType === "illness").length;

  return {
    farmName: farm[0].farmName,
    totalAnimals: animalsList.length,
    activeAnimals: animalsList.filter((a) => a.status === "active").length,
    animalsByType,
    healthRecords: healthRecords.length,
    recentIllnesses,
  };
}

/**
 * Generate PDF report
 */
export async function generatePDFReport(data: ReportData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([612, 792]); // Letter size
  const { height } = page.getSize();
  let yPosition = height - 50;

  const drawText = (text: string, size: number = 12, bold: boolean = false) => {
    page.drawText(text, {
      x: 50,
      y: yPosition,
      size,
      color: rgb(0, 0, 0),
    });
    yPosition -= size + 10;
  };

  const drawHeading = (text: string) => {
    page.drawText(text, {
      x: 50,
      y: yPosition,
      size: 16,
      color: rgb(0.2, 0.4, 0.8),
    });
    yPosition -= 26;
  };

  // Header
  drawHeading("FarmKonnect Report");
  drawText(`Report Type: ${data.reportType.toUpperCase()}`, 11);
  drawText(`Generated: ${new Date().toLocaleString()}`, 10);
  yPosition -= 10;

  if (data.reportType === "financial" || data.reportType === "complete") {
    const financialData = await generateFinancialData(data.farmId, data.startDate, data.endDate);

    drawHeading("Financial Summary");
    drawText(`Farm: ${financialData.farmName}`, 11);
    drawText(`Period: ${financialData.period}`, 10);
    drawText(`Total Revenue: $${financialData.totalRevenue.toFixed(2)}`, 10);
    drawText(`Total Expenses: $${financialData.totalExpenses.toFixed(2)}`, 10);
    drawText(`Net Profit: $${financialData.netProfit.toFixed(2)}`, 11, true);
    yPosition -= 10;

    if (Object.keys(financialData.expensesByCategory).length > 0) {
      drawText("Expenses by Category:", 11);
      Object.entries(financialData.expensesByCategory).forEach(([category, amount]) => {
        drawText(`  ${category}: $${amount.toFixed(2)}`, 10);
      });
    }

    yPosition -= 10;
  }

  if (data.reportType === "livestock" || data.reportType === "complete") {
    const livestockData = await generateLivestockData(data.farmId);

    drawHeading("Livestock Summary");
    drawText(`Total Animals: ${livestockData.totalAnimals}`, 11);
    drawText(`Active Animals: ${livestockData.activeAnimals}`, 10);
    drawText(`Health Records: ${livestockData.healthRecords}`, 10);
    drawText(`Recent Illnesses: ${livestockData.recentIllnesses}`, 10);
    yPosition -= 10;

    if (Object.keys(livestockData.animalsByType).length > 0) {
      drawText("Animals by Type:", 11);
      Object.entries(livestockData.animalsByType).forEach(([type, count]) => {
        drawText(`  ${type}: ${count}`, 10);
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes as Uint8Array);
}

/**
 * Generate Excel report
 */
export async function generateExcelReport(data: ReportData): Promise<Buffer> {
  const workbook = XLSX.utils.book_new();

  if (data.reportType === "financial" || data.reportType === "complete") {
    const financialData = await generateFinancialData(data.farmId, data.startDate, data.endDate);

    const financialSheet = XLSX.utils.json_to_sheet([
      { Metric: "Farm Name", Value: financialData.farmName },
      { Metric: "Period", Value: financialData.period },
      { Metric: "Total Revenue", Value: financialData.totalRevenue },
      { Metric: "Total Expenses", Value: financialData.totalExpenses },
      { Metric: "Net Profit", Value: financialData.netProfit },
    ]);

    XLSX.utils.book_append_sheet(workbook, financialSheet, "Financial");

    // Expenses by category
    const expenseData = Object.entries(financialData.expensesByCategory).map(([category, amount]) => ({
      Category: category,
      Amount: amount,
    }));
    if (expenseData.length > 0) {
      const expenseSheet = XLSX.utils.json_to_sheet(expenseData);
      XLSX.utils.book_append_sheet(workbook, expenseSheet, "Expenses");
    }

    // Revenue by source
    const revenueData = Object.entries(financialData.revenueBySource).map(([source, amount]) => ({
      Source: source,
      Amount: amount,
    }));
    if (revenueData.length > 0) {
      const revenueSheet = XLSX.utils.json_to_sheet(revenueData);
      XLSX.utils.book_append_sheet(workbook, revenueSheet, "Revenue");
    }
  }

  if (data.reportType === "livestock" || data.reportType === "complete") {
    const livestockData = await generateLivestockData(data.farmId);

    const livestockSheet = XLSX.utils.json_to_sheet([
      { Metric: "Farm Name", Value: livestockData.farmName },
      { Metric: "Total Animals", Value: livestockData.totalAnimals },
      { Metric: "Active Animals", Value: livestockData.activeAnimals },
      { Metric: "Health Records", Value: livestockData.healthRecords },
      { Metric: "Recent Illnesses", Value: livestockData.recentIllnesses },
    ]);

    XLSX.utils.book_append_sheet(workbook, livestockSheet, "Livestock");

    // Animals by type
    const animalData = Object.entries(livestockData.animalsByType).map(([type, count]) => ({
      Type: type,
      Count: count,
    }));
    if (animalData.length > 0) {
      const animalSheet = XLSX.utils.json_to_sheet(animalData);
      XLSX.utils.book_append_sheet(workbook, animalSheet, "Animals");
    }
  }

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
  return excelBuffer as Buffer;
}

/**
 * Get report filename
 */
export function getReportFilename(reportType: string, format: "pdf" | "xlsx"): string {
  const timestamp = new Date().toISOString().split("T")[0];
  const ext = format === "pdf" ? "pdf" : "xlsx";
  return `report-${reportType}-${timestamp}.${ext}`;
}
