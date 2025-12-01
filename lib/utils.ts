export function cn(...classes: Array<string | undefined | null | false>): string {
  return classes.filter(Boolean).join(' ');
}

const tagPalette = [
  {
    background: 'bg-indigo-50/60',
    text: 'text-indigo-700',
    ring: 'ring-indigo-100/70',
    icon: 'text-indigo-400',
  },
  {
    background: 'bg-amber-50/60',
    text: 'text-amber-800',
    ring: 'ring-amber-100/70',
    icon: 'text-amber-400',
  },
  {
    background: 'bg-emerald-50/60',
    text: 'text-emerald-700',
    ring: 'ring-emerald-100/70',
    icon: 'text-emerald-400',
  },
  {
    background: 'bg-sky-50/60',
    text: 'text-sky-700',
    ring: 'ring-sky-100/70',
    icon: 'text-sky-400',
  },
  {
    background: 'bg-rose-50/60',
    text: 'text-rose-700',
    ring: 'ring-rose-100/70',
    icon: 'text-rose-400',
  },
  {
    background: 'bg-slate-50/70',
    text: 'text-slate-700',
    ring: 'ring-slate-200/80',
    icon: 'text-slate-400',
  },
];

function tagToPaletteIndex(tag: string) {
  let hash = 0;
  for (let i = 0; i < tag.length; i += 1) {
    hash = (hash + tag.charCodeAt(i) * 17) % 997;
  }
  return hash % tagPalette.length;
}

export function getTagTone(tag: string) {
  const normalized = tag.trim().toLowerCase();
  const index = tagToPaletteIndex(normalized || 'tag');
  return tagPalette[index];
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatDateTimeLocal(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function parseDateTimeInput(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

export function formatRelativeDue(dateString: string | null): string | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;

  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  // Get day of week for "this week" context
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = dayNames[date.getDay()];

  // Format time for "today" display
  const timeStr = new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

  // Overdue
  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return overdueDays === 1 ? '1 day overdue' : `${overdueDays} days overdue`;
  }

  // Today
  if (diffDays === 0) {
    return `Due today at ${timeStr}`;
  }

  // Tomorrow
  if (diffDays === 1) {
    return 'Due tomorrow';
  }

  // This week (2-6 days)
  if (diffDays <= 6) {
    return `Due in ${diffDays} days (${dayName})`;
  }

  // Later - use short date format
  const dateStr = new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(date);
  return `Due ${dateStr}`;
}

export function formatEffort(minutes: number | null | undefined): string | null {
  if (minutes === null || minutes === undefined) return null;
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining === 0 ? `${hours}h` : `${hours}h ${remaining}min`;
}

export function formatTotalEffort(minutes: number): string {
  if (minutes === 0) return '0 min';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining === 0 ? `${hours}h` : `${hours}h ${remaining}min`;
}
