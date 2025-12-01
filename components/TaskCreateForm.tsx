'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { CalendarIcon, ClockIcon, LoaderIcon, SparklesIcon, TagIcon } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from './TagInput';

// Priority options with color coding
const PRIORITY_OPTIONS = [
  {
    value: 'high',
    label: 'High',
    color: 'bg-red-500',
    hoverColor: 'hover:bg-red-100',
    textColor: 'text-red-700',
    importance: 5,
    description: 'Urgent & important – Do it now',
  },
  {
    value: 'medium',
    label: 'Medium',
    color: 'bg-amber-500',
    hoverColor: 'hover:bg-amber-100',
    textColor: 'text-amber-700',
    importance: 3,
    description: 'Important – Schedule it soon',
  },
  {
    value: 'low',
    label: 'Low',
    color: 'bg-slate-400',
    hoverColor: 'hover:bg-slate-100',
    textColor: 'text-slate-600',
    importance: 1,
    description: 'Nice to have – Do when time permits',
  },
] as const;

// Effort presets in minutes
const EFFORT_PRESETS = [
  { value: 15, label: '15m' },
  { value: 30, label: '30m' },
  { value: 60, label: '1h' },
  { value: 120, label: '2h' },
  { value: 240, label: '4h' },
  { value: 480, label: '8h' },
] as const;

// Time options for dropdown (every 15 minutes)
const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => {
  const hours = Math.floor(i / 4);
  const minutes = (i % 4) * 15;
  const value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  const label = format(new Date(2000, 0, 1, hours, minutes), 'h:mm a');
  return { value, label };
});

function formatEffort(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

function normalizeTagInput(tags: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const tag of tags) {
    const trimmed = tag.trim().toLowerCase();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    normalized.push(trimmed);
  }

  return normalized;
}

interface TaskCreateFormProps {
  onCreated?: () => void;
}

