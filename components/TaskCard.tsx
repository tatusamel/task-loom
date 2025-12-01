'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'react-hot-toast';
import {
  ArchiveIcon,
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  LoaderIcon,
  RestoreIcon,
  TagIcon,
  TrashIcon,
} from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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

export function TaskCard({ task }: TaskCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [opening, setOpening] = useState(false);

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
      ? 'P1'
      : task.importance >= 3
        ? 'P2'
        : 'P3'
    : null;

  return (
    <Card
      as="article"
      className={cn(
        'flex flex-col transition-all duration-200 ease-in-out hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] animate-[fade-in-soft_200ms_ease-out]',
        task.completed && 'opacity-60',
        urgency === 'overdue' && !task.completed && 'border-l-4 border-l-red-500',
        urgency === 'urgent' && !task.completed && 'border-l-4 border-l-amber-500',
      )}
      data-testid="task-card"
    >
      {/* Primary: Title + Status Indicator */}
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          {/* Checkbox button - compact */}
          <button
            type="button"
            onClick={() => mutateTask({ completed: !task.completed })}
            disabled={isPending}
            className={cn(
              'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
              task.completed
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-slate-300 hover:border-purple-500',
              isPending && 'opacity-50',
            )}
            aria-pressed={task.completed}
            aria-label={task.completed ? 'Mark active' : 'Mark complete'}
          >
            {isPending ? (
              <LoaderIcon className="h-3 w-3 animate-spin" aria-hidden />
            ) : task.completed ? (
              <CheckIcon className="h-3 w-3" aria-hidden />
            ) : null}
          </button>

          <div className="flex-1 min-w-0">
            {/* Title - Most prominent */}
            <CardTitle className="flex items-start gap-2">
              <Link
                href={`/tasks/${task.id}`}
                className={cn(
                  'text-lg font-semibold leading-snug transition hover:text-purple-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:rounded',
                  task.completed && 'line-through text-slate-400 font-normal',
                )}
              >
                {task.title}
              </Link>
            </CardTitle>

            {/* Status Row - High visibility for urgent items */}
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {/* Urgency Badge - Most attention-grabbing when needed */}
              {urgency === 'overdue' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                  {dueDescription}
                </span>
              )}
              {urgency === 'urgent' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Due today
                </span>
              )}
              {urgency === 'soon' && dueDescription && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                  {dueDescription}
                </span>
              )}

              {/* Priority - Secondary prominence */}
              {priorityLabel && !task.completed && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                    priorityLabel === 'P1' && 'bg-red-500 text-white',
                    priorityLabel === 'P2' && 'bg-amber-500 text-white',
                    priorityLabel === 'P3' && 'bg-green-500 text-white',
                  )}
                >
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

      {/* Secondary: Description (if exists) */}
      {task.notes && (
        <CardContent className="py-0 pb-2">
          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed pl-8">{task.notes}</p>
        </CardContent>
      )}

      {/* Tertiary: Tags + Actions - Least prominent */}
      <CardFooter className="pt-2 flex items-center justify-between gap-3">
        {/* Tags - Subtle, small */}
        <div className="flex flex-wrap items-center gap-1.5 pl-8 min-h-[24px]">
          {task.tags.length > 0
            ? task.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500"
                >
                  {tag}
                </span>
              ))
            : null}
          {task.tags.length > 3 && (
            <span className="text-[11px] text-slate-400">+{task.tags.length - 3}</span>
          )}
        </div>

        {/* Actions - Compact */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => mutateTask({ archived: !task.archived })}
            disabled={isPending}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            title={task.archived ? 'Restore task' : 'Archive task'}
          >
            {isPending ? (
              <LoaderIcon className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : task.archived ? (
              <RestoreIcon className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <ArchiveIcon className="h-3.5 w-3.5" aria-hidden />
            )}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete task"
          >
            <TrashIcon className="h-3.5 w-3.5" aria-hidden />
          </button>
          <Link
            href={`/tasks/${task.id}`}
            className="ml-1 inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-purple-100 hover:text-purple-700 transition-colors"
            onClick={event => {
              if (event.metaKey || event.ctrlKey || event.button !== 0) return;
              setOpening(true);
            }}
          >
            {opening ? (
              <>
                <LoaderIcon className="h-3 w-3 animate-spin" aria-hidden />
                <span>Opening</span>
              </>
            ) : (
              <>
                <span>Open</span>
                <ArrowRightIcon className="h-3 w-3" aria-hidden />
              </>
            )}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
