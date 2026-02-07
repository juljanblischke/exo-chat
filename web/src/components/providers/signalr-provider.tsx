"use client";

import { createContext, useContext } from "react";
import { useSignalR } from "@/hooks/use-signalr";
import type { ConnectionState } from "@/lib/signalr/client";

interface SignalRContextValue {
  connectionState: ConnectionState;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
}

const SignalRContext = createContext<SignalRContextValue>({
  connectionState: "disconnected",
  startTyping: () => {},
  stopTyping: () => {},
});

export function SignalRProvider({ children }: { children: React.ReactNode }) {
  const signalr = useSignalR();

  return (
    <SignalRContext.Provider value={signalr}>{children}</SignalRContext.Provider>
  );
}

export function useSignalRContext() {
  return useContext(SignalRContext);
}
