'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ArchiveIcon, RestoreIcon } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FilterField, FiltersSection } from '@/components/FiltersSection';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TagFilterPopover } from '@/components/TagFilterPopover';
import { NoteCard } from './NoteCard';
import { SearchBar } from './SearchBar';
import { EmptyState } from './EmptyState';
import type { NoteDTO, NoteStatus } from '@/types/note';

interface NotesListClientProps {
  initialNotes: NoteDTO[];
  initialQuery: string;
  initialTags: string[];
  initialStatus: NoteStatus;
  availableTags: string[];
}

const statusFilters: Array<{ label: string; value: NoteStatus }> = [
  { label: 'Active', value: 'active' },
  { label: 'Archived', value: 'archived' },
  { label: 'All notes', value: 'all' },
];

export function NotesListClient({
  initialNotes,
  initialQuery,
  initialTags,
  initialStatus,
  availableTags: _availableTags,
}: NotesListClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [notes, setNotes] = useState<NoteDTO[]>(initialNotes);
  const [query, setQuery] = useState(initialQuery);
  const [tagTokens, setTagTokens] = useState<string[]>(initialTags);
  const [status, setStatus] = useState<NoteStatus>(initialStatus || 'active');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const statusCounts = useMemo(() => {
    const counts = { active: 0, archived: 0 };
    for (const note of notes) {
      if (note.archived) {
        counts.archived += 1;
      } else {
        counts.active += 1;
      }
    }
    return { ...counts, all: notes.length };
  }, [notes]);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);
  useEffect(() => {
    setTagTokens(initialTags);
  }, [initialTags]);

  const hasSelection = selectedIds.size > 0;
  const activeTags = tagTokens;
  const filtersDirty = Boolean(query.trim()) || activeTags.length > 0 || status !== 'active';

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
  }, []);

  const handleTagsChange = useCallback((nextTags: string[]) => {
    setTagTokens(nextTags);
  }, []);

  const handleStatusChange = useCallback((nextStatus: NoteStatus) => {
    setStatus(nextStatus);
  }, []);

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
    if (activeTags.length > 0) params.set('tags', activeTags.join(','));
    if (status !== 'active') params.set('status', status);

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
  }, [activeTags, pathname, query, router, status, syncSelection]);

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

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleResetFilters = useCallback(() => {
    setQuery('');
    setTagTokens([]);
    setStatus('active');
    setSelectedIds(new Set());
  }, []);

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
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Notes</h1>
          <p className="mt-2 text-base text-slate-600">
            All your captured thoughts, organized and searchable
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="px-6 pt-6 pb-4">
          <FiltersSection
            filtersDirty={filtersDirty}
            onReset={handleResetFilters}
            layoutClassName="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr,1fr,0.9fr] xl:grid-cols-[1.6fr,1fr,1fr]"
          >
            <FilterField label="Search" className="sm:col-span-2 lg:col-span-1">
              <SearchBar
                value={query}
                onChange={handleQueryChange}
                placeholder="Search notes…"
                testId="notes-search-input"
              />
            </FilterField>

            <FilterField label="Tag" className="sm:col-span-1">
              <TagFilterPopover
                value={tagTokens}
                onChange={handleTagsChange}
                placeholder="Filter by tags..."
              />
            </FilterField>

            <FilterField label="Status" htmlFor="notes-status-filter" className="sm:col-span-1">
              <Select value={status} onValueChange={value => handleStatusChange(value as NoteStatus)}>
                <SelectTrigger
                  id="notes-status-filter"
                  data-testid="status-filter"
                  aria-label="Filter notes by status"
                  className="min-w-[180px]"
                >
                  <SelectValue placeholder="Filter by status…" />
                </SelectTrigger>
                <SelectContent>
                  {statusFilters.map(option => (
                    <SelectItem key={option.value} value={option.value} className="pr-8">
                      <span className="flex w-full items-center justify-between gap-3">
                        <span>{option.label}</span>
                        <Badge variant="secondary">
                          {option.value === 'all'
                            ? `${statusCounts.all}`
                            : option.value === 'archived'
                              ? `${statusCounts.archived}`
                              : `${statusCounts.active}`}
                        </Badge>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterField>
          </FiltersSection>
        </CardHeader>
      </Card>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div
          className={cn(
            'flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600',
            hasSelection && 'border-purple-200 bg-purple-50 text-purple-900',
          )}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-white">
              {loading ? 'Loading…' : `Showing ${notes.length} note${notes.length === 1 ? '' : 's'}`}
            </Badge>
            {filtersDirty ? (
              <span className="text-xs text-purple-700">Filters applied</span>
            ) : (
              <span className="text-xs text-slate-500">All notes</span>
            )}
          </div>
          {hasSelection ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm">{selectedIds.size} selected</span>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={handleBulkArchive}
                data-testid="bulk-archive"
              >
                {status === 'archived' ? (
                  <RestoreIcon className="h-4 w-4" aria-hidden />
                ) : (
                  <ArchiveIcon className="h-4 w-4" aria-hidden />
                )}
                {status === 'archived' ? 'Restore' : 'Archive'}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={clearSelection}>
                Clear
              </Button>
            </div>
          ) : (
            <span className="text-xs text-slate-500">
              Status: {statusFilters.find(option => option.value === status)?.label ?? 'Active'}
            </span>
          )}
        </div>

        {!loading && notes.length <= 1 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
            Only seeing a few notes? Clear filters or add more notes to fill this space.
          </div>
        ) : null}

        <section className="mt-4 grid gap-4 md:grid-cols-2">
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
    </div>
  );
}
