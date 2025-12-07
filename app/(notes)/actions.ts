'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { parseQuickAdd } from '@/utils/parseQuickAdd';
import { createNoteSchema } from '@/lib/validation';
import { ensureTagsExist, normalizeTags } from '@/lib/tags';
import { auth } from '@/auth';

function convertDateTokenToIso(dateToken: string): string | undefined {
  const match = dateToken.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return undefined;
  }
  const [, yearStr, monthStr, dayStr] = match;
  const year = Number(yearStr);
  const month = Number(monthStr) - 1;
  const day = Number(dayStr);
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return undefined;
  }
  const date = new Date(Date.UTC(year, month, day, 12, 0, 0));
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

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
  const quickDueAt = parsed.dueDate ? convertDateTokenToIso(parsed.dueDate) : undefined;
  const validation = createNoteSchema.safeParse({
    title: parsed.title,
    content: content || undefined,
    tags: parsed.tags,
    dueAt: quickDueAt,
    estimatedEffort: parsed.estimatedEffortMinutes,
    importance: parsed.importance,
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
        dueAt: validation.data.dueAt ? new Date(validation.data.dueAt) : null,
        estimatedEffort: validation.data.estimatedEffort ?? null,
        importance: validation.data.importance ?? null,
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
