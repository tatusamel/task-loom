import { notFound } from 'next/navigation';
import { validateShareToken } from '@/lib/sharing';
import { SharedNoteEditor } from '@/components/SharedNoteEditor';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface SharedNotePageProps {
  params: { token: string };
}

export default async function SharedNotePage({ params }: SharedNotePageProps) {
  const result = await validateShareToken(params.token);

  if (!result) {
    notFound();
  }

  const { note, permission } = result;

  return (
    <SharedNoteEditor
      noteId={note.id}
      noteTitle={note.title}
      noteContent={note.content}
      permission={permission}
      shareToken={params.token}
    />
  );
}

export async function generateMetadata({ params }: SharedNotePageProps) {
  const result = await validateShareToken(params.token);

  if (!result) {
    return {
      title: 'Note not found',
    };
  }

  return {
    title: `${result.note.title || 'Untitled'} - Shared Note | Task Loom`,
    description: 'A shared note from Task Loom',
  };
}
