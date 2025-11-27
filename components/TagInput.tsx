'use client';

import { useState, useRef, type KeyboardEvent } from 'react';
import { TagIcon, XIcon } from '@/components/icons';
import { cn, getTagTone } from '@/lib/utils';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ value, onChange, placeholder }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const commitTag = (rawTag: string) => {
    const normalized = rawTag.trim().toLowerCase();
    if (!normalized) return;
    if (value.includes(normalized)) {
      setInputValue('');
      return;
    }
    onChange([...value, normalized]);
    setInputValue('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commitTag(inputValue);
    } else if (event.key === 'Backspace' && inputValue === '' && value.length > 0) {
      event.preventDefault();
      const next = [...value];
      next.pop();
      onChange(next);
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      onClick={handleContainerClick}
      className={cn(
        'flex min-h-[44px] w-full items-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-3 text-sm text-slate-900 transition-all duration-150 cursor-text hover:border-slate-300 hover:bg-white',
        isFocused && 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-soft',
      )}
    >
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
              onClick={e => {
                e.stopPropagation();
                onChange(value.filter(existing => existing !== tag));
              }}
              aria-label={`Remove tag ${tag}`}
            >
              <XIcon className="h-3 w-3" aria-hidden />
            </button>
          </span>
        );
      })}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={event => setInputValue(event.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          commitTag(inputValue);
        }}
        placeholder={value.length === 0 ? placeholder ?? 'Add tags…' : undefined}
        className="min-w-[120px] flex-1 border-none bg-transparent p-0 text-sm outline-none focus:outline-none focus:ring-0 placeholder:text-slate-400"
      />
    </div>
  );
}
