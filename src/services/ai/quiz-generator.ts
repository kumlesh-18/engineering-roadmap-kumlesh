import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const QuizQuestionSchema = z.object({
  id: z.string(),
  type: z.enum(['multiple_choice', 'true_false', 'short_answer', 'code_completion']),
  question: z.string(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]),
  explanation: z.string(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  tags: z.array(z.string()).default([]),
});

const QuizSchema = z.object({
  questions: z.array(QuizQuestionSchema).min(1),
  metadata: z.object({
    totalQuestions: z.number(),
    estimatedTimeMinutes: z.number(),
    topics: z.array(z.string()),
  }),
});

interface GenerateQuizOptions {
  nodeTitle: string;
  nodeDescription: string;
  nodeContent: string;
  count: number;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  provider?: 'openai' | 'anthropic' | 'google';
  apiKey?: string;
}

const SYSTEM_PROMPT = `You are an expert AI Engineering educator creating assessment quizzes.

Create {count} quiz questions for the topic: "{nodeTitle}"

Context:
- Description: {nodeDescription}
- Content: {nodeContent}
- Target difficulty: {difficulty}

Requirements:
1. Mix question types: multiple_choice, true_false, short_answer, code_completion
2. Questions should test understanding, not just memorization
3. Include practical scenarios and code examples where relevant
4. Each question must have a clear explanation of the correct answer
5. Tag questions with relevant topics
6. Ensure questions are appropriate for the difficulty level
7. Return valid JSON matching the schema exactly

Focus on AI Engineering concepts: LLMs, RAG, fine-tuning, embeddings, vector databases, prompt engineering, AI agents, MLOps, model evaluation, etc.`;

export async function generateQuiz(options: GenerateQuizOptions): Promise<z.infer<typeof QuizSchema>> {
  const { nodeTitle, nodeDescription, nodeContent, count, difficulty, provider = 'openai', apiKey } = options;

  const model = provider === 'anthropic' 
    ? anthropic('claude-3-opus-20240229', { apiKey })
    : provider === 'google'
    ? google('gemini-1.5-pro', { apiKey })
    : openai('gpt-4-turbo-preview', { apiKey });

  const prompt = SYSTEM_PROMPT
    .replace('{count}', count.toString())
    .replace('{nodeTitle}', nodeTitle)
    .replace('{nodeDescription}', nodeDescription || 'No description provided')
    .replace('{nodeContent}', nodeContent.slice(0, 8000) || 'No content provided')
    .replace('{difficulty}', difficulty);

  const result = await generateObject({
    model,
    schema: QuizSchema,
    prompt,
    temperature: 0.7,
  });

  logger.info({ nodeTitle, count: result.object.questions.length, difficulty }, 'Quiz generated');
  return result.object;
}

export async function generateQuizFromNode(
  nodeId: string,
  count: number = 5,
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
  provider?: 'openai' | 'anthropic' | 'google',
  apiKey?: string
) {
  const { prisma } = await import('@/db/client');
  const node = await prisma.node.findUnique({
    where: { id: nodeId },
    select: { title: true, description: true, contentMdx: true, difficulty: true },
  });

  if (!node) throw new Error('Node not found');

  return generateQuiz({
    nodeTitle: node.title,
    nodeDescription: node.description ?? '',
    nodeContent: node.contentMdx ?? '',
    count,
    difficulty: difficulty ?? (node.difficulty as any) ?? 'INTERMEDIATE',
    provider,
    apiKey,
  });
}