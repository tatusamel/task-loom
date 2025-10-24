'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'react-hot-toast';
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
    <article
      className={cn(
        'flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow',
        task.completed && 'opacity-85',
      )}
      data-testid="task-card"
    >
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => mutateTask({ completed: !task.completed })}
              disabled={isPending}
              aria-pressed={task.completed}
              className={cn(
                'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                task.completed
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200',
              )}
            >
              {task.completed ? 'Mark as active' : 'Mark complete'}
            </button>
            {task.archived ? (
              <span className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Archived
              </span>
            ) : null}
            {typeof task.importance === 'number' ? (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{`Importance ${task.importance}`}</span>
            ) : null}
          </div>
          <Link
            href={`/tasks/${task.id}`}
            className={cn(
              'mt-2 block text-lg font-semibold leading-tight text-slate-900 transition hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
              task.completed && 'line-through text-slate-500',
            )}
          >
            {task.title}
          </Link>
        </div>
        <div className="flex flex-col items-end gap-1 text-right text-xs text-slate-500">
          {task.dueAt ? (
            <>
              <span>{formatDateTime(task.dueAt)}</span>
              {dueDescription ? <span className="font-medium text-slate-600">{dueDescription}</span> : null}
            </>
          ) : (
            <span>No due date</span>
          )}
          {effortDescription ? <span>{effortDescription}</span> : null}
          {task.project ? <span className="text-indigo-600">Project: {task.project}</span> : null}
        </div>
      </header>

      {task.notes ? (
        <p className="text-sm leading-6 text-slate-600">{task.notes}</p>
      ) : (
        <p className="text-sm text-slate-400">No notes yet.</p>
      )}

      <div className="flex flex-wrap gap-2">
        {task.tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
          >
            #{tag}
          </span>
        ))}
        {task.tags.length === 0 ? (
          <span className="text-xs text-slate-400">No tags</span>
        ) : null}
      </div>

      <footer className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => mutateTask({ archived: !task.archived })}
          disabled={isPending}
          className="inline-flex items-center rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {task.archived ? 'Restore' : 'Archive'}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          Delete
        </button>
        <Link
          href={`/tasks/${task.id}`}
          className="ml-auto inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          Open
        </Link>
      </footer>
    </article>
  );
}
