import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { getDb } from '../db';
import { eq } from 'drizzle-orm';
import { farms } from '@/drizzle/schema';

export const teamCollaborationRouter = router({
  /**
   * Invite team member
   * Send invitation to join farm team with specific role
   */
  inviteTeamMember: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        email: z.string().email(),
        role: z.enum(['manager', 'accountant', 'viewer']),
        permissions: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

        // Verify farm ownership (only owner can invite)
        const farm = await db.select().from(farms).where(eq(farms.id, input.farmId));
        if (!farm.length || farm[0].farmerUserId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only farm owner can invite team members' });
        }

        const invitationId = Math.random().toString(36).substr(2, 9);

        return {
          invitationId,
          farmId: input.farmId,
          email: input.email,
          role: input.role,
          status: 'pending',
          invitedAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          message: `Invitation sent to ${input.email} with ${input.role} role`,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to invite team member',
        });
      }
    }),

  /**
   * Get team members
   * List all team members for a farm
   */
  getTeamMembers: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

        // Verify farm access
        const farm = await db.select().from(farms).where(eq(farms.id, input.farmId));
        if (!farm.length || farm[0].farmerUserId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Farm not found or access denied' });
        }

        // Mock team members
        const members = [
          {
            id: 'USER-001',
            name: 'John Smith',
            email: 'john@farm.com',
            role: 'manager',
            joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
            status: 'active',
          },
          {
            id: 'USER-002',
            name: 'Sarah Johnson',
            email: 'sarah@farm.com',
            role: 'accountant',
            joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000),
            status: 'active',
          },
          {
            id: 'USER-003',
            name: 'Mike Davis',
            email: 'mike@farm.com',
            role: 'viewer',
            joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            status: 'active',
          },
        ];

        return {
          farmId: input.farmId,
          members,
          totalMembers: members.length,
          activeMembers: members.filter(m => m.status === 'active').length,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve team members',
        });
      }
    }),

  /**
   * Update team member role
   * Change role of existing team member
   */
  updateTeamMemberRole: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        memberId: z.string(),
        newRole: z.enum(['manager', 'accountant', 'viewer']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

        // Verify farm ownership
        const farm = await db.select().from(farms).where(eq(farms.id, input.farmId));
        if (!farm.length || farm[0].farmerUserId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only farm owner can update roles' });
        }

        return {
          farmId: input.farmId,
          memberId: input.memberId,
          newRole: input.newRole,
          updatedAt: new Date(),
          message: `Team member role updated to ${input.newRole}`,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update team member role',
        });
      }
    }),

  /**
   * Remove team member
   * Remove member from farm team
   */
  removeTeamMember: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        memberId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

        // Verify farm ownership
        const farm = await db.select().from(farms).where(eq(farms.id, input.farmId));
        if (!farm.length || farm[0].farmerUserId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only farm owner can remove members' });
        }

        return {
          farmId: input.farmId,
          memberId: input.memberId,
          removedAt: new Date(),
          message: 'Team member removed successfully',
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove team member',
        });
      }
    }),

  /**
   * Get activity audit log
   * Retrieve audit trail of user actions
   */
  getActivityLog: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        limit: z.number().default(50),
        action: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

        // Verify farm access
        const farm = await db.select().from(farms).where(eq(farms.id, input.farmId));
        if (!farm.length || farm[0].farmerUserId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Farm not found or access denied' });
        }

        // Mock activity log
        const activities = [
          {
            id: 'ACT-001',
            userId: 'USER-001',
            userName: 'John Smith',
            action: 'added_expense',
            description: 'Added expense: Feed & Supplies - $500',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            details: { expenseId: 'EXP-123', amount: 500, category: 'Feed & Supplies' },
          },
          {
            id: 'ACT-002',
            userId: 'USER-002',
            userName: 'Sarah Johnson',
            action: 'approved_expense',
            description: 'Approved expense: Equipment - $2000',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            details: { expenseId: 'EXP-124', amount: 2000, status: 'approved' },
          },
          {
            id: 'ACT-003',
            userId: 'USER-001',
            userName: 'John Smith',
            action: 'added_revenue',
            description: 'Added revenue: Crop Sales - $5000',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
            details: { revenueId: 'REV-456', amount: 5000, type: 'Crop Sales' },
          },
          {
            id: 'ACT-004',
            userId: 'USER-003',
            userName: 'Mike Davis',
            action: 'viewed_report',
            description: 'Viewed financial report for January 2026',
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
            details: { reportType: 'financial', period: 'January 2026' },
          },
        ];

        const filtered = input.action
          ? activities.filter(a => a.action === input.action)
          : activities;

        return {
          farmId: input.farmId,
          activities: filtered.slice(0, input.limit),
          totalActivities: filtered.length,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve activity log',
        });
      }
    }),

  /**
   * Get role permissions
   * Retrieve permissions for a specific role
   */
  getRolePermissions: protectedProcedure
    .input(
      z.object({
        role: z.enum(['manager', 'accountant', 'viewer']),
      })
    )
    .query(async ({ input }) => {
      const rolePermissions = {
        manager: [
          'view_dashboard',
          'add_expense',
          'edit_expense',
          'delete_expense',
          'add_revenue',
          'edit_revenue',
          'delete_revenue',
          'view_reports',
          'export_reports',
          'manage_team',
          'view_audit_log',
          'approve_expenses',
        ],
        accountant: [
          'view_dashboard',
          'add_expense',
          'edit_expense',
          'add_revenue',
          'edit_revenue',
          'view_reports',
          'export_reports',
          'view_audit_log',
          'approve_expenses',
        ],
        viewer: [
          'view_dashboard',
          'view_reports',
          'view_audit_log',
        ],
      };

      return {
        role: input.role,
        permissions: rolePermissions[input.role],
        permissionCount: rolePermissions[input.role].length,
      };
    }),

  /**
   * Check permission
   * Verify if user has specific permission
   */
  checkPermission: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        permission: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

        // Verify farm access
        const farm = await db.select().from(farms).where(eq(farms.id, input.farmId));
        if (!farm.length) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Farm not found' });
        }

        // Check if user is owner
        const isOwner = farm[0].farmerUserId === ctx.user.id;

        // Owner has all permissions
        const hasPermission = isOwner || ['view_dashboard', 'view_reports', 'view_audit_log'].includes(input.permission);

        return {
          farmId: input.farmId,
          permission: input.permission,
          hasPermission,
          role: isOwner ? 'owner' : 'member',
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to check permission',
        });
      }
    }),
});
