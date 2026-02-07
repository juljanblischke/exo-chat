"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Smile } from "lucide-react";
import { useChatStore } from "@/stores/chat-store";
import { useSignalRContext } from "@/components/providers/signalr-provider";

interface MessageInputProps {
  conversationId: string;
}

export function MessageInput({ conversationId }: MessageInputProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isSendingMessage } = useChatStore();
  const { startTyping, stopTyping } = useSignalRContext();

  const handleSend = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed || isSendingMessage) return;

    setContent("");
    stopTyping(conversationId);
    await sendMessage(conversationId, { content: trimmed });
    textareaRef.current?.focus();
  }, [content, conversationId, sendMessage, isSendingMessage, stopTyping]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
      if (e.target.value.trim()) {
        startTyping(conversationId);
      }
    },
    [conversationId, startTyping]
  );

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [content]);

  return (
    <div className="border-t p-4">
      <div className="flex items-end gap-2">
        <Button variant="ghost" size="icon" className="shrink-0">
          <Paperclip className="h-4 w-4" />
          <span className="sr-only">Attach file</span>
        </Button>
        <Textarea
          ref={textareaRef}
          placeholder="Type a message..."
          className="min-h-[40px] max-h-[150px] flex-1 resize-none"
          rows={1}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <Button variant="ghost" size="icon" className="shrink-0">
          <Smile className="h-4 w-4" />
          <span className="sr-only">Emoji</span>
        </Button>
        <Button
          size="icon"
          className="shrink-0"
          onClick={handleSend}
          disabled={!content.trim() || isSendingMessage}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </div>
  );
}
