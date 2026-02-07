"use client";

import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileSettingsPage() {
  const { session, isLoading, signOut } = useAuth();

  if (isLoading) {
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
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile Settings</h1>
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-lg font-medium">{user?.name ?? "Unknown"}</p>
          <p className="text-sm text-muted-foreground">{user?.email ?? ""}</p>
        </div>
      </div>
      <div className="space-y-4 rounded-lg border p-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Name</p>
          <p>{user?.name ?? "Not set"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Email</p>
          <p>{user?.email ?? "Not set"}</p>
        </div>
      </div>
      <Button variant="destructive" onClick={signOut}>
        Sign Out
      </Button>
    </div>
  );
}
