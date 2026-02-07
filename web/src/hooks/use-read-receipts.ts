"use client";

import { useEffect, useRef, useCallback } from "react";
import { markAsRead } from "@/lib/signalr/client";

interface UseReadReceiptsOptions {
  conversationId: string | undefined;
  messages: { id: string }[];
  enabled?: boolean;
}

export function useReadReceipts({
  conversationId,
  messages,
  enabled = true,
}: UseReadReceiptsOptions) {
  const lastSentMessageIdRef = useRef<string | null>(null);
  const batchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingMessageIdRef = useRef<string | null>(null);

  const sendReadReceipt = useCallback(
    (messageId: string) => {
      if (!conversationId || !enabled) return;
      if (lastSentMessageIdRef.current === messageId) return;

      pendingMessageIdRef.current = messageId;

      // Batch reads: wait 500ms before sending to avoid rapid-fire
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }

      batchTimeoutRef.current = setTimeout(() => {
        const idToSend = pendingMessageIdRef.current;
        if (idToSend && conversationId) {
          markAsRead(conversationId, idToSend).catch(() => {});
          lastSentMessageIdRef.current = idToSend;
          pendingMessageIdRef.current = null;
        }
      }, 500);
    },
    [conversationId, enabled]
  );

  // Mark the latest message as read when conversation is opened or new messages arrive
  useEffect(() => {
    if (!conversationId || !enabled || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage) {
      sendReadReceipt(lastMessage.id);
    }
  }, [conversationId, enabled, messages, sendReadReceipt]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
    };
  }, []);

  return { sendReadReceipt };
}
