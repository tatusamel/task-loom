import { NotesListClient } from '@/components/NotesListClient';
import { getAllTags, getNotes } from '@/lib/notes';
import { NoteStatus } from '@/types/note';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface NotesPageProps {
  searchParams?: {
    query?: string;
    tag?: string;
    status?: NoteStatus;
  };
}

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const query = searchParams?.query ?? '';
  const tag = searchParams?.tag ?? '';
  const status = (searchParams?.status as NoteStatus) ?? 'active';

  const [initialNotes, availableTags] = await Promise.all([
    getNotes({ query, tag, status }),
    getAllTags(),
  ]);

  return (
    <NotesListClient
      initialNotes={initialNotes}
      initialQuery={query}
      initialTag={tag}
      initialStatus={status}
      availableTags={availableTags}
    />
  );
}
