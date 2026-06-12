'use client';

import { Button } from '@/components/ui/button';
import { BookOpen, Network, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface RoadmapHeaderProps {
  roadmap: {
    id: string;
    title: string;
    description: string | null;
    version: number;
    isPublished: boolean;
    _count: { nodes: number };
    createdBy: { name: string | null } | null;
  };
  view: 'list' | 'graph';
  setView: (view: 'list' | 'graph') => void;
}

export function RoadmapHeader({ roadmap, view, setView }: RoadmapHeaderProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/roadmaps"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold truncate">{roadmap.title}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span>{roadmap._count.nodes} topics</span>
                <span>•</span>
                <span>v{roadmap.version}</span>
                {roadmap.createdBy?.name && (
                  <>
                    <span>•</span>
                    <span>by {roadmap.createdBy.name}</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={view === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('list')}
              className="gap-2"
            >
              <BookOpen className="h-4 w-4" />
              List
            </Button>
            <Button
              variant={view === 'graph' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('graph')}
              className="gap-2"
            >
              <Network className="h-4 w-4" />
              Graph
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}