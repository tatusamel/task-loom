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

export async function ensureTagsExist(userId: string, tags: string[]): Promise<void> {
  if (tags.length === 0) {
    return;
  }

  await Promise.all(
    tags.map(name =>
      prisma.tag.upsert({
        where: {
          userId_name: {
            userId,
            name,
          },
        },
        update: {},
        create: { name, userId },
      }),
    ),
  );
}

export async function getAllTags(userId: string): Promise<string[]> {
  const tags = await prisma.tag.findMany({
    select: { name: true },
    where: { userId },
    orderBy: { name: 'asc' },
  });

  return tags.map(tag => tag.name);
}
