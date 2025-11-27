import Link from 'next/link';
import { redirect } from 'next/navigation';
import { QuickAddForm } from '@/components/QuickAddForm';
import { NoteCard } from '@/components/NoteCard';
import { EmptyState } from '@/components/EmptyState';
import { createQuickNoteAction } from './actions';
import { getPinnedNotes, getRecentNotes } from '@/lib/notes';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect('/sign-in');
  }

  const [pinnedNotes, recentNotesRaw] = await Promise.all([
    getPinnedNotes(userId),
    getRecentNotes(userId),
  ]);

  const pinnedIds = new Set(pinnedNotes.map(note => note.id));
  const recentNotes = recentNotesRaw.filter(note => !pinnedIds.has(note.id));

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">Inbox</h1>
            <p className="mt-1 text-sm text-slate-500">
              Capture thoughts instantly, then refine them in the editor.
            </p>
          </div>
          <Link
            href="/notes"
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            View all notes
          </Link>
        </div>
        <div className="mt-5">
          <QuickAddForm action={createQuickNoteAction} />
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Tip: Add tags inline, e.g. &ldquo;Plan spring offsite #ops #team&rdquo;.
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Pinned</h2>
          <span className="text-xs text-slate-400">Quick reference</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2" data-testid="pinned-section">
          {pinnedNotes.length > 0 ? (
            pinnedNotes.map(note => <NoteCard key={note.id} note={note} />)
          ) : (
            <EmptyState
              className="col-span-full"
              title="No pinned notes"
              message="Pin important notes from the list or editor to keep them handy here."
            />
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Recent</h2>
          <span className="text-xs text-slate-400">Latest updates</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {recentNotes.length > 0 ? (
            recentNotes.map(note => <NoteCard key={note.id} note={note} compact />)
          ) : (
            <EmptyState
              className="col-span-full"
              title="Nothing new yet"
              message="Create a note to see it appear here instantly."
            />
          )}
        </div>
      </section>
    </div>
  );
}
