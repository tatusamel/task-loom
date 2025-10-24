'use client';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  testId?: string;
}

export function SearchBar({ value, onChange, placeholder, testId }: SearchBarProps) {
  return (
    <div className="relative flex-1">
      <label className="sr-only" htmlFor={testId ?? 'search-input'}>
        Search notes
      </label>
      <input
        id={testId ?? 'search-input'}
        type="search"
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder ?? 'Search'}
        className="w-full rounded-md border border-slate-200 px-3 py-2 pl-3 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        data-testid={testId}
        autoComplete="off"
      />
    </div>
  );
}
