import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure, authorProcedure } from '@/trpc/init';
import { prisma } from '@/db/client';
import { logger, auditLogger } from '@/lib/logger';

const createNodeSchema = z.object({
  roadmapId: z.string().cuid(),
  parentId: z.string().cuid().optional(),
  type: z.enum(['TOPIC', 'CONCEPT', 'PROJECT', 'QUIZ', 'RESOURCE', 'MILESTONE']),
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  contentMdx: z.string().optional(),
  positionX: z.number().default(0),
  positionY: z.number().default(0),
  orderIndex: z.number().int().default(0),
  estimatedHours: z.number().positive().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  prerequisites: z.array(z.string().cuid()).default([]),
  metadata: z.record(z.unknown()).optional(),
});

const updateNodeSchema = createNodeSchema.partial().extend({
  id: z.string().cuid(),
});

const reorderSchema = z.object({
  roadmapId: z.string().cuid(),
  nodes: z.array(z.object({ id: z.string().cuid(), orderIndex: z.number().int() })),
});

export const nodeRouter = router({
  getByRoadmap: publicProcedure
    .input(z.object({ roadmapId: z.string().cuid() }))
    .query(async ({ input }) => {
      return prisma.node.findMany({
        where: { roadmapId: input.roadmapId },
        orderBy: { orderIndex: 'asc' },
        include: {
          children: { orderBy: { orderIndex: 'asc' } },
          sourceEdges: { include: { target: true } },
          targetEdges: { include: { source: true } },
        },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input }) => {
      const node = await prisma.node.findUnique({
        where: { id: input.id },
        include: {
          roadmap: { select: { id: true, slug: true, title: true, isPublished: true } },
          children: { orderBy: { orderIndex: 'asc' } },
          sourceEdges: { include: { target: { select: { id: true, title: true, type: true } } } },
          targetEdges: { include: { source: { select: { id: true, title: true, type: true } } } },
        },
      });
      if (!node) throw new TRPCError({ code: 'NOT_FOUND', message: 'Node not found' });
      if (!node.roadmap.isPublished) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Roadmap not published' });
      }
      return node;
    }),

  create: authorProcedure
    .input(createNodeSchema)
    .mutation(async ({ input, ctx }) => {
      const roadmap = await prisma.roadmap.findUnique({ where: { id: input.roadmapId } });
      if (!roadmap) throw new TRPCError({ code: 'NOT_FOUND', message: 'Roadmap not found' });
      if (roadmap.createdById !== ctx.userId && ctx.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' });
      }

      const maxOrder = await prisma.node.aggregate({
        where: { roadmapId: input.roadmapId },
        _max: { orderIndex: true },
      });

      const node = await prisma.node.create({
        data: {
          ...input,
          orderIndex: input.orderIndex ?? (maxOrder._max.orderIndex ?? 0) + 1,
        },
      });
      auditLogger.info({ userId: ctx.userId, nodeId: node.id, roadmapId: input.roadmapId }, 'Node created');
      return node;
    }),

  update: authorProcedure
    .input(updateNodeSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const node = await prisma.node.findUnique({
        where: { id },
        include: { roadmap: true },
      });
      if (!node) throw new TRPCError({ code: 'NOT_FOUND', message: 'Node not found' });
      if (node.roadmap.createdById !== ctx.userId && ctx.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' });
      }
      const updated = await prisma.node.update({ where: { id }, data });
      auditLogger.info({ userId: ctx.userId, nodeId: id }, 'Node updated');
      return updated;
    }),

  reorder: authorProcedure
    .input(reorderSchema)
    .mutation(async ({ input, ctx }) => {
      const roadmap = await prisma.roadmap.findUnique({ where: { id: input.roadmapId } });
      if (!roadmap) throw new TRPCError({ code: 'NOT_FOUND', message: 'Roadmap not found' });
      if (roadmap.createdById !== ctx.userId && ctx.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' });
      }

      await prisma.$transaction(
        input.nodes.map(({ id, orderIndex }) =>
          prisma.node.update({ where: { id }, data: { orderIndex } })
        )
      );
      auditLogger.info({ userId: ctx.userId, roadmapId: input.roadmapId }, 'Nodes reordered');
      return { success: true };
    }),

  delete: authorProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      const node = await prisma.node.findUnique({
        where: { id: input.id },
        include: { roadmap: true },
      });
      if (!node) throw new TRPCError({ code: 'NOT_FOUND', message: 'Node not found' });
      if (node.roadmap.createdById !== ctx.userId && ctx.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' });
      }
      await prisma.node.delete({ where: { id: input.id } });
      auditLogger.info({ userId: ctx.userId, nodeId: input.id }, 'Node deleted');
      return { success: true };
    }),

  getGraphData: publicProcedure
    .input(z.object({ roadmapId: z.string().cuid() }))
    .query(async ({ input }) => {
      const [nodes, edges] = await Promise.all([
        prisma.node.findMany({
          where: { roadmapId: input.roadmapId },
          select: {
            id: true,
            title: true,
            type: true,
            positionX: true,
            positionY: true,
            difficulty: true,
            estimatedHours: true,
            orderIndex: true,
          },
        }),
        prisma.edge.findMany({
          where: { roadmapId: input.roadmapId },
          select: { id: true, sourceId: true, targetId: true, type: true, label: true },
        }),
      ]);
      return { nodes, edges };
    }),
});