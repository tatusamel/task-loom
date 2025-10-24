import prisma from './prisma';

export function normalizeTags(tags: string[] = []): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const tag of tags) {
    const trimmed = tag.trim().toLowerCase();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    normalized.push(trimmed);
  }

  return normalized;
}

export async function ensureTagsExist(tags: string[]): Promise<void> {
  if (tags.length === 0) {
    return;
  }

  await Promise.all(
    tags.map(name =>
      prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );
}

export async function getAllTags(): Promise<string[]> {
  const tags = await prisma.tag.findMany({
    select: { name: true },
    orderBy: { name: 'asc' },
  });

  return tags.map(tag => tag.name);
}
