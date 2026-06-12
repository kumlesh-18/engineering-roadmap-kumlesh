import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure, premiumProcedure } from '@/trpc/init';
import { prisma } from '@/db/client';
import { logger, auditLogger } from '@/lib/logger';
import { generateQuiz } from '@/services/ai/quiz-generator';

const submitQuizSchema = z.object({
  nodeId: z.string().cuid(),
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  timeSeconds: z.number().int().positive().optional(),
});

const generateQuizSchema = z.object({
  nodeId: z.string().cuid(),
  count: z.number().int().min(1).max(20).default(5),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
});

export const quizRouter = router({
  generate: premiumProcedure
    .input(generateQuizSchema)
    .mutation(async ({ input, ctx }) => {
      const node = await prisma.node.findUnique({
        where: { id: input.nodeId },
        include: { roadmap: true },
      });
      if (!node) throw new TRPCError({ code: 'NOT_FOUND', message: 'Node not found' });
      if (!node.roadmap.isPublished) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Roadmap not published' });
      }

      const quiz = await generateQuiz({
        nodeTitle: node.title,
        nodeDescription: node.description ?? '',
        nodeContent: node.contentMdx ?? '',
        count: input.count,
        difficulty: input.difficulty ?? node.difficulty ?? 'INTERMEDIATE',
      });

      auditLogger.info({ userId: ctx.userId, nodeId: input.nodeId, questionCount: quiz.questions.length }, 'Quiz generated');
      return quiz;
    }),

  submit: protectedProcedure
    .input(submitQuizSchema)
    .mutation(async ({ input, ctx }) => {
      const node = await prisma.node.findUnique({
        where: { id: input.nodeId },
        include: { roadmap: true },
      });
      if (!node) throw new TRPCError({ code: 'NOT_FOUND', message: 'Node not found' });

      const correctAnswers = await getCorrectAnswers(input.nodeId);
      const { score, passed, results } = gradeQuiz(input.answers, correctAnswers);

      const attempt = await prisma.quizAttempt.create({
        data: {
          userId: ctx.userId,
          nodeId: input.nodeId,
          answers: input.answers as any,
          score,
          passed,
          timeSeconds: input.timeSeconds,
        },
      });

      if (passed) {
        await prisma.userProgress.upsert({
          where: { userId_nodeId: { userId: ctx.userId, nodeId: input.nodeId } },
          create: {
            userId: ctx.userId,
            nodeId: input.nodeId,
            status: 'COMPLETED',
            score,
            completedAt: new Date(),
            attempts: { increment: 1 },
          },
          update: {
            status: 'COMPLETED',
            score,
            completedAt: new Date(),
            attempts: { increment: 1 },
          },
        });
      } else {
        await prisma.userProgress.upsert({
          where: { userId_nodeId: { userId: ctx.userId, nodeId: input.nodeId } },
          create: { userId: ctx.userId, nodeId: input.nodeId, status: 'IN_PROGRESS', attempts: { increment: 1 } },
          update: { attempts: { increment: 1 } },
        });
      }

      auditLogger.info({ userId: ctx.userId, nodeId: input.nodeId, score, passed }, 'Quiz submitted');
      return { attemptId: attempt.id, score, passed, results };
    }),

  getAttempts: protectedProcedure
    .input(z.object({ nodeId: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      return prisma.quizAttempt.findMany({
        where: { userId: ctx.userId, nodeId: input.nodeId },
        orderBy: { createdAt: 'desc' },
      });
    }),

  getBestAttempt: protectedProcedure
    .input(z.object({ nodeId: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      return prisma.quizAttempt.findFirst({
        where: { userId: ctx.userId, nodeId: input.nodeId },
        orderBy: { score: 'desc' },
      });
    }),
});

async function getCorrectAnswers(nodeId: string): Promise<Record<string, string | string[]>> {
  const node = await prisma.node.findUnique({
    where: { id: nodeId },
    select: { metadata: true },
  });
  return (node?.metadata?.quizAnswers as Record<string, string | string[]>) ?? {};
}

function gradeQuiz(
  userAnswers: Record<string, string | string[]>,
  correctAnswers: Record<string, string | string[]>
): { score: number; passed: boolean; results: Record<string, { correct: boolean; expected: string | string[]; given: string | string[] }> } {
  const questionIds = Object.keys(correctAnswers);
  let correct = 0;
  const results: Record<string, { correct: boolean; expected: string | string[]; given: string | string[] }> = {};

  for (const qId of questionIds) {
    const expected = correctAnswers[qId];
    const given = userAnswers[qId];
    const isCorrect = JSON.stringify(expected) === JSON.stringify(given);
    if (isCorrect) correct++;
    results[qId] = { correct: isCorrect, expected, given: given ?? '' };
  }

  const score = questionIds.length > 0 ? Math.round((correct / questionIds.length) * 100) : 0;
  const passed = score >= 70;

  return { score, passed, results };
}