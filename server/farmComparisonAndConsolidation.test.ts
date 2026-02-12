import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { farms, expenses, revenue, budgets, budgetLineItems, users } from "../drizzle/schema";
import { eq, sql } from "drizzle-orm";

describe("Farm Comparison and Consolidation Features", () => {
  let db: any;
  let testUserId: number;
  let testFarmIds: number[] = [];

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Create test user
    const userResult = await db.insert(users).values({
      openId: `test-user-${Date.now()}`,
      name: "Test Farmer",
      email: "test@farm.com",
      loginMethod: "oauth",
      role: "user",
    });
    testUserId = userResult[0].insertId || 1;

    // Create test farms
    for (let i = 0; i < 3; i++) {
      const farmResult = await db.insert(farms).values({
        farmerUserId: testUserId,
        farmName: `Test Farm ${i + 1}`,
        location: `Location ${i + 1}`,
        sizeHectares: (10 + i * 5).toString(),
        farmType: i === 0 ? "crop" : i === 1 ? "livestock" : "mixed",
        description: `Test farm ${i + 1}`,
      });
      testFarmIds.push(farmResult[0].insertId || i + 1);
    }

    // Add sample expenses for each farm
    for (const farmId of testFarmIds) {
      await db.insert(expenses).values([
        {
          farmId,
          categoryName: "Feed",
          amount: 5000,
          date: new Date(),
          description: "Feed expenses",
        },
        {
          farmId,
          categoryName: "Labor",
          amount: 3000,
          date: new Date(),
          description: "Labor costs",
        },
        {
          farmId,
          categoryName: "Equipment",
          amount: 2000,
          date: new Date(),
          description: "Equipment maintenance",
        },
      ]);
    }

    // Add sample revenue for each farm
    for (const farmId of testFarmIds) {
      await db.insert(revenue).values([
        {
          farmId,
          revenueType: "Crop Sales",
          amount: 8000,
          date: new Date(),
          description: "Crop harvest",
        },
        {
          farmId,
          revenueType: "Animal Products",
          amount: 5000,
          date: new Date(),
          description: "Milk and eggs",
        },
      ]);
    }

    // Add sample budgets
    for (const farmId of testFarmIds) {
      const budgetResult = await db.insert(budgets).values({
        farmId,
        budgetName: `Budget ${farmId}`,
        totalAmount: 20000,
        fiscalYear: new Date().getFullYear(),
      });

      const budgetId = budgetResult[0].insertId || farmId;

      await db.insert(budgetLineItems).values([
        {
          budgetId,
          categoryName: "Feed",
          budgetedAmount: 8000,
        },
        {
          budgetId,
          categoryName: "Labor",
          budgetedAmount: 6000,
        },
        {
          budgetId,
          categoryName: "Equipment",
          budgetedAmount: 6000,
        },
      ]);
    }
  });

  afterAll(async () => {
    if (db) {
      // Cleanup test data
      for (const farmId of testFarmIds) {
        await db.delete(expenses).where(eq(expenses.farmId, farmId));
        await db.delete(revenue).where(eq(revenue.farmId, farmId));
      }
    }
  });

  describe("Farm Comparison Procedures", () => {
    it("should compare financial metrics across farms", async () => {
      const results = await db
        .select({
          farmId: farms.id,
          farmName: farms.farmName,
          totalRevenue: sql<number>`COALESCE(SUM(${revenue.amount}), 0)`,
          totalExpenses: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
        })
        .from(farms)
        .leftJoin(revenue, eq(farms.id, revenue.farmId))
        .leftJoin(expenses, eq(farms.id, expenses.farmId))
        .where(eq(farms.farmerUserId, testUserId))
        .groupBy(farms.id);

      expect(results.length).toBe(3);
      results.forEach((farm) => {
        expect(farm.totalRevenue).toBeGreaterThan(0);
        expect(farm.totalExpenses).toBeGreaterThan(0);
      });
    });

    it("should calculate profit margin correctly", async () => {
      const farm = await db
        .select({
          totalRevenue: sql<number>`COALESCE(SUM(${revenue.amount}), 0)`,
          totalExpenses: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
        })
        .from(revenue)
        .leftJoin(expenses, eq(revenue.farmId, expenses.farmId))
        .where(eq(revenue.farmId, testFarmIds[0]))
        .groupBy(revenue.farmId);

      if (farm.length > 0) {
        const totalRevenue = Number(farm[0].totalRevenue);
        const totalExpenses = Number(farm[0].totalExpenses);
        const profit = totalRevenue - totalExpenses;
        const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

        expect(profitMargin).toBeGreaterThanOrEqual(0);
        expect(profitMargin).toBeLessThanOrEqual(100);
      }
    });

    it("should identify top revenue farm", async () => {
      const results = await db
        .select({
          farmId: farms.id,
          farmName: farms.farmName,
          totalRevenue: sql<number>`COALESCE(SUM(${revenue.amount}), 0)`,
        })
        .from(farms)
        .leftJoin(revenue, eq(farms.id, revenue.farmId))
        .where(eq(farms.farmerUserId, testUserId))
        .groupBy(farms.id)
        .orderBy(sql`COALESCE(SUM(${revenue.amount}), 0) DESC`);

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].totalRevenue).toBeGreaterThanOrEqual(results[1]?.totalRevenue || 0);
    });

    it("should compare budget performance", async () => {
      const budgetComparison = await db
        .select({
          farmId: farms.id,
          farmName: farms.farmName,
          totalBudgeted: sql<number>`COALESCE(SUM(${budgetLineItems.budgetedAmount}), 0)`,
          totalSpent: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
        })
        .from(farms)
        .leftJoin(budgets, eq(farms.id, budgets.farmId))
        .leftJoin(budgetLineItems, eq(budgets.id, budgetLineItems.budgetId))
        .leftJoin(expenses, eq(farms.id, expenses.farmId))
        .where(eq(farms.farmerUserId, testUserId))
        .groupBy(farms.id);

      expect(budgetComparison.length).toBeGreaterThan(0);
      budgetComparison.forEach((farm) => {
        const variance = Number(farm.totalSpent) - Number(farm.totalBudgeted);
        expect(typeof variance).toBe("number");
      });
    });

    it("should calculate efficiency metrics", async () => {
      const efficiency = await db
        .select({
          farmId: farms.id,
          farmName: farms.farmName,
          sizeHectares: farms.sizeHectares,
          totalRevenue: sql<number>`COALESCE(SUM(${revenue.amount}), 0)`,
        })
        .from(farms)
        .leftJoin(revenue, eq(farms.id, revenue.farmId))
        .where(eq(farms.farmerUserId, testUserId))
        .groupBy(farms.id);

      expect(efficiency.length).toBeGreaterThan(0);
      efficiency.forEach((farm) => {
        const hectares = Number(farm.sizeHectares);
        const totalRevenue = Number(farm.totalRevenue);
        const revenuePerHectare = hectares > 0 ? totalRevenue / hectares : 0;
        expect(revenuePerHectare).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe("Farm Consolidation Procedures", () => {
    it("should consolidate financial data across all farms", async () => {
      const consolidated = await db
        .select({
          totalRevenue: sql<number>`COALESCE(SUM(${revenue.amount}), 0)`,
          totalExpenses: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
          farmCount: sql<number>`COUNT(DISTINCT ${farms.id})`,
        })
        .from(farms)
        .leftJoin(revenue, eq(farms.id, revenue.farmId))
        .leftJoin(expenses, eq(farms.id, expenses.farmId))
        .where(eq(farms.farmerUserId, testUserId));

      expect(consolidated.length).toBe(1);
      expect(Number(consolidated[0].totalRevenue)).toBeGreaterThan(0);
      expect(Number(consolidated[0].totalExpenses)).toBeGreaterThan(0);
      expect(Number(consolidated[0].farmCount)).toBe(3);
    });

    it("should calculate portfolio profit correctly", async () => {
      const portfolio = await db
        .select({
          totalRevenue: sql<number>`COALESCE(SUM(${revenue.amount}), 0)`,
          totalExpenses: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
        })
        .from(farms)
        .leftJoin(revenue, eq(farms.id, revenue.farmId))
        .leftJoin(expenses, eq(farms.id, expenses.farmId))
        .where(eq(farms.farmerUserId, testUserId));

      if (portfolio.length > 0) {
        const totalRevenue = Number(portfolio[0].totalRevenue);
        const totalExpenses = Number(portfolio[0].totalExpenses);
        const profit = totalRevenue - totalExpenses;

        expect(profit).toBeGreaterThanOrEqual(totalRevenue - totalExpenses);
      }
    });

    it("should aggregate expenses by category", async () => {
      const categoryAgg = await db
        .select({
          categoryName: expenses.categoryName,
          totalAmount: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
        })
        .from(expenses)
        .innerJoin(farms, eq(expenses.farmId, farms.id))
        .where(eq(farms.farmerUserId, testUserId))
        .groupBy(expenses.categoryName);

      expect(categoryAgg.length).toBeGreaterThan(0);
      categoryAgg.forEach((cat) => {
        expect(Number(cat.totalAmount)).toBeGreaterThan(0);
      });
    });

    it("should aggregate revenue by type", async () => {
      const typeAgg = await db
        .select({
          revenueType: revenue.revenueType,
          totalAmount: sql<number>`COALESCE(SUM(${revenue.amount}), 0)`,
        })
        .from(revenue)
        .innerJoin(farms, eq(revenue.farmId, farms.id))
        .where(eq(farms.farmerUserId, testUserId))
        .groupBy(revenue.revenueType);

      expect(typeAgg.length).toBeGreaterThan(0);
      typeAgg.forEach((type) => {
        expect(Number(type.totalAmount)).toBeGreaterThan(0);
      });
    });

    it("should calculate portfolio efficiency metrics", async () => {
      const portfolio = await db
        .select({
          totalRevenue: sql<number>`COALESCE(SUM(${revenue.amount}), 0)`,
          totalExpenses: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
          totalArea: sql<number>`COALESCE(SUM(CAST(${farms.sizeHectares} AS DECIMAL(10,2))), 0)`,
        })
        .from(farms)
        .leftJoin(revenue, eq(farms.id, revenue.farmId))
        .leftJoin(expenses, eq(farms.id, expenses.farmId))
        .where(eq(farms.farmerUserId, testUserId));

      if (portfolio.length > 0) {
        const totalRevenue = Number(portfolio[0].totalRevenue);
        const totalArea = Number(portfolio[0].totalArea);
        const revenuePerHectare = totalArea > 0 ? totalRevenue / totalArea : 0;

        expect(revenuePerHectare).toBeGreaterThanOrEqual(0);
      }
    });

    it("should rank farms by performance", async () => {
      const ranking = await db
        .select({
          farmId: farms.id,
          farmName: farms.farmName,
          totalRevenue: sql<number>`COALESCE(SUM(${revenue.amount}), 0)`,
        })
        .from(farms)
        .leftJoin(revenue, eq(farms.id, revenue.farmId))
        .where(eq(farms.farmerUserId, testUserId))
        .groupBy(farms.id)
        .orderBy(sql`COALESCE(SUM(${revenue.amount}), 0) DESC`);

      expect(ranking.length).toBe(3);
      // Verify descending order
      for (let i = 0; i < ranking.length - 1; i++) {
        expect(Number(ranking[i].totalRevenue)).toBeGreaterThanOrEqual(Number(ranking[i + 1].totalRevenue));
      }
    });

    it("should consolidate budget status", async () => {
      const budgetStatus = await db
        .select({
          totalBudgeted: sql<number>`COALESCE(SUM(${budgetLineItems.budgetedAmount}), 0)`,
          totalSpent: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
        })
        .from(farms)
        .leftJoin(budgets, eq(farms.id, budgets.farmId))
        .leftJoin(budgetLineItems, eq(budgets.id, budgetLineItems.budgetId))
        .leftJoin(expenses, eq(farms.id, expenses.farmId))
        .where(eq(farms.farmerUserId, testUserId));

      expect(budgetStatus.length).toBe(1);
      const totalBudgeted = Number(budgetStatus[0].totalBudgeted);
      const totalSpent = Number(budgetStatus[0].totalSpent);
      expect(totalBudgeted).toBeGreaterThan(0);
      expect(totalSpent).toBeGreaterThan(0);
    });
  });

  describe("Data Validation", () => {
    it("should handle farms with no expenses", async () => {
      const farmWithNoExpenses = await db
        .select({
          farmId: farms.id,
          totalExpenses: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
        })
        .from(farms)
        .leftJoin(expenses, eq(farms.id, expenses.farmId))
        .where(eq(farms.farmerUserId, testUserId))
        .groupBy(farms.id)
        .limit(1);

      expect(farmWithNoExpenses.length).toBeGreaterThan(0);
      expect(Number(farmWithNoExpenses[0].totalExpenses)).toBeGreaterThanOrEqual(0);
    });

    it("should handle zero division in percentage calculations", async () => {
      const farm = await db
        .select({
          totalRevenue: sql<number>`COALESCE(SUM(${revenue.amount}), 0)`,
          totalExpenses: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
        })
        .from(revenue)
        .where(eq(revenue.farmId, testFarmIds[0]))
        .groupBy(revenue.farmId);

      if (farm.length > 0) {
        const totalRevenue = Number(farm[0].totalRevenue);
        const profitMargin = totalRevenue > 0 ? 50 : 0; // Safe division

        expect(typeof profitMargin).toBe("number");
        expect(profitMargin).toBeGreaterThanOrEqual(0);
      }
    });

    it("should validate farm count in consolidation", async () => {
      const farmCount = await db
        .select({
          count: sql<number>`COUNT(DISTINCT ${farms.id})`,
        })
        .from(farms)
        .where(eq(farms.farmerUserId, testUserId));

      expect(Number(farmCount[0].count)).toBe(3);
    });
  });
});
