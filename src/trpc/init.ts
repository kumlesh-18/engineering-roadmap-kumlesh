import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/db/client';
import { logger } from '@/lib/logger';
import { Role } from '@prisma/client';

export interface Context {
  prisma: typeof prisma;
  session: Awaited<ReturnType<typeof getServerSession>> | null;
  userId: string | null;
  role: Role | null;
}

export async function createContext(): Promise<Context> {
  const session = await getServerSession(authOptions);
  return {
    prisma,
    session,
    userId: session?.user?.id ?? null,
    role: session?.user?.role ?? null,
  };
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const enforceAuth = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      userId: ctx.userId,
      role: ctx.role,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceAuth);

const enforceRole = (...roles: Role[]) =>
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.role || !roles.includes(ctx.role)) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Insufficient permissions' });
    }
    return next({ ctx });
  });

export const adminProcedure = protectedProcedure.use(enforceRole('ADMIN'));
export const authorProcedure = protectedProcedure.use(enforceRole('ADMIN', 'AUTHOR'));
export const premiumProcedure = protectedProcedure.use(enforceRole('ADMIN', 'AUTHOR', 'PREMIUM'));

export const loggingMiddleware = t.middleware(async ({ path, type, next, ctx }) => {
  const start = Date.now();
  const result = await next();
  const duration = Date.now() - start;
  
  logger.info({
    path,
    type,
    duration,
    userId: ctx.userId,
    role: ctx.role,
    ok: result.ok,
  }, 'tRPC request');
  
  return result;
});

export const procedure = t.procedure.use(loggingMiddleware);