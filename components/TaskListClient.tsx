'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { SearchBar } from './SearchBar';
import { EmptyState } from './EmptyState';
import { TaskCard } from './TaskCard';
import { TaskCreateForm } from './TaskCreateForm';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { FilterField, FiltersSection } from '@/components/FiltersSection';

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

  const filtersDirty = query.trim() !== '' || activeTag !== '' || status !== 'all' || project.trim() !== '';

  const handleResetFilters = useCallback(() => {
    setQuery('');
    setTagTokens([]);
    setStatus('all');
    setProject('');
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-[550] tracking-tight text-slate-900">Tasks</h1>
          <p className="mt-1.5 text-base text-slate-600/60">
            Plan, prioritize, and actually ship
          </p>
        </div>
      </div>

      <TaskCreateForm onCreated={fetchTasks} />

      <Card>
        <CardHeader className="px-7 pt-7 pb-5">
          <FiltersSection
            filtersDirty={filtersDirty}
            onReset={handleResetFilters}
            layoutClassName="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4"
            hint="Filter by search, tag, status, or project"
            resetButtonSize="default"
          >
            <FilterField
              label="Search"
              className="sm:col-span-2 lg:col-span-2"
              labelClassName="text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              <SearchBar
                value={query}
                onChange={setQuery}
                placeholder="Search tasks…"
                testId="tasks-search-input"
              />
            </FilterField>

            <FilterField
              label="Tag"
              className="sm:col-span-1"
              labelClassName="text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              <TagInput
                value={tagTokens}
                onChange={next => setTagTokens(next.slice(0, 1))}
                placeholder="Type a tag…"
              />
            </FilterField>

            <FilterField
              label="Status"
              htmlFor="tasks-status-filter"
              className="sm:col-span-1"
              labelClassName="text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              <Select value={status} onValueChange={value => setStatus(value as TaskStatusFilter)}>
                <SelectTrigger id="tasks-status-filter" aria-label="Filter tasks by status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>
            </FilterField>

            <FilterField
              label="Project"
              htmlFor="tasks-project-filter"
              className="sm:col-span-2 lg:col-span-1"
              labelClassName="text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              <Input
                id="tasks-project-filter"
                value={project}
                onChange={event => setProject(event.target.value)}
                placeholder="Project name"
              />
            </FilterField>
          </FiltersSection>
        </CardHeader>
        <CardContent className="border-t border-slate-200 pt-6">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {loading ? 'Loading…' : `${tasks.length} task${tasks.length === 1 ? '' : 's'}`}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-6 lg:grid-cols-2">
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
