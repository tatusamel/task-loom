import { redirect } from 'next/navigation';
import { TaskListClient } from '@/components/TaskListClient';
import { getTasks } from '@/lib/tasks';
import { getAllTags } from '@/lib/tags';
import type { TaskStatusFilter } from '@/types/task';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface TasksPageProps {
  searchParams?: {
    status?: TaskStatusFilter;
    query?: string;
    tag?: string;
    project?: string;
  };
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect('/sign-in');
  }

  const status = (searchParams?.status as TaskStatusFilter) ?? 'all';
  const query = searchParams?.query ?? '';
  const tag = searchParams?.tag ?? '';
  const project = searchParams?.project ?? '';

  const [initialTasks, availableTags] = await Promise.all([
    getTasks({ userId, status, query, tag, project }),
    getAllTags(userId),
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
