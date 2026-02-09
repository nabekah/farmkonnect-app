import { describe, it, expect, beforeAll } from "vitest";
import { db } from "../db";

describe("Financial Data Verification Tests", () => {
  beforeAll(async () => {
    // Verify database connection
    expect(db).toBeDefined();
  });

  it("should retrieve all expenses from database", async () => {
    const result = await db.query.expenses.findMany({ limit: 10 });
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it("should retrieve all revenue records from database", async () => {
    const result = await db.query.revenue.findMany({ limit: 10 });
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it("should verify expense data integrity", async () => {
    const result = await db.query.expenses.findMany({ limit: 1 });
    if (result.length > 0) {
      const exp = result[0];
      expect(exp.id).toBeDefined();
      expect(exp.farmId).toBeDefined();
      expect(exp.description).toBeDefined();
      expect(exp.amount).toBeDefined();
      expect(exp.expenseType).toBeDefined();
      expect(exp.expenseDate).toBeDefined();
    }
  });

  it("should verify revenue data integrity", async () => {
    const result = await db.query.revenue.findMany({ limit: 1 });
    if (result.length > 0) {
      const rev = result[0];
      expect(rev.id).toBeDefined();
      expect(rev.farmId).toBeDefined();
      expect(rev.description).toBeDefined();
      expect(rev.amount).toBeDefined();
      expect(rev.revenueType).toBeDefined();
      expect(rev.revenueDate).toBeDefined();
    }
  });

  it("should verify expense amounts are positive", async () => {
    const result = await db.query.expenses.findMany({ limit: 10 });
    result.forEach(exp => {
      expect(Number(exp.amount)).toBeGreaterThan(0);
    });
  });

  it("should verify revenue amounts are positive", async () => {
    const result = await db.query.revenue.findMany({ limit: 10 });
    result.forEach(rev => {
      expect(Number(rev.amount)).toBeGreaterThan(0);
    });
  });

  it("should verify payment status values are valid", async () => {
    const result = await db.query.expenses.findMany({ limit: 10 });
    const validStatuses = ["pending", "paid", "partial"];
    result.forEach(exp => {
      expect(validStatuses).toContain(exp.paymentStatus);
    });
  });

  it("should verify expense descriptions are not empty", async () => {
    const result = await db.query.expenses.findMany({ limit: 10 });
    result.forEach(exp => {
      expect(exp.description).toBeDefined();
      expect(exp.description.length).toBeGreaterThan(0);
    });
  });

  it("should verify revenue descriptions are not empty", async () => {
    const result = await db.query.revenue.findMany({ limit: 10 });
    result.forEach(rev => {
      expect(rev.description).toBeDefined();
      expect(rev.description.length).toBeGreaterThan(0);
    });
  });

  it("should verify currency is set to GHS", async () => {
    const result = await db.query.expenses.findMany({ limit: 10 });
    result.forEach(exp => {
      expect(exp.currency).toBe("GHS");
    });
  });

  it("should verify expense dates are valid", async () => {
    const result = await db.query.expenses.findMany({ limit: 10 });
    result.forEach(exp => {
      expect(exp.expenseDate).toBeDefined();
      const date = new Date(exp.expenseDate);
      expect(date.getTime()).toBeGreaterThan(0);
    });
  });

  it("should verify revenue dates are valid", async () => {
    const result = await db.query.revenue.findMany({ limit: 10 });
    result.forEach(rev => {
      expect(rev.revenueDate).toBeDefined();
      const date = new Date(rev.revenueDate);
      expect(date.getTime()).toBeGreaterThan(0);
    });
  });

  it("should verify vendor information for expenses", async () => {
    const result = await db.query.expenses.findMany({ limit: 10 });
    result.forEach(exp => {
      expect(exp.vendor).toBeDefined();
      expect(exp.vendor.length).toBeGreaterThan(0);
    });
  });

  it("should verify buyer information for revenue", async () => {
    const result = await db.query.revenue.findMany({ limit: 10 });
    result.forEach(rev => {
      expect(rev.buyer).toBeDefined();
      expect(rev.buyer.length).toBeGreaterThan(0);
    });
  });

  it("should calculate total expenses for farm", async () => {
    const result = await db.query.expenses.findMany({ limit: 100 });
    const totalExpenses = result.reduce((sum, exp) => sum + Number(exp.amount), 0);
    expect(totalExpenses).toBeGreaterThan(0);
  });

  it("should calculate total revenue for farm", async () => {
    const result = await db.query.revenue.findMany({ limit: 100 });
    const totalRevenue = result.reduce((sum, rev) => sum + Number(rev.amount), 0);
    expect(totalRevenue).toBeGreaterThan(0);
  });

  it("should verify expense types are valid", async () => {
    const result = await db.query.expenses.findMany({ limit: 10 });
    const validTypes = ["feed", "medication", "labor", "equipment", "utilities", "transport", "veterinary", "fertilizer", "seeds", "pesticides", "water", "rent", "insurance", "maintenance", "other"];
    result.forEach(exp => {
      expect(validTypes).toContain(exp.expenseType);
    });
  });

  it("should verify revenue types are valid", async () => {
    const result = await db.query.revenue.findMany({ limit: 10 });
    const validTypes = ["animal_sale", "milk_production", "egg_production", "wool_production", "meat_sale", "crop_sale", "produce_sale", "breeding_service", "other"];
    result.forEach(rev => {
      expect(validTypes).toContain(rev.revenueType);
    });
  });
});
