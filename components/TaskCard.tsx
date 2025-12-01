'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'react-hot-toast';
import {
  AlertTriangleIcon,
  ArchiveIcon,
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  LoaderIcon,
  MoreVerticalIcon,
  RestoreIcon,
  TagIcon,
  TrashIcon,
} from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { TaskDTO } from '@/types/task';
import { cn, formatDateTime, formatEffort, formatRelativeDue } from '@/lib/utils';

interface TaskCardProps {
  task: TaskDTO;
}

// Determine urgency level for visual treatment
function getUrgencyLevel(dueAt: string | null): 'overdue' | 'urgent' | 'soon' | 'normal' | null {
  if (!dueAt) return null;
  const date = new Date(dueAt);
  if (Number.isNaN(date.getTime())) return null;
  const diffMs = date.getTime() - Date.now();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'urgent';
  if (diffDays <= 2) return 'soon';
  return 'normal';
}

// Get overdue days for display
function getOverdueDays(dueAt: string | null): number {
  if (!dueAt) return 0;
  const date = new Date(dueAt);
  if (Number.isNaN(date.getTime())) return 0;
  const diffMs = Date.now() - date.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function TaskCard({ task }: TaskCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [opening, setOpening] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const mutateTask = (payload: Partial<Pick<TaskDTO, 'completed' | 'archived'>>) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/tasks/${task.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error ?? 'Failed to update task');
        }
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : 'Failed to update task.');
      }
    });
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Delete this task permanently?');
    if (!confirmed) return;
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? 'Failed to delete task.');
      }
      toast.success('Task deleted.');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete task.');
    }
  };

  const dueDescription = formatRelativeDue(task.dueAt);
  const effortDescription = formatEffort(task.estimatedEffort);
  const urgency = task.completed ? null : getUrgencyLevel(task.dueAt);

  // Map importance to priority labels
  const priorityLabel = task.importance
    ? task.importance >= 4
      ? 'High'
      : task.importance >= 3
        ? 'Medium'
        : 'Low'
    : null;

  const overdueDays = urgency === 'overdue' ? getOverdueDays(task.dueAt) : 0;

  return (
    <Card
      as="article"
      className={cn(
        'group flex flex-col transition-all duration-200 ease-in-out hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] animate-[fade-in-soft_200ms_ease-out] overflow-hidden',
        task.completed && 'opacity-60',
        urgency === 'urgent' && !task.completed && 'ring-2 ring-amber-400 ring-offset-1',
      )}
      data-testid="task-card"
    >
      {/* OVERDUE BANNER - Maximum prominence */}
      {urgency === 'overdue' && (
        <div className="bg-red-600 px-4 py-2 flex items-center gap-2">
          <AlertTriangleIcon className="h-4 w-4 text-white shrink-0" aria-hidden />
          <span className="text-sm font-bold text-white uppercase tracking-wide">
            {overdueDays === 1 ? '1 day overdue' : `${overdueDays} days overdue`}
          </span>
        </div>
      )}

      {/* DUE TODAY BANNER - High prominence */}
      {urgency === 'urgent' && (
        <div className="bg-amber-500 px-4 py-1.5 flex items-center gap-2">
          <ClockIcon className="h-3.5 w-3.5 text-white shrink-0" aria-hidden />
          <span className="text-xs font-semibold text-white uppercase tracking-wide">
            Due today
          </span>
        </div>
      )}

      {/* Primary: Title + Status Indicator */}
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          {/* Checkbox for completion - clear toggle affordance */}
          <button
            type="button"
            onClick={() => mutateTask({ completed: !task.completed })}
            disabled={isPending}
            className={cn(
              'mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all duration-150',
              task.completed
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-slate-300 bg-white hover:border-purple-500 hover:bg-purple-50',
              isPending && 'opacity-50',
            )}
            aria-pressed={task.completed}
            aria-label={task.completed ? 'Mark as active' : 'Mark as complete'}
            title={task.completed ? 'Click to mark as active' : 'Click to mark as complete'}
          >
            {isPending ? (
              <LoaderIcon className="h-3 w-3 animate-spin" aria-hidden />
            ) : task.completed ? (
              <CheckIcon className="h-3 w-3" aria-hidden />
            ) : null}
          </button>

          <div className="flex-1 min-w-0">
            {/* Title - Most prominent: 16px, 600 weight, gray-900 */}
            <CardTitle className="flex items-start gap-2">
              <Link
                href={`/tasks/${task.id}`}
                className={cn(
                  'text-base font-semibold leading-[1.4] text-gray-900 transition hover:text-purple-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:rounded',
                  task.completed && 'line-through text-slate-400 font-normal',
                )}
              >
                {task.title}
              </Link>
            </CardTitle>

            {/* Status Row - Secondary info */}
            <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
              {/* Due soon badge (not overdue/urgent - those have banners) */}
              {urgency === 'soon' && dueDescription && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                  <CalendarIcon className="h-3 w-3" aria-hidden />
                  {dueDescription}
                </span>
              )}

              {/* Priority - Secondary prominence */}
              {priorityLabel && !task.completed && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                    priorityLabel === 'High' && 'bg-red-100 text-red-700',
                    priorityLabel === 'Medium' && 'bg-amber-100 text-amber-700',
                    priorityLabel === 'Low' && 'bg-slate-100 text-slate-600',
                  )}
                >
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      priorityLabel === 'High' && 'bg-red-500',
                      priorityLabel === 'Medium' && 'bg-amber-500',
                      priorityLabel === 'Low' && 'bg-slate-400',
                    )}
                  />
                  {priorityLabel}
                </span>
              )}

              {/* Archived indicator */}
              {task.archived && <span className="text-xs text-slate-400">Archived</span>}
            </div>
          </div>

          {/* Right side metadata - Tertiary */}
          <div className="hidden sm:flex flex-col items-end gap-0.5 text-xs text-slate-400 shrink-0">
            {task.dueAt && urgency === 'normal' && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarIcon className="h-3 w-3" aria-hidden />
                {formatDateTime(task.dueAt)}
              </span>
            )}
            {effortDescription && (
              <span className="inline-flex items-center gap-1.5">
                <ClockIcon className="h-3 w-3" aria-hidden />
                {effortDescription}
              </span>
            )}
            {task.project && <span className="text-purple-600 font-medium">{task.project}</span>}
          </div>
        </div>
      </CardHeader>

      {/* Secondary: Description (if exists) - 14px, 400 weight, gray-500, 1.6 line-height */}
      {task.notes && (
        <CardContent className="pt-1 pb-3">
          <p className="text-sm font-normal text-gray-500 line-clamp-2 leading-[1.6] pl-9">
            {task.notes}
          </p>
        </CardContent>
      )}

      {/* Tertiary: Tags + Actions - Least prominent */}
      <CardFooter className="pt-3 flex items-center justify-between gap-4">
        {/* Tags - Subtle, small */}
        <div className="flex flex-wrap items-center gap-2 pl-9 min-h-[28px]">
          {task.tags.length > 0
            ? task.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500"
                >
                  {tag}
                </span>
              ))
            : null}
          {task.tags.length > 3 && (
            <span className="text-[11px] text-slate-400">+{task.tags.length - 3}</span>
          )}
        </div>

        {/* Actions - Hidden by default, visible on hover with dropdown menu */}
        <div className="flex items-center gap-2 shrink-0">
          {/* More actions dropdown - appears on hover */}
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  'p-2 rounded-md transition-all duration-150',
                  menuOpen
                    ? 'bg-slate-100 text-slate-700'
                    : 'text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-600',
                )}
                title="More actions"
              >
                <MoreVerticalIcon className="h-[18px] w-[18px]" aria-hidden />
                <span className="sr-only">More actions</span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-40 p-1.5">
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => {
                    mutateTask({ archived: !task.archived });
                    setMenuOpen(false);
                  }}
                  disabled={isPending}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-slate-700 rounded-md hover:bg-slate-100 transition-colors text-left"
                >
                  {task.archived ? (
                    <>
                      <RestoreIcon className="h-4 w-4 text-slate-500" aria-hidden />
                      Restore
                    </>
                  ) : (
                    <>
                      <ArchiveIcon className="h-4 w-4 text-slate-500" aria-hidden />
                      Archive
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDelete();
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 transition-colors text-left"
                >
                  <TrashIcon className="h-4 w-4" aria-hidden />
                  Delete
                </button>
              </div>
            </PopoverContent>
          </Popover>

          <Link
            href={`/tasks/${task.id}`}
            className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-purple-100 hover:text-purple-700 transition-colors"
            onClick={event => {
              if (event.metaKey || event.ctrlKey || event.button !== 0) return;
              setOpening(true);
            }}
          >
            {opening ? (
              <>
                <LoaderIcon className="h-3.5 w-3.5 animate-spin" aria-hidden />
                <span>Opening</span>
              </>
            ) : (
              <>
                <span>Open</span>
                <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
              </>
            )}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
