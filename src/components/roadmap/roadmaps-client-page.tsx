'use client';

import { Suspense, useState } from 'react';
import { trpc } from '@/trpc/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Search, Filter, ArrowRight, BookOpen, Clock, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export function RoadmapsClientPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.roadmap.list.useQuery({
    publishedOnly: true,
    limit: 12,
    cursor: undefined,
  });

  if (isLoading) {
    return <RoadmapsSkeleton />;
  }

  const filteredRoadmaps = data?.items.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Explore <span className="text-primary">Learning Roadmaps</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Structured paths designed by experts. Track progress, take quizzes, and learn with AI tutoring.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search roadmaps..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredRoadmaps.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No roadmaps found matching your search.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRoadmaps.map((roadmap) => (
              <RoadmapCard key={roadmap.id} roadmap={roadmap} />
            ))}
          </div>
        )}

        {(data?.nextCursor || page > 1) && (
          <div className="mt-8 flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={!data?.nextCursor}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function RoadmapCard({ roadmap }: { roadmap: any }) {
  return (
    <Card className="h-full flex flex-col group hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold">{roadmap.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{roadmap.description}</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
            v{roadmap.version}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />{roadmap._count?.nodes ?? 0} topics</span>
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" />~{roadmap._count?.nodes * 10}h</span>
        </div>
        <div className="flex items-center justify-between pt-4 border-t mt-auto">
          <span className="text-sm text-muted-foreground">
            By {roadmap.createdBy?.name ?? 'Anonymous'}
          </span>
          <Button asChild variant="outline" size="sm" className="group">
            <Link href={`/roadmap/${roadmap.slug}`}>
              Start Learning
              <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RoadmapsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
        </div>
        <div className="max-w-2xl mx-auto mb-8">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-full">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-1/2 mt-1" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center justify-between pt-4 border-t mt-auto">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}