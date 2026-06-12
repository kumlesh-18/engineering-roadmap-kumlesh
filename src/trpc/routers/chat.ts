import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure, premiumProcedure } from '@/trpc/init';
import { prisma } from '@/db/client';
import { logger, auditLogger } from '@/lib/logger';
import { streamChat } from '@/services/ai/chat-service';
import { decrypt } from '@/lib/encryption';

const createSessionSchema = z.object({
  nodeId: z.string().cuid().optional(),
  title: z.string().max(255).optional(),
  modelProvider: z.enum(['openai', 'anthropic', 'google']).optional(),
  modelName: z.string().optional(),
  systemPrompt: z.string().max(10000).optional(),
});

const sendMessageSchema = z.object({
  sessionId: z.string().cuid(),
  content: z.string().min(1).max(10000),
  useRag: z.boolean().default(true),
});

export const chatRouter = router({
  createSession: premiumProcedure
    .input(createSessionSchema)
    .mutation(async ({ input, ctx }) => {
      let apiKey: string | undefined;
      let provider = input.modelProvider ?? 'openai';

      if (provider !== 'managed') {
        const userKey = await prisma.userApiKey.findUnique({
          where: { userId_provider: { userId: ctx.userId, provider } },
        });
        if (!userKey || !userKey.isActive) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: `No active ${provider} API key configured` });
        }
        apiKey = decrypt(userKey.encryptedKey);
      }

      const session = await prisma.chatSession.create({
        data: {
          userId: ctx.userId,
          nodeId: input.nodeId,
          title: input.title ?? 'New Chat',
          modelProvider: provider,
          modelName: input.modelName,
          systemPrompt: input.systemPrompt,
        },
      });

      auditLogger.info({ userId: ctx.userId, sessionId: session.id, provider }, 'Chat session created');
      return session;
    }),

  getSessions: protectedProcedure
    .input(z.object({ nodeId: z.string().cuid().optional(), limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ input, ctx }) => {
      return prisma.chatSession.findMany({
        where: { userId: ctx.userId, nodeId: input.nodeId },
        orderBy: { updatedAt: 'desc' },
        take: input.limit,
        include: {
          messages: { take: 1, orderBy: { createdAt: 'desc' }, select: { content: true, role: true, createdAt: true } },
        },
      });
    }),

  getSession: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      const session = await prisma.chatSession.findUnique({
        where: { id: input.id },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
      if (!session || session.userId !== ctx.userId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
      }
      return session;
    }),

  sendMessage: premiumProcedure
    .input(sendMessageSchema)
    .mutation(async ({ input, ctx }) => {
      const session = await prisma.chatSession.findUnique({
        where: { id: input.sessionId },
        include: { node: true },
      });
      if (!session || session.userId !== ctx.userId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
      }

      let apiKey: string | undefined;
      const provider = session.modelProvider ?? 'openai';

      if (provider !== 'managed') {
        const userKey = await prisma.userApiKey.findUnique({
          where: { userId_provider: { userId: ctx.userId, provider } },
        });
        if (!userKey || !userKey.isActive) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: `No active ${provider} API key configured` });
        }
        apiKey = decrypt(userKey.encryptedKey);
      }

      await prisma.message.create({
        data: { sessionId: input.sessionId, role: 'USER', content: input.content },
      });

      const { stream, messageId } = await streamChat({
        sessionId: input.sessionId,
        messages: [...(await prisma.message.findMany({ where: { sessionId: input.sessionId }, orderBy: { createdAt: 'asc' } })),
          { role: 'user', content: input.content }],
        systemPrompt: session.systemPrompt,
        modelProvider: provider,
        modelName: session.modelName,
        apiKey,
        nodeId: session.nodeId ?? undefined,
        useRag: input.useRag,
        userId: ctx.userId,
      });

      return { messageId, stream };
    }),

  deleteSession: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      const session = await prisma.chatSession.findUnique({ where: { id: input.id } });
      if (!session || session.userId !== ctx.userId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
      }
      await prisma.chatSession.delete({ where: { id: input.id } });
      return { success: true };
    }),

  updateSession: protectedProcedure
    .input(z.object({ id: z.string().cuid(), title: z.string().max(255).optional() }))
    .mutation(async ({ input, ctx }) => {
      const session = await prisma.chatSession.findUnique({ where: { id: input.id } });
      if (!session || session.userId !== ctx.userId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
      }
      return prisma.chatSession.update({ where: { id: input.id }, data: { title: input.title } });
    }),
});