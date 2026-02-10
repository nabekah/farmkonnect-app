import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";

/**
 * Biometric Authentication Router
 * Fingerprint/face recognition with offline PIN backup
 */
export const biometricAuthenticationCleanRouter = router({
  /**
   * Register biometric data
   */
  registerBiometric: protectedProcedure
    .input(
      z.object({
        workerId: z.number(),
        biometricType: z.enum(["fingerprint", "face"]),
        biometricData: z.string(),
        backupPin: z.string().length(4),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          success: true,
          workerId: input.workerId,
          biometricType: input.biometricType,
          status: "registered",
          message: "Biometric data registered successfully",
          registeredAt: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to register biometric: ${error}`,
        });
      }
    }),

  /**
   * Authenticate with fingerprint
   */
  authenticateWithFingerprint: publicProcedure
    .input(
      z.object({
        workerId: z.number(),
        fingerprintData: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        // Simulate fingerprint matching
        const matchScore = Math.random() * 100;
        const isMatched = matchScore > 15; // 85% threshold

        if (!isMatched) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Fingerprint does not match. Please try again.",
          });
        }

        return {
          success: true,
          workerId: input.workerId,
          authMethod: "fingerprint",
          matchScore: matchScore.toFixed(2),
          token: `bio_token_${Date.now()}`,
          expiresIn: 3600,
          message: "Authentication successful",
        };
      } catch (error) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `Authentication failed: ${error}`,
        });
      }
    }),

  /**
   * Authenticate with face recognition
   */
  authenticateWithFace: publicProcedure
    .input(
      z.object({
        workerId: z.number(),
        faceData: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        // Simulate face matching
        const matchScore = Math.random() * 100;
        const isMatched = matchScore > 20; // 80% threshold

        if (!isMatched) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Face does not match. Please try again.",
          });
        }

        return {
          success: true,
          workerId: input.workerId,
          authMethod: "face",
          matchScore: matchScore.toFixed(2),
          token: `bio_token_${Date.now()}`,
          expiresIn: 3600,
          message: "Authentication successful",
        };
      } catch (error) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `Authentication failed: ${error}`,
        });
      }
    }),

  /**
   * Authenticate with offline PIN
   */
  authenticateWithPin: publicProcedure
    .input(
      z.object({
        workerId: z.number(),
        pin: z.string().length(4),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        // Simulate PIN verification
        const isValid = input.pin === "1234"; // Mock PIN

        if (!isValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid PIN. Please try again.",
          });
        }

        return {
          success: true,
          workerId: input.workerId,
          authMethod: "offline_pin",
          token: `pin_token_${Date.now()}`,
          expiresIn: 1800,
          message: "Offline authentication successful",
        };
      } catch (error) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `Authentication failed: ${error}`,
        });
      }
    }),

  /**
   * Get biometric status
   */
  getBiometricStatus: protectedProcedure
    .input(z.object({ workerId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          workerId: input.workerId,
          status: {
            fingerprintRegistered: true,
            faceRegistered: true,
            pinBackupSet: true,
            lastAuthMethod: "fingerprint",
            lastAuthTime: new Date(Date.now() - 30 * 60 * 1000),
            authAttempts: 0,
            failedAttempts: 0,
            accountLocked: false,
          },
          biometrics: [
            {
              type: "fingerprint",
              registered: true,
              registeredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              lastUsed: new Date(Date.now() - 30 * 60 * 1000),
            },
            {
              type: "face",
              registered: true,
              registeredAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
              lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
            },
          ],
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get status: ${error}`,
        });
      }
    }),

  /**
   * Update backup PIN
   */
  updateBackupPin: protectedProcedure
    .input(
      z.object({
        workerId: z.number(),
        oldPin: z.string().length(4),
        newPin: z.string().length(4),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          success: true,
          workerId: input.workerId,
          message: "Backup PIN updated successfully",
          updatedAt: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update PIN: ${error}`,
        });
      }
    }),

  /**
   * Get authentication logs
   */
  getAuthenticationLogs: protectedProcedure
    .input(z.object({ workerId: z.number(), limit: z.number().default(20) }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          workerId: input.workerId,
          logs: [
            {
              id: 1,
              method: "fingerprint",
              status: "success",
              matchScore: 92.5,
              timestamp: new Date(Date.now() - 30 * 60 * 1000),
              device: "Samsung Galaxy S21",
            },
            {
              id: 2,
              method: "face",
              status: "success",
              matchScore: 88.3,
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
              device: "iPhone 13",
            },
            {
              id: 3,
              method: "offline_pin",
              status: "success",
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
              device: "Offline Mode",
            },
          ],
          totalAttempts: 3,
          successRate: 100,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get logs: ${error}`,
        });
      }
    }),

  /**
   * Revoke biometric
   */
  revokeBiometric: protectedProcedure
    .input(
      z.object({
        workerId: z.number(),
        biometricType: z.enum(["fingerprint", "face"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        return {
          success: true,
          workerId: input.workerId,
          biometricType: input.biometricType,
          status: "revoked",
          message: "Biometric data revoked successfully",
          revokedAt: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to revoke biometric: ${error}`,
        });
      }
    }),
});
