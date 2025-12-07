'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoaderIcon, PlusIcon, SparklesIcon, PenIcon } from '@/components/icons';

type QuickAddState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  noteId?: string;
};

const initialState: QuickAddState = { status: 'idle' };

interface QuickAddFormProps {
  action: (state: QuickAddState, formData: FormData) => Promise<QuickAddState>;
}

// Detect markdown patterns that suggest user wants rich editing
function hasMarkdownSyntax(text: string): boolean {
  const markdownPatterns = [
    /\*\*[^*]+\*\*/, // bold
    /\*[^*]+\*/, // italic
    /^#{1,3}\s/, // headings
    /^-\s/, // unordered list
    /^\d+\.\s/, // ordered list
    /`[^`]+`/, // inline code
    /\[.+\]\(.+\)/, // links
    /^>\s/, // blockquote
  ];
  return markdownPatterns.some(pattern => pattern.test(text));
}

const SUGGEST_EDITOR_CHAR_THRESHOLD = 50;

export function QuickAddForm({ action }: QuickAddFormProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [state, formAction] = useFormState(action, initialState);
  const [expanded, setExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [contentValue, setContentValue] = useState('');
  const [isCreatingForEditor, setIsCreatingForEditor] = useState(false);

  // Determine if we should suggest opening in rich editor
  const shouldSuggestEditor = useMemo(() => {
    const combinedText = `${inputValue} ${contentValue}`;
    const hasMarkdown = hasMarkdownSyntax(inputValue) || hasMarkdownSyntax(contentValue);
    const isLongContent = combinedText.length > SUGGEST_EDITOR_CHAR_THRESHOLD;
    return expanded && (hasMarkdown || isLongContent);
  }, [inputValue, contentValue, expanded]);

  useEffect(() => {
    if (state.status === 'success') {
      // If we created the note to open in editor, redirect
      if (isCreatingForEditor && state.noteId) {
        toast.success('Opening in editor...');
        router.push(`/notes/${state.noteId}`);
        return;
      }

      toast.success(state.message ?? 'Note captured.');
      setInputValue('');
      setContentValue('');
      if (inputRef.current) {
        inputRef.current.value = '';
        inputRef.current.focus();
      }
      if (contentRef.current) {
        contentRef.current.value = '';
      }
      setExpanded(false);
      setIsCreatingForEditor(false);
    } else if (state.status === 'error' && state.message) {
      toast.error(state.message);
      setIsCreatingForEditor(false);
    }
  }, [state, isCreatingForEditor, router]);

  const handleCollapse = () => {
    setExpanded(false);
    setInputValue('');
    setContentValue('');
    if (contentRef.current) {
      contentRef.current.value = '';
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleOpenInEditor = () => {
    setIsCreatingForEditor(true);
    // Submit the form programmatically
    const form = inputRef.current?.closest('form');
    if (form) {
      form.requestSubmit();
    }
  };

  return (
    <form action={formAction} className="space-y-3" data-testid="quick-add-form">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor="quick-add-input" className="sr-only">
          Quick add note
        </label>
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            id="quick-add-input"
            name="quickAdd"
            placeholder='Capture something… e.g. "Ship update !high #ops"'
            className={`pr-28 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-all duration-200 ease-in-out hover:border-slate-300 hover:bg-white focus:border-purple-500 focus:ring-purple-500/25 focus:shadow-[0_10px_36px_rgba(79,70,229,0.08)]`}
            autoComplete="off"
            data-testid="quick-add-input"
            value={inputValue}
            onChange={event => {
              const next = event.target.value;
              setInputValue(next);
              if (next.trim() && !expanded) {
                setExpanded(true);
              }
            }}
            onFocus={() => setExpanded(true)}
          />
          {inputValue.trim() && !expanded ? (
            <div className="pointer-events-none absolute inset-y-1.5 right-1.5 flex items-center">
              <SubmitButton className="pointer-events-auto h-9 px-3 shadow-sm" size="sm" />
            </div>
          ) : null}
        </div>
      </div>
      {expanded ? (
        <div className="space-y-3 animate-slide-down">
          <div>
            <label
              htmlFor="quick-add-content"
              className="text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Content
            </label>
            <div className="mt-1">
              <Textarea
                ref={contentRef}
                id="quick-add-content"
                name="quickAddContent"
                rows={4}
                placeholder="Add details or markdown…"
                className="leading-6"
                value={contentValue}
                onChange={e => setContentValue(e.target.value)}
                data-testid="quick-add-content"
              />
            </div>
          </div>

          {/* Smart suggestion to open in rich editor */}
          {shouldSuggestEditor && (
            <div className="flex items-center gap-3 rounded-xl border border-purple-200 bg-purple-50/50 px-4 py-3">
              <SparklesIcon className="h-5 w-5 flex-shrink-0 text-purple-500" aria-hidden />
              <p className="flex-1 text-sm text-purple-700">
                Looks like you&apos;re writing something detailed. Want to use the rich editor?
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleOpenInEditor}
                disabled={isCreatingForEditor}
                className="flex-shrink-0 border-purple-200 bg-white text-purple-700 hover:bg-purple-100"
              >
                {isCreatingForEditor ? (
                  <>
                    <LoaderIcon className="h-4 w-4 animate-spin" aria-hidden />
                    Opening…
                  </>
                ) : (
                  <>
                    <PenIcon className="h-4 w-4" aria-hidden />
                    Open in editor
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCollapse}
              data-testid="quick-add-cancel"
            >
              Cancel
            </Button>
            <SubmitButton />
          </div>
        </div>
      ) : null}
    </form>
  );
}

function SubmitButton({
  className,
  size = 'default',
}: {
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      size={size}
      className={className}
      isLoading={pending}
      data-testid="quick-add-submit"
    >
      {pending ? (
        <>
          <LoaderIcon className="h-4 w-4 animate-spin" aria-hidden />
          Adding…
        </>
      ) : (
        <>
          <PlusIcon className="h-4 w-4" aria-hidden />
          Add note
        </>
      )}
    </Button>
  );
}
