import { notFound } from 'next/navigation';
import { NoteEditor } from '@/components/NoteEditor';
import { getNoteById } from '@/lib/notes';

interface NoteDetailPageProps {
  params: { id: string };
}

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
  const note = await getNoteById(params.id);

  if (!note) {
    notFound();
  }

  return <NoteEditor note={note} />;
}
