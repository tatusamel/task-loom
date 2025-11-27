import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { taskQuerySchema, createTaskSchema } from '@/lib/validation';
import { parseDateTimeInput } from '@/lib/utils';
import { createTask, getTasks } from '@/lib/tasks';
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
  const raw = {
    status: searchParams.get('status') ?? undefined,
    tag: searchParams.get('tag') ?? undefined,
    project: searchParams.get('project') ?? undefined,
    query: searchParams.get('query') ?? undefined,
  };

  const parsed = taskQuerySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const tasks = await getTasks({ userId, ...parsed.data });
  return NextResponse.json({ tasks });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = createTaskSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const dueAtDate = parseDateTimeInput(parsed.data.dueAt ?? undefined);
  if (parsed.data.dueAt && !dueAtDate) {
    return NextResponse.json(
      { error: { formErrors: ['Invalid due date/time'] } },
      { status: 400 },
    );
  }

  const task = await createTask(userId, {
    title: parsed.data.title,
    notes: parsed.data.notes ?? null,
    dueAt: dueAtDate,
    estimatedEffort: parsed.data.estimatedEffort ?? null,
    importance: parsed.data.importance ?? null,
    project: parsed.data.project ?? null,
    tags: parsed.data.tags ?? [],
    completed: parsed.data.completed ?? false,
    archived: parsed.data.archived ?? false,
  });

  revalidatePath('/tasks');

  return NextResponse.json({ task }, { status: 201 });
}
