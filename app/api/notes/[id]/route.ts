import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { noteRelations, serializeNote } from '@/lib/notes';
import { ensureTagsExist, normalizeTags } from '@/lib/tags';
import { updateNoteSchema } from '@/lib/validation';
import { parseDateTimeInput } from '@/lib/utils';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

interface RouteParams {
  params: { id: string };
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const note = await prisma.note.findUnique({
    where: { id_userId: { id: params.id, userId } },
    include: noteRelations.include,
  });

  if (!note) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ note: serializeNote(note) });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = updateNoteSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const normalizedTags =
    parsed.data.tags !== undefined ? normalizeTags(parsed.data.tags) : undefined;

  if (normalizedTags) {
    await ensureTagsExist(userId, normalizedTags);
  }

  const dueAtDate =
    parsed.data.dueAt !== undefined
      ? parseDateTimeInput(parsed.data.dueAt ?? undefined)
      : undefined;

  const note = await prisma.note.update({
    where: { id_userId: { id: params.id, userId } },
    data: {
      ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
      ...(parsed.data.content !== undefined ? { content: parsed.data.content } : {}),
      ...(parsed.data.dueAt !== undefined ? { dueAt: dueAtDate ?? null } : {}),
      ...(parsed.data.estimatedEffort !== undefined
        ? { estimatedEffort: parsed.data.estimatedEffort ?? null }
        : {}),
      ...(parsed.data.importance !== undefined
        ? { importance: parsed.data.importance ?? null }
        : {}),
      ...(parsed.data.pinned !== undefined ? { pinned: parsed.data.pinned } : {}),
      ...(parsed.data.archived !== undefined ? { archived: parsed.data.archived } : {}),
      ...(normalizedTags !== undefined
        ? {
            tags: {
              set: normalizedTags.map(name => ({
                userId_name: {
                  userId,
                  name,
                },
              })),
            },
          }
        : {}),
    },
    include: noteRelations.include,
  });

  revalidatePath('/');
  revalidatePath('/notes');
  revalidatePath(`/notes/${params.id}`);

  return NextResponse.json({ note: serializeNote(note) });
}

export async function DELETE(_: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.note.delete({
    where: { id_userId: { id: params.id, userId } },
  });

  revalidatePath('/');
  revalidatePath('/notes');

  return NextResponse.json({ ok: true });
}
