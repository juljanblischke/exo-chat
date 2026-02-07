import { AppShell } from "@/components/layout/app-shell";
import { SignalRProvider } from "@/components/providers/signalr-provider";
import { CallOverlay } from "@/components/call/call-overlay";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SignalRProvider>
      <AppShell>{children}</AppShell>
      <CallOverlay />
    </SignalRProvider>
  );
}
