import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all hover:border-slate-300 hover:bg-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/22 focus:shadow-[0_10px_36px_rgba(79,70,229,0.08)] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50',
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
