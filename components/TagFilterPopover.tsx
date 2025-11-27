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

  const popoverTone = {
    'bg-indigo-50': { bg: 'bg-indigo-100', text: 'text-indigo-800', ring: 'ring-indigo-200', icon: 'text-indigo-600' },
    'bg-amber-50': { bg: 'bg-amber-100', text: 'text-amber-800', ring: 'ring-amber-200', icon: 'text-amber-600' },
    'bg-emerald-50': { bg: 'bg-emerald-100', text: 'text-emerald-800', ring: 'ring-emerald-200', icon: 'text-emerald-600' },
    'bg-sky-50': { bg: 'bg-sky-100', text: 'text-sky-800', ring: 'ring-sky-200', icon: 'text-sky-600' },
    'bg-rose-50': { bg: 'bg-rose-100', text: 'text-rose-800', ring: 'ring-rose-200', icon: 'text-rose-600' },
    'bg-slate-50': { bg: 'bg-slate-100', text: 'text-slate-800', ring: 'ring-slate-200', icon: 'text-slate-600' },
  } as const;

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
            'flex h-10 w-full items-center justify-between rounded-lg border border-slate-200/80 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-slate-300 focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200/70',
            open && 'border-indigo-300 ring-1 ring-indigo-200/70',
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
      <PopoverContent
        align="start"
        className="w-80 rounded-xl border border-slate-200/80 bg-white/95 p-0 shadow-[0_4px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm"
      >
        <div className="border-b border-slate-100/80 px-3 py-2.5">
          <div className="relative flex items-center gap-2">
            <TagIcon className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type tag and press Enter..."
              className="h-9 w-full rounded-lg border border-slate-200/80 bg-white/80 px-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-1 focus:ring-indigo-200/70"
            />
            <button
              type="button"
              onClick={() => addTag(inputValue)}
              disabled={!inputValue.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-white/90 text-slate-500 transition-colors hover:border-slate-300 hover:bg-white focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200/70 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Add tag"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2 px-3 py-2.5">
          {value.length > 0 ? (
            <>
              <div className="border-t border-slate-100/80 pt-2">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Active filters ({value.length})
                </p>
                <div className="flex flex-wrap gap-x-2 gap-y-1.5">
                  {value.map(tag => {
                    const tone = getTagTone(tag);
                    const softTone = popoverTone[tone.background as keyof typeof popoverTone];
                    const bg = softTone?.bg ?? tone.background;
                    const text = softTone?.text ?? tone.text;
                    const ring = softTone?.ring ?? tone.ring;
                    const icon = softTone?.icon ?? tone.icon;
                    return (
                      <span
                        key={tag}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[13px] font-medium shadow-sm ring-1 transition hover:-translate-y-0.5 hover:shadow',
                          bg,
                          text,
                          ring,
                          'border-white/60',
                        )}
                      >
                        <TagIcon className={cn('h-3.5 w-3.5', icon)} aria-hidden />
                        {tag}
                        <button
                          type="button"
                          className="ml-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-slate-500 transition hover:bg-white hover:text-slate-800 focus-visible:ring-1 focus-visible:ring-indigo-300 focus-visible:ring-offset-1"
                          onClick={() => removeTag(tag)}
                          aria-label={`Remove tag ${tag}`}
                        >
                          <XIcon className="h-3 w-3" aria-hidden />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <p className="py-2 text-center text-sm text-slate-500">
              No tag filters applied. Type above to add tags.
            </p>
          )}
        </div>
        <div className="sticky bottom-0 border-t border-slate-100/80 bg-white/90 px-3 py-2 text-right">
          <button
            type="button"
            onClick={clearAll}
            disabled={value.length === 0}
            className="text-xs font-medium text-slate-500 underline-offset-4 transition hover:text-slate-800 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear all{value.length > 0 ? ` (${value.length})` : ''}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
