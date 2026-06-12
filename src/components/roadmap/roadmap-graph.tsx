'use client';

import React, { useCallback, useMemo } from 'react';
import ReactFlow, { Node, Edge, addEdge, Connection, NodeTypes, EdgeTypes, Handle, Position, Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { Check, BookOpen, Lock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RoadmapGraphProps {
  roadmap: {
    nodes: Array<{
      id: string;
      title: string;
      type: string;
      positionX: number;
      positionY: number;
      difficulty?: string | null;
      estimatedHours?: number | null;
    }>;
    edges: Array<{
      id: string;
      sourceId: string;
      targetId: string;
      type: string;
      label?: string | null;
    }>;
  };
  progressMap: Map<string, { status: string; score?: number | null }>;
  onNodeClick: (id: string) => void;
}

const nodeTypes: NodeTypes = {
  topic: TopicNode,
  concept: ConceptNode,
  project: ProjectNode,
  quiz: QuizNode,
  resource: ResourceNode,
  milestone: MilestoneNode,
};

const edgeTypes: EdgeTypes = {
  prerequisite: PrerequisiteEdge,
};

function getStatusConfig(status: string) {
  switch (status) {
    case 'COMPLETED':
      return { color: '#22c55e', bg: '#dcfce7', icon: Check, label: 'Completed' };
    case 'MASTERED':
      return { color: '#10b981', bg: '#d1fae5', icon: Check, label: 'Mastered' };
    case 'IN_PROGRESS':
      return { color: '#3b82f6', bg: '#dbeafe', icon: AlertTriangle, label: 'In Progress' };
    case 'AVAILABLE':
      return { color: '#6b7280', bg: '#f3f4f6', icon: BookOpen, label: 'Available' };
    case 'LOCKED':
    default:
      return { color: '#9ca3af', bg: '#f3f4f6', icon: Lock, label: 'Locked' };
  }
}

function TopicNode({ data, selected, onClick }: { data: any; selected: boolean; onClick: () => void }) {
  const config = getStatusConfig(data.status);
  const Icon = config.icon;
  return (
    <div className={cn('w-48', selected && 'ring-2 ring-primary')}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-transparent" />
      <div
        onClick={onClick}
        className={cn(
          'p-3 rounded-lg cursor-pointer transition-all text-center',
          'bg-white dark:bg-gray-800 border',
          selected ? 'border-primary shadow-lg' : 'border-gray-200 dark:border-gray-700'
        )}
        style={{ backgroundColor: config.bg, borderColor: config.color }}
      >
        <div className="flex items-center justify-center gap-1 mb-1">
          <Icon className="h-4 w-4" style={{ color: config.color }} />
          <span className="text-xs font-medium" style={{ color: config.color }}>{config.label}</span>
        </div>
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{data.label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">{data.type}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-transparent" />
    </div>
  );
}

function ConceptNode({ data, selected, onClick }: { data: any; selected: boolean; onClick: () => void }) {
  const config = getStatusConfig(data.status);
  const Icon = config.icon;
  return (
    <div className={cn('w-40', selected && 'ring-2 ring-primary')}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-transparent" />
      <div
        onClick={onClick}
        className={cn(
          'p-3 rounded-lg cursor-pointer transition-all text-center',
          'bg-white dark:bg-gray-800 border',
          selected ? 'border-primary shadow-lg' : 'border-gray-200 dark:border-gray-700'
        )}
        style={{ backgroundColor: config.bg, borderColor: config.color }}
      >
        <div className="flex items-center justify-center gap-1 mb-1">
          <Icon className="h-4 w-4" style={{ color: config.color }} />
        </div>
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{data.label}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-transparent" />
    </div>
  );
}

function ProjectNode({ data, selected, onClick }: { data: any; selected: boolean; onClick: () => void }) {
  const config = getStatusConfig(data.status);
  const Icon = config.icon;
  return (
    <div className={cn('w-48', selected && 'ring-2 ring-primary')}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-transparent" />
      <div
        onClick={onClick}
        className={cn(
          'p-3 rounded-lg cursor-pointer transition-all text-center',
          'bg-white dark:bg-gray-800 border',
          selected ? 'border-primary shadow-lg' : 'border-gray-200 dark:border-gray-700'
        )}
        style={{ backgroundColor: config.bg, borderColor: config.color }}
      >
        <div className="flex items-center justify-center gap-1 mb-1">
          <Icon className="h-4 w-4" style={{ color: config.color }} />
        </div>
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{data.label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Project</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-transparent" />
    </div>
  );
}

function QuizNode({ data, selected, onClick }: { data: any; selected: boolean; onClick: () => void }) {
  const config = getStatusConfig(data.status);
  const Icon = config.icon;
  return (
    <div className={cn('w-40', selected && 'ring-2 ring-primary')}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-transparent" />
      <div
        onClick={onClick}
        className={cn(
          'p-3 rounded-lg cursor-pointer transition-all text-center',
          'bg-white dark:bg-gray-800 border',
          selected ? 'border-primary shadow-lg' : 'border-gray-200 dark:border-gray-700'
        )}
        style={{ backgroundColor: config.bg, borderColor: config.color }}
      >
        <div className="flex items-center justify-center gap-1 mb-1">
          <Icon className="h-4 w-4" style={{ color: config.color }} />
        </div>
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{data.label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Quiz</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-transparent" />
    </div>
  );
}

function ResourceNode({ data, selected, onClick }: { data: any; selected: boolean; onClick: () => void }) {
  const config = getStatusConfig(data.status);
  const Icon = config.icon;
  return (
    <div className={cn('w-40', selected && 'ring-2 ring-primary')}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-transparent" />
      <div
        onClick={onClick}
        className={cn(
          'p-3 rounded-lg cursor-pointer transition-all text-center',
          'bg-white dark:bg-gray-800 border',
          selected ? 'border-primary shadow-lg' : 'border-gray-200 dark:border-gray-700'
        )}
        style={{ backgroundColor: config.bg, borderColor: config.color }}
      >
        <div className="flex items-center justify-center gap-1 mb-1">
          <Icon className="h-4 w-4" style={{ color: config.color }} />
        </div>
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{data.label}</p>
      </div>
    </div>
  );
}

function MilestoneNode({ data, selected, onClick }: { data: any; selected: boolean; onClick: () => void }) {
  const config = getStatusConfig(data.status);
  const Icon = config.icon;
  return (
    <div className={cn('w-48', selected && 'ring-2 ring-primary')}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-transparent" />
      <div
        onClick={onClick}
        className={cn(
          'p-3 rounded-full cursor-pointer transition-all text-center',
          'bg-white dark:bg-gray-800 border-2',
          selected ? 'border-primary shadow-lg' : 'border-gray-200 dark:border-gray-700'
        )}
        style={{ backgroundColor: config.bg, borderColor: config.color }}
      >
        <div className="flex items-center justify-center gap-1">
          <Icon className="h-5 w-5" style={{ color: config.color }} />
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{data.label}</span>
        </div>
      </div>
    </div>
  );
}

function PrerequisiteEdge({ data }: { data: any }) {
  return (
    <path
      stroke={data.status === 'COMPLETED' || data.status === 'MASTERED' ? '#22c55e' : '#9ca3af'}
      strokeWidth={2}
      strokeDasharray={data.status === 'LOCKED' ? '5,5' : 'none'}
      fill="none"
    />
  );
}

export function RoadmapGraph({ roadmap, progressMap, onNodeClick }: RoadmapGraphProps) {
  const initialNodes = useMemo(() =>
    roadmap.nodes.map(node => {
      const progress = progressMap.get(node.id);
      const status = progress?.status ?? 'LOCKED';
      return {
        id: node.id,
        type: node.type.toLowerCase(),
        position: { x: node.positionX || 0, y: node.positionY || 0 },
        data: { label: node.title, type: node.type, status },
        draggable: false,
      } as Node;
    }), [roadmap.nodes, progressMap]);

  const initialEdges = useMemo(() =>
    roadmap.edges.map(edge => {
      const sourceProgress = progressMap.get(edge.sourceId);
      const targetProgress = progressMap.get(edge.targetId);
      const sourceStatus = sourceProgress?.status ?? 'LOCKED';
      const targetStatus = targetProgress?.status ?? 'LOCKED';
      const status = sourceStatus === 'COMPLETED' || sourceStatus === 'MASTERED' ? 'COMPLETED' : 'LOCKED';
      return {
        id: edge.id,
        source: edge.sourceId,
        target: edge.targetId,
        type: 'prerequisite',
        animated: status === 'COMPLETED',
        style: { strokeWidth: 2 },
        data: { status },
        markerEnd: { type: 'arrowclosed', color: status === 'COMPLETED' ? '#22c55e' : '#9ca3af' },
      } as Edge;
    }), [roadmap.edges, progressMap]);

  const onConnect = useCallback((params: Connection) => {
    // Edge creation disabled for now
  }, []);

  const handleNodeClick = useCallback((_, node: Node) => {
    onNodeClick(node.id);
  }, [onNodeClick]);

  return (
    <div className="h-[70vh] w-full rounded-lg border bg-gray-50 dark:bg-gray-900/50">
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#e5e7eb" gap={16} />
        <Controls />
        <MiniMap />
      </ReactFlow>
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap justify-center gap-2 p-2 bg-background/80 backdrop-blur rounded-lg border">
        {[
          { label: 'Topic', type: 'topic' },
          { label: 'Concept', type: 'concept' },
          { label: 'Project', type: 'project' },
          { label: 'Quiz', type: 'quiz' },
          { label: 'Milestone', type: 'milestone' },
        ].map(({ label, type }) => {
          const config = getStatusConfig('AVAILABLE');
          const Icon = config.icon;
          return (
            <div key={type} className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground">
              <div className={cn('w-2 h-2 rounded', type === 'milestone' && 'rounded-full')} style={{ backgroundColor: config.bg, border: `1px solid ${config.color}` }} />
              <span>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}