export function TaskCreateForm({ onCreated }: TaskCreateFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [dueTime, setDueTime] = useState('');
  const [estimatedEffort, setEstimatedEffort] = useState<number | null>(null);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low' | null>(null);
  const [project, setProject] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const resetForm = () => {
    setTitle('');
    setNotes('');
    setDueDate(undefined);
    setDueTime('');
    setEstimatedEffort(null);
    setPriority(null);
    setProject('');
    setTags([]);
  };

  // Combine date and time into ISO string for API
  const getDueAtValue = (): string | undefined => {
    if (!dueDate) return undefined;
    const date = new Date(dueDate);
    if (dueTime) {
      const [hours, minutes] = dueTime.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
    } else {
      date.setHours(23, 59, 0, 0); // Default to end of day
    }
    return date.toISOString();
  };

  // Map priority to importance value
  const getImportanceValue = (): number | undefined => {
    if (!priority) return undefined;
    return PRIORITY_OPTIONS.find(p => p.value === priority)?.importance;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          notes: notes.trim() || undefined,
          dueAt: getDueAtValue(),
          estimatedEffort: estimatedEffort || undefined,
          importance: getImportanceValue(),
          project: project || undefined,
          tags: normalizeTagInput(tags),
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          payload?.error?.formErrors?.[0] ??
            payload?.error ??
            'Unable to create task. Please review the fields.',
        );
      }

      toast.success('Task created.');
      resetForm();
      router.refresh();
      onCreated?.();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card as="form" onSubmit={handleSubmit} className="space-y-4" data-testid="task-create-form">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
            <SparklesIcon className="h-5 w-5 text-purple-600" aria-hidden />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">Create a task</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Capture details now; prioritization comes later
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <Label
            htmlFor="task-title"
            className="text-xs font-medium uppercase tracking-wide text-slate-500"
          >
            Title<span className="text-rose-500 ml-0.5">*</span>
          </Label>
          <div className="mt-1">
            <Input
              id="task-title"
              name="title"
              value={title}
              onChange={event => setTitle(event.target.value)}
              placeholder="Draft launch plan"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="text-xs font-medium uppercase tracking-wide text-slate-500 flex items-center gap-2">
              <CalendarIcon className="h-3.5 w-3.5" aria-hidden />
              Due date
            </Label>
            <div className="mt-1">
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !dueDate ? 'text-slate-400' : ''
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'MMM d, yyyy') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={date => {
                      setDueDate(date);
                      setDatePickerOpen(false);
                    }}
                    initialFocus
                  />
                  <div className="border-t border-slate-100 px-3 py-2 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500">
                      {dueDate ? format(dueDate, 'EEE, MMM d') : 'No date'}
                    </span>
                    {dueDate && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[11px] text-slate-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setDueDate(undefined);
                          setDueTime('');
                          setDatePickerOpen(false);
                        }}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div>
            <Label className="text-xs font-medium uppercase tracking-wide text-slate-500 flex items-center gap-2">
              <ClockIcon className="h-3.5 w-3.5" aria-hidden />
              Time
            </Label>
            <div className="mt-1">
              <select
                value={dueTime}
                onChange={e => setDueTime(e.target.value)}
                disabled={!dueDate}
                className={`flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${
                  !dueTime ? 'text-slate-400' : 'text-slate-900'
                }`}
              >
                <option value="">End of day</option>
                {TIME_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Priority Selector */}
        <div>
          <Label className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Priority
          </Label>
          <div className="mt-2 flex gap-2">
            {PRIORITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPriority(priority === opt.value ? null : opt.value)}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all border ${
                  priority === opt.value
                    ? `${opt.color} text-white border-transparent shadow-sm`
                    : `border-slate-200 ${opt.textColor} ${opt.hoverColor}`
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${priority === opt.value ? 'bg-white' : opt.color}`}
                />
                {opt.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            {priority
              ? PRIORITY_OPTIONS.find(p => p.value === priority)?.description
              : 'Select priority level'}
          </p>
        </div>

        {/* Effort Presets */}
        <div>
          <Label className="text-xs font-medium uppercase tracking-wide text-slate-500 flex items-center gap-2">
            <ClockIcon className="h-3.5 w-3.5" aria-hidden />
            Estimated effort
          </Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {EFFORT_PRESETS.map(preset => (
              <button
                key={preset.value}
                type="button"
                onClick={() =>
                  setEstimatedEffort(estimatedEffort === preset.value ? null : preset.value)
                }
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all border ${
                  estimatedEffort === preset.value
                    ? 'bg-slate-800 text-white border-transparent shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {preset.label}
              </button>
            ))}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-all border inline-flex items-center gap-1.5 ${
                    estimatedEffort && !EFFORT_PRESETS.some(p => p.value === estimatedEffort)
                      ? 'bg-slate-800 text-white border-transparent shadow-sm'
                      : 'border-dashed border-slate-300 text-slate-500 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-600'
                  }`}
                >
                  {estimatedEffort && !EFFORT_PRESETS.some(p => p.value === estimatedEffort) ? (
                    formatEffort(estimatedEffort)
                  ) : (
                    <>
                      <span className="text-base leading-none">+</span>
                      <span>Custom</span>
                    </>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3" align="start" sideOffset={4}>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Custom duration</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={5}
                        max={480}
                        step={5}
                        placeholder="45"
                        value={
                          estimatedEffort && !EFFORT_PRESETS.some(p => p.value === estimatedEffort)
                            ? estimatedEffort
                            : ''
                        }
                        onChange={e => {
                          const val = e.target.value ? Number(e.target.value) : null;
                          setEstimatedEffort(val);
                        }}
                        className="flex-1"
                      />
                      <span className="text-sm text-slate-500 whitespace-nowrap">minutes</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[45, 90, 180, 360].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setEstimatedEffort(val)}
                        className="px-2 py-1 text-xs rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        {formatEffort(val)}
                      </button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            {estimatedEffort && (
              <button
                type="button"
                onClick={() => setEstimatedEffort(null)}
                className="rounded-xl px-2 py-2 text-sm text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                title="Clear effort"
              >
                ✕
              </button>
            )}
          </div>
          {estimatedEffort && (
            <p className="mt-1.5 text-xs text-slate-500">
              {formatEffort(estimatedEffort)} estimated
            </p>
          )}
        </div>

        <div>
          <Label
            htmlFor="task-project"
            className="text-xs font-medium uppercase tracking-wide text-slate-500"
          >
            Project
          </Label>
          <div className="mt-1">
            <Input
              id="task-project"
              value={project}
              onChange={event => setProject(event.target.value)}
              placeholder="Website refresh"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs font-medium uppercase tracking-wide text-slate-500 flex items-center gap-2">
            <TagIcon className="h-3.5 w-3.5" aria-hidden />
            Tags
          </Label>
          <div className="mt-1">
            <TagInput value={tags} onChange={setTags} placeholder="Add tags and press Enter" />
          </div>
        </div>

        <div>
          <Label
            htmlFor="task-notes"
            className="text-xs font-medium uppercase tracking-wide text-slate-500"
          >
            Notes
          </Label>
          <div className="mt-1">
            <Textarea
              id="task-notes"
              value={notes}
              onChange={event => setNotes(event.target.value)}
              rows={4}
              className="leading-6"
              placeholder="Add any additional context…"
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <LoaderIcon className="h-4 w-4 animate-spin" aria-hidden />
              Saving…
            </span>
          ) : (
            'Add task'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
