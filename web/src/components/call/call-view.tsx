"use client";

import { useEffect, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useParticipants,
} from "@livekit/components-react";
import { useCallStore } from "@/stores/call-store";
import { CallControls } from "./call-controls";
import { ParticipantTile } from "./participant-tile";
import { Phone, Video } from "lucide-react";
import { cn } from "@/lib/utils";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function CallDurationTimer() {
  const callStartedAt = useCallStore((s) => s.callStartedAt);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!callStartedAt) return;

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - callStartedAt) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [callStartedAt]);

  if (!callStartedAt) return null;

  return (
    <span className="text-sm text-muted-foreground tabular-nums">
      {formatDuration(elapsed)}
    </span>
  );
}

function CallRoomContent({ isVideo }: { isVideo: boolean }) {
  const participants = useParticipants();
  const endCurrentCall = useCallStore((s) => s.endCurrentCall);

  const gridCols =
    participants.length <= 1
      ? "grid-cols-1"
      : participants.length <= 4
        ? "grid-cols-2"
        : "grid-cols-3";

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          {isVideo ? (
            <Video className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Phone className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">
            {isVideo ? "Video Call" : "Voice Call"}
          </span>
          <span className="text-xs text-muted-foreground">
            {participants.length} participant{participants.length !== 1 ? "s" : ""}
          </span>
        </div>
        <CallDurationTimer />
      </div>

      {/* Participants grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className={cn("grid gap-3 h-full", gridCols)}>
          {participants.map((participant) => (
            <ParticipantTile
              key={participant.sid}
              participant={participant}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center border-t px-4 py-3">
        <CallControls onEndCall={endCurrentCall} isVideo={isVideo} />
      </div>

      <RoomAudioRenderer />
    </div>
  );
}

export function CallView() {
  const { status, token, liveKitUrl, isVideo, error } = useCallStore();
  const endCurrentCall = useCallStore((s) => s.endCurrentCall);

  if (status !== "connected" || !token || !liveKitUrl) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <LiveKitRoom
        serverUrl={liveKitUrl}
        token={token}
        connect={true}
        audio={true}
        video={isVideo}
        onDisconnected={() => {
          endCurrentCall();
        }}
        onError={(err) => {
          console.error("LiveKit error:", err);
        }}
      >
        <CallRoomContent isVideo={isVideo} />
      </LiveKitRoom>
    </div>
  );
}
