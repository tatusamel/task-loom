import { Prisma } from '@prisma/client';
import prisma from './prisma';
import type { NoteDTO, NoteStatus } from '@/types/note';
import { ensureTagsExist, normalizeTags } from './tags';

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
    pinned: note.pinned,
    archived: note.archived,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}

export async function getPinnedNotes(limit = 6): Promise<NoteDTO[]> {
  const notes = await prisma.note.findMany({
    include: noteInclude,
    where: { pinned: true, archived: false },
    orderBy: { updatedAt: 'desc' },
    take: limit,
  });

  return notes.map(serializeNote);
}

export async function getRecentNotes(limit = 8): Promise<NoteDTO[]> {
  const notes = await prisma.note.findMany({
    include: noteInclude,
    where: { archived: false },
    orderBy: { updatedAt: 'desc' },
    take: limit,
  });

  return notes.map(serializeNote);
}

export async function getNotes({
  query,
  tag,
  status,
}: {
  query?: string;
  tag?: string;
  status?: NoteStatus;
}): Promise<NoteDTO[]> {
  const where: Prisma.NoteWhereInput = {};

  if (status === 'active') {
    where.archived = false;
  } else if (status === 'archived') {
    where.archived = true;
  }

  if (query?.trim()) {
    where.OR = [
      { title: { contains: query.trim(), mode: 'insensitive' } },
      { content: { contains: query.trim(), mode: 'insensitive' } },
    ];
  }

  if (tag) {
    where.tags = {
      some: { name: tag },
    };
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

export async function getNoteById(id: string): Promise<NoteDTO | null> {
  const note = await prisma.note.findUnique({
    include: noteInclude,
    where: { id },
  });

  return note ? serializeNote(note) : null;
}

export const noteRelations = {
  include: noteInclude,
} as const;

export { getAllTags } from './tags';
