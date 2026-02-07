import { apiClient } from "./client";
import type {
  Notification,
  NotificationPreference,
  PagedResult,
} from "@/types";

export async function getNotifications(
  isRead?: boolean,
  page: number = 1,
  pageSize: number = 20
) {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  if (isRead !== undefined) params.set("isRead", isRead.toString());

  return apiClient.get<PagedResult<Notification>>(
    `/notifications?${params.toString()}`
  );
}

export async function subscribePush(
  endpoint: string,
  p256dhKey: string,
  authKey: string,
  userAgent?: string
) {
  return apiClient.post<void>("/notifications/subscribe", {
    endpoint,
    p256dhKey,
    authKey,
    userAgent,
  });
}

export async function unsubscribePush(endpoint: string) {
  return apiClient.delete<void>("/notifications/subscribe");
}

export async function markNotificationRead(id: string) {
  return apiClient.post<void>(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  return apiClient.post<void>("/notifications/read-all");
}

export async function getNotificationPreferences() {
  return apiClient.get<NotificationPreference[]>(
    "/notifications/preferences"
  );
}

export async function updateNotificationPreferences(data: {
  conversationId?: string | null;
  enablePush: boolean;
  enableSound: boolean;
  enableDesktop: boolean;
  mutedUntil?: string | null;
}) {
  return apiClient.put<NotificationPreference>(
    "/notifications/preferences",
    data
  );
}
