'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArchiveIcon,
  ArrowRightIcon,
  LoaderIcon,
  MoreVerticalIcon,
  PinIcon,
  RestoreIcon,
  TagIcon,
} from '@/components/icons';
import type { NoteDTO } from '@/types/note';
import { cn, formatDateTime, getTagTone } from '@/lib/utils';
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
  const selectionInset = showSelection ? 'pl-10 sm:pl-11' : '';

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
    <Card
      as="article"
      className={cn(
        'group relative flex flex-col transition-all duration-150',
        selection?.selected
          ? 'ring-2 ring-purple-200 bg-purple-50/60 shadow-md'
          : 'hover:-translate-y-0.5 hover:shadow-lg',
      )}
      data-testid="note-card"
      data-note-id={note.id}
    >
      {selection ? (
        <div className="absolute left-4 top-6 sm:left-5">
          <input
            id={`select-${note.id}`}
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
            checked={selection.selected}
            onChange={event => selection.onChange(event.target.checked)}
          />
          <label htmlFor={`select-${note.id}`} className="sr-only">
            Select note {note.title}
          </label>
        </div>
      ) : null}
      <CardHeader
        className={cn('flex flex-row items-start justify-between gap-4 pb-2', selectionInset)}
      >
        <div className="space-y-2">
          <CardTitle>
            <Link
              href={`/notes/${note.id}`}
              className="transition hover:text-purple-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:rounded"
            >
              {note.title}
            </Link>
          </CardTitle>
          <p className="text-[11px] font-medium text-slate-500/70">
            Updated {formatDateTime(note.updatedAt)}
          </p>
        </div>
        <div className="flex items-start gap-2">
          {note.pinned ? (
            <Badge variant="warning" className="inline-flex items-center gap-1">
              <PinIcon className="h-3 w-3" aria-hidden />
              Pinned
            </Badge>
          ) : null}
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white/80 p-1 opacity-0 shadow-sm transition hover:opacity-100 focus-within:opacity-100 group-hover:opacity-100">
            <button
              type="button"
              onClick={handlePinToggle}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-purple-700 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1"
              title={note.pinned ? 'Unpin note' : 'Pin note'}
              aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
            >
              <PinIcon className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={handleArchiveToggle}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-purple-700 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1"
              title={note.archived ? 'Restore to inbox' : 'Archive note'}
              aria-label={note.archived ? 'Restore to inbox' : 'Archive note'}
            >
              {note.archived ? (
                <RestoreIcon className="h-4 w-4" aria-hidden />
              ) : (
                <ArchiveIcon className="h-4 w-4" aria-hidden />
              )}
            </button>
            <Link
              href={`/notes/${note.id}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-purple-700 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1"
              title="Open note"
              aria-label="Open note"
            >
              <MoreVerticalIcon className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className={cn('flex flex-col gap-5 pt-3', selectionInset)}>
        {previewHtml ? (
          <div
            className="markdown-preview text-sm leading-relaxed text-slate-600"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        ) : (
          <p className="text-sm text-slate-500">No content yet.</p>
        )}
        <div className="flex flex-wrap gap-2">
          {note.tags.map(tag => {
            const tone = getTagTone(tag);
            return (
              <Badge
                key={tag}
                variant="secondary"
                className={cn(
                  'border border-transparent px-2 py-1 text-[11px] shadow-none transition hover:-translate-y-0.5 hover:shadow-sm rounded-lg',
                  tone.background,
                  tone.text,
                  tone.ring,
                )}
              >
                <span className="inline-flex items-center gap-1">
                  <TagIcon className={cn('h-3 w-3 opacity-70', tone.icon)} aria-hidden />
                  {tag}
                </span>
              </Badge>
            );
          })}
          {note.tags.length === 0 ? (
            <span className="text-xs text-slate-500">No tags</span>
          ) : null}
        </div>
      </CardContent>
      <CardFooter className={cn('mt-auto flex flex-wrap gap-2 pt-3', selectionInset)}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="border border-transparent hover:border-slate-200"
          onClick={handlePinToggle}
          disabled={isPending}
          title={note.pinned ? 'Unpin note' : 'Pin note'}
          aria-pressed={note.pinned}
          data-testid="note-card-pin"
        >
          {isPending ? (
            <LoaderIcon className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <PinIcon className="h-4 w-4" aria-hidden />
          )}
          <span className="sr-only">{note.pinned ? 'Unpin' : 'Pin'}</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="border border-transparent hover:border-slate-200"
          onClick={handleArchiveToggle}
          disabled={isPending}
          title={note.archived ? 'Restore note' : 'Archive note'}
          aria-pressed={note.archived}
          data-testid="note-card-archive"
        >
          {isPending ? (
            <LoaderIcon className="h-4 w-4 animate-spin" aria-hidden />
          ) : note.archived ? (
            <RestoreIcon className="h-4 w-4" aria-hidden />
          ) : (
            <ArchiveIcon className="h-4 w-4" aria-hidden />
          )}
          <span className="sr-only">{note.archived ? 'Restore' : 'Archive'}</span>
        </Button>
        <Link
          href={`/notes/${note.id}`}
          className={cn(buttonVariants({ variant: 'default', size: 'sm' }), 'group ml-auto h-9 px-3')}
        >
          Open
          <ArrowRightIcon className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" aria-hidden />
        </Link>
      </CardFooter>
    </Card>
  );
}
