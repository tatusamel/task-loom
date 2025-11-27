'use client';

import { useState, useRef, type KeyboardEvent } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDownIcon, TagIcon, XIcon, PlusIcon } from '@/components/icons';
import { cn, getTagTone } from '@/lib/utils';

interface TagFilterPopoverProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagFilterPopover({
  value,
  onChange,
  placeholder = 'Filter by tags...',
}: TagFilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (rawTag: string) => {
    const normalized = rawTag.trim().toLowerCase();
    if (!normalized) return;
    if (value.includes(normalized)) {
      setInputValue('');
      return;
    }
    onChange([...value, normalized]);
    setInputValue('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };

  const clearAll = () => {
    onChange([]);
    setInputValue('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag(inputValue);
    } else if (event.key === 'Backspace' && inputValue === '' && value.length > 0) {
      event.preventDefault();
      const next = [...value];
      next.pop();
      onChange(next);
    }
  };

  const getSummary = () => {
    if (value.length === 0) return null;
    const maxVisible = 2;
    const visible = value.slice(0, maxVisible);
    const remaining = value.length - maxVisible;
    return {
      visible,
      remaining: remaining > 0 ? remaining : 0,
    };
  };

  const summary = getSummary();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-colors hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
            open && 'border-indigo-500 ring-2 ring-indigo-500/20',
          )}
        >
          <span className="flex items-center gap-2 overflow-hidden">
            <TagIcon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
            {summary ? (
              <span className="flex items-center gap-1.5 truncate">
                {summary.visible.map(tag => {
                  const tone = getTagTone(tag);
                  return (
                    <span
                      key={tag}
                      className={cn(
                        'inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium',
                        tone.background,
                        tone.text,
                      )}
                    >
                      {tag}
                    </span>
                  );
                })}
                {summary.remaining > 0 && (
                  <span className="text-xs text-slate-500">+{summary.remaining} more</span>
                )}
              </span>
            ) : (
              <span className="text-slate-400">{placeholder}</span>
            )}
          </span>
          <ChevronDownIcon
            className={cn(
              'ml-2 h-4 w-4 shrink-0 text-slate-400 transition-transform',
              open && 'rotate-180',
            )}
            aria-hidden
          />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <div className="border-b border-slate-100 p-3">
          <div className="relative flex items-center gap-2">
            <TagIcon className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type tag and press Enter..."
              className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="button"
              onClick={() => addTag(inputValue)}
              disabled={!inputValue.trim()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Add tag"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-3">
          {value.length > 0 ? (
            <>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                Active filters ({value.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {value.map(tag => {
                  const tone = getTagTone(tag);
                  return (
                    <span
                      key={tag}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[13px] font-medium shadow-sm ring-1 transition hover:shadow',
                        tone.background,
                        tone.text,
                        tone.ring,
                        'border-white/60',
                      )}
                    >
                      <TagIcon className={cn('h-3.5 w-3.5', tone.icon)} aria-hidden />
                      {tag}
                      <button
                        type="button"
                        className="ml-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/70 text-slate-500 transition hover:bg-white hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
                        onClick={() => removeTag(tag)}
                        aria-label={`Remove tag ${tag}`}
                      >
                        <XIcon className="h-3 w-3" aria-hidden />
                      </button>
                    </span>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={clearAll}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-200 px-2 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <XIcon className="h-3.5 w-3.5" />
                Clear all
              </button>
            </>
          ) : (
            <p className="py-2 text-center text-sm text-slate-500">
              No tag filters applied. Type above to add tags.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
