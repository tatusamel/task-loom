import * as React from 'react';
import { cn } from '@/lib/utils';

const baseClasses =
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

const variantClasses = {
  default: 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300',
  outline: 'border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  destructive: 'bg-red-600 text-white shadow-sm hover:bg-red-500 active:bg-red-700',
  subtle: 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  link: 'text-indigo-600 underline-offset-4 hover:underline',
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
