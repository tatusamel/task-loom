import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { parseDateTimeInput } from '@/lib/utils';
import { deleteTask, getTaskById, updateTask } from '@/lib/tasks';
import { updateTaskSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

interface RouteParams {
  params: { id: string };
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  const task = await getTaskById(params.id);
  if (!task) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ task });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const json = await request.json().catch(() => null);
  const parsed = updateTaskSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const dueAt =
    parsed.data.dueAt !== undefined ? parseDateTimeInput(parsed.data.dueAt ?? undefined) : undefined;

  if (parsed.data.dueAt && dueAt === null) {
    return NextResponse.json(
      { error: { formErrors: ['Invalid due date/time'] } },
      { status: 400 },
    );
  }

  const task = await updateTask(params.id, {
    title: parsed.data.title,
    notes: parsed.data.notes,
    dueAt,
    estimatedEffort: parsed.data.estimatedEffort,
    importance: parsed.data.importance,
    project: parsed.data.project,
    completed: parsed.data.completed,
    archived: parsed.data.archived,
    tags: parsed.data.tags,
  });

  revalidatePath('/tasks');
  revalidatePath(`/tasks/${params.id}`);

  return NextResponse.json({ task });
}

export async function DELETE(_: NextRequest, { params }: RouteParams) {
  await deleteTask(params.id);
  revalidatePath('/tasks');
  return NextResponse.json({ ok: true });
}
