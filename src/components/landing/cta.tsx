'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, Zap, Shield, Users } from 'lucide-react';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-8 sm:p-16 lg:p-24 text-center">
          <div className="absolute inset-0 bg-gradient-radial from-primary/10 to-transparent rounded-2xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Zap className="h-4 w-4" />
              <span>Start free, upgrade anytime</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Ready to become an <span className="text-primary">AI Engineer</span>?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Join 10,000+ developers learning AI engineering with structured roadmaps, AI tutoring, and hands-on projects.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="xl" asChild>
                <Link href="/auth/signup">Start Learning Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link href="/roadmap/ai-engineer">Explore Roadmap</Link>
              </Button>
            </div>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <span>Free tier forever</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}