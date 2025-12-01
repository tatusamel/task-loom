'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoaderIcon, PlusIcon } from '@/components/icons';

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

  useEffect(() => {
    if (state.status === 'success') {
      toast.success(state.message ?? 'Note captured.');
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
        <Input
          ref={inputRef}
          id="quick-add-input"
          name="quickAdd"
          placeholder='Capture something… e.g. "Prep agenda #focus"'
          className="flex-1"
          autoComplete="off"
          data-testid="quick-add-input"
          onFocus={() => setExpanded(true)}
        />
        {!expanded ? <SubmitButton /> : null}
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

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      size="default"
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
