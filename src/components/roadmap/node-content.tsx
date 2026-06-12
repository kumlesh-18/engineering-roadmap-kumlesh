'use client';

import * as React from 'react';
import { useState } from 'react';
import { trpc } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MarkdownContent } from '@/components/ui/markdown-content';
import { QuizPlayer } from '@/components/quiz/quiz-player';
import { ChatInterface } from '@/components/chat/chat-interface';
import { cn, formatTime } from '@/lib/utils';
import {
  BookOpen, Clock, CheckCircle, AlertTriangle, Lock,
  MessageSquare, HelpCircle, Brain, Zap
} from 'lucide-react';

interface NodeContentProps {
  node: {
    id: string;
    title: string;
    type: string;
    description: string | null;
    contentMdx: string | null;
    difficulty?: string | null;
    estimatedHours?: number | null;
    prerequisites: string[];
  };
  progress: { status: string; score?: number | null; timeSpentSeconds?: number } | undefined;
  roadmapId: string;
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'COMPLETED':
    case 'MASTERED':
      return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Completed' };
    case 'IN_PROGRESS':
      return { icon: AlertTriangle, color: 'text-primary', bg: 'bg-primary/10', label: 'In Progress' };
    case 'AVAILABLE':
      return { icon: BookOpen, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Available' };
    case 'LOCKED':
    default:
      return { icon: Lock, color: 'text-muted-foreground/50', bg: 'bg-muted/50', label: 'Locked' };
  }
}

export function NodeContent({ node, progress, roadmapId }: NodeContentProps) {
  const [activeTab, setActiveTab] = useState<'learn' | 'quiz' | 'chat'>('learn');
  const status = progress?.status ?? 'AVAILABLE';
  const config = getStatusConfig(status);
  const Icon = config.icon;

  const startLearning = trpc.progress.updateProgress.useMutation({
    onSuccess: () => {
      trpc.progress.getMyProgress.invalidate({ roadmapId });
    },
  });

  const handleMarkInProgress = () => {
    if (status === 'LOCKED' || status === 'AVAILABLE') {
      startLearning.mutate({ nodeId: node.id, status: 'IN_PROGRESS' });
    }
  };

  const handleMarkComplete = () => {
    startLearning.mutate({ nodeId: node.id, status: 'COMPLETED' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={cn('p-2 rounded-lg', config.bg, config.color)}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{node.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1 capitalize">{node.type.toLowerCase()}</span>
                {node.difficulty && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {node.difficulty.charAt(0).toLowerCase() + node.difficulty.slice(1)}
                  </span>
                )}
                {node.estimatedHours && (
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />~{node.estimatedHours}h</span>
                )}
                {progress?.timeSpentSeconds && (
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Spent: {formatTime(progress.timeSpentSeconds)}</span>
                )}
              </div>
            </div>
          </div>
          {node.description && <p className="text-muted-foreground mt-2">{node.description}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {status === 'LOCKED' ? (
            <Button variant="outline" disabled><Lock className="h-4 w-4 mr-1" />Locked</Button>
          ) : status === 'COMPLETED' || status === 'MASTERED' ? (
            <Button variant="secondary"><CheckCircle className="h-4 w-4 mr-1" />Completed</Button>
          ) : status === 'IN_PROGRESS' ? (
            <Button onClick={handleMarkComplete}><CheckCircle className="h-4 w-4 mr-1" />Mark Complete</Button>
          ) : (
            <Button onClick={handleMarkInProgress}><BookOpen className="h-4 w-4 mr-1" />Start Learning</Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="learn"><BookOpen className="h-4 w-4 mr-2" />Learn</TabsTrigger>
          <TabsTrigger value="quiz"><HelpCircle className="h-4 w-4 mr-2" />Quiz</TabsTrigger>
          <TabsTrigger value="chat"><MessageSquare className="h-4 w-4 mr-2" />AI Tutor</TabsTrigger>
        </TabsList>

        <TabsContent value="learn" className="mt-4">
          <ScrollArea className="h-[60vh]">
            <div className="prose-custom prose-dark max-w-none p-4">
              {node.contentMdx ? (
                <MarkdownContent content={node.contentMdx} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No content available for this topic yet.</p>
                  <p className="text-sm mt-2">Content will be added soon.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="quiz" className="mt-4">
          <QuizPlayer nodeId={node.id} roadmapId={roadmapId} />
        </TabsContent>

        <TabsContent value="chat" className="mt-4">
          <ChatInterface nodeId={node.id} />
        </TabsContent>
      </Tabs>

      {node.prerequisites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" />Prerequisites</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Complete these topics before starting this one:
            </p>
            <div className="flex flex-wrap gap-2">
              {node.prerequisites.map((prereqId) => (
                <span key={prereqId} className="px-3 py-1 rounded-full bg-muted text-sm font-medium">
                  {prereqId.slice(0, 8)}...
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}