'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  ShareIcon,
  CopyIcon,
  GlobeIcon,
  LockIcon,
  LoaderIcon,
  CheckIcon,
  TrashIcon,
} from '@/components/icons';
import { cn } from '@/lib/utils';
import type { NoteShareDTO, SharePermission } from '@/lib/sharing';

interface SharePopoverProps {
  noteId: string;
  className?: string;
}

export function SharePopover({ noteId, className }: SharePopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [share, setShare] = useState<NoteShareDTO | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch current share status when popover opens
  const fetchShareStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/notes/${noteId}/share`);
      if (response.ok) {
        const data = await response.json();
        setShare(data.share);
      }
    } catch (error) {
      console.error('Failed to fetch share status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [noteId]);

  useEffect(() => {
    if (isOpen) {
      fetchShareStatus();
    }
  }, [isOpen, fetchShareStatus]);

  const handleEnableSharing = async (permission: SharePermission = 'edit') => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/notes/${noteId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permission }),
      });

      if (!response.ok) {
        throw new Error('Failed to enable sharing');
      }

      const data = await response.json();
      setShare(data.share);
      toast.success('Sharing enabled! Link copied to clipboard.');
      await copyToClipboard(data.share.shareUrl);
    } catch (error) {
      toast.error('Failed to enable sharing');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePermission = async (permission: SharePermission) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/notes/${noteId}/share`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permission }),
      });

      if (!response.ok) {
        throw new Error('Failed to update permission');
      }

      const data = await response.json();
      setShare(data.share);
      toast.success(`Permission updated to ${permission === 'edit' ? 'can edit' : 'view only'}`);
    } catch (error) {
      toast.error('Failed to update permission');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableSharing = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/notes/${noteId}/share`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to disable sharing');
      }

      setShare(null);
      toast.success('Sharing disabled. Link revoked.');
    } catch (error) {
      toast.error('Failed to disable sharing');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            'border border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50',
            share && 'text-emerald-600 hover:text-emerald-700',
            className
          )}
        >
          <ShareIcon className="mr-2 h-4 w-4" aria-hidden />
          Share
          {share && (
            <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-slate-900">Share note</h4>
            {isLoading && (
              <LoaderIcon className="h-4 w-4 animate-spin text-slate-400" />
            )}
          </div>

          {share ? (
            // Sharing is enabled
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3">
                <GlobeIcon className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-emerald-900">
                    Anyone with the link can {share.permission === 'edit' ? 'edit' : 'view'}
                  </p>
                  <p className="text-xs text-emerald-700 truncate">
                    {share.shareUrl}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-600">
                  Permission
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={share.permission === 'edit' ? 'default' : 'outline'}
                    onClick={() => handleUpdatePermission('edit')}
                    disabled={isLoading || share.permission === 'edit'}
                    className="flex-1"
                  >
                    Can edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={share.permission === 'view' ? 'default' : 'outline'}
                    onClick={() => handleUpdatePermission('view')}
                    disabled={isLoading || share.permission === 'view'}
                    className="flex-1"
                  >
                    View only
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => copyToClipboard(share.shareUrl)}
                  disabled={isLoading}
                >
                  {copied ? (
                    <>
                      <CheckIcon className="mr-2 h-4 w-4 text-emerald-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <CopyIcon className="mr-2 h-4 w-4" />
                      Copy link
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  onClick={handleDisableSharing}
                  disabled={isLoading}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            // Sharing is disabled
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3">
                <LockIcon className="h-5 w-5 text-slate-400 flex-shrink-0" />
                <p className="text-sm text-slate-600">
                  Only you can access this note
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  type="button"
                  size="sm"
                  className="w-full"
                  onClick={() => handleEnableSharing('edit')}
                  disabled={isLoading}
                >
                  <GlobeIcon className="mr-2 h-4 w-4" />
                  Enable sharing (can edit)
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleEnableSharing('view')}
                  disabled={isLoading}
                >
                  <GlobeIcon className="mr-2 h-4 w-4" />
                  Enable sharing (view only)
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
