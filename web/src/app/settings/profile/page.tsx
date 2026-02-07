"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { getProfile, updateProfile } from "@/lib/api/users";
import type { UserProfile } from "@/types";

export default function ProfileSettingsPage() {
  const { session, isLoading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await getProfile();
        if (response.success && response.data) {
          setProfile(response.data);
          setDisplayName(response.data.displayName);
          setStatusMessage(response.data.statusMessage ?? "");
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage("");
    try {
      const response = await updateProfile({
        displayName: displayName || undefined,
        statusMessage: statusMessage || null,
      });
      if (response.success && response.data) {
        setProfile(response.data);
        setSaveMessage("Profile updated successfully");
        setTimeout(() => setSaveMessage(""), 3000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <div className="space-y-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
    );
  }

  const user = session?.user;
  const initials = (profile?.displayName ?? user?.name ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile Settings</h1>
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-lg font-medium">
            {profile?.displayName ?? user?.name ?? "Unknown"}
          </p>
          <p className="text-sm text-muted-foreground">
            {profile?.email ?? user?.email ?? ""}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your display name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="statusMessage">Status Message</Label>
          <Textarea
            id="statusMessage"
            value={statusMessage}
            onChange={(e) => setStatusMessage(e.target.value)}
            placeholder="What's on your mind?"
            rows={2}
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground">
            {statusMessage.length}/200
          </p>
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            value={profile?.email ?? user?.email ?? ""}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Email is managed through Keycloak and cannot be changed here
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          {saveMessage && (
            <span className="text-sm text-green-600">{saveMessage}</span>
          )}
        </div>
      </div>

      <div className="border-t pt-6">
        <Button variant="destructive" onClick={signOut}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}
