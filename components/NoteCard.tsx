'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'react-hot-toast';
import type { NoteDTO } from '@/types/note';
import { cn, formatDateTime } from '@/lib/utils';
import { renderMarkdown } from '@/lib/markdown';

interface NoteCardProps {
  note: NoteDTO;
  compact?: boolean;
  selection?: {
    selected: boolean;
    onChange: (checked: boolean) => void;
  };
}

export function NoteCard({ note, compact = false, selection }: NoteCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const showSelection = Boolean(selection);

  const mutateNote = (payload: Partial<Pick<NoteDTO, 'pinned' | 'archived'>>, success: string) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/notes/${note.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => null);
          throw new Error(errorBody?.error ?? 'Unable to update note.');
        }

        toast.success(success);
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : 'Failed to update note.');
      }
    });
  };

  const handlePinToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    mutateNote({ pinned: !note.pinned }, note.pinned ? 'Note unpinned.' : 'Note pinned.');
  };

  const handleArchiveToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    mutateNote(
      { archived: !note.archived },
      note.archived ? 'Note restored to inbox.' : 'Note archived.',
    );
  };

  const previewHtml = note.content.trim().length > 0
    ? renderMarkdown(note.content.slice(0, compact ? 240 : 360))
    : '';

  return (
    <article
      className={cn(
        'relative flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow',
        showSelection && 'pl-12 sm:pl-14',
      )}
      data-testid="note-card"
      data-note-id={note.id}
    >
      {selection ? (
        <div className="absolute left-5 top-5">
          <input
            id={`select-${note.id}`}
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            checked={selection.selected}
            onChange={event => selection.onChange(event.target.checked)}
          />
          <label htmlFor={`select-${note.id}`} className="sr-only">
            Select note {note.title}
          </label>
        </div>
      ) : null}
      <header className="flex items-start justify-between gap-4">
        <div>
          <Link
            href={`/notes/${note.id}`}
            className="text-base font-semibold text-slate-900 transition hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {note.title}
          </Link>
          <p className="mt-1 text-xs text-slate-400">
            Updated {formatDateTime(note.updatedAt)}
          </p>
        </div>
        {note.pinned ? (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
            Pinned
          </span>
        ) : null}
      </header>
      {previewHtml ? (
        <div
          className="markdown-preview mt-3 text-sm leading-relaxed text-slate-600"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      ) : (
        <p className="mt-3 text-sm text-slate-400">No content yet.</p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {note.tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
          >
            #{tag}
          </span>
        ))}
        {note.tags.length === 0 ? (
          <span className="text-xs text-slate-400">No tags</span>
        ) : null}
      </div>
      <footer className="mt-5 flex items-center gap-2">
        <button
          type="button"
          onClick={handlePinToggle}
          disabled={isPending}
          aria-pressed={note.pinned}
          className="inline-flex items-center rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          data-testid="note-card-pin"
        >
          {note.pinned ? 'Unpin' : 'Pin'}
        </button>
        <button
          type="button"
          onClick={handleArchiveToggle}
          disabled={isPending}
          aria-pressed={note.archived}
          className="inline-flex items-center rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          data-testid="note-card-archive"
        >
          {note.archived ? 'Restore' : 'Archive'}
        </button>
        <Link
          href={`/notes/${note.id}`}
          className="ml-auto inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          Open
        </Link>
      </footer>
    </article>
  );
}
