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
        'col-span-full rounded-2xl border border-slate-200 bg-slate-50/50 px-6 py-12 text-center',
        className,
      )}
    >
      <h3 className="text-base font-medium text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{message}</p>
      {actionSlot ? <div className="mt-6">{actionSlot}</div> : null}
    </div>
  );
}
