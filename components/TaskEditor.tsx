'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  ArchiveIcon,
  ArrowLeftIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  LoaderIcon,
  RestoreIcon,
  TagIcon,
  TrashIcon,
} from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 transition hover:text-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden />
            Back to tasks
          </Link>
          <p className="mt-2 text-xs text-slate-400">
            Created {new Date(task.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={completed ? 'secondary' : 'outline'}
            size="sm"
            onClick={toggleCompleted}
            aria-pressed={completed}
          >
            <CheckIcon className="mr-2 h-4 w-4" aria-hidden />
            {completed ? 'Mark active' : 'Mark complete'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleArchived}
            aria-pressed={archived}
          >
            {archived ? (
              <RestoreIcon className="mr-2 h-4 w-4" aria-hidden />
            ) : (
              <ArchiveIcon className="mr-2 h-4 w-4" aria-hidden />
            )}
            {archived ? 'Restore' : 'Archive'}
          </Button>
          <Button type="button" variant="destructive" size="sm" onClick={handleDelete}>
            <TrashIcon className="mr-2 h-4 w-4" aria-hidden />
            Delete
          </Button>
        </div>
      </div>

      <Card
        as="form"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <CardHeader className="flex flex-col gap-2">
          <CardTitle>Task details</CardTitle>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant={completed ? 'success' : 'secondary'}>
              {completed ? 'Completed' : 'Active'}
            </Badge>
            {archived ? <Badge variant="secondary">Archived</Badge> : null}
            {typeof task.importance === 'number' ? (
              <Badge variant="warning">{`Importance ${task.importance}`}</Badge>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="task-editor-title">Title</Label>
            <Input
              id="task-editor-title"
              value={title}
              onChange={event => setTitle(event.target.value)}
              className="mt-1 text-base font-semibold"
              required
              data-testid="task-editor-title"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="task-editor-dueAt" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-slate-500" aria-hidden />
                Due date &amp; time
              </Label>
              <Input
                id="task-editor-dueAt"
                type="datetime-local"
                value={dueAt}
                onChange={event => setDueAt(event.target.value)}
                className="mt-1"
                data-testid="task-editor-dueAt"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-editor-effort" className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-slate-500" aria-hidden />
                  Effort (minutes)
                </Label>
                <Input
                  id="task-editor-effort"
                  type="number"
                  min={5}
                  max={1440}
                  step={5}
                  value={estimatedEffort}
                  onChange={event => setEstimatedEffort(event.target.value)}
                  className="mt-1"
                  data-testid="task-editor-effort"
                />
              </div>
              <div>
                <Label htmlFor="task-editor-importance">Importance (1-5)</Label>
                <Input
                  id="task-editor-importance"
                  type="number"
                  min={1}
                  max={5}
                  step={1}
                  value={importance}
                  onChange={event => setImportance(event.target.value)}
                  className="mt-1"
                  data-testid="task-editor-importance"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="task-editor-project">Project</Label>
            <Input
              id="task-editor-project"
              value={project}
              onChange={event => setProject(event.target.value)}
              className="mt-1"
              data-testid="task-editor-project"
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
            <Label htmlFor="task-editor-notes">Notes</Label>
            <Textarea
              id="task-editor-notes"
              value={notes}
              onChange={event => setNotes(event.target.value)}
              rows={5}
              className="mt-1 leading-6"
              data-testid="task-editor-notes"
            />
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-end gap-3">
          <Button type="submit" disabled={saving} data-testid="task-editor-save">
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <LoaderIcon className="h-4 w-4 animate-spin" aria-hidden />
                Saving…
              </span>
            ) : (
              'Save changes'
            )}
          </Button>
          <span className="text-xs text-slate-400">Enter submits, Tab navigates fields.</span>
        </CardFooter>
      </Card>
    </div>
  );
}
