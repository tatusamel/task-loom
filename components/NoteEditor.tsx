'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  ArchiveIcon,
  ArrowLeftIcon,
  LoaderIcon,
  PinIcon,
  RestoreIcon,
  SparklesIcon,
  TrashIcon,
} from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TagInput } from './TagInput';
import { TiptapEditor } from './TiptapEditor';
import type { NoteDTO } from '@/types/note';

interface NoteEditorProps {
  note: NoteDTO;
}

type NoteUpdatePayload = {
  title?: string;
  content?: string;
  tags?: string[];
  pinned?: boolean;
  archived?: boolean;
  importance?: number | null;
};

export function NoteEditor({ note }: NoteEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tags, setTags] = useState<string[]>(note.tags);
  const [pinned, setPinned] = useState(note.pinned);
  const [archived, setArchived] = useState(note.archived);
  const [importanceInput, setImportanceInput] = useState<string>(
    note.importance ? String(note.importance) : '',
  );
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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
        setImportanceInput(updatedNote.importance ? String(updatedNote.importance) : '');

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
    let importanceValue: number | null | undefined = undefined;
    if (importanceInput === '') {
      importanceValue = null;
    } else if (importanceInput) {
      importanceValue = Number(importanceInput);
    }

    await persist(
      {
        title,
        content,
        tags,
        pinned,
        archived,
        importance: importanceValue,
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
    <div className="space-y-8" data-testid="note-editor">
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-indigo-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden />
            Back to notes
            <span className="ml-1 text-[11px] text-slate-500">(Esc)</span>
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="border border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50"
            onClick={handlePinToggle}
            aria-pressed={pinned}
            data-testid="note-editor-pin"
          >
            <PinIcon className="mr-2 h-4 w-4" aria-hidden />
            {pinned ? 'Unpin' : 'Pin'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="border border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50"
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
            variant="ghost"
            size="sm"
            className="border border-transparent text-rose-600 hover:border-rose-100 hover:bg-rose-50 hover:text-rose-700"
            onClick={handleDelete}
            data-testid="note-editor-delete"
          >
            <TrashIcon className="mr-2 h-4 w-4" aria-hidden />
            Delete
          </Button>
        </div>
        <p className="text-[11px] text-slate-500/70 sm:ml-auto sm:text-right">
          Last updated {new Date(note.updatedAt).toLocaleString()}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-7">
        <div className="space-y-3">
          <Label htmlFor="note-title" className="block text-sm font-semibold text-slate-700">
            Title
          </Label>
          <Input
            id="note-title"
            name="title"
            value={title}
            onChange={event => setTitle(event.target.value)}
            className="mt-1 w-full border-transparent bg-transparent px-0 py-1 text-3xl font-semibold tracking-tight placeholder:text-slate-400/70 focus:border-slate-300 focus:bg-white focus:ring-0 hover:border-slate-200"
            placeholder="Untitled note"
            data-testid="note-editor-title"
          />
          <div>
            <Label htmlFor="note-tags" className="block text-sm font-semibold text-slate-700">
              Tags
            </Label>
            <div className="mt-2" id="note-tags">
              <TagInput value={tags} onChange={setTags} placeholder="Add tags and press Enter" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <SparklesIcon className="h-4 w-4 text-slate-400" aria-hidden />
              Priority
            </Label>
            <Select
              value={importanceInput === '' ? 'none' : importanceInput}
              onValueChange={value => setImportanceInput(value === 'none' ? '' : value)}
            >
              <SelectTrigger id="note-priority">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="5">High – bubble up now</SelectItem>
                <SelectItem value="3">Medium – schedule soon</SelectItem>
                <SelectItem value="1">Low – nice to have</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="note-content" className="block text-sm font-semibold text-slate-700">
            Content
          </Label>
          <TiptapEditor
            content={content}
            onChange={setContent}
            placeholder="Start writing your note..."
            data-testid="note-editor-content"
          />
        </div>

        {statusMessage ? (
          <Badge variant="success" className="px-3 py-2 text-sm" data-testid="note-editor-status">
            {statusMessage}
          </Badge>
        ) : null}

        <div className="flex items-center gap-4">
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
          <span className="text-[11px] text-slate-500/70">
            Keyboard-friendly: Tab through inputs, Enter to save.
          </span>
          {statusMessage ? (
            <span className="text-[11px] font-medium text-emerald-600">Saved</span>
          ) : isSaving ? (
            <span className="text-[11px] font-medium text-slate-600">Saving…</span>
          ) : null}
        </div>
      </form>
    </div>
  );
}
