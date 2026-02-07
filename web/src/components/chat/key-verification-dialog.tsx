"use client";

import { useCallback, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEncryption } from "@/hooks/use-encryption";

interface KeyVerificationDialogProps {
  userId: string;
  peerUserId: string;
  peerDisplayName: string;
}

export function KeyVerificationDialog({
  userId,
  peerUserId,
  peerDisplayName,
}: KeyVerificationDialogProps) {
  const { getVerificationCode } = useEncryption(userId);
  const [safetyNumber, setSafetyNumber] = useState<string>("");

  const handleOpenChange = useCallback(
    async (open: boolean) => {
      if (open) {
        const code = await getVerificationCode(peerUserId);
        setSafetyNumber(code);
      }
    },
    [peerUserId, getVerificationCode]
  );

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <ShieldCheck className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify encryption with {peerDisplayName}</DialogTitle>
          <DialogDescription>
            Compare these safety numbers with {peerDisplayName} to verify the
            encryption. Both sides should see the same numbers.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="rounded-lg bg-muted p-4 font-mono text-lg tracking-widest">
            {safetyNumber || "Loading..."}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            If the numbers match, your conversation is secure. Share these
            numbers through a separate channel (in person, phone call, etc.)
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
