'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  ArchiveIcon,
  ArrowLeftIcon,
  EyeIcon,
  LoaderIcon,
  PenIcon,
  PinIcon,
  RestoreIcon,
  TrashIcon,
} from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from './TagInput';
import type { NoteDTO } from '@/types/note';
import { renderMarkdown } from '@/lib/markdown';
import { cn } from '@/lib/utils';

interface NoteEditorProps {
  note: NoteDTO;
}

type NoteUpdatePayload = {
  title?: string;
  content?: string;
  tags?: string[];
  pinned?: boolean;
  archived?: boolean;
};

export function NoteEditor({ note }: NoteEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tags, setTags] = useState<string[]>(note.tags);
  const [pinned, setPinned] = useState(note.pinned);
  const [archived, setArchived] = useState(note.archived);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const markdownPreview = useMemo(() => renderMarkdown(content || ''), [content]);

  const persist = useCallback(
    async (payload: NoteUpdatePayload, successMessage: string) => {
      setIsSaving(true);

      try {
        const response = await fetch(`/api/notes/${note.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const body = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(body?.error ?? 'Failed to update note.');
        }

        const updatedNote: NoteDTO = body.note;

        setTitle(updatedNote.title);
        setContent(updatedNote.content);
        setTags(updatedNote.tags);
        setPinned(updatedNote.pinned);
        setArchived(updatedNote.archived);

        toast.success(successMessage);
        setStatusMessage(successMessage);
        setTimeout(() => setStatusMessage(null), 4000);
        router.refresh();
        return true;
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : 'Failed to update note.');
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [note.id, router],
  );

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await persist(
      {
        title,
        content,
        tags,
        pinned,
        archived,
      },
      'Saved changes.',
    );
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Delete this note permanently?');
    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? 'Failed to delete note.');
      }

      toast.success('Note deleted.');
      router.refresh();
      router.push('/notes');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete note.');
    }
  };

  const handlePinToggle = async () => {
    await persist({ pinned: !pinned }, !pinned ? 'Pinned note.' : 'Unpinned note.');
  };

  const handleArchiveToggle = async () => {
    await persist(
      { archived: !archived },
      !archived ? 'Archived note.' : 'Restored note to inbox.',
    );
  };

  return (
    <div className="space-y-6" data-testid="note-editor">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 transition hover:text-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden />
            Back to notes
          </Link>
          <p className="mt-2 text-xs text-slate-400">
            Last updated {new Date(note.updatedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={pinned ? 'secondary' : 'outline'}
            size="sm"
            onClick={handlePinToggle}
            aria-pressed={pinned}
            data-testid="note-editor-pin"
          >
            <PinIcon className="mr-2 h-4 w-4" aria-hidden />
            {pinned ? 'Unpin' : 'Pin'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleArchiveToggle}
            aria-pressed={archived}
            data-testid="note-editor-archive"
          >
            {archived ? (
              <RestoreIcon className="mr-2 h-4 w-4" aria-hidden />
            ) : (
              <ArchiveIcon className="mr-2 h-4 w-4" aria-hidden />
            )}
            {archived ? 'Restore' : 'Archive'}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            data-testid="note-editor-delete"
          >
            <TrashIcon className="mr-2 h-4 w-4" aria-hidden />
            Delete
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <Label htmlFor="note-title" className="block text-sm font-semibold text-slate-700">
            Title
          </Label>
          <Input
            id="note-title"
            name="title"
            value={title}
            onChange={event => setTitle(event.target.value)}
            className="mt-1 w-full text-base font-semibold"
            placeholder="Untitled note"
            data-testid="note-editor-title"
          />
        </div>

        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
            <Label htmlFor="note-content" className="block text-sm font-semibold text-slate-700">
              Markdown
            </Label>
            <div className="inline-flex rounded-md border border-slate-200 bg-white p-1 text-sm font-medium text-slate-600 shadow-sm">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  'rounded-sm px-3 py-1 text-sm font-medium',
                  isPreview
                    ? '!bg-indigo-600 !text-white hover:!bg-indigo-500 hover:!text-white'
                    : '!text-black hover:!bg-gray-200 hover:!text-black',
                )}
                onClick={() => setIsPreview(true)}
                aria-pressed={isPreview}
                data-testid="note-editor-preview-toggle-preview"
              >
                <EyeIcon className="mr-2 h-4 w-4" aria-hidden />
                Preview
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  'rounded-sm px-3 py-1 text-sm font-medium',
                  !isPreview
                    ? '!bg-indigo-600 !text-white hover:!bg-indigo-500 hover:!text-white'
                    : '!text-black hover:!bg-gray-200 hover:!text-black',
                )}
                onClick={() => setIsPreview(false)}
                aria-pressed={!isPreview}
                data-testid="note-editor-preview-toggle-edit"
              >
                <PenIcon className="mr-2 h-4 w-4" aria-hidden />
                Edit
              </Button>
            </div>
            <p className="text-xs text-slate-400">
              Toggle to preview rendered Markdown before saving.
            </p>
          </div>
          {isPreview ? (
            <div
              className="markdown-preview mt-2 rounded-md border border-slate-200 bg-white p-4"
              dangerouslySetInnerHTML={{ __html: markdownPreview }}
            />
          ) : (
            <Textarea
              id="note-content"
              name="content"
              value={content}
              onChange={event => setContent(event.target.value)}
              rows={12}
              className="mt-2 w-full text-sm leading-6"
              placeholder="Write in Markdown..."
              data-testid="note-editor-content"
            />
          )}
        </div>

        <div>
          <span className="block text-sm font-semibold text-slate-700">Tags</span>
          <TagInput value={tags} onChange={setTags} placeholder="Add tags and press Enter" />
        </div>

        {statusMessage ? (
          <Badge variant="success" className="px-3 py-2 text-sm" data-testid="note-editor-status">
            {statusMessage}
          </Badge>
        ) : null}

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={isSaving}
            data-testid="note-editor-save"
          >
            {isSaving ? (
              <span className="inline-flex items-center gap-2">
                <LoaderIcon className="h-4 w-4 animate-spin" aria-hidden />
                Saving…
              </span>
            ) : (
              'Save changes'
            )}
          </Button>
          <span className="text-xs text-slate-400">
            Keyboard-friendly: Tab through inputs, Enter to save.
          </span>
        </div>
      </form>
    </div>
  );
}
