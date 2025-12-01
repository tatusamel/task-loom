import * as React from 'react';
import { cn } from '@/lib/utils';

const variantClasses = {
  default: 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20',
  secondary: 'bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/10',
  outline: 'bg-transparent text-slate-600 ring-1 ring-inset ring-slate-200',
  destructive: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
} as const;

export type BadgeVariant = keyof typeof variantClasses;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
