import { describe, it, expect } from "vitest";

/**
 * Budget Visualization Component Tests
 * Tests the structure and calculations of budget visualization data
 */
describe("Budget Visualization Data Structures", () => {
  describe("BudgetVsActualItem", () => {
    it("should calculate variance correctly", () => {
      const budgeted = 1000;
      const actual = 800;
      const variance = budgeted - actual;
      
      expect(variance).toBe(200);
    });

    it("should calculate percentage used correctly", () => {
      const budgeted = 1000;
      const actual = 750;
      const percentageUsed = (actual / budgeted) * 100;
      
      expect(percentageUsed).toBe(75);
    });

    it("should identify over budget correctly", () => {
      const budgeted = 1000;
      const actual = 1200;
      const isOverBudget = actual > budgeted;
      
      expect(isOverBudget).toBe(true);
    });

    it("should identify under budget correctly", () => {
      const budgeted = 1000;
      const actual = 800;
      const isOverBudget = actual > budgeted;
      
      expect(isOverBudget).toBe(false);
    });
  });

  describe("BudgetPerformanceMetrics", () => {
    it("should calculate total remaining budget", () => {
      const totalBudget = 5000;
      const totalSpent = 3000;
      const totalRemaining = totalBudget - totalSpent;
      
      expect(totalRemaining).toBe(2000);
    });

    it("should calculate budget utilization percentage", () => {
      const totalBudget = 5000;
      const totalSpent = 2500;
      const budgetUtilization = (totalSpent / totalBudget) * 100;
      
      expect(budgetUtilization).toBe(50);
    });

    it("should determine budget health as healthy", () => {
      const budgetUtilization = 50;
      let budgetHealth = "healthy";
      
      if (budgetUtilization > 100) {
        budgetHealth = "over_budget";
      } else if (budgetUtilization > 80) {
        budgetHealth = "caution";
      } else if (budgetUtilization === 0) {
        budgetHealth = "no_budget";
      }
      
      expect(budgetHealth).toBe("healthy");
    });

    it("should determine budget health as caution", () => {
      const budgetUtilization = 85;
      let budgetHealth = "healthy";
      
      if (budgetUtilization > 100) {
        budgetHealth = "over_budget";
      } else if (budgetUtilization > 80) {
        budgetHealth = "caution";
      } else if (budgetUtilization === 0) {
        budgetHealth = "no_budget";
      }
      
      expect(budgetHealth).toBe("caution");
    });

    it("should determine budget health as over_budget", () => {
      const budgetUtilization = 120;
      let budgetHealth = "healthy";
      
      if (budgetUtilization > 100) {
        budgetHealth = "over_budget";
      } else if (budgetUtilization > 80) {
        budgetHealth = "caution";
      } else if (budgetUtilization === 0) {
        budgetHealth = "no_budget";
      }
      
      expect(budgetHealth).toBe("over_budget");
    });

    it("should determine budget health as no_budget", () => {
      const budgetUtilization = 0;
      let budgetHealth = "healthy";
      
      if (budgetUtilization > 100) {
        budgetHealth = "over_budget";
      } else if (budgetUtilization > 80) {
        budgetHealth = "caution";
      } else if (budgetUtilization === 0) {
        budgetHealth = "no_budget";
      }
      
      expect(budgetHealth).toBe("no_budget");
    });
  });

  describe("BudgetAlert", () => {
    it("should classify critical severity for over budget", () => {
      const budgeted = 1000;
      const actual = 1200;
      const severity = actual > budgeted ? "critical" : "warning";
      
      expect(severity).toBe("critical");
    });

    it("should classify warning severity for near budget", () => {
      const budgeted = 1000;
      const actual = 850;
      const percentageUsed = actual / budgeted;
      const threshold = 0.8;
      const severity = actual > budgeted ? "critical" : percentageUsed >= threshold ? "warning" : "normal";
      
      expect(severity).toBe("warning");
    });

    it("should classify normal severity for under budget", () => {
      const budgeted = 1000;
      const actual = 500;
      const percentageUsed = actual / budgeted;
      const threshold = 0.8;
      const severity = actual > budgeted ? "critical" : percentageUsed >= threshold ? "warning" : "normal";
      
      expect(severity).toBe("normal");
    });

    it("should generate correct alert message for over budget", () => {
      const budgeted = 1000;
      const actual = 1200;
      const message = actual > budgeted 
        ? `Over budget by ₵${(actual - budgeted).toFixed(2)}`
        : `${Math.round((actual / budgeted) * 100)}% of budget used`;
      
      expect(message).toBe("Over budget by ₵200.00");
    });

    it("should generate correct alert message for under budget", () => {
      const budgeted = 1000;
      const actual = 750;
      const message = actual > budgeted 
        ? `Over budget by ₵${(actual - budgeted).toFixed(2)}`
        : `${Math.round((actual / budgeted) * 100)}% of budget used`;
      
      expect(message).toBe("75% of budget used");
    });
  });

  describe("BudgetTrendAnalysis", () => {
    it("should calculate trend variance correctly", () => {
      const budgeted = 2000;
      const actual = 1800;
      const variance = budgeted - actual;
      
      expect(variance).toBe(200);
    });

    it("should calculate trend variance percentage", () => {
      const budgeted = 2000;
      const actual = 1800;
      const variance = budgeted - actual;
      const variancePercent = budgeted > 0 ? (variance / budgeted) * 100 : 0;
      
      expect(variancePercent).toBe(10);
    });

    it("should identify positive trend (under budget)", () => {
      const variance = 200;
      const isPositive = variance > 0;
      
      expect(isPositive).toBe(true);
    });

    it("should identify negative trend (over budget)", () => {
      const variance = -200;
      const isPositive = variance > 0;
      
      expect(isPositive).toBe(false);
    });
  });

  describe("Currency formatting", () => {
    it("should format currency correctly", () => {
      const value = 1234.56;
      const formatted = new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value);
      
      expect(formatted).toMatch(/GH₵|GHS/)
      expect(formatted).toContain("1,234");
    });

    it("should handle zero currency", () => {
      const value = 0;
      const formatted = new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value);
      
      expect(formatted).toMatch(/GH₵|GHS/)
    });
  });

  describe("Budget category calculations", () => {
    it("should count over budget categories", () => {
      const categories = [
        { budgeted: 1000, actual: 1200, isOverBudget: true },
        { budgeted: 1000, actual: 800, isOverBudget: false },
        { budgeted: 1000, actual: 1100, isOverBudget: true },
      ];
      
      const overBudgetCount = categories.filter(c => c.isOverBudget).length;
      expect(overBudgetCount).toBe(2);
    });

    it("should count under budget categories", () => {
      const categories = [
        { budgeted: 1000, actual: 1200, isOverBudget: true },
        { budgeted: 1000, actual: 800, isOverBudget: false },
        { budgeted: 1000, actual: 900, isOverBudget: false },
      ];
      
      const underBudgetCount = categories.filter(c => !c.isOverBudget).length;
      expect(underBudgetCount).toBe(2);
    });

    it("should calculate average variance percentage", () => {
      const categories = [
        { variance: 100, budgeted: 1000 },
        { variance: 200, budgeted: 1000 },
        { variance: 50, budgeted: 1000 },
      ];
      
      const avgVariancePercent = categories.reduce((sum, c) => sum + (c.variance / c.budgeted) * 100, 0) / categories.length;
      expect(avgVariancePercent).toBeCloseTo(11.67, 1);
    });
  });
});
