'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export function ProgressBar({ value, className, showLabel = true, label }: ProgressBarProps) {
  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="font-medium">{label ?? 'Progress'}</span>
          <span className="text-muted-foreground">{Math.round(value)}%</span>
        </div>
      )}
      <Progress value={value} className="h-2" />
    </div>
  );
}