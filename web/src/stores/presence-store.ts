import { create } from "zustand";
import { OnlineStatus } from "@/types";

interface UserPresence {
  isOnline: boolean;
  status: OnlineStatus;
  lastSeenAt: string | null;
}

interface PresenceState {
  userPresence: Record<string, UserPresence>;
  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string, lastSeenAt?: string) => void;
  setUserStatus: (userId: string, status: OnlineStatus, lastSeenAt?: string | null) => void;
  isUserOnline: (userId: string) => boolean;
  getUserPresence: (userId: string) => UserPresence | undefined;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  userPresence: {},

  setUserOnline: (userId) =>
    set((state) => ({
      userPresence: {
        ...state.userPresence,
        [userId]: {
          isOnline: true,
          status: OnlineStatus.Online,
          lastSeenAt: new Date().toISOString(),
        },
      },
    })),

  setUserOffline: (userId, lastSeenAt) =>
    set((state) => ({
      userPresence: {
        ...state.userPresence,
        [userId]: {
          isOnline: false,
          status: OnlineStatus.Offline,
          lastSeenAt: lastSeenAt ?? new Date().toISOString(),
        },
      },
    })),

  setUserStatus: (userId, status, lastSeenAt) =>
    set((state) => ({
      userPresence: {
        ...state.userPresence,
        [userId]: {
          isOnline: status === OnlineStatus.Online || status === OnlineStatus.Away || status === OnlineStatus.DoNotDisturb,
          status,
          lastSeenAt: lastSeenAt ?? state.userPresence[userId]?.lastSeenAt ?? null,
        },
      },
    })),

  isUserOnline: (userId) => get().userPresence[userId]?.isOnline ?? false,

  getUserPresence: (userId) => get().userPresence[userId],
}));
