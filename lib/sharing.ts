import { nanoid } from 'nanoid';
import prisma from '@/lib/prisma';

export type SharePermission = 'view' | 'edit';

export interface NoteShareDTO {
  id: string;
  noteId: string;
  token: string;
  permission: SharePermission;
  createdAt: string;
  expiresAt: string | null;
  shareUrl: string;
}

/**
 * Generate a share token for a note
 */
export function generateShareToken(): string {
  // Use nanoid for URL-safe, collision-resistant tokens
  return nanoid(21);
}

/**
 * Get the full share URL for a token
 */
export function getShareUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  return `${baseUrl}/shared/${token}`;
}

/**
 * Serialize a NoteShare record to DTO
 */
function serializeNoteShare(share: {
  id: string;
  noteId: string;
  token: string;
  permission: string;
  createdAt: Date;
  expiresAt: Date | null;
}): NoteShareDTO {
  return {
    id: share.id,
    noteId: share.noteId,
    token: share.token,
    permission: share.permission as SharePermission,
    createdAt: share.createdAt.toISOString(),
    expiresAt: share.expiresAt?.toISOString() || null,
    shareUrl: getShareUrl(share.token),
  };
}

/**
 * Create a share link for a note
 */
export async function createNoteShare(
  noteId: string,
  userId: string,
  permission: SharePermission = 'edit'
): Promise<NoteShareDTO> {
  // Verify user owns the note
  const note = await prisma.note.findUnique({
    where: { id_userId: { id: noteId, userId } },
  });

  if (!note) {
    throw new Error('Note not found or access denied');
  }

  // Check if a share already exists
  const existingShare = await prisma.noteShare.findFirst({
    where: { noteId },
  });

  if (existingShare) {
    // Update permission if different
    if (existingShare.permission !== permission) {
      const updated = await prisma.noteShare.update({
        where: { id: existingShare.id },
        data: { permission },
      });
      return serializeNoteShare(updated);
    }
    return serializeNoteShare(existingShare);
  }

  // Create new share
  const share = await prisma.noteShare.create({
    data: {
      noteId,
      token: generateShareToken(),
      permission,
    },
  });

  return serializeNoteShare(share);
}

/**
 * Get share info for a note (by note owner)
 */
export async function getNoteShare(
  noteId: string,
  userId: string
): Promise<NoteShareDTO | null> {
  // Verify user owns the note
  const note = await prisma.note.findUnique({
    where: { id_userId: { id: noteId, userId } },
    include: { shares: true },
  });

  if (!note) {
    throw new Error('Note not found or access denied');
  }

  const share = note.shares[0];
  if (!share) return null;

  return serializeNoteShare(share);
}

/**
 * Delete a share link (revoke access)
 */
export async function deleteNoteShare(
  noteId: string,
  userId: string
): Promise<void> {
  // Verify user owns the note
  const note = await prisma.note.findUnique({
    where: { id_userId: { id: noteId, userId } },
  });

  if (!note) {
    throw new Error('Note not found or access denied');
  }

  await prisma.noteShare.deleteMany({
    where: { noteId },
  });
}

/**
 * Update share permission
 */
export async function updateNoteSharePermission(
  noteId: string,
  userId: string,
  permission: SharePermission
): Promise<NoteShareDTO | null> {
  // Verify user owns the note
  const note = await prisma.note.findUnique({
    where: { id_userId: { id: noteId, userId } },
    include: { shares: true },
  });

  if (!note) {
    throw new Error('Note not found or access denied');
  }

  const share = note.shares[0];
  if (!share) return null;

  const updated = await prisma.noteShare.update({
    where: { id: share.id },
    data: { permission },
  });

  return serializeNoteShare(updated);
}

/**
 * Validate a share token and get the note
 * Used for guest access
 */
export async function validateShareToken(token: string): Promise<{
  note: {
    id: string;
    title: string;
    content: string;
    updatedAt: Date;
  };
  permission: SharePermission;
} | null> {
  const share = await prisma.noteShare.findUnique({
    where: { token },
    include: {
      note: {
        select: {
          id: true,
          title: true,
          content: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!share) return null;

  // Check expiration
  if (share.expiresAt && share.expiresAt < new Date()) {
    return null;
  }

  return {
    note: share.note,
    permission: share.permission as SharePermission,
  };
}

/**
 * Check if a user (authenticated or guest via token) can access a room
 * Used by Liveblocks auth
 */
export async function canAccessRoom(
  roomId: string,
  userId: string | null,
  shareToken?: string
): Promise<{ canAccess: boolean; permission: SharePermission }> {
  // Extract note ID from room ID (format: "note-{noteId}")
  const noteIdMatch = roomId.match(/^note-(.+)$/);
  if (!noteIdMatch) {
    return { canAccess: false, permission: 'view' };
  }
  const noteId = noteIdMatch[1];

  // Check if authenticated user owns the note
  if (userId) {
    const note = await prisma.note.findUnique({
      where: { id_userId: { id: noteId, userId } },
    });
    if (note) {
      return { canAccess: true, permission: 'edit' };
    }
  }

  // Check share token access
  if (shareToken) {
    const share = await prisma.noteShare.findFirst({
      where: {
        noteId,
        token: shareToken,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });
    if (share) {
      return { canAccess: true, permission: share.permission as SharePermission };
    }
  }

  // Check if there's any active share for this note (for logged-in users viewing shared notes)
  if (userId) {
    const share = await prisma.noteShare.findFirst({
      where: {
        noteId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });
    if (share) {
      return { canAccess: true, permission: share.permission as SharePermission };
    }
  }

  return { canAccess: false, permission: 'view' };
}
