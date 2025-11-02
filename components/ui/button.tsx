import * as React from 'react';
import { cn } from '@/lib/utils';

const baseClasses =
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60';

const variantClasses = {
  default: 'bg-indigo-600 text-white hover:bg-indigo-500',
  secondary: 'bg-slate-900 text-white hover:bg-slate-800',
  outline:
    'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900',
  destructive: 'bg-red-600 text-white hover:bg-red-500',
  subtle: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
} as const;

const sizeClasses = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 px-3',
  lg: 'h-11 px-6',
  icon: 'h-9 w-9',
} as const;

export type ButtonVariant = keyof typeof variantClasses;
export type ButtonSize = keyof typeof sizeClasses;

export function buttonVariants({
  variant = 'default',
  size = 'default',
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(baseClasses, variantClasses[variant], sizeClasses[size], className);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', children, isLoading, ...props }, ref) => (
    <button
      ref={ref}
      className={buttonVariants({ variant, size, className })}
      aria-busy={isLoading}
      {...props}
    >
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
