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
      <CardHeader className="flex flex-col gap-2">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <SparklesIcon className="h-5 w-5 text-indigo-600" aria-hidden />
          Create a task
        </CardTitle>
        <Badge variant="secondary" className="w-fit text-xs">
          Capture details now; prioritization comes later.
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="task-title" className="flex items-center gap-1 text-sm font-medium">
            Title<span className="text-red-500">*</span>
          </Label>
          <Input
            id="task-title"
            name="title"
            value={title}
            onChange={event => setTitle(event.target.value)}
            className="mt-1"
            placeholder="Draft launch plan"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="task-dueAt" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-slate-500" aria-hidden />
              Due date &amp; time
            </Label>
            <Input
              id="task-dueAt"
              type="datetime-local"
              value={dueAt}
              onChange={event => setDueAt(event.target.value)}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="task-effort" className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-slate-500" aria-hidden />
                Estimated effort (minutes)
              </Label>
              <Input
                id="task-effort"
                type="number"
                min={5}
                max={1440}
                step={5}
                value={estimatedEffort}
                onChange={event => setEstimatedEffort(event.target.value)}
                className="mt-1"
                placeholder="60"
              />
            </div>
            <div>
              <Label htmlFor="task-importance">Importance (1-5)</Label>
              <Input
                id="task-importance"
                type="number"
                min={1}
                max={5}
                step={1}
                value={importance}
                onChange={event => setImportance(event.target.value)}
                className="mt-1"
                placeholder="3"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="task-project">Project</Label>
          <Input
            id="task-project"
            value={project}
            onChange={event => setProject(event.target.value)}
            className="mt-1"
            placeholder="Website refresh"
          />
        </div>

        <div>
          <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <TagIcon className="h-4 w-4 text-slate-500" aria-hidden />
            Tags
          </span>
          <TagInput value={tags} onChange={setTags} placeholder="Add tags and press Enter" />
        </div>

        <div>
          <Label htmlFor="task-notes">Notes</Label>
          <Textarea
            id="task-notes"
            value={notes}
            onChange={event => setNotes(event.target.value)}
            rows={4}
            className="mt-1 leading-6"
            placeholder="Add any additional context…"
          />
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
