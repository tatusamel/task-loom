'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { NoteCard } from './NoteCard';
import { SearchBar } from './SearchBar';
import { EmptyState } from './EmptyState';
import type { NoteDTO, NoteStatus } from '@/types/note';

interface NotesListClientProps {
  initialNotes: NoteDTO[];
  initialQuery: string;
  initialTag: string;
  initialStatus: NoteStatus;
  availableTags: string[];
}

export function NotesListClient({
  initialNotes,
  initialQuery,
  initialTag,
  initialStatus,
  availableTags,
}: NotesListClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [notes, setNotes] = useState<NoteDTO[]>(initialNotes);
  const [query, setQuery] = useState(initialQuery);
  const [tag, setTag] = useState(initialTag);
  const [status, setStatus] = useState<NoteStatus>(initialStatus || 'active');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  const sortedTags = useMemo(() => [...availableTags].sort(), [availableTags]);
  const hasSelection = selectedIds.size > 0;

  const syncSelection = useCallback((nextNotes: NoteDTO[]) => {
    setSelectedIds(prev => {
      const keep = new Set<string>();
      for (const id of prev) {
        if (nextNotes.some(note => note.id === id)) {
          keep.add(id);
        }
      }
      return keep;
    });
  }, []);

  const fetchNotes = useCallback(async () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('query', query.trim());
    if (tag) params.set('tag', tag);
    if (status) params.set('status', status);

    setLoading(true);
    try {
      const response = await fetch(`/api/notes?${params.toString()}`, {
        cache: 'no-store',
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? 'Failed to load notes.');
      }

      const list: NoteDTO[] = payload?.notes ?? [];
      setNotes(list);
      syncSelection(list);

      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to load notes.');
    } finally {
      setLoading(false);
    }
  }, [pathname, query, router, status, syncSelection, tag]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotes();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchNotes]);

  const toggleSelection = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleBulkArchive = async () => {
    if (selectedIds.size === 0) {
      toast('Select one or more notes to update.');
      return;
    }

    const shouldArchive = status !== 'archived';

    try {
      const responses = await Promise.all(
        Array.from(selectedIds).map(id =>
          fetch(`/api/notes/${id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ archived: shouldArchive }),
          }),
        ),
      );

      const failed = responses.find(res => !res.ok);
      if (failed) {
        const body = await failed.json().catch(() => null);
        throw new Error(body?.error ?? 'Bulk update failed.');
      }

      toast.success(shouldArchive ? 'Selected notes archived.' : 'Selected notes restored.');
      clearSelection();
      await fetchNotes();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Bulk update failed.');
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search by title or content…"
            testId="notes-search-input"
          />
          <div className="flex flex-col gap-2 text-sm text-slate-600 md:flex-row md:items-center">
            <label className="flex items-center gap-2">
              <span className="font-medium">Tag</span>
              <select
                value={tag}
                onChange={event => setTag(event.target.value)}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                data-testid="tag-filter"
              >
                <option value="">All</option>
                {sortedTags.map(currentTag => (
                  <option key={currentTag} value={currentTag}>
                    #{currentTag}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="font-medium">Status</span>
              <select
                value={status}
                onChange={event => setStatus(event.target.value as NoteStatus)}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                data-testid="status-filter"
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
                <option value="all">All</option>
              </select>
            </label>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>
            {loading ? 'Loading notes…' : `${notes.length} note${notes.length === 1 ? '' : 's'}`}
          </span>
          {hasSelection ? <span>• {selectedIds.size} selected</span> : null}
        </div>
        {hasSelection ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleBulkArchive}
              className="inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              data-testid="bulk-archive"
            >
              {status === 'archived' ? 'Restore selected' : 'Archive selected'}
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="inline-flex items-center rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Clear selection
            </button>
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {notes.length > 0 ? (
          notes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              selection={{
                selected: selectedIds.has(note.id),
                onChange: checked => toggleSelection(note.id, checked),
              }}
            />
          ))
        ) : (
          <EmptyState
            title="No notes match your filters"
            message="Try adjusting the filters or clear the search to see more notes."
            className="col-span-full"
          />
        )}
      </section>
    </div>
  );
}
