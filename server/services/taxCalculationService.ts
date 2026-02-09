import { TRPCError } from '@trpc/server';
import { getDb } from '../db';
import { marketplaceOrders, marketplaceOrderItems, marketplaceProducts } from '../../drizzle/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

interface TaxCategory {
  name: string;
  rate: number;
  description: string;
}

interface TaxEstimate {
  grossIncome: number;
  taxableIncome: number;
  federalTax: number;
  stateTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  totalTaxes: number;
  effectiveTaxRate: number;
  netIncome: number;
}

interface QuarterlyTaxEstimate {
  quarter: number;
  year: number;
  estimatedTaxableIncome: number;
  estimatedTaxes: number;
  paymentDueDate: string;
  status: 'pending' | 'paid' | 'overdue';
}

interface AnnualTaxReport {
  year: number;
  totalGrossIncome: number;
  totalDeductions: number;
  totalTaxableIncome: number;
  federalTaxes: number;
  stateTaxes: number;
  totalTaxes: number;
  effectiveTaxRate: number;
  quarterlyEstimates: QuarterlyTaxEstimate[];
  taxBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

// Ghana tax brackets (simplified for demonstration)
const GHANA_TAX_BRACKETS = [
  { min: 0, max: 110, rate: 0 },
  { min: 110, max: 493, rate: 0.05 },
  { min: 493, max: 731, rate: 0.1 },
  { min: 731, max: 1000, rate: 0.175 },
  { min: 1000, max: Infinity, rate: 0.25 },
];

const TAX_CATEGORIES: TaxCategory[] = [
  { name: 'Federal Income Tax', rate: 0.22, description: 'Federal income tax on marketplace earnings' },
  { name: 'State/Regional Tax', rate: 0.05, description: 'State or regional tax on business income' },
  { name: 'Social Security Tax', rate: 0.062, description: 'Self-employment social security tax' },
  { name: 'Medicare Tax', rate: 0.0145, description: 'Self-employment medicare tax' },
  { name: 'Business License Fee', rate: 0.01, description: 'Annual business license fee' },
];

/**
 * Calculate federal income tax based on brackets
 */
function calculateFederalTax(taxableIncome: number): number {
  let tax = 0;
  let previousMax = 0;

  for (const bracket of GHANA_TAX_BRACKETS) {
    if (taxableIncome <= bracket.min) break;

    const incomeInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
    tax += incomeInBracket * bracket.rate;
  }

  return tax;
}

/**
 * Calculate tax estimate for a seller
 */
export async function calculateTaxEstimate(
  sellerId: number,
  startDate?: Date,
  endDate?: Date
): Promise<TaxEstimate> {
  try {
    const db = getDb();

    const end = endDate || new Date();
    const start = startDate || new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000);

    // Get seller's products
    const products = await db
      .select()
      .from(marketplaceProducts)
      .where(eq(marketplaceProducts.sellerId, sellerId));

    const productIds = products.map((p) => p.id);

    if (productIds.length === 0) {
      return {
        grossIncome: 0,
        taxableIncome: 0,
        federalTax: 0,
        stateTax: 0,
        socialSecurityTax: 0,
        medicareTax: 0,
        totalTaxes: 0,
        effectiveTaxRate: 0,
        netIncome: 0,
      };
    }

    // Get orders
    const orders = await db
      .select()
      .from(marketplaceOrders)
      .where(
        and(
          gte(marketplaceOrders.createdAt, start),
          lte(marketplaceOrders.createdAt, end)
        )
      );

    // Get order items
    const orderItems = await db
      .select()
      .from(marketplaceOrderItems);

    // Calculate gross income
    let grossIncome = 0;
    for (const item of orderItems) {
      if (productIds.includes(item.productId)) {
        grossIncome += parseFloat(item.price) * parseInt(item.quantity);
      }
    }

    // Calculate deductions (commissions and fees)
    const commissionRate = 0.03;
    const commissions = grossIncome * commissionRate;
    const processingFeeRate = 0.029;
    const processingFees = grossIncome * processingFeeRate + orders.length * 0.3;
    const totalDeductions = commissions + processingFees;

    // Calculate taxable income
    const taxableIncome = Math.max(0, grossIncome - totalDeductions);

    // Calculate taxes
    const federalTax = calculateFederalTax(taxableIncome);
    const stateTax = taxableIncome * 0.05;
    const socialSecurityTax = taxableIncome * 0.062;
    const medicareTax = taxableIncome * 0.0145;
    const totalTaxes = federalTax + stateTax + socialSecurityTax + medicareTax;

    // Calculate effective tax rate
    const effectiveTaxRate = grossIncome > 0 ? (totalTaxes / grossIncome) * 100 : 0;

    // Calculate net income
    const netIncome = grossIncome - totalDeductions - totalTaxes;

    return {
      grossIncome,
      taxableIncome,
      federalTax,
      stateTax,
      socialSecurityTax,
      medicareTax,
      totalTaxes,
      effectiveTaxRate: Math.round(effectiveTaxRate * 100) / 100,
      netIncome,
    };
  } catch (error) {
    console.error('Error calculating tax estimate:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to calculate tax estimate',
    });
  }
}

/**
 * Calculate quarterly tax estimates
 */
