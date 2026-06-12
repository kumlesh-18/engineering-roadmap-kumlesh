'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Zap, Network, BookOpen, Target, BarChart3, MessageSquare, Layers } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Tutoring',
    description: 'Get personalized explanations, code reviews, and guidance from an AI tutor that understands your learning context.',
    highlight: 'BYOK Support',
  },
  {
    icon: Network,
    title: 'Interactive Knowledge Graph',
    description: 'Visualize connections between concepts, prerequisites, and learning paths. Explore the AI engineering landscape.',
    highlight: 'React Flow',
  },
  {
    icon: BookOpen,
    title: 'Adaptive Quiz Engine',
    description: 'AI-generated quizzes tailored to your progress. Spaced repetition and detailed explanations for every question.',
    highlight: 'Smart Grading',
  },
  {
    icon: Target,
    title: 'Personalized Study Planner',
    description: 'Create custom learning plans based on your goals, timeline, and current knowledge. Track progress with analytics.',
    highlight: 'Spaced Repetition',
  },
  {
    icon: MessageSquare,
    title: 'RAG-Enhanced Learning',
    description: 'Ask questions about any topic and get answers grounded in curated documentation, papers, and code examples.',
    highlight: 'Vector Search',
  },
  {
    icon: BarChart3,
    title: 'Progress Analytics',
    description: 'Detailed insights into your learning velocity, knowledge gaps, and mastery levels across all topics.',
    highlight: 'Real-time',
  },
  {
    icon: Layers,
    title: 'Project-Based Learning',
    description: 'Build real AI applications as you learn. Each milestone includes hands-on projects with starter code.',
    highlight: 'Production-ready',
  },
  {
    icon: Zap,
    title: 'Modern Tech Stack',
    description: 'Built with Next.js 14, React 18, TypeScript, Tailwind, tRPC, Prisma, and Vercel AI SDK.',
    highlight: 'Open Source',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to master <span className="text-primary">AI Engineering</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            A comprehensive platform designed for effective, engaging, and personalized learning.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={feature.title} className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-3">{feature.description}</p>
                <span className="text-xs font-medium text-primary">{feature.highlight}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}