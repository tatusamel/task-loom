type PriorityLabel = 'high' | 'medium' | 'low';

export interface QuickAddResult {
  title: string;
  tags: string[];
  dueDate?: string; // ISO date (YYYY-MM-DD)
  estimatedEffortMinutes?: number;
  priority?: PriorityLabel;
  importance?: number;
}

interface DueParseResult {
  isoDate: string;
  additionalTokens: number;
}

interface PriorityParseResult {
  label: PriorityLabel;
  importance: number;
}

const PRIORITY_KEYWORD_MAP: Record<string, PriorityLabel> = {
  high: 'high',
  urgent: 'high',
  asap: 'high',
  now: 'high',
  critical: 'high',
  hot: 'high',
  fire: 'high',
  med: 'medium',
  medium: 'medium',
  normal: 'medium',
  soon: 'medium',
  default: 'medium',
  low: 'low',
  chill: 'low',
  later: 'low',
  someday: 'low',
  backburner: 'low',
};

const PRIORITY_EMOJI_MAP = new Map<string, PriorityLabel>([
  ['🔥', 'high'],
  ['⚡', 'high'],
  ['‼️', 'high'],
  ['🚨', 'high'],
  ['⏰', 'high'],
  ['⭐', 'medium'],
  ['✨', 'medium'],
  ['⬆️', 'medium'],
  ['🔶', 'medium'],
  ['🐢', 'low'],
  ['🌱', 'low'],
  ['⬇️', 'low'],
  ['🌙', 'low'],
]);

const WEEKDAY_MAP: Record<string, number> = {
  sun: 0,
  sunday: 0,
  mon: 1,
  monday: 1,
  tue: 2,
  tues: 2,
  tuesday: 2,
  wed: 3,
  weds: 3,
  wednesday: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  fri: 5,
  friday: 5,
  sat: 6,
  saturday: 6,
};

const MONTH_MAP: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

const DUE_KEYWORDS: Record<string, number> = {
  today: 0,
  tdy: 0,
  tonight: 0,
  tomorrow: 1,
  tmr: 1,
  tmrw: 1,
  tmmrw: 1,
};

const PRIORITY_TO_IMPORTANCE: Record<PriorityLabel, number> = {
  high: 5,
  medium: 3,
  low: 1,
};

export function parseQuickAdd(input: string, referenceDate: Date = new Date()): QuickAddResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return { title: '', tags: [] };
  }

  const tokens = trimmed.split(/\s+/);
  const tags: string[] = [];
  const titleParts: string[] = [];
  let dueDate: string | undefined;
  let estimatedEffortMinutes: number | undefined;
  let priority: PriorityLabel | undefined;
  let importance: number | undefined;

  for (let index = 0; index < tokens.length; ) {
    const token = tokens[index];
    const nextToken = tokens[index + 1];
    const afterNextToken = tokens[index + 2];

    if (token.startsWith('#') && token.length > 1) {
      const cleanedTag = token
        .replace(/^#+/, '')
        .replace(/[^a-z0-9-]/gi, '')
        .toLowerCase();

      if (cleanedTag.length > 0) {
        if (!tags.includes(cleanedTag)) {
          tags.push(cleanedTag);
        }
        index += 1;
        continue;
      }
    }

    const dueResult = tryParseDueToken(token, nextToken, afterNextToken, referenceDate);
    if (dueResult) {
      dueDate = dueResult.isoDate;
      index += 1 + dueResult.additionalTokens;
      continue;
    }

    const priorityResult = tryParsePriorityToken(token);
    if (priorityResult) {
      priority = priorityResult.label;
      importance = priorityResult.importance;
      index += 1;
      continue;
    }

    const effortResult = tryParseEffortToken(token);
    if (effortResult !== undefined) {
      estimatedEffortMinutes = (estimatedEffortMinutes ?? 0) + effortResult;
      index += 1;
      continue;
    }

    titleParts.push(token);
    index += 1;
  }

  const title = titleParts.join(' ').trim();
  const finalTitle = title || trimmed;

  const result: QuickAddResult = {
    title: finalTitle,
    tags,
  };

  if (dueDate) {
    result.dueDate = dueDate;
  }
  if (typeof estimatedEffortMinutes === 'number' && estimatedEffortMinutes > 0) {
    result.estimatedEffortMinutes = estimatedEffortMinutes;
  }
  if (priority) {
    result.priority = priority;
    result.importance = importance ?? PRIORITY_TO_IMPORTANCE[priority];
  }

  return result;
}