export async function calculateQuarterlyTaxEstimates(
  sellerId: number,
  year: number
): Promise<QuarterlyTaxEstimate[]> {
  try {
    const estimates: QuarterlyTaxEstimate[] = [];

    // Calculate for each quarter
    for (let quarter = 1; quarter <= 4; quarter++) {
      const startMonth = (quarter - 1) * 3;
      const endMonth = startMonth + 2;

      const startDate = new Date(year, startMonth, 1);
      const endDate = new Date(year, endMonth + 1, 0);

      const taxEstimate = await calculateTaxEstimate(sellerId, startDate, endDate);

      // Quarterly tax payment due dates (US standard)
      let paymentDueDate = '';
      if (quarter === 1) paymentDueDate = `${year}-04-15`;
      else if (quarter === 2) paymentDueDate = `${year}-06-15`;
      else if (quarter === 3) paymentDueDate = `${year}-09-15`;
      else paymentDueDate = `${year + 1}-01-15`;

      estimates.push({
        quarter,
        year,
        estimatedTaxableIncome: taxEstimate.taxableIncome,
        estimatedTaxes: taxEstimate.totalTaxes,
        paymentDueDate,
        status: 'pending',
      });
    }

    return estimates;
  } catch (error) {
    console.error('Error calculating quarterly tax estimates:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to calculate quarterly tax estimates',
    });
  }
}

/**
 * Generate annual tax report
 */
export async function generateAnnualTaxReport(
  sellerId: number,
  year: number
): Promise<AnnualTaxReport> {
  try {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const taxEstimate = await calculateTaxEstimate(sellerId, startDate, endDate);
    const quarterlyEstimates = await calculateQuarterlyTaxEstimates(sellerId, year);

    // Calculate tax breakdown
    const taxBreakdown = [
      {
        category: 'Federal Income Tax',
        amount: taxEstimate.federalTax,
        percentage: taxEstimate.totalTaxes > 0 ? (taxEstimate.federalTax / taxEstimate.totalTaxes) * 100 : 0,
      },
      {
        category: 'State/Regional Tax',
        amount: taxEstimate.stateTax,
        percentage: taxEstimate.totalTaxes > 0 ? (taxEstimate.stateTax / taxEstimate.totalTaxes) * 100 : 0,
      },
      {
        category: 'Social Security Tax',
        amount: taxEstimate.socialSecurityTax,
        percentage: taxEstimate.totalTaxes > 0 ? (taxEstimate.socialSecurityTax / taxEstimate.totalTaxes) * 100 : 0,
      },
      {
        category: 'Medicare Tax',
        amount: taxEstimate.medicareTax,
        percentage: taxEstimate.totalTaxes > 0 ? (taxEstimate.medicareTax / taxEstimate.totalTaxes) * 100 : 0,
      },
    ];

    return {
      year,
      totalGrossIncome: taxEstimate.grossIncome,
      totalDeductions: taxEstimate.grossIncome - taxEstimate.taxableIncome,
      totalTaxableIncome: taxEstimate.taxableIncome,
      federalTaxes: taxEstimate.federalTax,
      stateTaxes: taxEstimate.stateTax,
      totalTaxes: taxEstimate.totalTaxes,
      effectiveTaxRate: taxEstimate.effectiveTaxRate,
      quarterlyEstimates,
      taxBreakdown,
    };
  } catch (error) {
    console.error('Error generating annual tax report:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to generate annual tax report',
    });
  }
}

/**
 * Export tax report to CSV
 */
export async function exportTaxReportToCSV(
  sellerId: number,
  year: number
): Promise<string> {
  try {
    const report = await generateAnnualTaxReport(sellerId, year);

    let csv = 'FarmKonnect Annual Tax Report\n\n';
    csv += `Year,${year}\n\n`;

    csv += 'Income Summary\n';
    csv += `Total Gross Income,${report.totalGrossIncome.toFixed(2)}\n`;
    csv += `Total Deductions,${report.totalDeductions.toFixed(2)}\n`;
    csv += `Total Taxable Income,${report.totalTaxableIncome.toFixed(2)}\n\n`;

    csv += 'Tax Summary\n';
    csv += `Federal Income Tax,${report.federalTaxes.toFixed(2)}\n`;
    csv += `State/Regional Tax,${report.stateTaxes.toFixed(2)}\n`;
    csv += `Total Taxes,${report.totalTaxes.toFixed(2)}\n`;
    csv += `Effective Tax Rate,${report.effectiveTaxRate.toFixed(2)}%\n\n`;

    csv += 'Tax Breakdown\n';
    csv += 'Category,Amount,Percentage\n';
    for (const item of report.taxBreakdown) {
      csv += `${item.category},${item.amount.toFixed(2)},${item.percentage.toFixed(2)}%\n`;
    }

    csv += '\nQuarterly Tax Estimates\n';
    csv += 'Quarter,Year,Estimated Taxable Income,Estimated Taxes,Due Date,Status\n';
    for (const quarter of report.quarterlyEstimates) {
      csv += `Q${quarter.quarter},${quarter.year},${quarter.estimatedTaxableIncome.toFixed(2)},${quarter.estimatedTaxes.toFixed(2)},${quarter.paymentDueDate},${quarter.status}\n`;
    }

    return csv;
  } catch (error) {
    console.error('Error exporting tax report:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to export tax report',
    });
  }
}

/**
 * Get tax categories
 */
export function getTaxCategories(): TaxCategory[] {
  return TAX_CATEGORIES;
}
