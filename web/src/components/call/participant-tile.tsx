"use client";

import { useIsSpeaking } from "@livekit/components-react";
import type { Participant } from "livekit-client";
import { Track } from "livekit-client";
import { cn } from "@/lib/utils";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

interface ParticipantTileProps {
  participant: Participant;
}

export function ParticipantTile({ participant }: ParticipantTileProps) {
  const isSpeaking = useIsSpeaking(participant);

  const cameraTrack = participant.getTrackPublication(Track.Source.Camera);
  const micTrack = participant.getTrackPublication(Track.Source.Microphone);
  const screenTrack = participant.getTrackPublication(Track.Source.ScreenShare);

  const isCameraEnabled = cameraTrack?.isSubscribed && !cameraTrack.isMuted;
  const isMicEnabled = micTrack?.isSubscribed && !micTrack.isMuted;
  const isScreenSharing = screenTrack?.isSubscribed && !screenTrack.isMuted;

  const displayName = participant.name || participant.identity;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-lg bg-muted",
        "aspect-video w-full",
        isSpeaking && "ring-2 ring-primary"
      )}
    >
      {isCameraEnabled && cameraTrack?.videoTrack ? (
        <video
          ref={(el) => {
            if (el && cameraTrack.videoTrack) {
              cameraTrack.videoTrack.attach(el);
            }
          }}
          className="h-full w-full object-cover"
          autoPlay
          playsInline
          muted={participant.isLocal}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
            {initials}
          </div>
        </div>
      )}

      {/* Screen share overlay indicator */}
      {isScreenSharing && screenTrack?.videoTrack && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <video
            ref={(el) => {
              if (el && screenTrack.videoTrack) {
                screenTrack.videoTrack.attach(el);
              }
            }}
            className="h-full w-full object-contain"
            autoPlay
            playsInline
          />
        </div>
      )}

      {/* Participant info overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-white truncate">
            {displayName}
            {participant.isLocal && " (You)"}
          </span>
          <div className="flex items-center gap-1 ml-auto">
            {isMicEnabled ? (
              <Mic className="h-3 w-3 text-white" />
            ) : (
              <MicOff className="h-3 w-3 text-red-400" />
            )}
            {isCameraEnabled ? (
              <Video className="h-3 w-3 text-white" />
            ) : (
              <VideoOff className="h-3 w-3 text-red-400" />
            )}
          </div>
        </div>
      </div>

      {/* Audio track (hidden but needed for playback) */}
      {!participant.isLocal && micTrack?.audioTrack && (
        <audio
          ref={(el) => {
            if (el && micTrack.audioTrack) {
              micTrack.audioTrack.attach(el);
            }
          }}
          autoPlay
          hidden
        />
      )}
    </div>
  );
}
