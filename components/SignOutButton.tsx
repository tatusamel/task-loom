'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function SignOutButton() {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut({ callbackUrl: '/sign-in' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSignOut}
      disabled={loading}
      className="whitespace-nowrap"
    >
      {loading ? 'Signing out…' : 'Sign out'}
    </Button>
  );
}
