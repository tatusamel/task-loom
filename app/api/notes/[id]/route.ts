import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { noteRelations, serializeNote } from '@/lib/notes';
import { ensureTagsExist, normalizeTags } from '@/lib/tags';
import { updateNoteSchema } from '@/lib/validation';

interface RouteParams {
  params: { id: string };
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  const note = await prisma.note.findUnique({
    where: { id: params.id },
    include: noteRelations.include,
  });

  if (!note) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ note: serializeNote(note) });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
    await ensureTagsExist(normalizedTags);
  }

  const note = await prisma.note.update({
    where: { id: params.id },
    data: {
      ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
      ...(parsed.data.content !== undefined ? { content: parsed.data.content } : {}),
      ...(parsed.data.pinned !== undefined ? { pinned: parsed.data.pinned } : {}),
      ...(parsed.data.archived !== undefined ? { archived: parsed.data.archived } : {}),
      ...(normalizedTags !== undefined
        ? {
            tags: {
              set: normalizedTags.map(name => ({ name })),
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
  await prisma.note.delete({
    where: { id: params.id },
  });

  revalidatePath('/');
  revalidatePath('/notes');

  return NextResponse.json({ ok: true });
}
