"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MessageType } from "@/types";
import type { Message } from "@/types";
import { formatMessageTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ReadReceiptIcon, type ReadStatus } from "@/components/chat/read-receipt-icon";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showSender: boolean;
  readStatus?: ReadStatus;
  readByCount?: number;
}

export function MessageBubble({ message, isOwn, showSender, readStatus, readByCount }: MessageBubbleProps) {
  if (message.messageType === MessageType.System) {
    return (
      <div className="flex justify-center py-1">
        <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          {message.content}
        </span>
      </div>
    );
  }

  const senderInitials = message.sender?.displayName
    ? message.sender.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const absoluteTime = new Date(message.createdAt).toLocaleString();

  return (
    <div
      className={cn(
        "group flex gap-2",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      {showSender && !isOwn ? (
        <Avatar className="mt-auto h-8 w-8 shrink-0">
          <AvatarFallback className="text-xs">{senderInitials}</AvatarFallback>
        </Avatar>
      ) : (
        !isOwn && <div className="w-8 shrink-0" />
      )}

      <div
        className={cn(
          "flex max-w-[70%] flex-col",
          isOwn ? "items-end" : "items-start"
        )}
      >
        {showSender && !isOwn && message.sender && (
          <span className="mb-0.5 px-1 text-xs font-medium text-muted-foreground">
            {message.sender.displayName}
          </span>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "rounded-2xl px-3.5 py-2 text-sm",
                  isOwn
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-bl-md bg-muted"
                )}
              >
                <p className="whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                <div
                  className={cn(
                    "mt-1 flex items-center gap-1 text-[10px]",
                    isOwn
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  )}
                >
                  <span>{formatMessageTime(message.createdAt)}</span>
                  {message.editedAt && <span>(edited)</span>}
                  {isOwn && readStatus && (
                    <ReadReceiptIcon
                      status={readStatus}
                      readByCount={readByCount}
                      className={cn(
                        isOwn
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      )}
                    />
                  )}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side={isOwn ? "left" : "right"}>
              <p>{absoluteTime}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
