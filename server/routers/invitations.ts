import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../db";
import crypto from "crypto";

const generateInvitationCode = () => crypto.randomBytes(32).toString("hex");

export const invitationsRouter = router({
  // Create and send invitation
  sendInvitation: protectedProcedure
    .input(
      z.object({
        farmId: z.string(),
        invitedEmail: z.string().email(),
        role: z.enum(["manager", "worker", "viewer"])
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        // Verify user is owner of the farm
        const farmOwner = await db.query.raw(
          `SELECT id FROM farms WHERE id = ? AND ownerId = ?`,
          [parseInt(input.farmId), ctx.user.id]
        );

        if (!farmOwner || farmOwner.length === 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to invite workers to this farm"
          });
        }

        // Generate invitation code
        const invitationCode = generateInvitationCode();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        // Create invitation
        await db.query.raw(
          `INSERT INTO user_invitations (invitationCode, farmId, invitedEmail, role, invitedBy, expiresAt)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [invitationCode, parseInt(input.farmId), input.invitedEmail, input.role, ctx.user.id, expiresAt]
        );

        // Send email notification (using Manus notification system)
        const invitationLink = `${process.env.VITE_FRONTEND_URL}/accept-invitation/${invitationCode}`;
        
        // TODO: Send email via SENDGRID or Manus notification API
        console.log(`Invitation sent to ${input.invitedEmail} with code: ${invitationCode}`);

        return {
          success: true,
          message: `Invitation sent to ${input.invitedEmail}`,
          invitationCode
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error sending invitation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send invitation"
        });
      }
    }),

  // Get pending invitations for a farm
  getFarmInvitations: protectedProcedure
    .input(z.object({ farmId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        // Verify user is owner of the farm
        const farmOwner = await db.query.raw(
          `SELECT id FROM farms WHERE id = ? AND ownerId = ?`,
          [parseInt(input.farmId), ctx.user.id]
        );

        if (!farmOwner || farmOwner.length === 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to view invitations for this farm"
          });
        }

        const invitations = await db.query.raw(
          `SELECT id, invitedEmail, role, status, createdAt, expiresAt
           FROM user_invitations
           WHERE farmId = ? AND status IN ('pending', 'accepted')
           ORDER BY createdAt DESC`,
          [parseInt(input.farmId)]
        );

        return invitations || [];
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching invitations:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch invitations"
        });
      }
    }),

  // Accept invitation
  acceptInvitation: protectedProcedure
    .input(z.object({ invitationCode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        // Get invitation
        const invitation = await db.query.raw(
          `SELECT id, farmId, role, status, expiresAt FROM user_invitations
           WHERE invitationCode = ?`,
          [input.invitationCode]
        );

        if (!invitation || invitation.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Invitation not found"
          });
        }

        const inv = invitation[0];

        // Check if invitation is expired
        if (new Date(inv.expiresAt) < new Date()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invitation has expired"
          });
        }

        // Check if already accepted
        if (inv.status === "accepted") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invitation has already been accepted"
          });
        }

        // Assign worker to farm
        await db.query.raw(
          `INSERT INTO farm_workers (userId, farmId, role, status)
           VALUES (?, ?, ?, 'active')
           ON DUPLICATE KEY UPDATE role = VALUES(role), status = 'active'`,
          [ctx.user.id, inv.farmId, inv.role]
        );

        // Update invitation status
        await db.query.raw(
          `UPDATE user_invitations SET status = 'accepted', acceptedAt = NOW()
           WHERE invitationCode = ?`,
          [input.invitationCode]
        );

        return {
          success: true,
          message: "Invitation accepted successfully",
          farmId: inv.farmId,
          role: inv.role
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error accepting invitation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to accept invitation"
        });
      }
    }),

  // Revoke invitation
  revokeInvitation: protectedProcedure
    .input(z.object({ invitationCode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        // Get invitation
        const invitation = await db.query.raw(
          `SELECT farmId FROM user_invitations WHERE invitationCode = ?`,
          [input.invitationCode]
        );

        if (!invitation || invitation.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Invitation not found"
          });
        }

        // Verify user is owner of the farm
        const farmOwner = await db.query.raw(
          `SELECT id FROM farms WHERE id = ? AND ownerId = ?`,
          [invitation[0].farmId, ctx.user.id]
        );

        if (!farmOwner || farmOwner.length === 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to revoke this invitation"
          });
        }

        // Update invitation status
        await db.query.raw(
          `UPDATE user_invitations SET status = 'rejected'
           WHERE invitationCode = ?`,
          [input.invitationCode]
        );

        return {
          success: true,
          message: "Invitation revoked successfully"
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error revoking invitation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to revoke invitation"
        });
      }
    }),

  // Get user's pending invitations
  getMyInvitations: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const invitations = await db.query.raw(
        `SELECT ui.id, ui.invitationCode, ui.farmId, f.farmName, ui.role, ui.status, ui.createdAt, ui.expiresAt
         FROM user_invitations ui
         JOIN farms f ON ui.farmId = f.id
         WHERE ui.invitedEmail = ? AND ui.status = 'pending' AND ui.expiresAt > NOW()
         ORDER BY ui.createdAt DESC`,
        [ctx.user.email || ctx.user.id]
      );

      return invitations || [];
    } catch (error) {
      console.error("Error fetching my invitations:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch invitations"
      });
    }
  })
});
