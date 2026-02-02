import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { marketplaceCart, marketplaceProducts, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Marketplace Cart Operations", () => {
  let db: any;
  let testUserId: number;
  let testProductId: number;
  let testCartId: number;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Create test user
    const userResult = await db
      .insert(users)
      .values({
        name: "Test Cart User",
        email: `cart-test-${Date.now()}@test.com`,
        role: "user",
      })
      .returning({ id: users.id });
    testUserId = userResult[0].id;

    // Create test product
    const productResult = await db
      .insert(marketplaceProducts)
      .values({
        name: "Test Cart Product",
        description: "Test product for cart operations",
        category: "Seeds",
        price: "100.00",
        quantity: "50",
        unit: "kg",
        sellerId: testUserId,
        imageUrl: "https://example.com/test.jpg",
      })
      .returning({ id: marketplaceProducts.id });
    testProductId = productResult[0].id;
  });

  afterAll(async () => {
    if (!db) return;

    // Cleanup test data
    await db.delete(marketplaceCart).where(eq(marketplaceCart.userId, testUserId));
    await db
      .delete(marketplaceProducts)
      .where(eq(marketplaceProducts.id, testProductId));
    await db.delete(users).where(eq(users.id, testUserId));
  });

  it("should add item to cart", async () => {
    const result = await db
      .insert(marketplaceCart)
      .values({
        userId: testUserId,
        productId: testProductId,
        quantity: "5",
      })
      .returning({ id: marketplaceCart.id });

    testCartId = result[0].id;
    expect(result[0].id).toBeDefined();
    expect(typeof result[0].id).toBe("number");
  });

  it("should retrieve cart with id field", async () => {
    const cartItems = await db
      .select()
      .from(marketplaceCart)
      .where(eq(marketplaceCart.userId, testUserId));

    expect(cartItems.length).toBeGreaterThan(0);
    expect(cartItems[0].id).toBeDefined();
    expect(typeof cartItems[0].id).toBe("number");
  });

  it("should have valid cartId for removal", async () => {
    const cartItem = await db
      .select()
      .from(marketplaceCart)
      .where(eq(marketplaceCart.id, testCartId))
      .limit(1);

    expect(cartItem.length).toBe(1);
    expect(cartItem[0].id).toBe(testCartId);
    expect(typeof cartItem[0].id).toBe("number");
    expect(cartItem[0].id).not.toBeUndefined();
  });

  it("should remove item from cart using cartId", async () => {
    const result = await db
      .delete(marketplaceCart)
      .where(eq(marketplaceCart.id, testCartId));

    expect(result).toBeDefined();

    // Verify deletion
    const cartItem = await db
      .select()
      .from(marketplaceCart)
      .where(eq(marketplaceCart.id, testCartId));

    expect(cartItem.length).toBe(0);
  });

  it("should handle multiple cart items with unique ids", async () => {
    // Add two items
    const item1 = await db
      .insert(marketplaceCart)
      .values({
        userId: testUserId,
        productId: testProductId,
        quantity: "2",
      })
      .returning({ id: marketplaceCart.id });

    const item2 = await db
      .insert(marketplaceCart)
      .values({
        userId: testUserId,
        productId: testProductId,
        quantity: "3",
      })
      .returning({ id: marketplaceCart.id });

    expect(item1[0].id).not.toEqual(item2[0].id);
    expect(typeof item1[0].id).toBe("number");
    expect(typeof item2[0].id).toBe("number");

    // Cleanup
    await db.delete(marketplaceCart).where(eq(marketplaceCart.userId, testUserId));
  });

  it("should validate cartId is a number not undefined", async () => {
    const result = await db
      .insert(marketplaceCart)
      .values({
        userId: testUserId,
        productId: testProductId,
        quantity: "1",
      })
      .returning({ id: marketplaceCart.id });

    const cartId = result[0].id;

    // This should not throw "Invalid input: expected number, received undefined"
    expect(cartId).toBeDefined();
    expect(typeof cartId).toBe("number");
    expect(Number.isNaN(cartId)).toBe(false);

    // Cleanup
    await db.delete(marketplaceCart).where(eq(marketplaceCart.id, cartId));
  });
});
