"use client";

import { useCallStore } from "@/stores/call-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Phone, PhoneOff, Video } from "lucide-react";

export function IncomingCallDialog() {
  const incomingCall = useCallStore((s) => s.incomingCall);
  const acceptIncomingCall = useCallStore((s) => s.acceptIncomingCall);
  const rejectIncomingCall = useCallStore((s) => s.rejectIncomingCall);

  const isOpen = incomingCall !== null;
  const callerName = incomingCall?.callerDisplayName ?? "Unknown";
  const isVideo = incomingCall?.isVideo ?? false;

  const initials = callerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Dialog open={isOpen}>
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader className="items-center">
          <Avatar className="h-16 w-16 mb-2">
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <DialogTitle>{callerName}</DialogTitle>
          <DialogDescription>
            Incoming {isVideo ? "video" : "voice"} call
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center gap-6 pt-2">
          <Button
            variant="destructive"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={rejectIncomingCall}
          >
            <PhoneOff className="h-5 w-5" />
            <span className="sr-only">Reject call</span>
          </Button>
          <Button
            className="h-12 w-12 rounded-full bg-green-600 hover:bg-green-700"
            size="icon"
            onClick={acceptIncomingCall}
          >
            {isVideo ? (
              <Video className="h-5 w-5 text-white" />
            ) : (
              <Phone className="h-5 w-5 text-white" />
            )}
            <span className="sr-only">Accept call</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
