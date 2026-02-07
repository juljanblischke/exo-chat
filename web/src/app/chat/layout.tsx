import { AppShell } from "@/components/layout/app-shell";
import { SignalRProvider } from "@/components/providers/signalr-provider";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SignalRProvider>
      <AppShell>{children}</AppShell>
    </SignalRProvider>
  );
}
