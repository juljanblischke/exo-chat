"use client";

import { usePresenceStore } from "@/stores/presence-store";
import { OnlineStatus } from "@/types";

export function useOnlineStatus(userId: string | undefined) {
  const userPresence = usePresenceStore((state) =>
    userId ? state.userPresence[userId] : undefined
  );

  return {
    isOnline: userPresence?.isOnline ?? false,
    status: userPresence?.status ?? OnlineStatus.Offline,
    lastSeenAt: userPresence?.lastSeenAt ?? null,
  };
}
