type PriorityLabel = 'high' | 'medium' | 'low';

export interface QuickAddResult {
  title: string;
  tags: string[];
  priority?: PriorityLabel;
  importance?: number;
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

const PRIORITY_TO_IMPORTANCE: Record<PriorityLabel, number> = {
  high: 5,
  medium: 3,
  low: 1,
};

export function parseQuickAdd(input: string): QuickAddResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return { title: '', tags: [] };
  }

  const tokens = trimmed.split(/\s+/);
  const tags: string[] = [];
  const titleParts: string[] = [];
  let priority: PriorityLabel | undefined;
  let importance: number | undefined;

  for (let index = 0; index < tokens.length; ) {
    const token = tokens[index];
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

    const priorityResult = tryParsePriorityToken(token);
    if (priorityResult) {
      priority = priorityResult.label;
      importance = priorityResult.importance;
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

  if (priority) {
    result.priority = priority;
    result.importance = importance ?? PRIORITY_TO_IMPORTANCE[priority];
  }

  return result;
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
