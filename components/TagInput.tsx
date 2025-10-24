'use client';

import { useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ value, onChange, placeholder }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

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

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
      {value.map(tag => (
        <span
          key={tag}
          className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
        >
          #{tag}
          <button
            type="button"
            className="rounded-full bg-transparent text-slate-500 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            onClick={() => onChange(value.filter(existing => existing !== tag))}
            aria-label={`Remove tag ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={event => setInputValue(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => commitTag(inputValue)}
        placeholder={value.length === 0 ? placeholder ?? 'Add tags…' : undefined}
        className={cn(
          'min-w-[160px] flex-1 border-none bg-transparent px-0 py-1 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-0',
        )}
      />
    </div>
  );
}
