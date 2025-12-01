'use client';

import { useEffect, useState } from 'react';
import { XIcon, SparklesIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';

const shortcuts = [
  { keys: ['Esc'], label: 'Back to list / close' },
  { keys: ['Enter'], label: 'Save changes' },
  { keys: ['?'], label: 'Show shortcuts' },
  { keys: ['Cmd', '/'], label: 'Focus search' },
  { keys: ['Shift', 'P'], label: 'Toggle pin' },
];

function KeyBadge({ keys }: { keys: string[] }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
      {keys.map((key, idx) => (
        <span key={key} className="px-1">
          {key}
          {idx < keys.length - 1 ? <span className="px-1 text-slate-400">+</span> : null}
        </span>
      ))}
    </span>
  );
}

export function ShortcutOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.altKey || event.ctrlKey) return;
      const target = event.target as HTMLElement | null;
      const isTypingTarget = target && ['INPUT', 'TEXTAREA'].includes(target.tagName);
      if (isTypingTarget) return;

      if (event.key === '?') {
        event.preventDefault();
        setOpen(prev => !prev);
      } else if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900">
            <SparklesIcon className="h-5 w-5 text-purple-600" aria-hidden />
            <p className="text-sm font-semibold">Keyboard shortcuts</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="border border-transparent hover:border-slate-200"
            onClick={() => setOpen(false)}
            aria-label="Close shortcuts overlay"
          >
            <XIcon className="h-4 w-4" aria-hidden />
          </Button>
        </div>
        <div className="space-y-3">
          {shortcuts.map(shortcut => (
            <div
              key={shortcut.label}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-sm text-slate-800"
            >
              <span>{shortcut.label}</span>
              <KeyBadge keys={shortcut.keys} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
