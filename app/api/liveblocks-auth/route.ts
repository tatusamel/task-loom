import { NextRequest, NextResponse } from 'next/server';
import { Liveblocks } from '@liveblocks/node';
import { auth } from '@/auth';
import { canAccessRoom } from '@/lib/sharing';

// Initialize Liveblocks lazily to avoid build-time errors when key is not set
let liveblocks: Liveblocks | null = null;

function getLiveblocks(): Liveblocks {
  if (!liveblocks) {
    const secret = process.env.LIVEBLOCKS_SECRET_KEY;
    if (!secret) {
      throw new Error('LIVEBLOCKS_SECRET_KEY is not configured');
    }
    liveblocks = new Liveblocks({ secret });
  }
  return liveblocks;
}

// Generate a random color for user avatars
function getRandomColor(): string {
  const colors = [
    '#E57373', '#F06292', '#BA68C8', '#9575CD', '#7986CB',
    '#64B5F6', '#4FC3F7', '#4DD0E1', '#4DB6AC', '#81C784',
    '#AED581', '#DCE775', '#FFD54F', '#FFB74D', '#FF8A65',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export async function POST(request: NextRequest) {
  // Parse request body once
  let body: { room?: string; name?: string; shareToken?: string } = {};
  try {
    body = await request.json();
  } catch {
    // No body or invalid JSON
  }

  const roomId = body.room;

  // Check for authenticated user
  const session = await auth();
  const userId = session?.user?.id;
  const userName = session?.user?.name;

  // Determine user identity
  let id: string;
  let name: string;
  let isGuest = false;

  if (userId) {
    // Authenticated user
    id = userId;
    name = userName || session?.user?.email || 'User';
  } else if (body.name && body.name.trim().length > 0) {
    // Guest with provided name
    id = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    name = body.name.trim();
    isGuest = true;
  } else {
    // No auth and no guest name - require name
    return NextResponse.json(
      { error: 'Name is required for guest access' },
      { status: 400 }
    );
  }

  // Create Liveblocks session
  let liveblocksInstance: Liveblocks;
  try {
    liveblocksInstance = getLiveblocks();
  } catch (error) {
    return NextResponse.json(
      { error: 'Liveblocks is not configured. Please add LIVEBLOCKS_SECRET_KEY to your environment.' },
      { status: 500 }
    );
  }

  const liveblocksSession = liveblocksInstance.prepareSession(id, {
    userInfo: {
      name,
      color: getRandomColor(),
    },
  });

  // Check room access permissions
  if (roomId) {
    const { canAccess, permission } = await canAccessRoom(
      roomId,
      userId || null,
      body.shareToken
    );

    if (!canAccess) {
      return NextResponse.json(
        { error: 'Access denied to this room' },
        { status: 403 }
      );
    }

    // Grant access based on permission
    if (permission === 'view') {
      liveblocksSession.allow(roomId, liveblocksSession.READ_ACCESS);
    } else {
      liveblocksSession.allow(roomId, liveblocksSession.FULL_ACCESS);
    }
  } else {
    // No room specified - for authenticated users, allow all their rooms
    if (!isGuest) {
      liveblocksSession.allow('*', liveblocksSession.FULL_ACCESS);
    } else {
      // Guests must specify a room
      return NextResponse.json(
        { error: 'Room is required for guest access' },
        { status: 400 }
      );
    }
  }

  const { status, body: responseBody } = await liveblocksSession.authorize();

  return new NextResponse(responseBody, { status });
}
