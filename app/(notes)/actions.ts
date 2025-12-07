'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { parseQuickAdd } from '@/utils/parseQuickAdd';
import { createNoteSchema } from '@/lib/validation';
import { ensureTagsExist, normalizeTags } from '@/lib/tags';
import { auth } from '@/auth';

type QuickAddState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  noteId?: string;
};

export async function createQuickNoteAction(
  _: QuickAddState,
  formData: FormData,
): Promise<QuickAddState> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return {
      status: 'error',
      message: 'Please sign in to capture notes.',
    };
  }

  const rawInput = formData.get('quickAdd');
  const rawContent = formData.get('quickAddContent');
  if (typeof rawInput !== 'string' || !rawInput.trim()) {
    return {
      status: 'error',
      message: 'Please enter a note before submitting.',
    };
  }

  const parsed = parseQuickAdd(rawInput);
  const content = typeof rawContent === 'string' ? rawContent.trim() : '';
  const validation = createNoteSchema.safeParse({
    title: parsed.title,
    content: content || undefined,
    tags: parsed.tags,
  });

  if (!validation.success) {
    return {
      status: 'error',
      message: 'Unable to create note. Please adjust the title or tags.',
    };
  }

  try {
    const normalizedTags = normalizeTags(validation.data.tags);
    await ensureTagsExist(userId, normalizedTags);

    const note = await prisma.note.create({
      data: {
        userId,
        title: validation.data.title,
        content: validation.data.content ?? '',
        pinned: false,
        archived: false,
        tags:
          normalizedTags.length > 0
            ? {
                connect: normalizedTags.map(name => ({
                  userId_name: { userId, name },
                })),
              }
            : undefined,
      },
    });

    revalidatePath('/');
    revalidatePath('/notes');

    return {
      status: 'success',
      message: `Captured "${note.title}".`,
      noteId: note.id,
    };
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: 'Unexpected error while saving the note.',
    };
  }
}
