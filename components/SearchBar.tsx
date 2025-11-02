'use client';

import { SearchIcon } from '@/components/icons';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  testId?: string;
}

export function SearchBar({ value, onChange, placeholder, testId }: SearchBarProps) {
  const id = testId ?? 'search-input';
  return (
    <div className="relative flex-1">
      <label className="sr-only" htmlFor={id}>
        Search
      </label>
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        id={id}
        type="search"
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder ?? 'Search'}
        className="pl-9"
        data-testid={testId}
        autoComplete="off"
      />
    </div>
  );
}
