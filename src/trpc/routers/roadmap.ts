import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure, authorProcedure } from '@/trpc/init';
import { prisma } from '@/db/client';
import { logger, auditLogger } from '@/lib/logger';

const createRoadmapSchema = z.object({
  slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
});

const updateRoadmapSchema = createRoadmapSchema.partial().extend({
  id: z.string().cuid(),
});

const publishSchema = z.object({
  id: z.string().cuid(),
  isPublished: z.boolean(),
});

export const roadmapRouter = router({
  list: publicProcedure
    .input(
      z.object({
        publishedOnly: z.boolean().default(true),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const where = input.publishedOnly ? { isPublished: true } : {};
      const items = await prisma.roadmap.findMany({
        where,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { updatedAt: 'desc' },
        include: {
          createdBy: { select: { id: true, name: true, image: true } },
          _count: { select: { nodes: true } },
        },
      });
      let nextCursor: string | undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }
      return { items, nextCursor };
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const roadmap = await prisma.roadmap.findUnique({
        where: { slug: input.slug },
        include: {
          createdBy: { select: { id: true, name: true, image: true } },
          nodes: {
            orderBy: { orderIndex: 'asc' },
            include: {
              _count: { select: { children: true, sourceEdges: true, targetEdges: true } },
            },
          },
          edges: true,
        },
      });
      if (!roadmap) throw new TRPCError({ code: 'NOT_FOUND', message: 'Roadmap not found' });
      if (!roadmap.isPublished) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Roadmap is not published' });
      }
      return roadmap;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      const roadmap = await prisma.roadmap.findUnique({
        where: { id: input.id },
        include: {
          createdBy: { select: { id: true, name: true, image: true } },
          nodes: {
            orderBy: { orderIndex: 'asc' },
            include: {
              _count: { select: { children: true, sourceEdges: true, targetEdges: true } },
            },
          },
          edges: true,
        },
      });
      if (!roadmap) throw new TRPCError({ code: 'NOT_FOUND', message: 'Roadmap not found' });
      if (!roadmap.isPublished && roadmap.createdById !== ctx.userId && ctx.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' });
      }
      return roadmap;
    }),

  create: authorProcedure
    .input(createRoadmapSchema)
    .mutation(async ({ input, ctx }) => {
      const existing = await prisma.roadmap.findUnique({ where: { slug: input.slug } });
      if (existing) throw new TRPCError({ code: 'CONFLICT', message: 'Slug already exists' });

      const roadmap = await prisma.roadmap.create({
        data: { ...input, createdById: ctx.userId },
      });
      auditLogger.info({ userId: ctx.userId, roadmapId: roadmap.id }, 'Roadmap created');
      return roadmap;
    }),

  update: authorProcedure
    .input(updateRoadmapSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const roadmap = await prisma.roadmap.findUnique({ where: { id } });
      if (!roadmap) throw new TRPCError({ code: 'NOT_FOUND', message: 'Roadmap not found' });
      if (roadmap.createdById !== ctx.userId && ctx.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' });
      }
      if (data.slug && data.slug !== roadmap.slug) {
        const existing = await prisma.roadmap.findUnique({ where: { slug: data.slug } });
        if (existing) throw new TRPCError({ code: 'CONFLICT', message: 'Slug already exists' });
      }
      const updated = await prisma.roadmap.update({ where: { id }, data });
      auditLogger.info({ userId: ctx.userId, roadmapId: id }, 'Roadmap updated');
      return updated;
    }),

  publish: authorProcedure
    .input(publishSchema)
    .mutation(async ({ input, ctx }) => {
      const roadmap = await prisma.roadmap.findUnique({ where: { id: input.id } });
      if (!roadmap) throw new TRPCError({ code: 'NOT_FOUND', message: 'Roadmap not found' });
      if (roadmap.createdById !== ctx.userId && ctx.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' });
      }
      const updated = await prisma.roadmap.update({
        where: { id: input.id },
        data: { isPublished: input.isPublished, version: { increment: 1 } },
      });
      auditLogger.info({ userId: ctx.userId, roadmapId: input.id, published: input.isPublished }, 'Roadmap publish toggled');
      return updated;
    }),

  delete: authorProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      const roadmap = await prisma.roadmap.findUnique({ where: { id: input.id } });
      if (!roadmap) throw new TRPCError({ code: 'NOT_FOUND', message: 'Roadmap not found' });
      if (roadmap.createdById !== ctx.userId && ctx.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' });
      }
      await prisma.roadmap.delete({ where: { id: input.id } });
      auditLogger.info({ userId: ctx.userId, roadmapId: input.id }, 'Roadmap deleted');
      return { success: true };
    }),

  getMyRoadmaps: protectedProcedure.query(async ({ ctx }) => {
    return prisma.roadmap.findMany({
      where: { createdById: ctx.userId },
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { nodes: true } } },
    });
  }),
});