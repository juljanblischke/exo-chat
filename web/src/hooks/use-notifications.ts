"use client";

import { useEffect, useCallback, useSyncExternalStore } from "react";
import { useNotificationStore } from "@/stores/notification-store";
import { subscribePush } from "@/lib/api/notifications";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function subscribeToNotificationPermission(callback: () => void) {
  // Notification permission doesn't have an event, so we use a no-op subscriber
  // Permission is only updated via user action (requestPermission)
  return () => {};
}

function getNotificationPermissionSnapshot(): NotificationPermission {
  if (typeof window !== "undefined" && "Notification" in window) {
    return Notification.permission;
  }
  return "default";
}

function getNotificationPermissionServerSnapshot(): NotificationPermission {
  return "default";
}

export function useNotifications() {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllRead,
    addNotification,
  } = useNotificationStore();

  const permissionState = useSyncExternalStore(
    subscribeToNotificationPermission,
    getNotificationPermissionSnapshot,
    getNotificationPermissionServerSnapshot
  );

  useEffect(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return false;

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }, []);

  const subscribeToPush = useCallback(async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey =
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

      if (!vapidPublicKey) return;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const json = subscription.toJSON();
      if (json.endpoint && json.keys) {
        await subscribePush(
          json.endpoint,
          json.keys.p256dh ?? "",
          json.keys.auth ?? "",
          navigator.userAgent
        );
      }
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
    }
  }, []);

  const initializeNotifications = useCallback(async () => {
    const granted = await requestPermission();
    if (granted) {
      await subscribeToPush();
    }
  }, [requestPermission, subscribeToPush]);

  return {
    notifications,
    unreadCount,
    isLoading,
    permissionState,
    fetchNotifications,
    markAsRead,
    markAllRead,
    addNotification,
    requestPermission,
    subscribeToPush,
    initializeNotifications,
  };
}
