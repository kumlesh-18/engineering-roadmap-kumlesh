'use client';

import * as React from 'react';
import { Suspense, useState } from 'react';
import { trpc } from '@/trpc/client';
import { RoadmapHeader } from './roadmap-header';
import { RoadmapSidebar } from './roadmap-sidebar';
import { RoadmapGraph } from './roadmap-graph';
import { NodeContent } from './node-content';
import { ProgressBar } from './progress-bar';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface RoadmapClientPageProps {
  slug: string;
}

export function RoadmapClientPage({ slug }: RoadmapClientPageProps) {
  const [view, setView] = useState<'list' | 'graph'>('list');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const { data: roadmap, isLoading } = trpc.roadmap.getBySlug.useQuery({ slug });
  const { data: progress } = trpc.progress.getMyProgress.useQuery({ roadmapId: roadmap?.id }, { enabled: !!roadmap?.id });

  if (isLoading) {
    return <RoadmapSkeleton />;
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Roadmap not found</h2>
              <p className="text-muted-foreground mt-2">This roadmap doesn't exist or isn't published yet.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressMap = new Map(progress?.map(p => [p.nodeId, p]) ?? []);

  return (
    <div className="min-h-screen bg-background">
      <RoadmapHeader roadmap={roadmap} view={view} setView={setView} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className={cn('grid gap-6', view === 'graph' ? '' : 'lg:grid-cols-12')}>
          <aside className={cn('hidden lg:block', view === 'graph' ? 'lg:col-span-3' : 'lg:col-span-4')}>
            <RoadmapSidebar
              roadmap={roadmap}
              progressMap={progressMap}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
            />
          </aside>
          <main className={cn(view === 'graph' ? '' : 'lg:col-span-8 lg:col-start-5')}>
            {view === 'graph' ? (
              <RoadmapGraph roadmap={roadmap} progressMap={progressMap} onNodeClick={setSelectedNodeId} />
            ) : (
              <Suspense fallback={<NodeContentSkeleton />}>
                {selectedNodeId ? (
                  <NodeContent
                    node={roadmap.nodes.find(n => n.id === selectedNodeId)!}
                    progress={progressMap.get(selectedNodeId)}
                    roadmapId={roadmap.id}
                  />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Select a topic from the sidebar to start learning</p>
                  </div>
                )}
              </Suspense>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function RoadmapSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl py-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 grid lg:grid-cols-12 gap-6">
        <Skeleton className="lg:col-span-4 h-96" />
        <Skeleton className="lg:col-span-8 h-96" />
      </div>
    </div>
  );
}

function NodeContentSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </CardContent>
    </Card>
  );
}