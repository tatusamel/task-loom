import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { createNoteSchema, noteQuerySchema } from '@/lib/validation';
import { getNotes, noteRelations, serializeNote } from '@/lib/notes';
import { ensureTagsExist, normalizeTags } from '@/lib/tags';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const tagParams = [
    ...searchParams.getAll('tag'),
    ...(searchParams.get('tags') ? [searchParams.get('tags') as string] : []),
  ];
  const raw = {
    query: searchParams.get('query') ?? undefined,
    tags: tagParams,
    status: searchParams.get('status') ?? undefined,
  };

  const parsed = noteQuerySchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const notes = await getNotes({ userId, ...parsed.data });

  return NextResponse.json({ notes });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  const parsed = createNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const tagNames = normalizeTags(parsed.data.tags ?? []);
  await ensureTagsExist(userId, tagNames);

  const note = await prisma.note.create({
    data: {
      userId,
      title: parsed.data.title,
      content: parsed.data.content ?? '',
      pinned: parsed.data.pinned ?? false,
      archived: parsed.data.archived ?? false,
      tags:
        tagNames.length > 0
          ? {
              connect: tagNames.map(name => ({
                userId_name: {
                  userId,
                  name,
                },
              })),
            }
          : undefined,
    },
    include: noteRelations.include,
  });

  revalidatePath('/');
  revalidatePath('/notes');

  return NextResponse.json(
    { note: serializeNote(note) },
    { status: 201 },
  );
}
