'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoaderIcon, PlusIcon, SparklesIcon } from '@/components/icons';

type QuickAddState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

const initialState: QuickAddState = { status: 'idle' };

interface QuickAddFormProps {
  action: (state: QuickAddState, formData: FormData) => Promise<QuickAddState>;
}

export function QuickAddForm({ action }: QuickAddFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [state, formAction] = useFormState(action, initialState);
  const [expanded, setExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (state.status === 'success') {
      toast.success(state.message ?? 'Note captured.');
      setInputValue('');
      if (inputRef.current) {
        inputRef.current.value = '';
        inputRef.current.focus();
      }
      if (contentRef.current) {
        contentRef.current.value = '';
      }
      setExpanded(false);
    } else if (state.status === 'error' && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  const handleCollapse = () => {
    setExpanded(false);
    setInputValue('');
    if (contentRef.current) {
      contentRef.current.value = '';
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <form
      action={formAction}
      className="space-y-3"
      data-testid="quick-add-form"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor="quick-add-input" className="sr-only">
          Quick add note
        </label>
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            id="quick-add-input"
            name="quickAdd"
            placeholder='Capture something… e.g. "Prep agenda #focus"'
            className={`pr-28 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-all hover:border-slate-300 hover:bg-white focus:border-purple-500 focus:ring-purple-500/25 focus:shadow-[0_10px_36px_rgba(79,70,229,0.08)]`}
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
          {inputValue.trim() ? (
            <div className="pointer-events-none absolute inset-y-1.5 right-1.5 flex items-center">
              <SubmitButton className="pointer-events-auto h-9 px-3 shadow-sm" size="sm" />
            </div>
          ) : null}
        </div>
      </div>
      {expanded ? (
        <div className="space-y-3">
          <div>
            <label htmlFor="quick-add-content" className="text-xs font-medium uppercase tracking-wide text-slate-500">
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
                data-testid="quick-add-content"
              />
            </div>
          </div>
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
