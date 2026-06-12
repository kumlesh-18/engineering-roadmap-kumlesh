import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '@/trpc/init';
import { prisma } from '@/db/client';
import { encrypt, generateApiKey } from '@/lib/encryption';
import { logger, auditLogger } from '@/lib/logger';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(100).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const apiKeySchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'google']),
  key: z.string().min(1),
  keyName: z.string().max(100).optional(),
});

export const authRouter = router({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input }) => {
      const existing = await prisma.user.findUnique({ where: { email: input.email } });
      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Email already registered' });
      }

      const passwordHash = await bcrypt.hash(input.password, 12);
      const user = await prisma.user.create({
        data: {
          email: input.email,
          passwordHash,
          name: input.name,
          role: 'USER',
        },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      });

      auditLogger.info({ userId: user.id, email: user.email }, 'User registered');
      return user;
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
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
        apiKeys: { select: { id: true, provider: true, keyName: true, isActive: true, createdAt: true } },
      },
    });
    if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    return user;
  }),

  updateProfile: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(100).optional(), image: z.string().url().optional() }))
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.update({
        where: { id: ctx.userId },
        data: input,
        select: { id: true, email: true, name: true, image: true, role: true },
      });
      return user;
    }),

  addApiKey: protectedProcedure
    .input(apiKeySchema)
    .mutation(async ({ ctx, input }) => {
      const encryptedKey = encrypt(input.key);
      const keyName = input.keyName ?? `${input.provider} key`;
      
      const apiKey = await prisma.userApiKey.upsert({
        where: { userId_provider: { userId: ctx.userId, provider: input.provider } },
        create: {
          userId: ctx.userId,
          provider: input.provider,
          encryptedKey,
          keyName,
        },
        update: {
          encryptedKey,
          keyName,
          isActive: true,
        },
        select: { id: true, provider: true, keyName: true, isActive: true, createdAt: true },
      });

      auditLogger.info({ userId: ctx.userId, provider: input.provider }, 'API key added');
      return apiKey;
    }),

  removeApiKey: protectedProcedure
    .input(z.object({ provider: z.enum(['openai', 'anthropic', 'google']) }))
    .mutation(async ({ ctx, input }) => {
      await prisma.userApiKey.delete({
        where: { userId_provider: { userId: ctx.userId, provider: input.provider } },
      });
      auditLogger.info({ userId: ctx.userId, provider: input.provider }, 'API key removed');
      return { success: true };
    }),

  listApiKeys: protectedProcedure.query(async ({ ctx }) => {
    return prisma.userApiKey.findMany({
      where: { userId: ctx.userId },
      select: { id: true, provider: true, keyName: true, isActive: true, createdAt: true },
    });
  }),

  generateApiKey: protectedProcedure
    .input(z.object({ provider: z.enum(['openai', 'anthropic', 'google']) }))
    .mutation(async ({ ctx, input }) => {
      const newKey = generateApiKey(input.provider);
      const encryptedKey = encrypt(newKey);
      
      await prisma.userApiKey.upsert({
        where: { userId_provider: { userId: ctx.userId, provider: input.provider } },
        create: { userId: ctx.userId, provider: input.provider, encryptedKey, keyName: 'Generated key' },
        update: { encryptedKey, keyName: 'Generated key', isActive: true },
      });

      auditLogger.info({ userId: ctx.userId, provider: input.provider }, 'API key generated');
      return { key: newKey };
    }),
});