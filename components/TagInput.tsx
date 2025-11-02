'use client';

import { useState, type KeyboardEvent } from 'react';
import { TagIcon, XIcon } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    <div className="flex flex-wrap items-center gap-2 rounded-md px-0 py-1 text-sm">
      {value.map(tag => (
        <Badge
          key={tag}
          variant="secondary"
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
        >
          <TagIcon className="h-3 w-3" aria-hidden />
          {tag}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-6 w-6 rounded-full text-slate-500 hover:text-slate-900"
            onClick={() => onChange(value.filter(existing => existing !== tag))}
            aria-label={`Remove tag ${tag}`}
          >
            <XIcon className="h-3.5 w-3.5" aria-hidden />
          </Button>
        </Badge>
      ))}
      <Input
        type="text"
        value={inputValue}
        onChange={event => setInputValue(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => commitTag(inputValue)}
        placeholder={value.length === 0 ? placeholder ?? 'Add tags…' : undefined}
        className={cn(
          'min-w-[160px] flex-1 border-none bg-transparent px-0 py-1 shadow-none outline-none focus:border-none focus:outline-none focus:ring-0',
        )}
      />
    </div>
  );
}
