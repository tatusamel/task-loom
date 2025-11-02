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
  PinIcon,
  RestoreIcon,
  TagIcon,
} from '@/components/icons';
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
      className="relative flex flex-col"
      data-testid="note-card"
      data-note-id={note.id}
    >
      {selection ? (
        <div className="absolute left-4 top-6 sm:left-5">
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
      <CardHeader className={cn('flex flex-row items-start justify-between gap-4', selectionInset)}>
        <div className="space-y-1">
          <CardTitle>
            <Link
              href={`/notes/${note.id}`}
              className="transition hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {note.title}
            </Link>
          </CardTitle>
          <p className="text-xs text-slate-400">Updated {formatDateTime(note.updatedAt)}</p>
        </div>
        {note.pinned ? (
          <Badge variant="warning" className="inline-flex items-center gap-1">
            <PinIcon className="h-3 w-3" aria-hidden />
            Pinned
          </Badge>
        ) : null}
      </CardHeader>
      <CardContent className={cn('flex flex-col gap-4', selectionInset)}>
        {previewHtml ? (
          <div
            className="markdown-preview text-sm leading-relaxed text-slate-600"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        ) : (
          <p className="text-sm text-slate-400">No content yet.</p>
        )}
        <div className="flex flex-wrap gap-2">
          {note.tags.map(tag => (
            <Badge
              key={tag}
              variant="secondary"
              className="inline-flex items-center gap-1 text-xs font-medium"
            >
              <TagIcon className="h-3 w-3" aria-hidden />
              {tag}
            </Badge>
          ))}
          {note.tags.length === 0 ? (
            <span className="text-xs text-slate-400">No tags</span>
          ) : null}
        </div>
      </CardContent>
      <CardFooter className={cn('mt-auto flex flex-wrap gap-2', selectionInset)}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePinToggle}
          disabled={isPending}
          aria-pressed={note.pinned}
          data-testid="note-card-pin"
        >
          {isPending ? (
            <LoaderIcon className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <PinIcon className="mr-2 h-4 w-4" aria-hidden />
          )}
          {note.pinned ? 'Unpin' : 'Pin'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleArchiveToggle}
          disabled={isPending}
          aria-pressed={note.archived}
          data-testid="note-card-archive"
        >
          {isPending ? (
            <LoaderIcon className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          ) : note.archived ? (
            <RestoreIcon className="mr-2 h-4 w-4" aria-hidden />
          ) : (
            <ArchiveIcon className="mr-2 h-4 w-4" aria-hidden />
          )}
          {note.archived ? 'Restore' : 'Archive'}
        </Button>
        <Link
          href={`/notes/${note.id}`}
          className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'ml-auto')}
        >
          Open
          <ArrowRightIcon className="ml-2 h-4 w-4" aria-hidden />
        </Link>
      </CardFooter>
    </Card>
  );
}
