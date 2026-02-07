"use client";

import { useCallStore } from "@/stores/call-store";
import { Button } from "@/components/ui/button";
import { Phone, Video, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CallStatus } from "@/types";

interface CallButtonProps {
  conversationId: string;
}

export function CallButton({ conversationId }: CallButtonProps) {
  const status = useCallStore((s) => s.status);
  const startCall = useCallStore((s) => s.startCall);

  const isInCall = status !== CallStatus.Idle;
  const isInitiating = status === CallStatus.Initiating;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={isInCall}
              onClick={() => startCall(conversationId, false)}
            >
              {isInitiating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Phone className="h-4 w-4" />
              )}
              <span className="sr-only">Voice call</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Voice call</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={isInCall}
              onClick={() => startCall(conversationId, true)}
            >
              <Video className="h-4 w-4" />
              <span className="sr-only">Video call</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Video call</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
