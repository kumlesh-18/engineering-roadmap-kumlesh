import { streamText, CoreMessage, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { searchDocuments } from './rag-service';
import { prisma } from '@/db/client';
import { logger } from '@/lib/logger';

interface ChatOptions {
  sessionId: string;
  messages: CoreMessage[];
  systemPrompt?: string;
  modelProvider: 'openai' | 'anthropic' | 'google' | 'managed';
  modelName?: string;
  apiKey?: string;
  nodeId?: string;
  useRag: boolean;
  userId: string;
}

interface ModelConfig {
  provider: 'openai' | 'anthropic' | 'google';
  model: any;
}

function getModel(provider: 'openai' | 'anthropic' | 'google', modelName?: string, apiKey?: string): ModelConfig {
  const models: Record<string, ModelConfig> = {
    openai: { provider: 'openai', model: openai(modelName ?? 'gpt-4-turbo-preview', { apiKey }) },
    anthropic: { provider: 'anthropic', model: anthropic(modelName ?? 'claude-3-opus-20240229', { apiKey }) },
    google: { provider: 'google', model: google(modelName ?? 'gemini-1.5-pro', { apiKey }) },
  };
  return models[provider] ?? models.openai;
}

const SYSTEM_PROMPT_TEMPLATE = `You are an expert AI Engineering tutor. Your role is to guide learners through the AI Engineer Roadmap.

Guidelines:
- Be encouraging, clear, and concise
- Explain complex concepts with analogies and examples
- Ask probing questions to check understanding
- Provide practical exercises and code snippets
- Reference the roadmap context when relevant
- If you don't know something, admit it and offer to research
- Encourage hands-on learning and experimentation

Current context: {context}`;

export async function streamChat(options: ChatOptions): Promise<{ stream: ReadableStream; messageId: string }> {
  const { sessionId, messages, systemPrompt, modelProvider, modelName, apiKey, nodeId, useRag, userId } = options;

  let context = '';
  if (nodeId) {
    const node = await prisma.node.findUnique({
      where: { id: nodeId },
      select: { title: true, description: true, contentMdx: true, type: true, roadmapId: true },
    });
    if (node) {
      context = `Node: ${node.title} (${node.type})
Description: ${node.description ?? 'N/A'}
Content: ${node.contentMdx?.slice(0, 3000) ?? 'N/A'}`;
    }
  }

  let ragContext = '';
  if (useRag && messages.length > 0) {
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (lastUserMessage && typeof lastUserMessage.content === 'string') {
      const results = await searchDocuments({
        query: lastUserMessage.content,
        nodeId,
        limit: 3,
        threshold: 0.65,
        userId,
      });
      if (results.length > 0) {
        ragContext = '\n\nRelevant knowledge:\n' + results.map(r => `- ${r.content.slice(0, 500)}`).join('\n');
      }
    }
  }

  const fullSystemPrompt = (systemPrompt ?? SYSTEM_PROMPT_TEMPLATE)
    .replace('{context}', context + ragContext);

  const modelConfig = modelProvider === 'managed' 
    ? getModel('openai') 
    : getModel(modelProvider, modelName, apiKey);

  const result = await streamText({
    model: modelConfig.model,
    system: fullSystemPrompt,
    messages,
    temperature: 0.7,
    maxTokens: 4000,
    tools: {
      searchKnowledge: tool({
        description: 'Search the knowledge base for relevant information',
        parameters: z.object({
          query: z.string().describe('Search query'),
        }),
        execute: async ({ query }) => {
          const results = await searchDocuments({ query, nodeId, limit: 5, threshold: 0.6, userId });
          return results.map(r => ({ content: r.content, score: r.score }));
        },
      }),
    },
    onFinish: async ({ text, toolCalls, usage }) => {
      await prisma.message.create({
        data: {
          sessionId,
          role: 'ASSISTANT',
          content: text,
          toolCalls: toolCalls as any,
          metadata: { usage, model: modelName ?? modelProvider },
        },
      });
      logger.info({ sessionId, tokens: usage?.totalTokens }, 'Chat completed');
    },
  });

  return { stream: result.toAIStream(), messageId: '' };
}

import { z } from 'zod';