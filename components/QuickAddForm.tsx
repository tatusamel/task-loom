'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { toast } from 'react-hot-toast';

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
  const [state, formAction] = useFormState(action, initialState);

  useEffect(() => {
    if (state.status === 'success') {
      toast.success(state.message ?? 'Note captured.');
      if (inputRef.current) {
        inputRef.current.value = '';
        inputRef.current.focus();
      }
    } else if (state.status === 'error' && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-2 sm:flex-row sm:items-center"
      data-testid="quick-add-form"
    >
      <label htmlFor="quick-add-input" className="sr-only">
        Quick add note
      </label>
      <input
        ref={inputRef}
        id="quick-add-input"
        name="quickAdd"
        placeholder='Capture something… e.g. "Prep agenda #focus"'
        className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        autoComplete="off"
        data-testid="quick-add-input"
      />
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      data-testid="quick-add-submit"
    >
      {pending ? 'Adding…' : 'Add'}
    </button>
  );
}
