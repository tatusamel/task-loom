import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  message: string;
  actionSlot?: ReactNode;
  className?: string;
}

export function EmptyState({ title, message, actionSlot, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'col-span-full rounded-lg border border-slate-200/80 bg-slate-50/50 px-6 py-8 text-center',
        className,
      )}
    >
      <h3 className="text-sm font-medium text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{message}</p>
      {actionSlot ? <div className="mt-4">{actionSlot}</div> : null}
    </div>
  );
}
