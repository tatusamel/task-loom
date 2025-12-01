import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  message: string;
  actionSlot?: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export function EmptyState({ title, message, actionSlot, className, icon }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'col-span-full rounded-2xl border border-slate-200 bg-slate-50/60 px-6 py-12 text-center shadow-[0_8px_32px_rgba(15,23,42,0.04)]',
        className,
      )}
    >
      {icon ? (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-50 via-white to-indigo-50 text-purple-600 shadow-[0_6px_24px_rgba(79,70,229,0.12)]">
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-medium text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{message}</p>
      {actionSlot ? <div className="mt-6">{actionSlot}</div> : null}
    </div>
  );
}
