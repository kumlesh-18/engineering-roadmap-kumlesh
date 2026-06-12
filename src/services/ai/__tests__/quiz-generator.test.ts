import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateQuiz } from '@/services/ai/quiz-generator';

vi.mock('ai', () => ({
  generateObject: vi.fn(),
}));

vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn(() => ({})),
}));

vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: vi.fn(() => ({})),
}));

vi.mock('@ai-sdk/google', () => ({
  google: vi.fn(() => ({})),
}));

import { generateObject } from 'ai';

describe('Quiz Generator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate quiz with correct structure', async () => {
    const mockQuiz = {
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: 'What is a transformer?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 'A',
          explanation: 'Transformers use attention mechanism',
          difficulty: 'BEGINNER',
          tags: ['transformers', 'architecture'],
        },
      ],
      metadata: {
        totalQuestions: 1,
        estimatedTimeMinutes: 5,
        topics: ['transformers'],
      },
    };

    (generateObject as any).mockResolvedValue({ object: mockQuiz });

    const result = await generateQuiz({
      nodeTitle: 'Transformers',
      nodeDescription: 'Attention is all you need',
      nodeContent: 'Transformer architecture details...',
      count: 1,
      difficulty: 'BEGINNER',
    });

    expect(result).toEqual(mockQuiz);
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].type).toBe('multiple_choice');
  });

  it('should handle different difficulty levels', async () => {
    (generateObject as any).mockResolvedValue({
      object: {
        questions: [{ id: 'q1', type: 'multiple_choice', question: 'Test', options: [], correctAnswer: 'A', explanation: '', difficulty: 'ADVANCED', tags: [] }],
        metadata: { totalQuestions: 1, estimatedTimeMinutes: 5, topics: [] },
      },
    });

    const result = await generateQuiz({
      nodeTitle: 'Advanced Topic',
      nodeDescription: '',
      nodeContent: '',
      count: 1,
      difficulty: 'ADVANCED',
    });

    expect(result.questions[0].difficulty).toBe('ADVANCED');
  });
});