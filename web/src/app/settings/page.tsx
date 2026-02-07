import Link from "next/link";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Settings</h1>
      <nav className="mt-6 space-y-2">
        <Link
          href="/settings/profile"
          className="block rounded-lg border p-4 hover:bg-accent"
        >
          <h2 className="font-medium">Profile</h2>
          <p className="text-sm text-muted-foreground">
            Manage your display name and avatar
          </p>
        </Link>
        <Link
          href="/settings/privacy"
          className="block rounded-lg border p-4 hover:bg-accent"
        >
          <h2 className="font-medium">Privacy</h2>
          <p className="text-sm text-muted-foreground">
            Data export, account deletion, and privacy settings
          </p>
        </Link>
      </nav>
    </div>
  );
}
