'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ChevronRight, Lock, Clock, BookOpen, Terminal } from 'lucide-react';
import Link from 'next/link';

const roadmapNodes = [
  { id: '1', title: 'Foundations', topics: ['Python for AI', 'Linear Algebra', 'Probability & Stats', 'ML Basics'], status: 'completed' },
  { id: '2', title: 'Deep Learning', topics: ['Neural Networks', 'CNNs', 'RNNs/Transformers', 'PyTorch/TensorFlow'], status: 'in-progress' },
  { id: '3', title: 'LLM Fundamentals', topics: ['Transformer Architecture', 'Tokenization', 'Pre-training', 'Scaling Laws'], status: 'available' },
  { id: '4', title: 'RAG Systems', topics: ['Embeddings', 'Vector Databases', 'Retrieval Strategies', 'Evaluation'], status: 'locked' },
  { id: '5', title: 'AI Agents', topics: ['Tool Use', 'Planning', 'Memory', 'Multi-agent Systems'], status: 'locked' },
  { id: '6', title: 'MLOps & Deployment', topics: ['Model Serving', 'Monitoring', 'CI/CD', 'Cost Optimization'], status: 'locked' },
];

export function RoadmapPreview() {
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              The <span className="text-primary">AI Engineer Roadmap</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
              6 modules, 50+ topics, 100+ hours of content. Track your progress from beginner to production-ready AI Engineer.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/roadmap/ai-engineer">View Full Roadmap <ChevronRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="space-y-4">
          {roadmapNodes.map((node, index) => (
            <Card key={node.id} className="flex items-center gap-4 p-4 group hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                {node.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                {node.status === 'in-progress' ? 'bg-primary/10 text-primary' : ''}
                {node.status === 'available' ? 'bg-muted text-muted-foreground' : ''}
                {node.status === 'locked' ? 'bg-muted/50 text-muted-foreground/50' : ''}
              ">
                {node.status === 'completed' ? <Check className="h-6 w-6" /> : index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{node.title}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full
                    {node.status === 'completed' ? 'bg-green-100 text-green-700' : ''}
                    {node.status === 'in-progress' ? 'bg-primary/10 text-primary' : ''}
                    {node.status === 'available' ? 'bg-muted text-muted-foreground' : ''}
                    {node.status === 'locked' ? 'bg-muted/50 text-muted-foreground/50' : ''}
                  ">
                    {node.status.replace('-', ' ')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {node.topics.slice(0, 3).join(', ')}{node.topics.length > 3 ? ` +${node.topics.length - 3} more` : ''}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />~15h</span>
                <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{node.topics.length} topics</span>
                <span className="flex items-center gap-1"><Terminal className="h-3.5 w-3.5" />3 projects</span>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/roadmap/ai-engineer?node=${node.id}`}>
                  {node.status === 'locked' ? (
                    <>
                      <Lock className="h-4 w-4 mr-1" />
                      Locked
                    </>
                  ) : (
                    'Continue'
                  )}
                </Link>
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}