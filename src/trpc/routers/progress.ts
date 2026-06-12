import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '@/trpc/init';
import { prisma } from '@/db/client';
import { logger, auditLogger } from '@/lib/logger';

const updateProgressSchema = z.object({
  nodeId: z.string().cuid(),
  status: z.enum(['LOCKED', 'AVAILABLE', 'IN_PROGRESS', 'COMPLETED', 'MASTERED']).optional(),
  score: z.number().int().min(0).max(100).optional(),
  timeSpentSeconds: z.number().int().min(0).optional(),
});

const bulkUpdateSchema = z.object({
  updates: z.array(
    z.object({
      nodeId: z.string().cuid(),
      status: z.enum(['LOCKED', 'AVAILABLE', 'IN_PROGRESS', 'COMPLETED', 'MASTERED']).optional(),
      score: z.number().int().min(0).max(100).optional(),
      timeSpentSeconds: z.number().int().min(0).optional(),
    })
  ).min(1).max(50),
});

export const progressRouter = router({
  getMyProgress: protectedProcedure
    .input(z.object({ roadmapId: z.string().cuid().optional() }))
    .query(async ({ input, ctx }) => {
      const where: { userId: string; node?: { roadmapId: string } } = { userId: ctx.userId };
      if (input.roadmapId) {
        where.node = { roadmapId: input.roadmapId };
      }
      return prisma.userProgress.findMany({
        where,
        include: { node: { select: { id: true, title: true, type: true, roadmapId: true, orderIndex: true } } },
        orderBy: { updatedAt: 'desc' },
      });
    }),

  getNodeProgress: protectedProcedure
    .input(z.object({ nodeId: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      const progress = await prisma.userProgress.findUnique({
        where: { userId_nodeId: { userId: ctx.userId, nodeId: input.nodeId } },
      });
      return progress ?? { status: 'LOCKED' as const, score: null, attempts: 0, timeSpentSeconds: 0 };
    }),

  updateProgress: protectedProcedure
    .input(updateProgressSchema)
    .mutation(async ({ input, ctx }) => {
      const node = await prisma.node.findUnique({ where: { id: input.nodeId } });
      if (!node) throw new TRPCError({ code: 'NOT_FOUND', message: 'Node not found' });

      const existing = await prisma.userProgress.findUnique({
        where: { userId_nodeId: { userId: ctx.userId, nodeId: input.nodeId } },
      });

      const data: {
        status?: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED' | 'MASTERED';
        score?: number;
        timeSpentSeconds?: number;
        startedAt?: Date;
        completedAt?: Date;
        attempts?: { increment: number };
      } = {};

      if (input.status) data.status = input.status;
      if (input.score !== undefined) data.score = input.score;
      if (input.timeSpentSeconds !== undefined) data.timeSpentSeconds = input.timeSpentSeconds;

      if (input.status === 'IN_PROGRESS' && (!existing || existing.status === 'LOCKED' || existing.status === 'AVAILABLE')) {
        data.startedAt = new Date();
        data.attempts = { increment: 1 };
      }
      if (input.status === 'COMPLETED' || input.status === 'MASTERED') {
        data.completedAt = new Date();
      }

      const progress = await prisma.userProgress.upsert({
        where: { userId_nodeId: { userId: ctx.userId, nodeId: input.nodeId } },
        create: {
          userId: ctx.userId,
          nodeId: input.nodeId,
          status: input.status ?? 'IN_PROGRESS',
          ...data,
        },
        update: data,
      });

      if (input.status === 'COMPLETED' || input.status === 'MASTERED') {
        await unlockDependentNodes(ctx.userId, input.nodeId);
      }

      auditLogger.info({ userId: ctx.userId, nodeId: input.nodeId, status: input.status }, 'Progress updated');
      return progress;
    }),

  bulkUpdate: protectedProcedure
    .input(bulkUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const results = await prisma.$transaction(
        input.updates.map((update) =>
          prisma.userProgress.upsert({
            where: { userId_nodeId: { userId: ctx.userId, nodeId: update.nodeId } },
            create: { userId: ctx.userId, nodeId: update.nodeId, status: update.status ?? 'IN_PROGRESS' },
            update: {
              status: update.status,
              score: update.score,
              timeSpentSeconds: update.timeSpentSeconds,
              completedAt: update.status === 'COMPLETED' || update.status === 'MASTERED' ? new Date() : undefined,
            },
          })
        )
      );
      return { updated: results.length };
    }),

  getRoadmapStats: protectedProcedure
    .input(z.object({ roadmapId: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      const [totalNodes, completedNodes, inProgressNodes, totalTime] = await Promise.all([
        prisma.node.count({ where: { roadmapId: input.roadmapId } }),
        prisma.userProgress.count({
          where: { userId: ctx.userId, node: { roadmapId: input.roadmapId }, status: { in: ['COMPLETED', 'MASTERED'] } },
        }),
        prisma.userProgress.count({
          where: { userId: ctx.userId, node: { roadmapId: input.roadmapId }, status: 'IN_PROGRESS' },
        }),
        prisma.userProgress.aggregate({
          where: { userId: ctx.userId, node: { roadmapId: input.roadmapId } },
          _sum: { timeSpentSeconds: true },
        }),
      ]);

      const progressPercent = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

      return {
        totalNodes,
        completedNodes,
        inProgressNodes,
        progressPercent,
        totalTimeSeconds: totalTime._sum.timeSpentSeconds ?? 0,
      };
    }),
});

async function unlockDependentNodes(userId: string, completedNodeId: string) {
  const edges = await prisma.edge.findMany({
    where: { sourceId: completedNodeId, type: 'PREREQUISITE' },
    select: { targetId: true },
  });

  for (const edge of edges) {
    const targetProgress = await prisma.userProgress.findUnique({
      where: { userId_nodeId: { userId, nodeId: edge.targetId } },
    });
    if (targetProgress && targetProgress.status === 'LOCKED') {
      await prisma.userProgress.update({
        where: { userId_nodeId: { userId, nodeId: edge.targetId } },
        data: { status: 'AVAILABLE' },
      });
    } else if (!targetProgress) {
      await prisma.userProgress.create({
        data: { userId, nodeId: edge.targetId, status: 'AVAILABLE' },
      });
    }
  }
}