function tryParseDueToken(
  token: string,
  nextToken: string | undefined,
  afterNextToken: string | undefined,
  referenceDate: Date,
): DueParseResult | undefined {
  const normalized = normalizeToken(token);
  if (!normalized) {
    return undefined;
  }

  const nextNormalized = nextToken ? normalizeToken(nextToken) : undefined;

  // Handle "due tomorrow" / "by friday"
  if ((normalized === 'due' || normalized === 'by') && nextNormalized) {
    const nextDue = parseDueValue(nextNormalized, referenceDate);
    if (nextDue) {
      return { isoDate: nextDue, additionalTokens: 1 };
    }
  }

  // Handle "next friday"
  if (normalized === 'next' && nextNormalized) {
    const nextWeekday = WEEKDAY_MAP[nextNormalized];
    if (typeof nextWeekday === 'number') {
      const nextDate = getUpcomingWeekday(referenceDate, nextWeekday, true);
      return { isoDate: toISODate(nextDate), additionalTokens: 1 };
    }
  }

  // Handle "in 3d" / "in 3 days"
  if (normalized === 'in' && nextNormalized) {
    const combinedRelative =
      nextNormalized && afterNextToken
        ? `${nextNormalized}${normalizeToken(afterNextToken)}`
        : undefined;
    const relativeString = combinedRelative ?? nextNormalized;
    const relative = parseRelativeDue(relativeString, referenceDate);
    if (relative) {
      const additionalTokens = combinedRelative ? 2 : 1;
      return { isoDate: relative, additionalTokens };
    }
  }

  // Handle combined tokens like "due:tomorrow" / "next-friday"
  const combinedResult = tryParseCombinedDue(normalized, referenceDate);
  if (combinedResult) {
    return { isoDate: combinedResult, additionalTokens: 0 };
  }

  return undefined;
}

function tryParseCombinedDue(token: string, referenceDate: Date): string | undefined {
  let base = stripPrefixes(token, ['due:', 'due=', 'due@']);
  base = stripPrefixes(base, ['by:']);

  if (base !== token) {
    const parsed = parseDueValue(base, referenceDate);
    if (parsed) {
      return parsed;
    }
  }

  if (base.startsWith('due') && base.length > 3) {
    const parsed = parseDueValue(base.slice(3), referenceDate);
    if (parsed) {
      return parsed;
    }
  }

  if (base.startsWith('by') && base.length > 2) {
    const parsed = parseDueValue(base.slice(2), referenceDate);
    if (parsed) {
      return parsed;
    }
  }

  if (base.startsWith('in') && base.length > 2) {
    const parsed = parseRelativeDue(base.slice(2), referenceDate);
    if (parsed) {
      return parsed;
    }
  }

  if (base.includes('-') || base.includes('_')) {
    const [first, second] = base.split(/[-_]/);
    if (first && second) {
      if (first === 'next' && WEEKDAY_MAP[second]) {
        const date = getUpcomingWeekday(referenceDate, WEEKDAY_MAP[second], true);
        return toISODate(date);
      }
      if (first === 'due' || first === 'by') {
        const parsed = parseDueValue(second, referenceDate);
        if (parsed) {
          return parsed;
        }
      }
    }
  }

  return parseDueValue(base, referenceDate);
}

