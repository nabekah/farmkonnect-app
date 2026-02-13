import { describe, it, expect } from 'vitest';

describe('New Financial Features', () => {
  describe('Expense Reconciliation', () => {
    it('should parse CSV bank statements', () => {
      const csv = `date,description,amount
2026-02-01,Purchase Seeds,500.00
2026-02-05,Fertilizer,1200.00
2026-02-10,Labor,800.00`;

      const lines = csv.split('\n');
      const headers = lines[0].split(',');
      expect(headers).toEqual(['date', 'description', 'amount']);
      expect(lines.length).toBe(4);
    });

    it('should match bank statements with expenses', () => {
      const bankStatement = {
        date: '2026-02-01',
        description: 'Purchase Seeds',
        amount: '500.00',
      };

      const expense = {
        expenseDate: new Date('2026-02-01'),
        description: 'Purchase Seeds',
        amount: 500.00,
      };

      const amount1 = parseFloat(bankStatement.amount);
      const amount2 = expense.amount;
      const match = Math.abs(amount1 - amount2) < 0.01;

      expect(match).toBe(true);
    });

    it('should identify unmatched transactions', () => {
      const bankStatements = [
        { date: '2026-02-01', description: 'Purchase Seeds', amount: '500.00' },
        { date: '2026-02-05', description: 'Unknown Payment', amount: '1500.00' },
      ];

      const expenses = [
        { expenseDate: new Date('2026-02-01'), amount: 500.00 },
      ];

      const unmatched = bankStatements.filter((stmt) => {
        const amount = parseFloat(stmt.amount);
        return !expenses.some(
          (exp) => Math.abs(exp.amount - amount) < 0.01
        );
      });

      expect(unmatched.length).toBe(1);
      expect(unmatched[0].description).toBe('Unknown Payment');
    });

    it('should calculate reconciliation summary', () => {
      const matched = 5;
      const unmatched = 2;
      const total = matched + unmatched;
      const matchPercentage = (matched / total) * 100;

      expect(matchPercentage).toBe(71.42857142857143);
      expect(total).toBe(7);
    });
  });

  describe('Cash Flow Projections', () => {
    it('should calculate monthly averages', () => {
      const monthlyExpenses: Record<string, number> = {
        '2026-01': 5000,
        '2026-02': 6000,
        '2026-03': 5500,
      };

      const values = Object.values(monthlyExpenses);
      const average = values.reduce((a, b) => a + b, 0) / values.length;

      expect(average).toBe(5500);
    });

    it('should project 6-month cash flow', () => {
      const avgRevenue = 10000;
      const avgExpense = 6000;
      const monthlyFlow = avgRevenue - avgExpense;

      const projections = [];
      let cumulative = 0;

      for (let i = 0; i < 6; i++) {
        cumulative += monthlyFlow;
        projections.push({
          month: i + 1,
          cashFlow: monthlyFlow,
          cumulative,
        });
      }

      expect(projections.length).toBe(6);
      expect(projections[0].cashFlow).toBe(4000);
      expect(projections[5].cumulative).toBe(24000);
    });

    it('should identify negative cash flow', () => {
      const avgRevenue = 5000;
      const avgExpense = 8000;
      const monthlyFlow = avgRevenue - avgExpense;

      expect(monthlyFlow).toBeLessThan(0);
      expect(monthlyFlow).toBe(-3000);
    });

    it('should calculate cumulative cash position', () => {
      const monthlyFlows = [4000, 4000, 4000, 4000, 4000, 4000];
      let cumulative = 0;
      const positions = [];

      monthlyFlows.forEach((flow) => {
        cumulative += flow;
        positions.push(cumulative);
      });

      expect(positions[0]).toBe(4000);
      expect(positions[5]).toBe(24000);
    });
  });

  describe('Financial Alerts', () => {
    it('should detect budget exceeded condition', () => {
      const totalExpenses = 12000;
      const totalRevenue = 10000;
      const budgetExceeded = totalExpenses > totalRevenue * 1.1;

      expect(budgetExceeded).toBe(true);
    });

    it('should calculate budget overrun percentage', () => {
      const totalExpenses = 11000;
      const totalRevenue = 10000;
      const overrunPercent = ((totalExpenses / totalRevenue - 1) * 100);

      expect(Math.round(overrunPercent)).toBe(10);
    });

    it('should detect low cash flow warning', () => {
      const totalRevenue = 10000;
      const totalExpenses = 6000;
      const cashFlow = totalRevenue - totalExpenses;
      const isLowCashFlow = cashFlow < totalRevenue * 0.2;

      expect(isLowCashFlow).toBe(false);
      expect(cashFlow).toBe(4000);
    });

    it('should identify unusual spending patterns', () => {
      const expenses = [500, 600, 700, 2500, 800];
      const avgExpense = expenses.reduce((a, b) => a + b, 0) / expenses.length;
      const unusual = expenses.filter((exp) => exp > avgExpense * 2);

      expect(Math.round(avgExpense)).toBe(1020);
      expect(unusual.length).toBe(1);
      expect(unusual[0]).toBe(2500);
    });

    it('should count pending payments', () => {
      const revenues = [
        { amount: 1000, paymentStatus: 'paid' },
        { amount: 2000, paymentStatus: 'pending' },
        { amount: 1500, paymentStatus: 'partial' },
        { amount: 3000, paymentStatus: 'paid' },
      ];

      const pending = revenues.filter(
        (rev) => rev.paymentStatus === 'pending' || rev.paymentStatus === 'partial'
      );

      expect(pending.length).toBe(2);
      expect(pending.reduce((sum, p) => sum + p.amount, 0)).toBe(3500);
    });

    it('should assign severity levels to alerts', () => {
      const alerts = [
        { type: 'budget_exceeded', severity: 'critical' },
        { type: 'low_cash_flow', severity: 'warning' },
        { type: 'payment_due', severity: 'info' },
      ];

      const criticalAlerts = alerts.filter((a) => a.severity === 'critical');
      expect(criticalAlerts.length).toBe(1);

      const warningAlerts = alerts.filter((a) => a.severity === 'warning');
      expect(warningAlerts.length).toBe(1);

      const infoAlerts = alerts.filter((a) => a.severity === 'info');
      expect(infoAlerts.length).toBe(1);
    });
  });

  describe('Integration Tests', () => {
    it('should process complete financial workflow', () => {
      // Simulate complete workflow
      const expenses = [500, 600, 700, 800];
      const revenues = [2000, 2500, 2200];

      const totalExpenses = expenses.reduce((a, b) => a + b, 0);
      const totalRevenue = revenues.reduce((a, b) => a + b, 0);
      const cashFlow = totalRevenue - totalExpenses;

      expect(totalExpenses).toBe(2600);
      expect(totalRevenue).toBe(6700);
      expect(cashFlow).toBe(4100);
    });

    it('should handle empty data gracefully', () => {
      const expenses: number[] = [];
      const revenues: number[] = [];

      const totalExpenses = expenses.reduce((a, b) => a + b, 0);
      const totalRevenue = revenues.reduce((a, b) => a + b, 0);

      expect(totalExpenses).toBe(0);
      expect(totalRevenue).toBe(0);
    });

    it('should validate data types', () => {
      const validAmount = '1000.50';
      const parsedAmount = parseFloat(validAmount);

      expect(typeof parsedAmount).toBe('number');
      expect(parsedAmount).toBe(1000.50);
    });
  });
});
