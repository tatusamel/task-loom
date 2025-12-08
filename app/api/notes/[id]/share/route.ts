import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  createNoteShare,
  getNoteShare,
  deleteNoteShare,
  updateNoteSharePermission,
  SharePermission,
} from '@/lib/sharing';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

interface RouteParams {
  params: { id: string };
}

const createShareSchema = z.object({
  permission: z.enum(['view', 'edit']).optional().default('edit'),
});

const updateShareSchema = z.object({
  permission: z.enum(['view', 'edit']),
});

// GET - Get current share status for a note
export async function GET(_: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const share = await getNoteShare(params.id, userId);
    return NextResponse.json({ share });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    throw error;
  }
}

// POST - Create or enable sharing for a note
export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const json = await request.json().catch(() => ({}));
  const parsed = createShareSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const share = await createNoteShare(
      params.id,
      userId,
      parsed.data.permission as SharePermission
    );
    return NextResponse.json({ share }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    throw error;
  }
}

// PATCH - Update share permission
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = updateShareSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const share = await updateNoteSharePermission(
      params.id,
      userId,
      parsed.data.permission as SharePermission
    );

    if (!share) {
      return NextResponse.json(
        { error: 'Share not found. Create a share first.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ share });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    throw error;
  }
}

// DELETE - Remove sharing (revoke access)
export async function DELETE(_: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await deleteNoteShare(params.id, userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    throw error;
  }
}
