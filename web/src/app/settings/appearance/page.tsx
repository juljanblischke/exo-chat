"use client";

import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";
import { useSettingsStore } from "@/stores/settings-store";
import { Sun, Moon, Monitor } from "lucide-react";
import type { ThemeMode, FontSize, MessageDensity } from "@/types";

const themeOptions: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const fontSizeOptions: { value: FontSize; label: string; preview: string }[] = [
  { value: "small", label: "Small", preview: "text-sm" },
  { value: "medium", label: "Medium", preview: "text-base" },
  { value: "large", label: "Large", preview: "text-lg" },
];

const densityOptions: { value: MessageDensity; label: string; description: string }[] = [
  {
    value: "compact",
    label: "Compact",
    description: "Less spacing between messages",
  },
  {
    value: "comfortable",
    label: "Comfortable",
    description: "More spacing between messages",
  },
];

export default function AppearanceSettingsPage() {
  const { theme, setTheme } = useTheme();
  const { fontSize, messageDensity, setFontSize, setMessageDensity } =
    useSettingsStore();

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Appearance</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Customize the look and feel of ExoChat
        </p>
      </div>

      {/* Theme */}
      <section className="space-y-4">
        <Label className="text-lg font-semibold">Theme</Label>
        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => handleThemeChange(value)}
              className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors hover:bg-accent ${
                theme === value ? "border-primary bg-accent" : ""
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Font Size */}
      <section className="space-y-4">
        <Label className="text-lg font-semibold">Font Size</Label>
        <div className="space-y-2">
          {fontSizeOptions.map(({ value, label, preview }) => (
            <button
              key={value}
              onClick={() => setFontSize(value)}
              className={`flex w-full items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent ${
                fontSize === value ? "border-primary bg-accent" : ""
              }`}
            >
              <span className={`font-medium ${preview}`}>{label}</span>
              <span className={`text-muted-foreground ${preview}`}>
                Preview text
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Message Density */}
      <section className="space-y-4">
        <Label className="text-lg font-semibold">Message Density</Label>
        <div className="space-y-2">
          {densityOptions.map(({ value, label, description }) => (
            <button
              key={value}
              onClick={() => setMessageDensity(value)}
              className={`flex w-full flex-col items-start rounded-lg border p-3 transition-colors hover:bg-accent ${
                messageDensity === value ? "border-primary bg-accent" : ""
              }`}
            >
              <span className="text-sm font-medium">{label}</span>
              <span className="text-xs text-muted-foreground">
                {description}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
