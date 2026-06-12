import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/db/client';
import { logger } from '@/lib/logger';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const [deletedSessions, deletedMessages, deletedAttempts] = await Promise.all([
      prisma.session.deleteMany({
        where: { expires: { lt: new Date() } },
      }),
      prisma.message.deleteMany({
        where: { createdAt: { lt: ninetyDaysAgo } },
      }),
      prisma.quizAttempt.deleteMany({
        where: { createdAt: { lt: ninetyDaysAgo } },
      }),
    ]);

    logger.info({ deletedSessions, deletedMessages, deletedAttempts }, 'Cron cleanup completed');

    return NextResponse.json({
      success: true,
      deleted: {
        sessions: deletedSessions.count,
        messages: deletedMessages.count,
        quizAttempts: deletedAttempts.count,
      },
    });
  } catch (error) {
    logger.error({ error }, 'Cron cleanup failed');
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}