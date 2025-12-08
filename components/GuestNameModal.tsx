'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserIcon, ArrowRightIcon } from '@/components/icons';

interface GuestNameModalProps {
  onSubmit: (name: string) => void;
  isViewOnly?: boolean;
}

export function GuestNameModal({ onSubmit, isViewOnly = false }: GuestNameModalProps) {
  const [name, setName] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  // Get saved name from localStorage on mount
  // Note: onSubmit must be memoized (useCallback) by the parent to prevent re-runs
  useEffect(() => {
    const savedName = localStorage.getItem('guestName');
    if (savedName) {
      setName(savedName);
      onSubmit(savedName);
    } else {
      setIsVisible(true);
    }
  }, [onSubmit]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName.length < 2) return;

    // Save to localStorage for future visits
    localStorage.setItem('guestName', trimmedName);
    onSubmit(trimmedName);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
            <UserIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Welcome to this shared note
            </h2>
            <p className="text-sm text-slate-500">
              {isViewOnly
                ? 'Enter your name to view this note'
                : 'Enter your name to start collaborating'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="guest-name" className="text-sm font-medium text-slate-700">
              Your name
            </Label>
            <Input
              id="guest-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="mt-1.5"
              minLength={2}
              maxLength={50}
              autoFocus
              required
            />
            <p className="mt-1.5 text-xs text-slate-500">
              This name will be visible to other collaborators
            </p>
          </div>

          <Button
            type="submit"
            disabled={name.trim().length < 2}
            className="w-full"
          >
            {isViewOnly ? 'View note' : 'Start collaborating'}
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          Your name is saved locally for future visits
        </p>
      </div>
    </div>
  );
}
