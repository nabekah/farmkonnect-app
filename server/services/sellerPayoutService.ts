import { TRPCError } from '@trpc/server';
import { getDb } from '../db';
import { marketplaceOrders, marketplaceOrderItems, marketplaceProducts } from '../../drizzle/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

interface PayoutRecord {
  id: number;
  sellerId: number;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payoutMethod: 'bank_transfer' | 'mobile_money' | 'check';
  bankAccount?: string;
  mobileNumber?: string;
  requestedDate: Date;
  processedDate?: Date;
  completedDate?: Date;
  failureReason?: string;
  transactionId?: string;
}

interface PayoutHistory {
  totalPayouts: number;
  totalAmount: number;
  pendingAmount: number;
  completedAmount: number;
  failedAmount: number;
  payouts: PayoutRecord[];
}

interface PayoutSummary {
  availableBalance: number;
  pendingAmount: number;
  lastPayoutDate?: Date;
  nextPayoutDate?: Date;
  minimumPayoutAmount: number;
  payoutMethods: string[];
}

interface EarlyPayoutRequest {
  id: number;
  sellerId: number;
  requestedAmount: number;
  fee: number;
  netAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: Date;
  approvalDate?: Date;
  reason?: string;
}

// Mock payout records storage
const payoutRecords: Map<number, PayoutRecord[]> = new Map();
const earlyPayoutRequests: Map<number, EarlyPayoutRequest[]> = new Map();

/**
 * Calculate available payout balance for seller
 */
export async function calculateAvailableBalance(sellerId: number): Promise<number> {
  try {
    const db = getDb();

    // Get seller's products
    const products = await db
      .select()
      .from(marketplaceProducts)
      .where(eq(marketplaceProducts.sellerId, sellerId));

    const productIds = products.map((p) => p.id);

    if (productIds.length === 0) {
      return 0;
    }

    // Get all completed orders
    const orders = await db
      .select()
      .from(marketplaceOrders)
      .where(eq(marketplaceOrders.status, 'delivered'));

    // Get order items
    const orderItems = await db
      .select()
      .from(marketplaceOrderItems);

    // Calculate balance
    let balance = 0;
    for (const item of orderItems) {
      if (productIds.includes(item.productId)) {
        const itemRevenue = parseFloat(item.price) * parseInt(item.quantity);
        const commissionRate = 0.03;
        const processingFeeRate = 0.029;
        const commission = itemRevenue * commissionRate;
        const processingFee = itemRevenue * processingFeeRate + 0.3;
        balance += itemRevenue - commission - processingFee;
      }
    }

    return Math.max(0, balance);
  } catch (error) {
    console.error('Error calculating available balance:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to calculate available balance',
    });
  }
}

/**
 * Request payout
 */
