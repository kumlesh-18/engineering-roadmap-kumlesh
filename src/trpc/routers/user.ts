import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure, adminProcedure } from '@/trpc/init';
import { prisma } from '@/db/client';
import { logger, auditLogger } from '@/lib/logger';

const updateUserSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(['ADMIN', 'AUTHOR', 'PREMIUM', 'USER', 'GUEST']).optional(),
  subscriptionTier: z.enum(['FREE', 'PRO', 'TEAM', 'ENTERPRISE']).optional(),
  subscriptionStatus: z.enum(['INACTIVE', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIALING']).optional(),
});

export const userRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        createdAt: true,
        _count: { select: { progress: true, chatSessions: true, quizAttempts: true } },
      },
    });
    if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    return user;
  }),

  updateSettings: protectedProcedure
    .input(z.object({ theme: z.enum(['light', 'dark', 'system']).optional() }))
    .mutation(async ({ ctx, input }) => {
      // Store in user metadata or separate settings table
      return { success: true };
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const [totalRoadmaps, totalProgress, completedNodes, totalQuizzes, totalChatSessions, totalTime] = await Promise.all([
      prisma.roadmap.count({ where: { createdById: ctx.userId } }),
      prisma.userProgress.count({ where: { userId: ctx.userId } }),
      prisma.userProgress.count({ where: { userId: ctx.userId, status: { in: ['COMPLETED', 'MASTERED'] } } }),
      prisma.quizAttempt.count({ where: { userId: ctx.userId } }),
      prisma.chatSession.count({ where: { userId: ctx.userId } }),
      prisma.userProgress.aggregate({ where: { userId: ctx.userId }, _sum: { timeSpentSeconds: true } }),
    ]);

    return {
      totalRoadmaps,
      totalProgress,
      completedNodes,
      totalQuizzes,
      totalChatSessions,
      totalTimeHours: Math.round((totalTime._sum.timeSpentSeconds ?? 0) / 3600 * 10) / 10,
    };
  }),

  exportData: protectedProcedure.mutation(async ({ ctx }) => {
    const [user, progress, quizAttempts, chatSessions, apiKeys] = await Promise.all([
      prisma.user.findUnique({ where: { id: ctx.userId }, select: { id: true, email: true, name: true, role: true, createdAt: true } }),
      prisma.userProgress.findMany({ where: { userId: ctx.userId }, include: { node: { select: { id: true, title: true, roadmapId: true } } } }),
      prisma.quizAttempt.findMany({ where: { userId: ctx.userId }, include: { node: { select: { id: true, title: true } } } }),
      prisma.chatSession.findMany({ where: { userId: ctx.userId }, include: { messages: true, node: { select: { id: true, title: true } } } }),
      prisma.userApiKey.findMany({ where: { userId: ctx.userId }, select: { provider: true, keyName: true, createdAt: true } }),
    ]);

    auditLogger.info({ userId: ctx.userId }, 'User data exported');
    return { user, progress, quizAttempts, chatSessions, apiKeys };
  }),

  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    await prisma.user.delete({ where: { id: ctx.userId } });
    auditLogger.info({ userId: ctx.userId }, 'Account deleted');
    return { success: true };
  }),

  // Admin only
  listUsers: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(50), cursor: z.string().optional() }))
    .query(async ({ input }) => {
      const users = await prisma.user.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          createdAt: true,
          _count: { select: { progress: true, chatSessions: true } },
        },
      });
      let nextCursor: string | undefined;
      if (users.length > input.limit) {
        const nextItem = users.pop();
        nextCursor = nextItem!.id;
      }
      return { items: users, nextCursor };
    }),

  updateUser: adminProcedure
    .input(updateUserSchema)
    .mutation(async ({ input, ctx }) => {
      const { userId, ...data } = input;
      const user = await prisma.user.update({ where: { id: userId }, data, select: { id: true, email: true, name: true, role: true, subscriptionTier: true } });
      auditLogger.info({ adminId: ctx.userId, targetUserId: userId, changes: data }, 'User updated by admin');
      return user;
    }),

  getUserDetails: adminProcedure
    .input(z.object({ userId: z.string().cuid() }))
    .query(async ({ input }) => {
      return prisma.user.findUnique({
        where: { id: input.userId },
        include: {
          progress: { include: { node: { select: { title: true, roadmapId: true } } } },
          quizAttempts: { include: { node: { select: { title: true } } } },
          chatSessions: { include: { messages: true } },
          apiKeys: true,
          createdRoadmaps: true,
        },
      });
    }),
});