'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { ChevronDownIcon, ChevronRightIcon, ClockIcon, ListChecksIcon } from '@/components/icons';
import { cn, formatTotalEffort } from '@/lib/utils';

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
  const [showCompleted, setShowCompleted] = useState(false);

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

  const filtersDirty =
    query.trim() !== '' || activeTag !== '' || status !== 'all' || project.trim() !== '';

  // Separate active and completed/archived tasks
  const { activeTasks, completedTasks, stats } = useMemo(() => {
    const active: TaskDTO[] = [];
    const completed: TaskDTO[] = [];
    let totalEffort = 0;
    let activeEffort = 0;
    let completedEffort = 0;

    for (const task of tasks) {
      const effort = task.estimatedEffort ?? 0;
      totalEffort += effort;

      if (task.completed || task.archived) {
        completed.push(task);
        completedEffort += effort;
      } else {
        active.push(task);
        activeEffort += effort;
      }
    }

    return {
      activeTasks: active,
      completedTasks: completed,
      stats: {
        total: tasks.length,
        activeCount: active.length,
        completedCount: completed.length,
        totalEffort,
        activeEffort,
        completedEffort,
      },
    };
  }, [tasks]);

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
          <p className="mt-1.5 text-base text-slate-600/60">Plan, prioritize, and actually ship</p>
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
          {/* Task Summary Stats */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-medium">
                {loading ? 'Loading…' : `${stats.total} task${stats.total === 1 ? '' : 's'}`}
              </Badge>
              {stats.totalEffort > 0 && (
                <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                  <ClockIcon className="h-3.5 w-3.5" aria-hidden />
                  {formatTotalEffort(stats.totalEffort)} total
                </span>
              )}
            </div>
            {stats.activeCount > 0 && (
              <span className="text-sm text-slate-600">
                <span className="font-medium text-slate-700">{stats.activeCount}</span> active
                {stats.activeEffort > 0 && (
                  <span className="text-slate-400"> • {formatTotalEffort(stats.activeEffort)}</span>
                )}
              </span>
            )}
            {stats.completedCount > 0 && (
              <span className="text-sm text-slate-500">
                <span className="font-medium">{stats.completedCount}</span> completed
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Active Tasks
          </h2>
          <div className="grid gap-5 lg:grid-cols-2">
            {activeTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {tasks.length === 0 && (
        <EmptyState
          title="No tasks found"
          message="Adjust your filters or create a new task to get started."
          className="col-span-full"
          icon={<ListChecksIcon className="h-6 w-6 text-purple-500" aria-hidden />}
        />
      )}

      {/* Completed/Archived Tasks - Collapsible */}
      {completedTasks.length > 0 && (
        <section className="space-y-4">
          <button
            type="button"
            onClick={() => setShowCompleted(!showCompleted)}
            className="group flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
          >
            {showCompleted ? (
              <ChevronDownIcon
                className="h-4 w-4 text-slate-400 transition group-hover:text-slate-500"
                aria-hidden
              />
            ) : (
              <ChevronRightIcon
                className="h-4 w-4 text-slate-400 transition group-hover:text-slate-500"
                aria-hidden
              />
            )}
            <span className="uppercase tracking-wide">Completed ({completedTasks.length})</span>
            {!showCompleted && stats.completedEffort > 0 && (
              <span className="font-normal normal-case text-slate-400">
                • {formatTotalEffort(stats.completedEffort)}
              </span>
            )}
          </button>

          {showCompleted && (
            <div className="grid gap-5 lg:grid-cols-2">
              {completedTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
