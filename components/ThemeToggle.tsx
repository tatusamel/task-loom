'use client';

import { memo } from 'react';
import { useTheme } from './ThemeProvider';
import { MoonIcon, SunIcon } from './icons';
import { cn } from '@/lib/utils';

export const ThemeToggle = memo(function ThemeToggle() {
  const { resolvedTheme, toggleTheme, isReady } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      disabled={!isReady}
      className={cn(
        'group inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-150',
        'border-slate-200 bg-white text-slate-700 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        'dark:border-slate-600 dark:bg-[#111827] dark:text-slate-100 dark:hover:border-purple-600 dark:hover:bg-purple-900/40 dark:hover:text-purple-100 dark:focus-visible:ring-offset-slate-900',
      )}
    >
      {isDark ? (
        <SunIcon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" aria-hidden />
      ) : (
        <MoonIcon className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-45" aria-hidden />
      )}
    </button>
  );
});
