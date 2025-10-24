export interface QuickAddResult {
  title: string;
  tags: string[];
}

export function parseQuickAdd(input: string): QuickAddResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return { title: '', tags: [] };
  }

  const tokens = trimmed.split(/\s+/);
  const tags: string[] = [];
  const titleParts: string[] = [];

  for (const token of tokens) {
    if (token.startsWith('#') && token.length > 1) {
      const cleaned = token
        .replace(/^#+/, '')
        .replace(/[^a-z0-9-]/gi, '')
        .toLowerCase();

      if (cleaned.length > 0) {
        if (!tags.includes(cleaned)) {
          tags.push(cleaned);
        }
        continue;
      }
    }

    titleParts.push(token);
  }

  const title = titleParts.join(' ').trim();

  if (!title) {
    return { title: trimmed, tags };
  }

  return { title, tags };
}
