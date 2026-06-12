'use client';

import { Check, Clock, BookOpen, AlertTriangle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface NodeWithProgress {
  id: string;
  title: string;
  type: string;
  orderIndex: number;
  difficulty?: string | null;
  estimatedHours?: number | null;
  status: string;
  score?: number | null;
}

interface RoadmapSidebarProps {
  roadmap: {
    nodes: Array<{
      id: string;
      title: string;
      type: string;
      orderIndex: number;
      difficulty?: string | null;
      estimatedHours?: number | null;
      parentId?: string | null;
    }>;
  };
  progressMap: Map<string, { status: string; score?: number | null }>;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'COMPLETED':
      return { icon: Check, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Completed' };
    case 'MASTERED':
      return { icon: Check, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'Mastered' };
    case 'IN_PROGRESS':
      return { icon: AlertTriangle, color: 'text-primary', bg: 'bg-primary/10', label: 'In Progress' };
    case 'AVAILABLE':
      return { icon: BookOpen, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Available' };
    case 'LOCKED':
    default:
      return { icon: Lock, color: 'text-muted-foreground/50', bg: 'bg-muted/50', label: 'Locked' };
  }
}

function NodeItem({
  node,
  progress,
  isSelected,
  onClick,
}: {
  node: NodeWithProgress;
  progress: { status: string; score?: number | null } | undefined;
  isSelected: boolean;
  onClick: () => void;
}) {
  const status = progress?.status ?? 'LOCKED';
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Button
      variant={isSelected ? 'default' : 'ghost'}
      className={cn(
        'w-full justify-start gap-3 text-left px-3 py-2',
        isSelected ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted'
      )}
      onClick={onClick}
    >
      <div className={cn('flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium', config.bg, config.color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0 text-sm">
        <p className={cn('font-medium truncate', isSelected ? 'text-primary-foreground' : '')}>{node.title}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
          <span className="capitalize">{node.type.toLowerCase()}</span>
          {node.difficulty && <span>• {node.difficulty.charAt(0).toLowerCase() + node.difficulty.slice(1)}</span>}
          {node.estimatedHours && <span>• ~{node.estimatedHours}h</span>}
        </div>
      </div>
      {progress?.score !== null && progress?.score !== undefined && (
        <span className="text-xs font-medium">{progress.score}%</span>
      )}
    </Button>
  );
}

export function RoadmapSidebar({
  roadmap,
  progressMap,
  selectedNodeId,
  onSelectNode,
}: RoadmapSidebarProps) {
  const rootNodes = roadmap.nodes.filter(n => !n.parentId).sort((a, b) => a.orderIndex - b.orderIndex);
  const childMap = new Map<string, typeof roadmap.nodes>();
  roadmap.nodes.filter(n => n.parentId).forEach(n => {
    if (!childMap.has(n.parentId!)) childMap.set(n.parentId!, []);
    childMap.get(n.parentId!)!.push(n);
  });

  const totalNodes = roadmap.nodes.length;
  const completedNodes = Array.from(progressMap.values()).filter(p => p.status === 'COMPLETED' || p.status === 'MASTERED').length;
  const progressPercent = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Overall Progress</span>
          <span className="text-muted-foreground">{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
        <p className="text-xs text-muted-foreground">{completedNodes} of {totalNodes} topics completed</p>
      </div>

      <nav className="space-y-2" aria-label="Roadmap topics">
        {rootNodes.map((rootNode) => {
          const children = childMap.get(rootNode.id)?.sort((a, b) => a.orderIndex - b.orderIndex) ?? [];
          const rootProgress = progressMap.get(rootNode.id);
          const rootStatus = rootProgress?.status ?? 'LOCKED';

          return (
            <div key={rootNode.id} className="space-y-1">
              <NodeItem
                node={{ ...rootNode, status: rootStatus }}
                progress={rootProgress}
                isSelected={selectedNodeId === rootNode.id}
                onClick={() => onSelectNode(rootNode.id)}
              />
              {children.length > 0 && (
                <div className="ml-4 space-y-1 border-l border-muted/50 pl-3">
                  {children.map((child) => {
                    const childProgress = progressMap.get(child.id);
                    const childStatus = childProgress?.status ?? 'LOCKED';
                    return (
                      <NodeItem
                        key={child.id}
                        node={{ ...child, status: childStatus }}
                        progress={childProgress}
                        isSelected={selectedNodeId === child.id}
                        onClick={() => onSelectNode(child.id)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}