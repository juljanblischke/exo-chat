"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, Volume2, VolumeX } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { useNotificationStore } from "@/stores/notification-store";
import type { NotificationPreference } from "@/types";

export default function NotificationSettingsPage() {
  const { permissionState, requestPermission, subscribeToPush } =
    useNotifications();
  const { preferences, fetchPreferences, updatePreference } =
    useNotificationStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const globalPref = preferences.find((p) => p.conversationId === null);
  const conversationPrefs = preferences.filter(
    (p) => p.conversationId !== null
  );

  const handleGlobalUpdate = async (updates: Partial<NotificationPreference>) => {
    setIsUpdating(true);
    try {
      await updatePreference({
        conversationId: null,
        enablePush: updates.enablePush ?? globalPref?.enablePush ?? true,
        enableSound: updates.enableSound ?? globalPref?.enableSound ?? true,
        enableDesktop: updates.enableDesktop ?? globalPref?.enableDesktop ?? true,
        mutedUntil: updates.mutedUntil ?? globalPref?.mutedUntil ?? null,
      });
      setSaveMessage("Preferences updated");
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEnablePush = async () => {
    const granted = await requestPermission();
    if (granted) {
      await subscribeToPush();
      setSaveMessage("Push notifications enabled");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const handleConversationMute = async (
    conversationId: string,
    mute: boolean
  ) => {
    const existing = conversationPrefs.find(
      (p) => p.conversationId === conversationId
    );
    await updatePreference({
      conversationId,
      enablePush: mute ? false : true,
      enableSound: mute ? false : (existing?.enableSound ?? true),
      enableDesktop: mute ? false : (existing?.enableDesktop ?? true),
      mutedUntil: mute
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        : null,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Notification Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure how you receive notifications
        </p>
      </div>

      {saveMessage && (
        <div className="rounded-md border border-green-500 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
          {saveMessage}
        </div>
      )}

      {/* Browser Permission */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Browser Notifications</h2>
        <div className="rounded-md border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Desktop Notifications</p>
              <p className="text-xs text-muted-foreground">
                {permissionState === "granted"
                  ? "Desktop notifications are enabled"
                  : permissionState === "denied"
                    ? "Desktop notifications are blocked. Please update your browser settings."
                    : "Enable desktop notifications to receive alerts"}
              </p>
            </div>
            {permissionState !== "granted" && permissionState !== "denied" && (
              <Button onClick={handleEnablePush} size="sm">
                Enable
              </Button>
            )}
            {permissionState === "granted" && (
              <span className="text-sm text-green-600">Enabled</span>
            )}
            {permissionState === "denied" && (
              <span className="text-sm text-destructive">Blocked</span>
            )}
          </div>
        </div>
      </section>

      {/* Global Preferences */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Global Preferences</h2>
        <div className="space-y-3 rounded-md border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Push Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Receive push notifications for new messages
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={globalPref?.enablePush ?? true}
              onChange={(e) =>
                handleGlobalUpdate({ enablePush: e.target.checked })
              }
              disabled={isUpdating}
              className="h-4 w-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Sound Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Play a sound when receiving messages
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={globalPref?.enableSound ?? true}
              onChange={(e) =>
                handleGlobalUpdate({ enableSound: e.target.checked })
              }
              disabled={isUpdating}
              className="h-4 w-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Desktop Alerts</p>
                <p className="text-xs text-muted-foreground">
                  Show message previews in desktop notifications
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={globalPref?.enableDesktop ?? true}
              onChange={(e) =>
                handleGlobalUpdate({ enableDesktop: e.target.checked })
              }
              disabled={isUpdating}
              className="h-4 w-4"
            />
          </div>
        </div>
      </section>

      {/* Per-Conversation Preferences */}
      {conversationPrefs.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Muted Conversations</h2>
          <div className="space-y-2">
            {conversationPrefs
              .filter((p) => p.mutedUntil !== null)
              .map((pref) => (
                <div
                  key={pref.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center gap-2">
                    <BellOff className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {pref.conversationName ?? "Direct Message"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Muted{" "}
                        {pref.mutedUntil
                          ? `until ${new Date(pref.mutedUntil).toLocaleDateString()}`
                          : "indefinitely"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleConversationMute(pref.conversationId!, false)
                    }
                  >
                    Unmute
                  </Button>
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
