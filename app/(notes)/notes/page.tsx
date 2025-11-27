import { redirect } from 'next/navigation';
import { NotesListClient } from '@/components/NotesListClient';
import { getAllTags, getNotes } from '@/lib/notes';
import { NoteStatus } from '@/types/note';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface NotesPageProps {
  searchParams?: {
    query?: string;
    tag?: string | string[];
    tags?: string | string[];
    status?: NoteStatus;
  };
}

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect('/sign-in');
  }

  const query = searchParams?.query ?? '';
  const tagParam = searchParams?.tags ?? searchParams?.tag ?? '';
  const tagTokens = Array.isArray(tagParam)
    ? tagParam.flatMap(value => value.split(','))
    : tagParam.split(',');
  const tags = tagTokens.map(tag => tag.trim()).filter(Boolean);
  const status = (searchParams?.status as NoteStatus) ?? 'active';

  const [initialNotes, availableTags] = await Promise.all([
    getNotes({ userId, query, tags, status }),
    getAllTags(userId),
  ]);

  return (
    <NotesListClient
      initialNotes={initialNotes}
      initialQuery={query}
      initialTags={tags}
      initialStatus={status}
      availableTags={availableTags}
    />
  );
}
