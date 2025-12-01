'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  CalendarIcon,
  ClockIcon,
  LoaderIcon,
  SparklesIcon,
  TagIcon,
} from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    <Card as="form" onSubmit={handleSubmit} className="space-y-4" data-testid="task-create-form">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
            <SparklesIcon className="h-5 w-5 text-purple-600" aria-hidden />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">Create a task</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Capture details now; prioritization comes later</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="task-title" className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Title<span className="text-rose-500 ml-0.5">*</span>
          </Label>
          <div className="mt-1">
            <Input
              id="task-title"
              name="title"
              value={title}
              onChange={event => setTitle(event.target.value)}
              placeholder="Draft launch plan"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="task-dueAt" className="text-xs font-medium uppercase tracking-wide text-slate-500 flex items-center gap-2">
              <CalendarIcon className="h-3.5 w-3.5" aria-hidden />
              Due date &amp; time
            </Label>
            <div className="mt-1">
              <Input
                id="task-dueAt"
                type="datetime-local"
                value={dueAt}
                onChange={event => setDueAt(event.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="task-effort" className="text-xs font-medium uppercase tracking-wide text-slate-500 flex items-center gap-2">
              <ClockIcon className="h-3.5 w-3.5" aria-hidden />
              Effort (minutes)
            </Label>
            <div className="mt-1">
              <Input
                id="task-effort"
                type="number"
                min={5}
                max={1440}
                step={5}
                value={estimatedEffort}
                onChange={event => setEstimatedEffort(event.target.value)}
                placeholder="60"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="task-importance" className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Importance (1-5)
          </Label>
          <div className="mt-2 inline-flex w-full rounded-xl border border-slate-200 bg-slate-50 p-1">
            {[1, 2, 3, 4, 5].map(level => (
              <button
                key={level}
                type="button"
                onClick={() => setImportance(String(level))}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  importance === String(level)
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="task-project" className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Project
          </Label>
          <div className="mt-1">
            <Input
              id="task-project"
              value={project}
              onChange={event => setProject(event.target.value)}
              placeholder="Website refresh"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs font-medium uppercase tracking-wide text-slate-500 flex items-center gap-2">
            <TagIcon className="h-3.5 w-3.5" aria-hidden />
            Tags
          </Label>
          <div className="mt-1">
            <TagInput value={tags} onChange={setTags} placeholder="Add tags and press Enter" />
          </div>
        </div>

        <div>
          <Label htmlFor="task-notes" className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Notes
          </Label>
          <div className="mt-1">
            <Textarea
              id="task-notes"
              value={notes}
              onChange={event => setNotes(event.target.value)}
              rows={4}
              className="leading-6"
              placeholder="Add any additional context…"
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <LoaderIcon className="h-4 w-4 animate-spin" aria-hidden />
              Saving…
            </span>
          ) : (
            'Add task'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
