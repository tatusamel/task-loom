import { notFound, redirect } from 'next/navigation';
import { TaskEditor } from '@/components/TaskEditor';
import { getTaskById } from '@/lib/tasks';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface TaskDetailPageProps {
  params: { id: string };
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect('/sign-in');
  }

  const task = await getTaskById(userId, params.id);
  if (!task) {
    notFound();
  }

  return <TaskEditor task={task} />;
}