function parseDueValue(token: string, referenceDate: Date): string | undefined {
  if (!token) return undefined;

  if (DUE_KEYWORDS[token] !== undefined) {
    const offset = DUE_KEYWORDS[token];
    const date = addDays(startOfDay(referenceDate), offset);
    return toISODate(date);
  }

  if (token.startsWith('next') && token.length > 4) {
    const weekdayPart = token.slice(4);
    const weekday = WEEKDAY_MAP[weekdayPart];
    if (typeof weekday === 'number') {
      const date = getUpcomingWeekday(referenceDate, weekday, true);
      return toISODate(date);
    }
  }

  const weekday = WEEKDAY_MAP[token];
  if (typeof weekday === 'number') {
    const date = getUpcomingWeekday(referenceDate, weekday, false);
    return toISODate(date);
  }

  const relative = parseRelativeDue(token, referenceDate);
  if (relative) {
    return relative;
  }

  const isoDate = parseISODate(token);
  if (isoDate) {
    return isoDate;
  }

  const slashDate = parseSlashDate(token, referenceDate);
  if (slashDate) {
    return slashDate;
  }

  const monthDate = parseMonthDate(token, referenceDate);
  if (monthDate) {
    return monthDate;
  }

  return undefined;
}

function parseRelativeDue(token: string, referenceDate: Date): string | undefined {
  const relativeMatch = token.match(/^(?:\+)?(\d+)(d|day|days|w|week|weeks)$/);

  if (relativeMatch) {
    const [, value, unit] = relativeMatch;
    const amount = Number(value);
    if (Number.isNaN(amount) || amount <= 0) {
      return undefined;
    }

    const unitLower = unit.toLowerCase();
    const days = unitLower.startsWith('w') ? amount * 7 : amount;
    const date = addDays(startOfDay(referenceDate), days);
    return toISODate(date);
  }

  return undefined;
}

function parseISODate(token: string): string | undefined {
  const isoMatch = token.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!isoMatch) return undefined;

  const [, yearStr, monthStr, dayStr] = isoMatch;
  const year = Number(yearStr);
  const month = Number(monthStr) - 1;
  const day = Number(dayStr);
  if (!isValidDate(year, month, day)) {
    return undefined;
  }
  return toISODate(new Date(year, month, day));
}

