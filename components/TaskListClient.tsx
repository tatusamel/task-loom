'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { SearchBar } from './SearchBar';
import { EmptyState } from './EmptyState';
import { TaskCard } from './TaskCard';
import { TaskCreateForm } from './TaskCreateForm';
import { ListChecksIcon, TagIcon } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TagInput } from '@/components/TagInput';
import type { TaskDTO, TaskStatusFilter } from '@/types/task';

interface TaskListClientProps {
  initialTasks: TaskDTO[];
  initialStatus: TaskStatusFilter;
  initialQuery: string;
  initialTag: string;
  initialProject: string;
  availableTags: string[];
}

export function TaskListClient({
  initialTasks,
  initialStatus,
  initialQuery,
  initialTag,
  initialProject,
  availableTags: _availableTags,
}: TaskListClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [tasks, setTasks] = useState<TaskDTO[]>(initialTasks);
  const [status, setStatus] = useState<TaskStatusFilter>(initialStatus);
  const [query, setQuery] = useState(initialQuery);
  const [tagTokens, setTagTokens] = useState<string[]>(initialTag ? [initialTag] : []);
  const [project, setProject] = useState(initialProject);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);
  useEffect(() => {
    setTagTokens(initialTag ? [initialTag] : []);
  }, [initialTag]);

  const activeTag = tagTokens[0] ?? '';

  const fetchTasks = useCallback(async () => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (query.trim()) params.set('query', query.trim());
    if (activeTag) params.set('tag', activeTag);
    if (project.trim()) params.set('project', project.trim());

    setLoading(true);
    try {
      const response = await fetch(`/api/tasks?${params.toString()}`, {
        cache: 'no-store',
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error ?? 'Failed to load tasks.');
      }
      setTasks(payload?.tasks ?? []);

      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [activeTag, pathname, project, query, router, status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  return (
    <div className="space-y-8">
      <TaskCreateForm onCreated={fetchTasks} />

      <Card>
        <CardHeader className="space-y-4 p-6 pb-6">
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-4">
            <div className="flex-1 min-w-[220px] md:self-stretch md:pt-1">
              <SearchBar
                value={query}
                onChange={setQuery}
                placeholder="Search tasks by title, notes, or project…"
                testId="tasks-search-input"
              />
            </div>
            <div className="flex w-full flex-col gap-1 md:w-[220px] md:self-stretch">
              <span className="inline-flex items-center gap-2 font-medium text-slate-700">
                <TagIcon className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                Tag
              </span>
              <div className="max-w-xs pt-1">
                <TagInput
                  value={tagTokens}
                  onChange={next => setTagTokens(next.slice(0, 1))}
                  placeholder="Type a tag…"
                />
              </div>
            </div>
            <label
              className="flex w-full flex-col gap-1 md:w-[180px] md:self-stretch"
              htmlFor="tasks-status-filter"
            >
              <span className="font-medium text-slate-700">Status</span>
              <Select value={status} onValueChange={value => setStatus(value as TaskStatusFilter)}>
                <SelectTrigger
                  id="tasks-status-filter"
                  aria-label="Filter tasks by status"
                >
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>
            </label>
            <label
              className="flex w-full flex-col gap-1 md:w-[200px]"
              htmlFor="tasks-project-filter"
            >
              <span className="font-medium text-slate-700">Project</span>
              <Input
                id="tasks-project-filter"
                value={project}
                onChange={event => setProject(event.target.value)}
                placeholder="Project name"
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <Badge variant="secondary" className="inline-flex items-center gap-2">
              <ListChecksIcon className="h-3.5 w-3.5" aria-hidden />
              {loading ? 'Loading tasks…' : `${tasks.length} task${tasks.length === 1 ? '' : 's'}`}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2">
        {tasks.length > 0 ? (
          tasks.map(task => <TaskCard key={task.id} task={task} />)
        ) : (
          <EmptyState
            title="No tasks found"
            message="Adjust your filters or create a new task to get started."
            className="col-span-full"
          />
        )}
      </section>
    </div>
  );
}
