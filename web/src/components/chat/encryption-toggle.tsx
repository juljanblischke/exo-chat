"use client";

import { Lock, LockOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEncryptionStore } from "@/stores/encryption-store";

interface EncryptionToggleProps {
  conversationId: string;
}

export function EncryptionToggle({ conversationId }: EncryptionToggleProps) {
  const { isInitialized, isConversationEncrypted, toggleEncryption } =
    useEncryptionStore();

  const encrypted = isConversationEncrypted(conversationId);

  if (!isInitialized) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => toggleEncryption(conversationId)}
          className={encrypted ? "text-green-500" : "text-muted-foreground"}
        >
          {encrypted ? (
            <Lock className="size-4" />
          ) : (
            <LockOpen className="size-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {encrypted ? "End-to-end encrypted" : "Click to enable encryption"}
      </TooltipContent>
    </Tooltip>
  );
}