function parseSlashDate(token: string, referenceDate: Date): string | undefined {
  const match = token.match(/^(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?$/);
  if (!match) return undefined;

  const [, monthStr, dayStr, yearStr] = match;
  const month = Number(monthStr) - 1;
  const day = Number(dayStr);
  let year = yearStr ? normalizeYear(yearStr) : referenceDate.getFullYear();

  if (!isValidDate(year, month, day)) {
    return undefined;
  }

  let candidate = new Date(year, month, day);
  if (!yearStr && candidate < startOfDay(referenceDate)) {
    candidate = new Date(year + 1, month, day);
  }

  return toISODate(candidate);
}

function parseMonthDate(token: string, referenceDate: Date): string | undefined {
  const match = token.match(/^([a-zA-Z]+)(?:[-]?)(\d{1,2})$/);
  if (!match) return undefined;

  const [, monthText, dayStr] = match;
  const month = MONTH_MAP[monthText.toLowerCase()];
  if (month === undefined) return undefined;

  const day = Number(dayStr);
  if (!isValidDate(referenceDate.getFullYear(), month, day)) {
    return undefined;
  }

  let candidate = new Date(referenceDate.getFullYear(), month, day);
  if (candidate < startOfDay(referenceDate)) {
    candidate = new Date(referenceDate.getFullYear() + 1, month, day);
  }

  return toISODate(candidate);
}

function tryParsePriorityToken(token: string): PriorityParseResult | undefined {
  const trimmed = token.trim();
  if (!trimmed) return undefined;

  const emojiPriority = PRIORITY_EMOJI_MAP.get(trimmed);
  if (emojiPriority) {
    return {
      label: emojiPriority,
      importance: PRIORITY_TO_IMPORTANCE[emojiPriority],
    };
  }

  let normalized = normalizeToken(trimmed);
  if (!normalized) return undefined;

  if (/^!{2,}$/.test(normalized)) {
    return { label: 'high', importance: PRIORITY_TO_IMPORTANCE.high };
  }

  normalized = stripPrefixes(normalized, ['priority:', 'prio:', 'p:', 'importance:']);
  if (normalized.startsWith('!') && normalized.length > 1) {
    normalized = normalized.replace(/^!+/, '');
    if (!normalized) {
      return { label: 'high', importance: PRIORITY_TO_IMPORTANCE.high };
    }
  }

  const mapped = PRIORITY_KEYWORD_MAP[normalized];
  if (mapped) {
    return {
      label: mapped,
      importance: PRIORITY_TO_IMPORTANCE[mapped],
    };
  }

  const pMatch = normalized.match(/^p([0-5])$/);
  if (pMatch) {
    const level = Number(pMatch[1]);
    if (level <= 1) {
      return { label: 'high', importance: PRIORITY_TO_IMPORTANCE.high };
    }
    if (level === 2) {
      return { label: 'medium', importance: 3 };
    }
    return { label: 'low', importance: 1 };
  }

  return undefined;
}

function tryParseEffortToken(token: string): number | undefined {
  let normalized = normalizeToken(token);
  if (!normalized) return undefined;

  normalized = normalized.replace(/^[~≈]/, '');
  normalized = stripPrefixes(normalized, ['eta:', 'effort:', 'time:', 'duration:', 'dur:']);
  if (!normalized) {
    return undefined;
  }

  if (/^\d+h\d+m$/.test(normalized)) {
    const [hoursPart, minutesPart] = normalized.split('h');
    const hours = Number(hoursPart);
    const minutes = Number(minutesPart.replace(/m$/, ''));
    return hours * 60 + minutes;
  }

  const hourMinuteMatch = normalized.match(/^(\d+)h(?:([\d]{1,2})m?)?$/);
  if (hourMinuteMatch) {
    const [, hoursStr, minutesStr] = hourMinuteMatch;
    const hours = Number(hoursStr);
    const minutes = minutesStr ? Number(minutesStr) : 0;
    return hours * 60 + minutes;
  }

  const decimalHourMatch = normalized.match(/^(\d+(?:\.\d+)?)h$/);
  if (decimalHourMatch) {
    const [, hoursStr] = decimalHourMatch;
    return Math.round(Number(hoursStr) * 60);
  }

  const minuteMatch = normalized.match(/^(\d+)(?:m|min|mins|minute|minutes)$/);
  if (minuteMatch) {
    return Number(minuteMatch[1]);
  }

  return undefined;
}

function normalizeToken(token: string): string {
  return token
    .toLowerCase()
    .replace(/^[\s({\[<]+/, '')
    .replace(/[\s)\]\}>.,!?;:]+$/, '');
}

function stripPrefixes(token: string, prefixes: string[]): string {
  for (const prefix of prefixes) {
    if (token.startsWith(prefix)) {
      return token.slice(prefix.length);
    }
  }
  return token;
}

function addDays(date: Date, amount: number): Date {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + amount);
  return result;
}

function startOfDay(date: Date): Date {
  const result = new Date(date.getTime());
  result.setHours(0, 0, 0, 0);
  return result;
}

function getUpcomingWeekday(reference: Date, targetDay: number, forceNextWeek: boolean): Date {
  const result = startOfDay(reference);
  const currentDay = result.getDay();
  let delta = targetDay - currentDay;

  if (forceNextWeek) {
    delta += 7;
  }

  if (delta <= 0) {
    delta += 7;
  }

  result.setDate(result.getDate() + delta);
  return result;
}

function toISODate(date: Date): string {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().slice(0, 10);
}

function isValidDate(year: number, month: number, day: number): boolean {
  const date = new Date(year, month, day);
  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
}

function normalizeYear(yearStr: string): number {
  if (yearStr.length === 2) {
    const year = Number(yearStr);
    return year >= 70 ? 1900 + year : 2000 + year;
  }
  return Number(yearStr);
}
