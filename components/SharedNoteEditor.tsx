'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { GuestNameModal } from './GuestNameModal';
import { CollaborativeEditor } from './CollaborativeEditor';
import { Badge } from '@/components/ui/badge';
import { EyeIcon, PenIcon, UsersIcon } from '@/components/icons';
import type { SharePermission } from '@/lib/sharing';

interface SharedNoteEditorProps {
  noteId: string;
  noteTitle: string;
  noteContent: string;
  permission: SharePermission;
  shareToken: string;
}

export function SharedNoteEditor({
  noteId,
  noteTitle,
  noteContent,
  permission,
  shareToken,
}: SharedNoteEditorProps) {
  const [guestName, setGuestName] = useState<string | null>(null);
  const [content, setContent] = useState(noteContent);
  const [hasChanges, setHasChanges] = useState(false);

  const isViewOnly = permission === 'view';

  // Store share token for Liveblocks auth
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('shareToken', shareToken);
    }
  }, [shareToken]);

  const handleGuestNameSubmit = useCallback((name: string) => {
    setGuestName(name);
  }, []);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setHasChanges(true);
  }, []);

  // Show guest name modal if we don't have a name yet
  if (!guestName) {
    return <GuestNameModal onSubmit={handleGuestNameSubmit} isViewOnly={isViewOnly} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-lg font-semibold text-purple-600 hover:text-purple-700"
              >
                Task Loom
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-600">Shared Note</span>
            </div>

            <div className="flex items-center gap-3">
              <Badge
                variant={isViewOnly ? 'secondary' : 'success'}
                className="flex items-center gap-1.5"
              >
                {isViewOnly ? (
                  <>
                    <EyeIcon className="h-3.5 w-3.5" />
                    View only
                  </>
                ) : (
                  <>
                    <PenIcon className="h-3.5 w-3.5" />
                    Can edit
                  </>
                )}
              </Badge>
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <UsersIcon className="h-4 w-4" />
                <span>Viewing as {guestName}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              {noteTitle || 'Untitled note'}
            </h1>
            {isViewOnly && (
              <p className="mt-2 text-sm text-slate-500">
                You have view-only access to this note. Ask the owner to grant edit permission.
              </p>
            )}
          </div>

          {/* Editor */}
          {isViewOnly ? (
            // View-only mode: show static content
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(content) }}
              />
            </div>
          ) : (
            // Edit mode: show collaborative editor
            <CollaborativeEditor
              noteId={noteId}
              initialContent={content}
              onChange={handleContentChange}
              placeholder="Start writing..."
              userName={guestName}
            />
          )}

          {/* Footer info */}
          <div className="text-center text-xs text-slate-400">
            <p>This is a shared note from Task Loom.</p>
            <p className="mt-1">
              <Link href="/sign-up" className="text-purple-600 hover:underline">
                Create your own account
              </Link>
              {' '}to start organizing your notes and tasks.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

// Simple markdown to HTML converter for view-only mode
function formatMarkdownToHtml(markdown: string): string {
  if (!markdown) return '<p class="text-slate-400">No content yet.</p>';

  return markdown
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Code
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    // Line breaks
    .replace(/\n/g, '<br />');
}
