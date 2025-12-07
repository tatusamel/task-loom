import { Prisma } from '@prisma/client';
import prisma from './prisma';
import type { NoteDTO, NoteStatus } from '@/types/note';

const noteInclude = {
  tags: {
    select: { name: true },
  },
} satisfies Prisma.NoteInclude;

export function serializeNote(
  note: Prisma.NoteGetPayload<{ include: typeof noteInclude }>,
): NoteDTO {
  const tagNames = note.tags.map(tag => tag.name).sort((a, b) => a.localeCompare(b));

  return {
    id: note.id,
    title: note.title,
    content: note.content,
    tags: tagNames,
    importance: note.importance ?? null,
    pinned: note.pinned,
    archived: note.archived,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}

export async function getPinnedNotes(userId: string, limit = 6): Promise<NoteDTO[]> {
  const notes = await prisma.note.findMany({
    include: noteInclude,
    where: { pinned: true, archived: false, userId },
    orderBy: { updatedAt: 'desc' },
    take: limit,
  });

  return notes.map(serializeNote);
}

export async function getRecentNotes(userId: string, limit = 8): Promise<NoteDTO[]> {
  const notes = await prisma.note.findMany({
    include: noteInclude,
    where: { archived: false, userId },
    orderBy: { updatedAt: 'desc' },
    take: limit,
  });

  return notes.map(serializeNote);
}

export async function getNotes({
  userId,
  query,
  tags,
  status,
}: {
  userId: string;
  query?: string;
  tags?: string[];
  status?: NoteStatus;
}): Promise<NoteDTO[]> {
  const where: Prisma.NoteWhereInput = {
    userId,
  };

  if (status === 'active') {
    where.archived = false;
  } else if (status === 'archived') {
    where.archived = true;
  }

  if (query?.trim()) {
    where.OR = [
      { title: { contains: query.trim() } },
      { content: { contains: query.trim() } },
    ];
  }

  const normalizedTags = tags?.map(tag => tag.trim()).filter(Boolean) ?? [];

  if (normalizedTags.length > 0) {
    const existingAnd = where.AND ? (Array.isArray(where.AND) ? where.AND : [where.AND]) : [];
    where.AND = [
      ...existingAnd,
      ...normalizedTags.map(tag => ({
        tags: {
          some: { name: tag, userId },
        },
      })),
    ];
  }

  const notes = await prisma.note.findMany({
    include: noteInclude,
    where,
    orderBy: [
      { pinned: 'desc' },
      { updatedAt: 'desc' },
    ],
  });

  return notes.map(serializeNote);
}

export async function getNoteById(userId: string, id: string): Promise<NoteDTO | null> {
  const note = await prisma.note.findUnique({
    include: noteInclude,
    where: { id_userId: { id, userId } },
  });

  return note ? serializeNote(note) : null;
}

export const noteRelations = {
  include: noteInclude,
} as const;

export { getAllTags } from './tags';
