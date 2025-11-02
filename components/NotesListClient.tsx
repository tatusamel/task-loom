'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ArchiveIcon, RestoreIcon, TagIcon } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TagInput } from '@/components/TagInput';
import { NoteCard } from './NoteCard';
import { SearchBar } from './SearchBar';
import { EmptyState } from './EmptyState';
import type { NoteDTO, NoteStatus } from '@/types/note';

interface NotesListClientProps {
  initialNotes: NoteDTO[];
  initialQuery: string;
  initialTag: string;
  initialStatus: NoteStatus;
}

function FilterField({
  label,
  icon,
  children,
  className,
}: {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex w-full min-w-[180px] flex-col gap-2 sm:w-auto', className)}>
      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </span>
      {children}
    </div>
  );
}

const statusFilters: Array<{ label: string; value: NoteStatus }> = [
  { label: 'Active', value: 'active' },
  { label: 'Archived', value: 'archived' },
  { label: 'All notes', value: 'all' },
];

export function NotesListClient({
  initialNotes,
  initialQuery,
  initialTag,
  initialStatus,
}: NotesListClientProps) {

  const router = useRouter();
  const pathname = usePathname();

  const [notes, setNotes] = useState<NoteDTO[]>(initialNotes);
  const [query, setQuery] = useState(initialQuery);
  const [tagTokens, setTagTokens] = useState<string[]>(initialTag ? [initialTag] : []);
  const [status, setStatus] = useState<NoteStatus>(initialStatus || 'active');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);
  useEffect(() => {
    setTagTokens(initialTag ? [initialTag] : []);
  }, [initialTag]);

  const hasSelection = selectedIds.size > 0;
  const activeTag = tagTokens[0] ?? '';
  const filtersDirty = Boolean(query.trim()) || Boolean(activeTag) || status !== 'active';

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
  }, []);

  const handleTagsChange = useCallback((nextTags: string[]) => {
    setTagTokens(nextTags.slice(0, 1));
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
    if (activeTag) params.set('tag', activeTag);
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
  }, [activeTag, pathname, query, router, status, syncSelection]);

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
    handleQueryChange('');
    handleTagsChange([]);
    handleStatusChange('active');
    clearSelection();
  }, [clearSelection, handleQueryChange, handleStatusChange, handleTagsChange]);

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
      <Card>
        <CardHeader className="space-y-0 pb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-4">
            <FilterField label="Search" className="flex-1 min-w-[220px]">
              <SearchBar
                value={query}
                onChange={handleQueryChange}
                placeholder="Search by title or content…"
                testId="notes-search-input"
              />
            </FilterField>

            <FilterField label="Tag" className="w-full md:w-[200px]">
              <TagInput value={tagTokens} onChange={handleTagsChange} placeholder="Type a tag…" />
            </FilterField>

            <FilterField label="Status" className="w-full md:w-[160px]">
              <Select value={status} onValueChange={value => handleStatusChange(value as NoteStatus)}>
                <SelectTrigger
                  data-testid="status-filter"
                  aria-label="Filter notes by status"
                  className="h-10"
                >
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusFilters.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterField>

            <div className="flex items-end md:pb-[2px]">
              <Button
                type="button"
                variant="ghost"
                size="default"
                onClick={handleResetFilters}
                disabled={!filtersDirty}
                className="h-10"
              >
                Clear filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <Badge variant="secondary">
              {loading ? 'Loading notes…' : `${notes.length} note${notes.length === 1 ? '' : 's'}`}
            </Badge>
            {hasSelection ? <span>{selectedIds.size} selected</span> : null}
          </div>
          {hasSelection ? (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={handleBulkArchive}
                data-testid="bulk-archive"
              >
                {status === 'archived' ? (
                  <RestoreIcon className="mr-2 h-4 w-4" aria-hidden />
                ) : (
                  <ArchiveIcon className="mr-2 h-4 w-4" aria-hidden />
                )}
                {status === 'archived' ? 'Restore selected' : 'Archive selected'}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={clearSelection}>
                Clear selection
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

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
