import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeMode, FontSize, MessageDensity } from "@/types";

interface AppearanceState {
  theme: ThemeMode;
  fontSize: FontSize;
  messageDensity: MessageDensity;

  setTheme: (theme: ThemeMode) => void;
  setFontSize: (fontSize: FontSize) => void;
  setMessageDensity: (density: MessageDensity) => void;
}

export const useSettingsStore = create<AppearanceState>()(
  persist(
    (set) => ({
      theme: "system",
      fontSize: "medium",
      messageDensity: "comfortable",

      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setMessageDensity: (messageDensity) => set({ messageDensity }),
    }),
    {
      name: "exochat-settings",
    }
  )
);
