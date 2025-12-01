'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'relative flex flex-col',
        month: 'w-full',
        month_caption: 'flex items-center justify-center h-8 mb-2',
        caption_label: 'text-sm font-semibold text-slate-900',
        nav: 'absolute top-3 left-0 right-0 flex items-center justify-between px-0.5',
        button_previous:
          'h-7 w-7 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-colors',
        button_next:
          'h-7 w-7 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-colors',
        weekdays: 'flex w-full mb-1',
        weekday:
          'w-9 h-6 flex items-center justify-center text-[10px] font-medium text-slate-400 uppercase',
        week: 'flex w-full',
        day: 'w-9 h-9 flex items-center justify-center p-0',
        day_button: cn(
          'h-8 w-8 flex items-center justify-center rounded-full text-sm font-medium transition-all',
          'text-slate-700 hover:bg-purple-50 hover:text-purple-700 hover:rounded-full',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1',
        ),
        today: 'bg-purple-50 text-purple-700 font-semibold rounded-full',
        selected:
          'bg-purple-600 text-white font-semibold shadow-sm rounded-full hover:bg-purple-700 hover:text-white',
        outside: 'text-slate-300 hover:bg-slate-50 hover:text-slate-400',
        disabled: 'text-slate-300 cursor-not-allowed hover:bg-transparent',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === 'left') {
            return <ChevronLeftIcon className="h-4 w-4" />;
          }
          return <ChevronRightIcon className="h-4 w-4" />;
        },
      }}
      {...props}
    />
  );
}
