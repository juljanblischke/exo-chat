"use client";

import { useCallback } from "react";
import { useLocalParticipant } from "@livekit/components-react";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  PhoneOff,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CallControlsProps {
  onEndCall: () => void;
  isVideo: boolean;
}

export function CallControls({ onEndCall, isVideo }: CallControlsProps) {
  const { localParticipant } = useLocalParticipant();

  const isMicEnabled = localParticipant.isMicrophoneEnabled;
  const isCamEnabled = localParticipant.isCameraEnabled;
  const isScreenShareEnabled = localParticipant.isScreenShareEnabled;

  const toggleMic = useCallback(async () => {
    await localParticipant.setMicrophoneEnabled(!isMicEnabled);
  }, [localParticipant, isMicEnabled]);

  const toggleCamera = useCallback(async () => {
    await localParticipant.setCameraEnabled(!isCamEnabled);
  }, [localParticipant, isCamEnabled]);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenShareEnabled) {
      await localParticipant.setScreenShareEnabled(false);
    } else {
      await localParticipant.setScreenShareEnabled(true);
    }
  }, [localParticipant, isScreenShareEnabled]);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isMicEnabled ? "secondary" : "destructive"}
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={toggleMic}
            >
              {isMicEnabled ? (
                <Mic className="h-4 w-4" />
              ) : (
                <MicOff className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isMicEnabled ? "Mute microphone" : "Unmute microphone"}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isMicEnabled ? "Mute" : "Unmute"}
          </TooltipContent>
        </Tooltip>

        {isVideo && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isCamEnabled ? "secondary" : "destructive"}
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={toggleCamera}
              >
                {isCamEnabled ? (
                  <Video className="h-4 w-4" />
                ) : (
                  <VideoOff className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {isCamEnabled ? "Turn off camera" : "Turn on camera"}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isCamEnabled ? "Camera off" : "Camera on"}
            </TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isScreenShareEnabled ? "default" : "secondary"}
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={toggleScreenShare}
            >
              <MonitorUp className="h-4 w-4" />
              <span className="sr-only">
                {isScreenShareEnabled ? "Stop sharing" : "Share screen"}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isScreenShareEnabled ? "Stop sharing" : "Share screen"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={onEndCall}
            >
              <PhoneOff className="h-4 w-4" />
              <span className="sr-only">End call</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>End call</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
