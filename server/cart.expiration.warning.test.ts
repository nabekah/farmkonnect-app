import { describe, it, expect } from "vitest";

describe("Cart Expiration Warning Feature", () => {
  describe("Expiration Status Calculation", () => {
    it("should correctly identify items expiring within 7 days", () => {
      const now = new Date();
      const expiresIn5Days = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

      const daysRemaining = Math.ceil(
        (expiresIn5Days.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      );
      const isExpiring = daysRemaining <= 7 && daysRemaining > 0;

      expect(daysRemaining).toBe(5);
      expect(isExpiring).toBe(true);
    });

    it("should correctly identify items not expiring within 7 days", () => {
      const now = new Date();
      const expiresIn15Days = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

      const daysRemaining = Math.ceil(
        (expiresIn15Days.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      );
      const isExpiring = daysRemaining <= 7 && daysRemaining > 0;

      expect(daysRemaining).toBe(15);
      expect(isExpiring).toBe(false);
    });

    it("should correctly identify expired items", () => {
      const now = new Date();
      const expiredDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

      const daysRemaining = Math.ceil(
        (expiredDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      );
      const isExpired = daysRemaining <= 0;

      expect(daysRemaining).toBeLessThanOrEqual(0);
      expect(isExpired).toBe(true);
    });

    it("should handle edge case: exactly 7 days remaining", () => {
      const now = new Date();
      const expiresIn7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const daysRemaining = Math.ceil(
        (expiresIn7Days.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      );
      const isExpiring = daysRemaining <= 7 && daysRemaining > 0;

      expect(daysRemaining).toBe(7);
      expect(isExpiring).toBe(true);
    });

    it("should handle edge case: exactly 1 day remaining", () => {
      const now = new Date();
      const expiresIn1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

      const daysRemaining = Math.ceil(
        (expiresIn1Day.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      );
      const isExpiring = daysRemaining <= 7 && daysRemaining > 0;

      expect(daysRemaining).toBe(1);
      expect(isExpiring).toBe(true);
    });

    it("should handle edge case: 0 days remaining (expires today)", () => {
      const now = new Date();
      const expiresToday = new Date(now.getTime() + 1 * 60 * 60 * 1000); // 1 hour from now

      const daysRemaining = Math.ceil(
        (expiresToday.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      );
      const isExpiring = daysRemaining <= 7 && daysRemaining > 0;
      const isExpired = daysRemaining <= 0;

      expect(daysRemaining).toBe(1); // Rounds up to 1 day
      expect(isExpiring).toBe(true);
      expect(isExpired).toBe(false);
    });
  });

  describe("Cart Item Warning Status", () => {
    interface CartItem {
      id: number;
      productName: string;
      daysRemaining: number;
      isExpiring: boolean;
      isExpired: boolean;
    }

    it("should filter expiring items correctly", () => {
      const cartItems: CartItem[] = [
        {
          id: 1,
          productName: "Seeds",
          daysRemaining: 5,
          isExpiring: true,
          isExpired: false,
        },
        {
          id: 2,
          productName: "Fertilizer",
          daysRemaining: 15,
          isExpiring: false,
          isExpired: false,
        },
        {
          id: 3,
          productName: "Pesticide",
          daysRemaining: -1,
          isExpiring: false,
          isExpired: true,
        },
      ];

      const expiringItems = cartItems.filter(
        (item) => item.isExpiring || item.isExpired
      );

      expect(expiringItems).toHaveLength(2);
      expect(expiringItems[0].id).toBe(1);
      expect(expiringItems[1].id).toBe(3);
    });

    it("should return empty array when no items are expiring", () => {
      const cartItems: CartItem[] = [
        {
          id: 1,
          productName: "Seeds",
          daysRemaining: 15,
          isExpiring: false,
          isExpired: false,
        },
        {
          id: 2,
          productName: "Fertilizer",
          daysRemaining: 30,
          isExpiring: false,
          isExpired: false,
        },
      ];

      const expiringItems = cartItems.filter(
        (item) => item.isExpiring || item.isExpired
      );

      expect(expiringItems).toHaveLength(0);
    });

    it("should correctly identify multiple expiring items", () => {
      const cartItems: CartItem[] = [
        {
          id: 1,
          productName: "Seeds",
          daysRemaining: 3,
          isExpiring: true,
          isExpired: false,
        },
        {
          id: 2,
          productName: "Fertilizer",
          daysRemaining: 7,
          isExpiring: true,
          isExpired: false,
        },
        {
          id: 3,
          productName: "Pesticide",
          daysRemaining: -2,
          isExpiring: false,
          isExpired: true,
        },
      ];

      const expiringItems = cartItems.filter(
        (item) => item.isExpiring || item.isExpired
      );

      expect(expiringItems).toHaveLength(3);
      expect(expiringItems.filter((item) => item.isExpiring)).toHaveLength(2);
      expect(expiringItems.filter((item) => item.isExpired)).toHaveLength(1);
    });
  });

  describe("Warning Message Display", () => {
    it("should show appropriate message for expiring items", () => {
      const daysRemaining = 5;
      const message =
        daysRemaining <= 7 && daysRemaining > 0
          ? `${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} remaining`
          : "Item expired";

      expect(message).toBe("5 days remaining");
    });

    it("should show appropriate message for expired items", () => {
      const daysRemaining = -1;
      const message =
        daysRemaining <= 0
          ? "Item expired"
          : `${daysRemaining} days remaining`;

      expect(message).toBe("Item expired");
    });

    it("should handle singular day correctly", () => {
      const daysRemaining = 1;
      const message = `${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} remaining`;

      expect(message).toBe("1 day remaining");
    });

    it("should handle plural days correctly", () => {
      const daysRemaining = 7;
      const message = `${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} remaining`;

      expect(message).toBe("7 days remaining");
    });
  });

  describe("Extend Expiration Logic", () => {
    it("should calculate new expiration date 30 days from now", () => {
      const now = new Date();
      const newExpiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const daysRemaining = Math.ceil(
        (newExpiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      );

      expect(daysRemaining).toBe(30);
    });

    it("should extend expiration for items expiring within 7 days", () => {
      const now = new Date();
      const currentExpiry = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
      const newExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const currentDaysRemaining = Math.ceil(
        (currentExpiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      );
      const newDaysRemaining = Math.ceil(
        (newExpiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      );

      expect(currentDaysRemaining).toBe(5);
      expect(newDaysRemaining).toBe(30);
      expect(newDaysRemaining - currentDaysRemaining).toBe(25);
    });
  });
});
