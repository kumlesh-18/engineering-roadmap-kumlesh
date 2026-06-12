import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure, premiumProcedure, authorProcedure } from '@/trpc/init';
import { prisma } from '@/db/client';
import { logger, auditLogger } from '@/lib/logger';
import { searchDocuments, ingestDocument, deleteDocument } from '@/services/ai/rag-service';

const searchSchema = z.object({
  query: z.string().min(1).max(500),
  roadmapId: z.string().cuid().optional(),
  nodeId: z.string().cuid().optional(),
  limit: z.number().int().min(1).max(20).default(5),
  threshold: z.number().min(0).max(1).default(0.7),
});

const ingestSchema = z.object({
  roadmapId: z.string().cuid(),
  nodeId: z.string().cuid().optional(),
  title: z.string().max(255),
  content: z.string().min(1).max(50000),
  metadata: z.record(z.unknown()).optional(),
});

export const ragRouter = router({
  search: premiumProcedure
    .input(searchSchema)
    .query(async ({ input, ctx }) => {
      const results = await searchDocuments({
        query: input.query,
        roadmapId: input.roadmapId,
        nodeId: input.nodeId,
        limit: input.limit,
        threshold: input.threshold,
        userId: ctx.userId,
      });
      return results;
    }),

  ingest: authorProcedure
    .input(ingestSchema)
    .mutation(async ({ input, ctx }) => {
      const roadmap = await prisma.roadmap.findUnique({ where: { id: input.roadmapId } });
      if (!roadmap) throw new TRPCError({ code: 'NOT_FOUND', message: 'Roadmap not found' });
      if (roadmap.createdById !== ctx.userId && ctx.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' });
      }

      const document = await ingestDocument({
        roadmapId: input.roadmapId,
        nodeId: input.nodeId,
        title: input.title,
        content: input.content,
        metadata: input.metadata,
      });

      auditLogger.info({ userId: ctx.userId, documentId: document.id, roadmapId: input.roadmapId }, 'Document ingested');
      return document;
    }),

  delete: authorProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      const document = await prisma.document.findUnique({ where: { id: input.id }, include: { roadmap: true } });
      if (!document) throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' });
      if (document.roadmap.createdById !== ctx.userId && ctx.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' });
      }

      await deleteDocument(input.id);
      auditLogger.info({ userId: ctx.userId, documentId: input.id }, 'Document deleted');
      return { success: true };
    }),

  list: protectedProcedure
    .input(z.object({ roadmapId: z.string().cuid().optional(), nodeId: z.string().cuid().optional() }))
    .query(async ({ input }) => {
      return prisma.document.findMany({
        where: { roadmapId: input.roadmapId, nodeId: input.nodeId },
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, roadmapId: true, nodeId: true, createdAt: true, metadata: true },
      });
    }),

  reindexRoadmap: authorProcedure
    .input(z.object({ roadmapId: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      const roadmap = await prisma.roadmap.findUnique({ where: { id: input.roadmapId } });
      if (!roadmap) throw new TRPCError({ code: 'NOT_FOUND', message: 'Roadmap not found' });
      if (roadmap.createdById !== ctx.userId && ctx.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' });
      }

      const nodes = await prisma.node.findMany({
        where: { roadmapId: input.roadmapId },
        select: { id: true, title: true, contentMdx: true, description: true },
      });

      let count = 0;
      for (const node of nodes) {
        if (node.contentMdx) {
          await ingestDocument({
            roadmapId: input.roadmapId,
            nodeId: node.id,
            title: node.title,
            content: node.contentMdx,
            metadata: { type: 'node_content', nodeType: 'auto' },
          });
          count++;
        }
      }

      auditLogger.info({ userId: ctx.userId, roadmapId: input.roadmapId, documentsIndexed: count }, 'Roadmap reindexed');
      return { indexed: count };
    }),
});