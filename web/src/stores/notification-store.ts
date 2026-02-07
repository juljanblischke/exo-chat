import { create } from "zustand";
import type { Notification, NotificationPreference } from "@/types";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/api/notifications";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreference[];
  isLoading: boolean;
  hasMore: boolean;
  page: number;

  fetchNotifications: (reset?: boolean) => Promise<void>;
  fetchMoreNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  fetchPreferences: () => Promise<void>;
  updatePreference: (data: {
    conversationId?: string | null;
    enablePush: boolean;
    enableSound: boolean;
    enableDesktop: boolean;
    mutedUntil?: string | null;
  }) => Promise<void>;
  addNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  preferences: [],
  isLoading: false,
  hasMore: true,
  page: 1,

  fetchNotifications: async (reset = false) => {
    set({ isLoading: true });
    try {
      const page = reset ? 1 : get().page;
      const response = await getNotifications(undefined, page);
      if (response.success && response.data) {
        const items = response.data.items;
        set({
          notifications: reset ? items : [...get().notifications, ...items],
          unreadCount: items.filter((n) => !n.isRead).length,
          hasMore: response.data.hasNextPage,
          page: page + 1,
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMoreNotifications: async () => {
    const { isLoading, hasMore } = get();
    if (isLoading || !hasMore) return;
    await get().fetchNotifications();
  },

  markAsRead: async (id: string) => {
    const response = await markNotificationRead(id);
    if (response.success) {
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    }
  },

  markAllRead: async () => {
    const response = await markAllNotificationsRead();
    if (response.success) {
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    }
  },

  fetchPreferences: async () => {
    const response = await getNotificationPreferences();
    if (response.success && response.data) {
      set({ preferences: response.data });
    }
  },

  updatePreference: async (data) => {
    const response = await updateNotificationPreferences(data);
    if (response.success && response.data) {
      set((state) => {
        const existing = state.preferences.findIndex(
          (p) => p.conversationId === data.conversationId
        );
        const updated = [...state.preferences];
        if (existing >= 0) {
          updated[existing] = response.data!;
        } else {
          updated.push(response.data!);
        }
        return { preferences: updated };
      });
    }
  },

  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));
