import { notFound, redirect } from 'next/navigation';
import { NoteEditor } from '@/components/NoteEditor';
import { getNoteById } from '@/lib/notes';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface NoteDetailPageProps {
  params: { id: string };
}

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect('/sign-in');
  }

  const note = await getNoteById(userId, params.id);

  if (!note) {
    notFound();
  }

  return <NoteEditor note={note} />;
}
