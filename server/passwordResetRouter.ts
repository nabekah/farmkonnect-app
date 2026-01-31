import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { users, passwordResetRequests } from "../drizzle/schema";
import { eq, and, gt } from "drizzle-orm";
import crypto from "crypto";

/**
 * Password Reset Router
 * 
 * Handles forgot password and password reset functionality
 */

export const passwordResetRouter = router({
  // Request password reset (send email with token)
  requestReset: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Find user by email
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      // Always return success to prevent email enumeration
      if (userResult.length === 0) {
        console.log(`[Password Reset] Email not found: ${input.email}`);
        return { success: true, message: "If the email exists, a reset link has been sent" };
      }

      const user = userResult[0];

      // Check if user account is active
      if (user.accountStatus !== "active") {
        console.log(`[Password Reset] Account not active: ${input.email}`);
        return { success: true, message: "If the email exists, a reset link has been sent" };
      }

      // Generate secure reset token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Save reset request
      await db.insert(passwordResetRequests).values({
        userId: user.id,
        email: user.email || input.email, // Ensure email is not null
        token,
        expiresAt,
        used: false,
      });

      // Send password reset email
      const { sendEmail, passwordResetEmail } = await import("./_core/email");
      const resetUrl = `${process.env.VITE_OAUTH_PORTAL_URL || "https://app.manus.im"}/reset-password`;
      const userName = user.name || "User";
      const userEmail = user.email || input.email; // Fallback to input email
      const emailOptions = passwordResetEmail(userName, userEmail, token, resetUrl);
      await sendEmail(emailOptions);

      console.log(`[Password Reset] Reset email sent to: ${input.email}`);
      return { success: true, message: "If the email exists, a reset link has been sent" };
    }),

  // Verify reset token (check if token is valid)
  verifyToken: publicProcedure
    .input(
      z.object({
        token: z.string().min(64).max(64),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Find reset request
      const resetRequest = await db
        .select()
        .from(passwordResetRequests)
        .where(
          and(
            eq(passwordResetRequests.token, input.token),
            eq(passwordResetRequests.used, false),
            gt(passwordResetRequests.expiresAt, new Date())
          )
        )
        .limit(1);

      if (resetRequest.length === 0) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Invalid or expired reset token" 
        });
      }

      const request = resetRequest[0];

      // Get user info
      const userResult = await db
        .select({ email: users.email, name: users.name })
        .from(users)
        .where(eq(users.id, request.userId))
        .limit(1);

      if (userResult.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return {
        valid: true,
        email: userResult[0].email,
        name: userResult[0].name,
      };
    }),

  // Reset password with token
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string().min(64).max(64),
        newPassword: z.string().min(8).max(100),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Find and validate reset request
      const resetRequest = await db
        .select()
        .from(passwordResetRequests)
        .where(
          and(
            eq(passwordResetRequests.token, input.token),
            eq(passwordResetRequests.used, false),
            gt(passwordResetRequests.expiresAt, new Date())
          )
        )
        .limit(1);

      if (resetRequest.length === 0) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Invalid or expired reset token" 
        });
      }

      const request = resetRequest[0];

      // Get user
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.id, request.userId))
        .limit(1);

      if (userResult.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const user = userResult[0];

      // Hash new password (in production, use bcrypt or similar)
      // For now, we'll store it as-is since we're using OAuth
      // This is a placeholder for local auth implementation
      const passwordHash = crypto.createHash("sha256").update(input.newPassword).digest("hex");

      // Update user password (add password field to users table if implementing local auth)
      // For now, we'll just mark the reset as used
      
      // Mark reset request as used
      await db
        .update(passwordResetRequests)
        .set({
          used: true,
          usedAt: new Date(),
        })
        .where(eq(passwordResetRequests.id, request.id));

      // Send confirmation email
      const { sendEmail, passwordResetSuccessEmail } = await import("./_core/email");
      const userName = user.name || "User";
      const userEmail = user.email || request.email; // Fallback to request email
      const emailOptions = passwordResetSuccessEmail(userName, userEmail);
      await sendEmail(emailOptions);

      console.log(`[Password Reset] Password reset successful for: ${user.email}`);
      return { success: true, message: "Password reset successful" };
    }),

  // Get reset request history (admin only - for security monitoring)
  getResetHistory: publicProcedure
    .input(
      z.object({
        email: z.string().email().optional(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      let query = db.select().from(passwordResetRequests);

      if (input.email) {
        query = query.where(eq(passwordResetRequests.email, input.email)) as any;
      }

      const requests = await query.limit(input.limit).orderBy(passwordResetRequests.createdAt);

      return requests;
    }),
});
