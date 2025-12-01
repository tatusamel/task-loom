'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface FilterFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
  htmlFor?: string;
  labelClassName?: string;
}

export function FilterField({ label, children, className, htmlFor, labelClassName }: FilterFieldProps) {
  return (
    <div className={cn('flex w-full flex-col gap-1 sm:w-auto', className)}>
      <label
        htmlFor={htmlFor}
        className={cn('text-xs font-semibold uppercase tracking-wide text-slate-500', labelClassName)}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

interface FiltersSectionProps {
  children: ReactNode;
  filtersDirty: boolean;
  onReset: () => void;
  layoutClassName?: string;
  title?: string;
  hint?: string;
  activeLabel?: string;
  resetButtonSize?: 'sm' | 'default';
  resetButtonClassName?: string;
}

export function FiltersSection({
  children,
  filtersDirty,
  onReset,
  layoutClassName,
  title = 'Filters',
  hint = 'Search, tag, or status',
  activeLabel = 'Active',
  resetButtonSize = 'sm',
  resetButtonClassName,
}: FiltersSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          {title ? <span>{title}</span> : null}
          {filtersDirty ? (
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {activeLabel}
            </Badge>
          ) : hint ? (
            <span className="hidden text-xs font-normal text-slate-500 sm:inline">{hint}</span>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size={resetButtonSize}
          onClick={onReset}
          disabled={!filtersDirty}
          className={cn(resetButtonSize === 'sm' ? 'h-9' : 'h-10', resetButtonClassName)}
        >
          Clear filters
        </Button>
      </div>

      <div
        className={cn(
          'grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr,1fr,0.9fr] xl:grid-cols-[1.6fr,1fr,1fr]',
          layoutClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
