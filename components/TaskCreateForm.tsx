'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { TagInput } from './TagInput';

function normalizeTagInput(tags: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const tag of tags) {
    const trimmed = tag.trim().toLowerCase();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    normalized.push(trimmed);
  }

  return normalized;
}

interface TaskCreateFormProps {
  onCreated?: () => void;
}

export function TaskCreateForm({ onCreated }: TaskCreateFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [estimatedEffort, setEstimatedEffort] = useState('');
  const [importance, setImportance] = useState('');
  const [project, setProject] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setTitle('');
    setNotes('');
    setDueAt('');
    setEstimatedEffort('');
    setImportance('');
    setProject('');
    setTags([]);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          notes: notes.trim() || undefined,
          dueAt: dueAt || undefined,
          estimatedEffort: estimatedEffort ? Number(estimatedEffort) : undefined,
          importance: importance ? Number(importance) : undefined,
          project: project || undefined,
          tags: normalizeTagInput(tags),
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          payload?.error?.formErrors?.[0] ??
            payload?.error ??
            'Unable to create task. Please review the fields.',
        );
      }

      toast.success('Task created.');
      resetForm();
      router.refresh();
      onCreated?.();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      data-testid="task-create-form"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Create a task</h2>
        <p className="text-xs text-slate-400">Capture details now; prioritization comes later.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="task-title">
          Title<span className="text-red-500">*</span>
        </label>
        <input
          id="task-title"
          name="title"
          value={title}
          onChange={event => setTitle(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Draft launch plan"
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="task-dueAt">
            Due date & time
          </label>
          <input
            id="task-dueAt"
            type="datetime-local"
            value={dueAt}
            onChange={event => setDueAt(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="task-effort">
              Estimated effort (minutes)
            </label>
            <input
              id="task-effort"
              type="number"
              min={5}
              max={1440}
              step={5}
              value={estimatedEffort}
              onChange={event => setEstimatedEffort(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="60"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="task-importance">
              Importance (1-5)
            </label>
            <input
              id="task-importance"
              type="number"
              min={1}
              max={5}
              step={1}
              value={importance}
              onChange={event => setImportance(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="3"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="task-project">
          Project
        </label>
        <input
          id="task-project"
          value={project}
          onChange={event => setProject(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Website refresh"
        />
      </div>

      <div>
        <span className="block text-sm font-medium text-slate-700">Tags</span>
        <TagInput value={tags} onChange={setTags} placeholder="Add tags and press Enter" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="task-notes">
          Notes
        </label>
        <textarea
          id="task-notes"
          value={notes}
          onChange={event => setNotes(event.target.value)}
          rows={4}
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm leading-6 text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Add any additional context…"
        />
      </div>

      <div className="flex items-center justify-end">
        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? 'Saving…' : 'Add task'}
        </button>
      </div>
    </form>
  );
}
