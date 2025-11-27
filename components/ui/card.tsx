import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

export function Card({ className, as: Component = 'div', ...props }: CardProps) {
  return (
    <Component
      className={cn(
        'rounded-lg border border-slate-200/80 bg-white shadow-soft transition-shadow duration-200 hover:shadow-soft-md',
        className,
      )}
      {...props}
    />
  );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return <div className={cn('space-y-1.5 p-5 pb-0', className)} {...props} />;
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn('text-base font-semibold leading-tight tracking-tight text-slate-900', className)}
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
  return <div className={cn('p-5 pt-4', className)} {...props} />;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className, ...props }: CardFooterProps) {
  return <div className={cn('flex items-center gap-2 p-5 pt-0', className)} {...props} />;
}
