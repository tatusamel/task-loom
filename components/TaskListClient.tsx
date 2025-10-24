'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { SearchBar } from './SearchBar';
import { EmptyState } from './EmptyState';
import { TaskCard } from './TaskCard';
import { TaskCreateForm } from './TaskCreateForm';
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
  availableTags,
}: TaskListClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [tasks, setTasks] = useState<TaskDTO[]>(initialTasks);
  const [status, setStatus] = useState<TaskStatusFilter>(initialStatus);
  const [query, setQuery] = useState(initialQuery);
  const [tag, setTag] = useState(initialTag);
  const [project, setProject] = useState(initialProject);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const sortedTags = useMemo(() => [...availableTags].sort(), [availableTags]);

  const fetchTasks = useCallback(async () => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (query.trim()) params.set('query', query.trim());
    if (tag) params.set('tag', tag);
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
  }, [pathname, project, query, router, status, tag]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  return (
    <div className="space-y-8">
      <TaskCreateForm onCreated={fetchTasks} />

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search tasks by title, notes, or project…"
            testId="tasks-search-input"
          />
          <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:flex lg:items-center lg:gap-4">
            <label className="flex flex-col text-xs uppercase tracking-wide text-slate-400">
              Status
              <select
                value={status}
                onChange={event => setStatus(event.target.value as TaskStatusFilter)}
                className="mt-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </label>
            <label className="flex flex-col text-xs uppercase tracking-wide text-slate-400">
              Tag
              <select
                value={tag}
                onChange={event => setTag(event.target.value)}
                className="mt-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All</option>
                {sortedTags.map(currentTag => (
                  <option key={currentTag} value={currentTag}>
                    #{currentTag}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col text-xs uppercase tracking-wide text-slate-400 sm:col-span-2 lg:w-56">
              Project
              <input
                value={project}
                onChange={event => setProject(event.target.value)}
                placeholder="Project name"
                className="mt-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>
        <div className="mt-4 text-xs text-slate-500">
          {loading ? 'Loading tasks…' : `${tasks.length} task${tasks.length === 1 ? '' : 's'}`}
        </div>
      </section>

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
