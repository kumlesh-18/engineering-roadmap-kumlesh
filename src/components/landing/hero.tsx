'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, Zap, Shield, Users } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Zap className="h-4 w-4" />
            <span>New: AI Tutoring with BYOK Support</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl">
            Become an <span className="text-primary">AI Engineer</span> with a
            <br />
            Structured, Interactive Roadmap
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto">
            Master LLMs, RAG, Agents, Fine-tuning, MLOps, and more. Learn with AI-powered tutoring,
            interactive quizzes, knowledge graphs, and a personalized study planner.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/roadmap/ai-engineer">
              <Button size="xl" asChild>
                Start Learning Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="xl" asChild>
              <Link href="/roadmap/ai-engineer?view=graph">View Knowledge Graph</Link>
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Self-paced</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <span>AI Tutoring</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Community</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}