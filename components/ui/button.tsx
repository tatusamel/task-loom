import * as React from 'react';
import { cn } from '@/lib/utils';

const baseClasses =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:pointer-events-none disabled:opacity-50 active:translate-y-[0.5px]';

const variantClasses = {
  default:
    'bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-500 text-white shadow-sm hover:from-purple-600 hover:via-purple-600 hover:to-indigo-400 hover:shadow-md active:from-purple-700 active:to-indigo-500',
  secondary: 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 active:bg-slate-100',
  outline: 'border border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50 hover:border-slate-300',
  ghost: 'border border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900',
  destructive: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:bg-rose-800',
  subtle: 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  link: 'text-purple-600 underline-offset-4 hover:underline hover:text-purple-700',
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
