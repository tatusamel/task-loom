'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { SearchBar } from './SearchBar';
import { EmptyState } from './EmptyState';
import { TaskCard } from './TaskCard';
import { TaskCreateForm } from './TaskCreateForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';

function FilterField({
  label,
  children,
  className,
  htmlFor,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <div className={cn('flex w-full flex-col gap-1.5 sm:w-auto', className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

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
    <div className="space-y-6">
      <TaskCreateForm onCreated={fetchTasks} />

      <Card>
        <CardHeader className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <FilterField label="Search" className="flex-1 min-w-[200px]">
              <SearchBar
                value={query}
                onChange={setQuery}
                placeholder="Search tasks…"
                testId="tasks-search-input"
              />
            </FilterField>

            <FilterField label="Tag" className="w-full lg:w-[180px]">
              <TagInput
                value={tagTokens}
                onChange={next => setTagTokens(next.slice(0, 1))}
                placeholder="Type a tag…"
              />
            </FilterField>

            <FilterField label="Status" htmlFor="tasks-status-filter" className="w-full lg:w-[140px]">
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

            <FilterField label="Project" htmlFor="tasks-project-filter" className="w-full lg:w-[160px]">
              <Input
                id="tasks-project-filter"
                value={project}
                onChange={event => setProject(event.target.value)}
                placeholder="Project name"
              />
            </FilterField>

            <Button
              type="button"
              variant="ghost"
              size="default"
              onClick={handleResetFilters}
              disabled={!filtersDirty}
              className="h-10 self-end"
            >
              Clear filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="border-t border-slate-100 pt-4">
          <Badge variant="secondary">
            {loading ? 'Loading…' : `${tasks.length} task${tasks.length === 1 ? '' : 's'}`}
          </Badge>
        </CardContent>
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
