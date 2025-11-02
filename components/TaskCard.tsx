'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
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

export function TaskCard({ task }: TaskCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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

  return (
    <Card
      as="article"
      className={cn('flex flex-col gap-2', task.completed && 'opacity-85')}
      data-testid="task-card"
    >
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={task.completed ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => mutateTask({ completed: !task.completed })}
              disabled={isPending}
              aria-pressed={task.completed}
            >
              {isPending ? (
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <CheckIcon className="mr-2 h-4 w-4" aria-hidden />
              )}
              {task.completed ? 'Mark active' : 'Mark complete'}
            </Button>
            {task.archived ? (
              <Badge variant="secondary">Archived</Badge>
            ) : null}
            {typeof task.importance === 'number' ? (
              <Badge variant="warning">{`Importance ${task.importance}`}</Badge>
            ) : null}
          </div>
          <CardTitle>
            <Link
              href={`/tasks/${task.id}`}
              className={cn(
                'transition hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                task.completed && 'line-through text-slate-500',
              )}
            >
              {task.title}
            </Link>
          </CardTitle>
        </div>
        <div className="flex flex-col items-end gap-1 text-right text-xs text-slate-500">
          {task.dueAt ? (
            <>
              <span className="inline-flex items-center gap-2">
                <CalendarIcon className="h-3.5 w-3.5" aria-hidden />
                {formatDateTime(task.dueAt)}
              </span>
              {dueDescription ? (
                <span className="font-medium text-slate-600">{dueDescription}</span>
              ) : null}
            </>
          ) : (
            <span className="inline-flex items-center gap-2 text-slate-400">
              <CalendarIcon className="h-3.5 w-3.5" aria-hidden />
              No due date
            </span>
          )}
          {effortDescription ? (
            <span className="inline-flex items-center gap-2">
              <ClockIcon className="h-3.5 w-3.5" aria-hidden />
              {effortDescription}
            </span>
          ) : null}
          {task.project ? (
            <Badge variant="default" className="mt-1">
              {task.project}
            </Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {task.notes ? (
          <p className="text-sm leading-6 text-slate-600">{task.notes}</p>
        ) : (
          <p className="text-sm text-slate-400">No notes yet.</p>
        )}

        <div className="flex flex-wrap gap-2">
          {task.tags.map(tag => (
            <Badge
              key={tag}
              variant="secondary"
              className="inline-flex items-center gap-1 text-xs font-medium"
            >
              <TagIcon className="h-3 w-3" aria-hidden />
              {tag}
            </Badge>
          ))}
          {task.tags.length === 0 ? (
            <span className="text-xs text-slate-400">No tags</span>
          ) : null}
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => mutateTask({ archived: !task.archived })}
          disabled={isPending}
        >
          {isPending ? (
            <LoaderIcon className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          ) : task.archived ? (
            <RestoreIcon className="mr-2 h-4 w-4" aria-hidden />
          ) : (
            <ArchiveIcon className="mr-2 h-4 w-4" aria-hidden />
          )}
          {task.archived ? 'Restore' : 'Archive'}
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleDelete}
        >
          <TrashIcon className="mr-2 h-4 w-4" aria-hidden />
          Delete
        </Button>
        <Link
          href={`/tasks/${task.id}`}
          className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'ml-auto')}
        >
          Open
          <ArrowRightIcon className="ml-2 h-4 w-4" aria-hidden />
        </Link>
      </CardFooter>
    </Card>
  );
}
