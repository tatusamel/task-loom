import Link from 'next/link';
import { QuickAddForm } from '@/components/QuickAddForm';
import { NoteCard } from '@/components/NoteCard';
import { EmptyState } from '@/components/EmptyState';
import { createQuickNoteAction } from './actions';
import { getPinnedNotes, getRecentNotes } from '@/lib/notes';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const [pinnedNotes, recentNotesRaw] = await Promise.all([
    getPinnedNotes(),
    getRecentNotes(),
  ]);

  const pinnedIds = new Set(pinnedNotes.map(note => note.id));
  const recentNotes = recentNotesRaw.filter(note => !pinnedIds.has(note.id));

  return (
    <div className="space-y-10">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
            <p className="mt-1 text-sm text-slate-500">
              Capture thoughts instantly, then refine them in the editor.
            </p>
          </div>
          <div>
            <Link
              href="/notes"
              className="inline-flex items-center rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              View all notes
            </Link>
          </div>
        </div>
        <div className="mt-6">
          <QuickAddForm action={createQuickNoteAction} />
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Tip: Add tags inline, e.g. “Plan spring offsite #ops #team”.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Pinned</h2>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Quick reference
          </p>
        </div>
        <div
          className="grid gap-4 md:grid-cols-2"
          data-testid="pinned-section"
        >
          {pinnedNotes.length > 0 ? (
            pinnedNotes.map(note => (
              <NoteCard key={note.id} note={note} />
            ))
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
          <h2 className="text-lg font-semibold">Recent</h2>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Latest updates
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {recentNotes.length > 0 ? (
            recentNotes.map(note => (
              <NoteCard key={note.id} note={note} compact />
            ))
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
