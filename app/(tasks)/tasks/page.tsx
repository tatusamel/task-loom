import { TaskListClient } from '@/components/TaskListClient';
import { getTasks } from '@/lib/tasks';
import { getAllTags } from '@/lib/tags';
import type { TaskStatusFilter } from '@/types/task';

interface TasksPageProps {
  searchParams?: {
    status?: TaskStatusFilter;
    query?: string;
    tag?: string;
    project?: string;
  };
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const status = (searchParams?.status as TaskStatusFilter) ?? 'all';
  const query = searchParams?.query ?? '';
  const tag = searchParams?.tag ?? '';
  const project = searchParams?.project ?? '';

  const [initialTasks, availableTags] = await Promise.all([
    getTasks({ status, query, tag, project }),
    getAllTags(),
  ]);

  return (
    <TaskListClient
      initialTasks={initialTasks}
      initialStatus={status}
      initialQuery={query}
      initialTag={tag}
      initialProject={project}
      availableTags={availableTags}
    />
  );
}
