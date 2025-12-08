import { createClient } from "@liveblocks/client";
import { createRoomContext, createLiveblocksContext } from "@liveblocks/react";

// Helper to get guest name and share token from storage
function getGuestInfo(): { name?: string; shareToken?: string } {
  if (typeof window === 'undefined') return {};

  return {
    name: localStorage.getItem('guestName') || undefined,
    shareToken: sessionStorage.getItem('shareToken') || undefined,
  };
}

// Create the Liveblocks client
// Note: We use authEndpoint as a function to pass additional data
const client = createClient({
  authEndpoint: async (room) => {
    const { name, shareToken } = getGuestInfo();

    const response = await fetch("/api/liveblocks-auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        room,
        name,
        shareToken,
      }),
    });

    return response.json();
  },
});

// Presence - what each user has in real-time
type Presence = {
  cursor: { x: number; y: number } | null;
};

// Storage - shared state (Tiptap uses Yjs internally, so minimal here)
type Storage = Record<string, never>;

// User metadata from auth endpoint
type UserMeta = {
  id: string;
  info: {
    name: string;
    color: string;
  };
};

// Room events
type RoomEvent = Record<string, never>;

// Thread metadata (for comments feature)
type ThreadMetadata = Record<string, never>;

// Create room context with typed hooks
export const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useUpdateMyPresence,
  useOthers,
  useSelf,
  useOthersMapped,
  useOthersConnectionIds,
  useStatus,
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent, ThreadMetadata>(client);

// Create Liveblocks context
export const {
  LiveblocksProvider,
  useClient,
} = createLiveblocksContext(client);

export type { Presence, UserMeta };
