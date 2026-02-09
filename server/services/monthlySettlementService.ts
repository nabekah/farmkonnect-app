import { TRPCError } from '@trpc/server';
import { getDb } from '../db';
import { marketplaceOrders, marketplaceOrderItems, marketplaceProducts, revenue, expenses } from '../../drizzle/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

interface SettlementRecord {
  id: number;
  sellerId: number;
  month: string;
  year: number;
  grossRevenue: number;
  commissions: number;
  processingFees: number;
  netRevenue: number;
  totalOrders: number;
  settlementDate: Date;
  status: 'pending' | 'processed' | 'paid';
  notes?: string;
}

interface SettlementSummary {
  currentMonth: string;
  totalGrossRevenue: number;
  totalCommissions: number;
  totalProcessingFees: number;
  totalNetRevenue: number;
  totalOrders: number;
  estimatedSettlementDate: Date;
  lastSettlementDate?: Date;
}

interface SettlementReport {
  period: string;
  settlements: SettlementRecord[];
  totalGrossRevenue: number;
  totalCommissions: number;
  totalProcessingFees: number;
  totalNetRevenue: number;
  averageOrderValue: number;
}

/**
 * Calculate monthly settlement for a seller
 */
export async function calculateMonthlySettlement(
  sellerId: number,
  month: number,
  year: number
): Promise<SettlementRecord> {
  try {
    const db = getDb();

    // Get first and last day of month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Get seller's products
    const products = await db
      .select()
      .from(marketplaceProducts)
      .where(eq(marketplaceProducts.sellerId, sellerId));

    const productIds = products.map((p) => p.id);

    if (productIds.length === 0) {
      return {
        id: 0,
        sellerId,
        month: startDate.toLocaleString('default', { month: 'long' }),
        year,
        grossRevenue: 0,
        commissions: 0,
        processingFees: 0,
        netRevenue: 0,
        totalOrders: 0,
        settlementDate: new Date(),
        status: 'pending',
      };
    }

    // Get orders for the month
    const orders = await db
      .select()
      .from(marketplaceOrders)
      .where(
        and(
          gte(marketplaceOrders.createdAt, startDate),
          lte(marketplaceOrders.createdAt, endDate)
        )
      );

    // Get order items
    const orderItems = await db
      .select()
      .from(marketplaceOrderItems);

    // Calculate totals
    let grossRevenue = 0;
    let totalOrders = 0;
    const processedOrders = new Set<number>();

    for (const item of orderItems) {
      if (productIds.includes(item.productId)) {
        const itemRevenue = parseFloat(item.price) * parseInt(item.quantity);
        grossRevenue += itemRevenue;

        if (!processedOrders.has(item.orderId)) {
          processedOrders.add(item.orderId);
          totalOrders++;
        }
      }
    }

    // Calculate fees
    const commissionRate = 0.03;
    const commissions = grossRevenue * commissionRate;
    const processingFeeRate = 0.029;
    const processingFees = grossRevenue * processingFeeRate + totalOrders * 0.3;
    const netRevenue = grossRevenue - commissions - processingFees;

    const settlementRecord: SettlementRecord = {
      id: Math.floor(Math.random() * 1000000),
      sellerId,
      month: startDate.toLocaleString('default', { month: 'long' }),
      year,
      grossRevenue,
      commissions,
      processingFees,
      netRevenue,
      totalOrders,
      settlementDate: new Date(),
      status: 'pending',
      notes: `Settlement for ${startDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
    };

    return settlementRecord;
  } catch (error) {
    console.error('Error calculating monthly settlement:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to calculate monthly settlement',
    });
  }
}

/**
 * Get current month settlement summary
 */
export async function getCurrentMonthSettlementSummary(sellerId: number): Promise<SettlementSummary> {
  try {
    const now = new Date();
    const settlement = await calculateMonthlySettlement(sellerId, now.getMonth() + 1, now.getFullYear());

    // Calculate estimated settlement date (1st of next month)
    const estimatedSettlementDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return {
      currentMonth: settlement.month,
      totalGrossRevenue: settlement.grossRevenue,
      totalCommissions: settlement.commissions,
      totalProcessingFees: settlement.processingFees,
      totalNetRevenue: settlement.netRevenue,
      totalOrders: settlement.totalOrders,
      estimatedSettlementDate,
    };
  } catch (error) {
    console.error('Error getting settlement summary:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to get settlement summary',
    });
  }
}

/**
 * Process monthly settlement (record to financial dashboard)
 */
export async function processMonthlySettlement(
  sellerId: number,
  farmId: number,
  month: number,
  year: number
): Promise<boolean> {
  try {
    const db = getDb();

    const settlement = await calculateMonthlySettlement(sellerId, month, year);

    if (settlement.netRevenue > 0) {
      // Record revenue entry
      await db.insert(revenue).values({
        farmId,
        revenueType: 'marketplace_settlement',
        description: `Marketplace settlement - ${settlement.month} ${year}`,
        amount: settlement.netRevenue,
        revenueDate: new Date().toISOString().split('T')[0],
        buyer: 'Marketplace Settlement',
        quantity: settlement.totalOrders,
        unitPrice: settlement.grossRevenue / settlement.totalOrders,
        notes: `Gross: ${settlement.grossRevenue}, Commission: ${settlement.commissions}, Fees: ${settlement.processingFees}`,
      });

      // Record commission expense
      if (settlement.commissions > 0) {
        await db.insert(expenses).values({
          farmId,
          expenseType: 'other',
          description: `Marketplace commissions - ${settlement.month} ${year}`,
          amount: settlement.commissions,
          expenseDate: new Date().toISOString().split('T')[0],
          vendor: 'FarmKonnect Marketplace',
          notes: `Commission on ${settlement.totalOrders} orders`,
        });
      }

      // Record processing fees
      if (settlement.processingFees > 0) {
        await db.insert(expenses).values({
          farmId,
          expenseType: 'other',
          description: `Payment processing fees - ${settlement.month} ${year}`,
          amount: settlement.processingFees,
          expenseDate: new Date().toISOString().split('T')[0],
          vendor: 'Payment Processor',
          notes: `Processing fees for ${settlement.totalOrders} orders`,
        });
      }
    }

    return true;
  } catch (error) {
    console.error('Error processing settlement:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to process settlement',
    });
  }
}

/**
 * Get settlement history
 */
export async function getSettlementHistory(
  sellerId: number,
  limit: number = 12,
  offset: number = 0
): Promise<SettlementReport> {
  try {
    const settlements: SettlementRecord[] = [];
    let totalGrossRevenue = 0;
    let totalCommissions = 0;
    let totalProcessingFees = 0;
    let totalNetRevenue = 0;
    let totalOrders = 0;

    // Get last 12 months of settlements
    const now = new Date();
    for (let i = 0; i < limit; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const settlement = await calculateMonthlySettlement(sellerId, date.getMonth() + 1, date.getFullYear());

      settlements.push(settlement);
      totalGrossRevenue += settlement.grossRevenue;
      totalCommissions += settlement.commissions;
      totalProcessingFees += settlement.processingFees;
      totalNetRevenue += settlement.netRevenue;
      totalOrders += settlement.totalOrders;
    }

    const startDate = new Date(now.getFullYear(), now.getMonth() - limit + 1, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      period: `${startDate.toLocaleString('default', { month: 'short', year: 'numeric' })} - ${endDate.toLocaleString('default', { month: 'short', year: 'numeric' })}`,
      settlements: settlements.sort((a, b) => b.year - a.year || (b.month.localeCompare(a.month))),
      totalGrossRevenue,
      totalCommissions,
      totalProcessingFees,
      totalNetRevenue,
      averageOrderValue: totalOrders > 0 ? totalGrossRevenue / totalOrders : 0,
    };
  } catch (error) {
    console.error('Error getting settlement history:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to get settlement history',
    });
  }
}

/**
 * Generate settlement report for export
 */
export async function generateSettlementReport(
  sellerId: number,
  startMonth: number,
  startYear: number,
  endMonth: number,
  endYear: number
): Promise<string> {
  try {
    const settlements: SettlementRecord[] = [];

    // Generate settlements for date range
    let currentMonth = startMonth;
    let currentYear = startYear;

    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
      const settlement = await calculateMonthlySettlement(sellerId, currentMonth, currentYear);
      settlements.push(settlement);

      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }

    // Generate CSV
    let csv = 'FarmKonnect Marketplace Settlement Report\n\n';
    csv += 'Settlement History\n';
    csv += 'Month,Year,Gross Revenue,Commissions,Processing Fees,Net Revenue,Total Orders,Status\n';

    let totalGrossRevenue = 0;
    let totalCommissions = 0;
    let totalProcessingFees = 0;
    let totalNetRevenue = 0;
    let totalOrders = 0;

    for (const settlement of settlements) {
      csv += `${settlement.month},${settlement.year},${settlement.grossRevenue.toFixed(2)},${settlement.commissions.toFixed(2)},${settlement.processingFees.toFixed(2)},${settlement.netRevenue.toFixed(2)},${settlement.totalOrders},${settlement.status}\n`;

      totalGrossRevenue += settlement.grossRevenue;
      totalCommissions += settlement.commissions;
      totalProcessingFees += settlement.processingFees;
      totalNetRevenue += settlement.netRevenue;
      totalOrders += settlement.totalOrders;
    }

    csv += '\nSummary\n';
    csv += `Total Gross Revenue,${totalGrossRevenue.toFixed(2)}\n`;
    csv += `Total Commissions,${totalCommissions.toFixed(2)}\n`;
    csv += `Total Processing Fees,${totalProcessingFees.toFixed(2)}\n`;
    csv += `Total Net Revenue,${totalNetRevenue.toFixed(2)}\n`;
    csv += `Total Orders,${totalOrders}\n`;
    csv += `Average Order Value,${(totalGrossRevenue / totalOrders).toFixed(2)}\n`;

    return csv;
  } catch (error) {
    console.error('Error generating settlement report:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to generate settlement report',
    });
  }
}
