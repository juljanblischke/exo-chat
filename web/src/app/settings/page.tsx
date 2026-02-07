import Link from "next/link";
import { User, Shield, Bell, Palette } from "lucide-react";

const sections = [
  {
    href: "/settings/profile",
    label: "Profile",
    description: "Manage your display name, avatar, and status",
    icon: User,
  },
  {
    href: "/settings/privacy",
    label: "Privacy",
    description: "Read receipts, online status, and blocked users",
    icon: Shield,
  },
  {
    href: "/settings/notifications",
    label: "Notifications",
    description: "Desktop notifications, sounds, and per-conversation settings",
    icon: Bell,
  },
  {
    href: "/settings/appearance",
    label: "Appearance",
    description: "Theme, font size, and message density",
    icon: Palette,
  },
];

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Settings</h1>
      <nav className="mt-6 space-y-2">
        {sections.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 rounded-lg border p-4 hover:bg-accent transition-colors"
          >
            <Icon className="h-5 w-5 text-muted-foreground" />
            <div>
              <h2 className="font-medium">{label}</h2>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
}
