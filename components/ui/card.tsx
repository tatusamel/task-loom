import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

export function Card({ className, as: Component = 'div', ...props }: CardProps) {
  return (
    <Component
      className={cn(
        'rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white via-white to-slate-50 shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-all duration-200 ease-in-out hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]',
        'dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/60 dark:shadow-[0_1px_3px_rgba(0,0,0,0.28)] dark:hover:shadow-[0_6px_18px_rgba(0,0,0,0.3)]',
      className,
      )}
      {...props}
    />
  );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return <div className={cn('space-y-3 px-6 pt-6 pb-2', className)} {...props} />;
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn(
        'text-base font-semibold leading-tight tracking-tight text-slate-900',
        className,
      )}
      {...props}
    />
  );
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return <p className={cn('text-sm text-slate-500', className)} {...props} />;
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn('px-6 py-4', className)} {...props} />;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className, ...props }: CardFooterProps) {
  return <div className={cn('flex items-center gap-3 px-6 pb-6 pt-3', className)} {...props} />;
}
