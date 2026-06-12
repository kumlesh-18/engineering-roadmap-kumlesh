import { router } from '@/trpc/init';
import { authRouter } from './auth';
import { roadmapRouter } from './roadmap';
import { nodeRouter } from './node';
import { progressRouter } from './progress';
import { quizRouter } from './quiz';
import { chatRouter } from './chat';
import { ragRouter } from './rag';
import { userRouter } from './user';

export const appRouter = router({
  auth: authRouter,
  roadmap: roadmapRouter,
  node: nodeRouter,
  progress: progressRouter,
  quiz: quizRouter,
  chat: chatRouter,
  rag: ragRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;