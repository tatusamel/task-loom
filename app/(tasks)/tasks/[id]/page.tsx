import { notFound } from 'next/navigation';
import { TaskEditor } from '@/components/TaskEditor';
import { getTaskById } from '@/lib/tasks';

interface TaskDetailPageProps {
  params: { id: string };
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const task = await getTaskById(params.id);
  if (!task) {
    notFound();
  }

  return <TaskEditor task={task} />;
}
