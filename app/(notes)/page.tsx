import Link from 'next/link';
import { redirect } from 'next/navigation';
import { QuickAddForm } from '@/components/QuickAddForm';
import { NoteCard } from '@/components/NoteCard';
import { EmptyState } from '@/components/EmptyState';
import { buttonVariants } from '@/components/ui/button';
import { createQuickNoteAction } from './actions';
import { getPinnedNotes, getRecentNotes } from '@/lib/notes';
import { auth } from '@/auth';
import { PinIcon, SparklesIcon } from '@/components/icons';

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
    <div className="space-y-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-[550] tracking-tight text-slate-900">Inbox</h1>
          <p className="mt-1.5 text-base text-slate-600/60">
            Capture everything before it becomes a task
          </p>
        </div>
        <Link
          href="/notes"
          className={buttonVariants({
            variant: 'secondary',
            size: 'sm',
            className: 'rounded-lg px-4',
          })}
        >
          View all notes
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 p-7 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/60">
        <div className="space-y-5">
          <QuickAddForm action={createQuickNoteAction} />
          <p className="flex items-center gap-2 text-[11px] font-medium text-slate-500/75">
            <SparklesIcon className="h-4 w-4 text-purple-500" aria-hidden />
            <span>Tip: Add tags inline, e.g. &ldquo;Plan spring offsite #ops #team&rdquo;</span>
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium text-slate-900">Pinned</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Quick reference
            </span>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2" data-testid="pinned-section">
          {pinnedNotes.length > 0 ? (
            pinnedNotes.map(note => <NoteCard key={note.id} note={note} />)
          ) : (
            <EmptyState
              className="col-span-full"
              title="No pinned notes"
              message="Pin important notes from the list or editor to keep them handy here."
              icon={<PinIcon className="h-6 w-6" aria-hidden />}
            />
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-slate-900">Recent</h2>
          <span className="text-xs uppercase tracking-wide text-slate-500">Latest updates</span>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
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