export async function requestPayout(
  sellerId: number,
  amount: number,
  payoutMethod: 'bank_transfer' | 'mobile_money' | 'check',
  bankAccount?: string,
  mobileNumber?: string
): Promise<PayoutRecord> {
  try {
    const availableBalance = await calculateAvailableBalance(sellerId);

    if (amount > availableBalance) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Requested amount exceeds available balance. Available: GH₵${availableBalance.toFixed(2)}`,
      });
    }

    if (amount < 50) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Minimum payout amount is GH₵50',
      });
    }

    const payoutRecord: PayoutRecord = {
      id: Math.floor(Math.random() * 1000000),
      sellerId,
      amount,
      status: 'pending',
      payoutMethod,
      bankAccount,
      mobileNumber,
      requestedDate: new Date(),
    };

    // Store payout record
    if (!payoutRecords.has(sellerId)) {
      payoutRecords.set(sellerId, []);
    }
    payoutRecords.get(sellerId)!.push(payoutRecord);

    return payoutRecord;
  } catch (error) {
    console.error('Error requesting payout:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to request payout',
    });
  }
}

/**
 * Get payout history
 */
export async function getPayoutHistory(
  sellerId: number,
  limit: number = 50,
  offset: number = 0
): Promise<PayoutHistory> {
  try {
    const sellerPayouts = payoutRecords.get(sellerId) || [];

    let totalPayouts = 0;
    let totalAmount = 0;
    let pendingAmount = 0;
    let completedAmount = 0;
    let failedAmount = 0;

    for (const payout of sellerPayouts) {
      totalPayouts++;
      totalAmount += payout.amount;

      if (payout.status === 'pending' || payout.status === 'processing') {
        pendingAmount += payout.amount;
      } else if (payout.status === 'completed') {
        completedAmount += payout.amount;
      } else if (payout.status === 'failed') {
        failedAmount += payout.amount;
      }
    }

    return {
      totalPayouts,
      totalAmount,
      pendingAmount,
      completedAmount,
      failedAmount,
      payouts: sellerPayouts.slice(offset, offset + limit).sort((a, b) => new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime()),
    };
  } catch (error) {
    console.error('Error getting payout history:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to get payout history',
    });
  }
}

/**
 * Get payout summary
 */
export async function getPayoutSummary(sellerId: number): Promise<PayoutSummary> {
  try {
    const availableBalance = await calculateAvailableBalance(sellerId);
    const history = await getPayoutHistory(sellerId);

    const sellerPayouts = payoutRecords.get(sellerId) || [];
    const completedPayouts = sellerPayouts.filter((p) => p.status === 'completed').sort((a, b) => new Date(b.completedDate!).getTime() - new Date(a.completedDate!).getTime());
    const lastPayoutDate = completedPayouts.length > 0 ? completedPayouts[0].completedDate : undefined;

    // Calculate next payout date (typically 1st of next month)
    const now = new Date();
    const nextPayoutDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return {
      availableBalance,
      pendingAmount: history.pendingAmount,
      lastPayoutDate,
      nextPayoutDate,
      minimumPayoutAmount: 50,
      payoutMethods: ['bank_transfer', 'mobile_money', 'check'],
    };
  } catch (error) {
    console.error('Error getting payout summary:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to get payout summary',
    });
  }
}

/**
 * Request early payout
 */
export async function requestEarlyPayout(
  sellerId: number,
  amount: number
): Promise<EarlyPayoutRequest> {
  try {
    const availableBalance = await calculateAvailableBalance(sellerId);

    if (amount > availableBalance) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Requested amount exceeds available balance. Available: GH₵${availableBalance.toFixed(2)}`,
      });
    }

    if (amount < 100) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Minimum early payout amount is GH₵100',
      });
    }

    // Calculate fee (2% of amount)
    const fee = amount * 0.02;
    const netAmount = amount - fee;

    const request: EarlyPayoutRequest = {
      id: Math.floor(Math.random() * 1000000),
      sellerId,
      requestedAmount: amount,
      fee,
      netAmount,
      status: 'pending',
      requestDate: new Date(),
    };

    // Store request
    if (!earlyPayoutRequests.has(sellerId)) {
      earlyPayoutRequests.set(sellerId, []);
    }
    earlyPayoutRequests.get(sellerId)!.push(request);

    return request;
  } catch (error) {
    console.error('Error requesting early payout:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to request early payout',
    });
  }
}

/**
 * Get early payout requests
 */
export async function getEarlyPayoutRequests(sellerId: number): Promise<EarlyPayoutRequest[]> {
  try {
    return (earlyPayoutRequests.get(sellerId) || []).sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
  } catch (error) {
    console.error('Error getting early payout requests:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to get early payout requests',
    });
  }
}

/**
 * Process payout (admin function)
 */
export async function processPayout(
  payoutId: number,
  transactionId: string
): Promise<PayoutRecord | null> {
  try {
    // Find and update payout record
    for (const [, payouts] of payoutRecords) {
      const payout = payouts.find((p) => p.id === payoutId);
      if (payout) {
        payout.status = 'completed';
        payout.processedDate = new Date();
        payout.completedDate = new Date();
        payout.transactionId = transactionId;
        return payout;
      }
    }

    return null;
  } catch (error) {
    console.error('Error processing payout:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to process payout',
    });
  }
}

/**
 * Cancel payout
 */
export async function cancelPayout(payoutId: number, reason: string): Promise<boolean> {
  try {
    // Find and update payout record
    for (const [, payouts] of payoutRecords) {
      const payout = payouts.find((p) => p.id === payoutId);
      if (payout && (payout.status === 'pending' || payout.status === 'processing')) {
        payout.status = 'failed';
        payout.failureReason = reason;
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error cancelling payout:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to cancel payout',
    });
  }
}
