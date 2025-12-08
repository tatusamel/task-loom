'use client';

import { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';
import { useLiveblocksExtension } from '@liveblocks/react-tiptap';
import { ClientSideSuspense } from '@liveblocks/react';
import { RoomProvider, useOthers, useSelf } from '@/liveblocks.config';
import { cn } from '@/lib/utils';
import {
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  UndoIcon,
  RedoIcon,
} from '@/components/icons';

// Import Liveblocks styles
import '@liveblocks/react-ui/styles.css';
import '@liveblocks/react-tiptap/styles.css';

interface CollaborativeEditorProps {
  noteId: string;
  initialContent: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  userName?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

type UserInfo = {
  name: string;
  color: string;
};

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'p-1.5 rounded-md transition-colors',
        'hover:bg-slate-100',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isActive && 'bg-slate-200 text-purple-600',
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-slate-200 mx-1" />;
}

// Avatar component for showing connected users
function CollaboratorAvatars() {
  const others = useOthers();
  const self = useSelf();

  const totalUsers = others.length + (self ? 1 : 0);
  if (totalUsers <= 1) return null;

  const selfInfo = self?.info as UserInfo | undefined;

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-slate-500 mr-1">
        {totalUsers} editing
      </span>
      <div className="flex -space-x-2">
        {self && (
          <div
            className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-white"
            style={{ backgroundColor: selfInfo?.color || '#9575CD' }}
            title={`${selfInfo?.name || 'You'} (you)`}
          >
            {(selfInfo?.name || 'Y')[0].toUpperCase()}
          </div>
        )}
        {others.slice(0, 4).map((other) => {
          const otherInfo = other.info as UserInfo | undefined;
          return (
            <div
              key={other.connectionId}
              className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-white"
              style={{ backgroundColor: otherInfo?.color || '#64B5F6' }}
              title={otherInfo?.name || 'Anonymous'}
            >
              {(otherInfo?.name || 'A')[0].toUpperCase()}
            </div>
          );
        })}
        {others.length > 4 && (
          <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-400 flex items-center justify-center text-xs font-medium text-white">
            +{others.length - 4}
          </div>
        )}
      </div>
    </div>
  );
}

// The actual editor that uses Liveblocks extension
function TiptapWithLiveblocks({
  initialContent,
  onChange,
  placeholder = 'Start writing...',
  className,
}: Omit<CollaborativeEditorProps, 'noteId' | 'userName'>) {
  // Use the Liveblocks extension hook - handles Yjs internally
  const liveblocks = useLiveblocksExtension({
    initialContent,
  });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      liveblocks,
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      Markdown.configure({
        html: false,
        transformCopiedText: true,
        transformPastedText: true,
      }),
    ],
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-slate max-w-none',
          'prose-headings:font-semibold prose-headings:text-slate-900',
          'prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg',
          'prose-p:text-slate-700 prose-p:leading-relaxed',
          'prose-a:text-purple-600 prose-a:no-underline hover:prose-a:underline',
          'prose-strong:text-slate-900 prose-strong:font-semibold',
          'prose-code:text-purple-600 prose-code:bg-purple-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none',
          'prose-pre:bg-slate-900 prose-pre:text-slate-100',
          'prose-blockquote:border-l-purple-500 prose-blockquote:text-slate-600',
          'prose-ul:list-disc prose-ol:list-decimal prose-ul:my-2 prose-ol:my-2',
          'prose-li:text-slate-700 prose-li:my-0.5',
          'focus:outline-none',
          'min-h-[400px] p-4',
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const storage = editor.storage as unknown as { markdown: { getMarkdown: () => string } };
      const markdown = storage.markdown.getMarkdown();
      onChange(markdown);
    },
  });

  const toggleBold = useCallback(() => editor?.chain().focus().toggleBold().run(), [editor]);
  const toggleItalic = useCallback(() => editor?.chain().focus().toggleItalic().run(), [editor]);
  const toggleStrike = useCallback(() => editor?.chain().focus().toggleStrike().run(), [editor]);
  const toggleCode = useCallback(() => editor?.chain().focus().toggleCode().run(), [editor]);
  const toggleHeading = useCallback((level: 1 | 2 | 3) => editor?.chain().focus().toggleHeading({ level }).run(), [editor]);
  const toggleBulletList = useCallback(() => editor?.chain().focus().toggleBulletList().run(), [editor]);
  const toggleOrderedList = useCallback(() => editor?.chain().focus().toggleOrderedList().run(), [editor]);
  const toggleBlockquote = useCallback(() => editor?.chain().focus().toggleBlockquote().run(), [editor]);
  const handleUndo = useCallback(() => editor?.chain().focus().undo().run(), [editor]);
  const handleRedo = useCallback(() => editor?.chain().focus().redo().run(), [editor]);

  if (!editor) {
    return <EditorLoading className={className} />;
  }

  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden', className)}>
      {/* Fixed Toolbar */}
      <div className="flex items-center justify-between gap-0.5 px-3 py-2 border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-0.5 flex-wrap">
          <ToolbarButton onClick={() => toggleHeading(1)} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1">
            <Heading1Icon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => toggleHeading(2)} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
            <Heading2Icon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => toggleHeading(3)} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">
            <Heading3Icon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton onClick={toggleBold} isActive={editor.isActive('bold')} title="Bold (Ctrl+B)">
            <BoldIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={toggleItalic} isActive={editor.isActive('italic')} title="Italic (Ctrl+I)">
            <ItalicIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={toggleStrike} isActive={editor.isActive('strike')} title="Strikethrough">
            <StrikethroughIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={toggleCode} isActive={editor.isActive('code')} title="Inline Code">
            <CodeIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton onClick={toggleBulletList} isActive={editor.isActive('bulletList')} title="Bullet List">
            <ListIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={toggleOrderedList} isActive={editor.isActive('orderedList')} title="Numbered List">
            <ListOrderedIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={toggleBlockquote} isActive={editor.isActive('blockquote')} title="Quote">
            <QuoteIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton onClick={handleUndo} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">
            <UndoIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={handleRedo} disabled={!editor.can().redo()} title="Redo (Ctrl+Shift+Z)">
            <RedoIcon className="h-4 w-4" />
          </ToolbarButton>
        </div>
        <CollaboratorAvatars />
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Editor Styles */}
      <style jsx global>{`
        .tiptap p.is-editor-empty:first-child::before {
          color: #94a3b8;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .tiptap:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}

// Loading component
function EditorLoading({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white shadow-sm', className)}>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200 bg-slate-50/50">
        <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
      </div>
      <div className="min-h-[400px] p-4">
        <div className="space-y-2">
          <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-slate-100 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Wrapper that's inside RoomProvider
function RoomContent({
  initialContent,
  onChange,
  placeholder,
  className,
}: Omit<CollaborativeEditorProps, 'noteId' | 'userName'>) {
  return (
    <ClientSideSuspense fallback={<EditorLoading className={className} />}>
      <TiptapWithLiveblocks
        initialContent={initialContent}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
      />
    </ClientSideSuspense>
  );
}

// Main export - wraps everything with RoomProvider
export function CollaborativeEditor({
  noteId,
  initialContent,
  onChange,
  placeholder,
  className,
}: CollaborativeEditorProps) {
  return (
    <RoomProvider
      id={`note-${noteId}`}
      initialPresence={{ cursor: null }}
    >
      <RoomContent
        initialContent={initialContent}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
      />
    </RoomProvider>
  );
}
