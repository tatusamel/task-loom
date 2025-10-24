'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
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
  const [isPreview, setIsPreview] = useState(false);
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
            className="text-sm font-medium text-indigo-600 transition hover:text-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            ← Back to notes
          </Link>
          <p className="mt-2 text-xs text-slate-400">
            Last updated {new Date(note.updatedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePinToggle}
            aria-pressed={pinned}
            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            data-testid="note-editor-pin"
          >
            {pinned ? 'Unpin' : 'Pin'}
          </button>
          <button
            type="button"
            onClick={handleArchiveToggle}
            aria-pressed={archived}
            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            data-testid="note-editor-archive"
          >
            {archived ? 'Restore' : 'Archive'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            data-testid="note-editor-delete"
          >
            Delete
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label htmlFor="note-title" className="block text-sm font-semibold text-slate-700">
            Title
          </label>
          <input
            id="note-title"
            name="title"
            value={title}
            onChange={event => setTitle(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-base font-semibold text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Untitled note"
            data-testid="note-editor-title"
          />
        </div>

        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
            <label htmlFor="note-content" className="block text-sm font-semibold text-slate-700">
              Markdown
            </label>
            <div className="inline-flex rounded-md border border-slate-200 bg-white p-1 text-sm font-medium text-slate-600 shadow-sm">
              <button
                type="button"
                className={cn(
                  'rounded-sm px-3 py-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                  !isPreview ? 'bg-indigo-600 text-white shadow' : 'hover:bg-slate-100',
                )}
                onClick={() => setIsPreview(false)}
                aria-pressed={!isPreview}
                data-testid="note-editor-preview-toggle-edit"
              >
                Edit
              </button>
              <button
                type="button"
                className={cn(
                  'rounded-sm px-3 py-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                  isPreview ? 'bg-indigo-600 text-white shadow' : 'hover:bg-slate-100',
                )}
                onClick={() => setIsPreview(true)}
                aria-pressed={isPreview}
                data-testid="note-editor-preview-toggle-preview"
              >
                Preview
              </button>
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
            <textarea
              id="note-content"
              name="content"
              value={content}
              onChange={event => setContent(event.target.value)}
              rows={12}
              className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm leading-6 text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
          <div
            className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
            data-testid="note-editor-status"
          >
            {statusMessage}
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving}
            data-testid="note-editor-save"
          >
            {isSaving ? 'Saving…' : 'Save changes'}
          </button>
          <span className="text-xs text-slate-400">
            Keyboard-friendly: Tab through inputs, Enter to save.
          </span>
        </div>
      </form>
    </div>
  );
}
