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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Inbox</h1>
          <p className="mt-2 text-base text-slate-600">
            Capture everything before it becomes a task
          </p>
        </div>
        <Link
          href="/notes"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition-all hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
        >
          View all notes
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <QuickAddForm action={createQuickNoteAction} />
          <p className="text-xs text-slate-500">
            Tip: Add tags inline, e.g. &ldquo;Plan spring offsite #ops #team&rdquo;
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-slate-900">Pinned</h2>
          <span className="text-xs uppercase tracking-wide text-slate-500">Quick reference</span>
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

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-slate-900">Recent</h2>
          <span className="text-xs uppercase tracking-wide text-slate-500">Latest updates</span>
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
