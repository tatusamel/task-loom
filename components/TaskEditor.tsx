'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { TagInput } from './TagInput';
import type { TaskDTO } from '@/types/task';
import { formatDateTimeLocal } from '@/lib/utils';

interface TaskEditorProps {
  task: TaskDTO;
}

export function TaskEditor({ task }: TaskEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes ?? '');
  const [dueAt, setDueAt] = useState(formatDateTimeLocal(task.dueAt));
  const [estimatedEffort, setEstimatedEffort] = useState(
    task.estimatedEffort ? String(task.estimatedEffort) : '',
  );
  const [importance, setImportance] = useState(
    typeof task.importance === 'number' ? String(task.importance) : '',
  );
  const [project, setProject] = useState(task.project ?? '');
  const [tags, setTags] = useState<string[]>(task.tags);
  const [completed, setCompleted] = useState(task.completed);
  const [archived, setArchived] = useState(task.archived);
  const [saving, setSaving] = useState(false);

  const persist = useCallback(
    async (payload: Record<string, unknown>, successMessage: string) => {
      setSaving(true);
      try {
        const response = await fetch(`/api/tasks/${task.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const body = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(body?.error ?? 'Failed to update task.');
        }
        const updated: TaskDTO = body.task;
        setTitle(updated.title);
        setNotes(updated.notes ?? '');
        setDueAt(formatDateTimeLocal(updated.dueAt));
        setEstimatedEffort(updated.estimatedEffort ? String(updated.estimatedEffort) : '');
        setImportance(updated.importance ? String(updated.importance) : '');
        setProject(updated.project ?? '');
        setTags(updated.tags);
        setCompleted(updated.completed);
        setArchived(updated.archived);
        toast.success(successMessage);
        router.refresh();
        return true;
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : 'Failed to update task.');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [router, task.id],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await persist(
      {
        title,
        notes,
        dueAt: dueAt || null,
        estimatedEffort: estimatedEffort ? Number(estimatedEffort) : null,
        importance: importance ? Number(importance) : null,
        project: project || null,
        tags,
        completed,
        archived,
      },
      'Task updated.',
    );
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
      router.push('/tasks');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete task.');
    }
  };

  const toggleCompleted = () => {
    const next = !completed;
    setCompleted(next);
    persist({ completed: next }, next ? 'Task marked complete.' : 'Task marked active.');
  };

  const toggleArchived = () => {
    const next = !archived;
    setArchived(next);
    persist({ archived: next }, next ? 'Task archived.' : 'Task restored.');
  };

  return (
    <div className="space-y-6" data-testid="task-editor">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <Link
            href="/tasks"
            className="text-sm font-medium text-indigo-600 transition hover:text-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            ← Back to tasks
          </Link>
          <p className="mt-2 text-xs text-slate-400">
            Created {new Date(task.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleCompleted}
            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-pressed={completed}
          >
            {completed ? 'Mark active' : 'Mark complete'}
          </button>
          <button
            type="button"
            onClick={toggleArchived}
            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-pressed={archived}
          >
            {archived ? 'Restore' : 'Archive'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="task-editor-title">
            Title
          </label>
          <input
            id="task-editor-title"
            value={title}
            onChange={event => setTitle(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-base font-semibold text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
            data-testid="task-editor-title"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="task-editor-dueAt">
              Due date & time
            </label>
            <input
              id="task-editor-dueAt"
              type="datetime-local"
              value={dueAt}
              onChange={event => setDueAt(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              data-testid="task-editor-dueAt"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="task-editor-effort">
                Estimated effort (minutes)
              </label>
              <input
                id="task-editor-effort"
                type="number"
                min={5}
                max={1440}
                step={5}
                value={estimatedEffort}
                onChange={event => setEstimatedEffort(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                data-testid="task-editor-effort"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="task-editor-importance">
                Importance (1-5)
              </label>
              <input
                id="task-editor-importance"
                type="number"
                min={1}
                max={5}
                step={1}
                value={importance}
                onChange={event => setImportance(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                data-testid="task-editor-importance"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="task-editor-project">
            Project
          </label>
          <input
            id="task-editor-project"
            value={project}
            onChange={event => setProject(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            data-testid="task-editor-project"
          />
        </div>

        <div>
          <span className="block text-sm font-medium text-slate-700">Tags</span>
          <TagInput value={tags} onChange={setTags} placeholder="Add tags and press Enter" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="task-editor-notes">
            Notes
          </label>
          <textarea
            id="task-editor-notes"
            value={notes}
            onChange={event => setNotes(event.target.value)}
            rows={5}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm leading-6 text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            data-testid="task-editor-notes"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving}
            data-testid="task-editor-save"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <span className="text-xs text-slate-400">Enter submits, Tab navigates fields.</span>
        </div>
      </form>
    </div>
  );
}
