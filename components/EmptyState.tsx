import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  title: string;
  message: string;
  actionSlot?: ReactNode;
  className?: string;
}

export function EmptyState({ title, message, actionSlot, className }: EmptyStateProps) {
  return (
    <Card
      className={cn(
        'col-span-full border border-dashed border-slate-200 bg-white text-left',
        className,
      )}
    >
      <CardContent className="flex flex-col gap-2 p-6">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{message}</p>
        {actionSlot ? <div className="pt-2">{actionSlot}</div> : null}
      </CardContent>
    </Card>
  );
}
