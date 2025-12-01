'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { UserIcon, ArrowRightIcon } from '@/components/icons';

interface UserMenuProps {
  name?: string | null;
  email?: string | null;
}

export function UserMenu({ name, email }: UserMenuProps) {
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut({ callbackUrl: '/sign-in' });
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/60 px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:border-slate-300 hover:bg-white"
        >
          <UserIcon className="h-[18px] w-[18px] text-slate-500" aria-hidden />
          <span className="hidden sm:inline">{name || 'Demo user'}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-3">
        <div className="space-y-2">
          <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2">
            <p className="text-sm font-medium text-slate-900">{name || 'Demo user'}</p>
            {email ? <p className="text-xs text-slate-500">{email}</p> : null}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full justify-between border border-transparent hover:border-slate-200"
          >
            <span>{signingOut ? 'Signing out…' : 'Sign out'}</span>
            <ArrowRightIcon className="h-4 w-4 text-slate-500" aria-hidden />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
