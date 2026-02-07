"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Loader2, Users, Settings } from "lucide-react";
import { useChatStore } from "@/stores/chat-store";
import { useAuth } from "@/hooks/use-auth";
import { MessageBubble } from "@/components/chat/message-bubble";
import { MessageInput } from "@/components/chat/message-input";
import { DateSeparator } from "@/components/chat/date-separator";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { GroupSettingsDialog } from "@/components/chat/group-settings-dialog";
import { CallButton } from "@/components/call/call-button";
import { isSameDay } from "@/lib/format";
import { ConversationType } from "@/types";
import type { Conversation } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface ChatAreaProps {
  conversationId?: string;
}

function getConversationDisplayName(
  conversation: Conversation,
  currentUserId?: string
): string {
  if (conversation.type === ConversationType.Group && conversation.group) {
    return conversation.group.name;
  }
  const other = conversation.participants.find(
    (p) => p.userId !== currentUserId
  );
  return other?.user?.displayName ?? "Unknown User";
}

export function ChatArea({ conversationId }: ChatAreaProps) {
  const { session } = useAuth();
  const currentUserId = session?.user?.id;

  const {
    conversations,
    messages,
    isLoadingMessages,
    hasMoreMessages,
    typingUsers,
    fetchMessages,
    fetchOlderMessages,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);
  const [groupSettingsOpen, setGroupSettingsOpen] = useState(false);

  const conversation = conversations.find((c) => c.id === conversationId);
  const conversationMessages = conversationId
    ? (messages[conversationId] ?? [])
    : [];
  const typing = conversationId ? (typingUsers[conversationId] ?? []) : [];
  const hasMore = conversationId
    ? (hasMoreMessages[conversationId] ?? false)
    : false;

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    }
  }, [conversationId, fetchMessages]);

  useEffect(() => {
    if (conversationMessages.length > prevMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessageCountRef.current = conversationMessages.length;
  }, [conversationMessages.length]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      if (target.scrollTop === 0 && conversationId && hasMore) {
        fetchOlderMessages(conversationId);
      }
    },
    [conversationId, hasMore, fetchOlderMessages]
  );

  if (!conversationId) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <span className="text-sm text-muted-foreground">
            Select a conversation to start chatting
          </span>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              Select a conversation or start a new one
            </p>
          </div>
        </div>
      </div>
    );
  }

  const displayName = conversation
    ? getConversationDisplayName(conversation, currentUserId)
    : "Loading...";

  const memberCount =
    conversation?.type === ConversationType.Group
      ? conversation.participants.length
      : undefined;

  return (
    <div className="flex flex-1 flex-col">
      {/* Chat header */}
      <div className="flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {conversation?.type === ConversationType.Group ? (
                <Users className="h-3.5 w-3.5" />
              ) : (
                displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              )}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-medium">{displayName}</h3>
            {memberCount !== undefined && (
              <p className="text-xs text-muted-foreground">
                {memberCount} members
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <CallButton conversationId={conversationId} />
          {conversation?.type === ConversationType.Group && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setGroupSettingsOpen(true)}
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Group settings</span>
            </Button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4"
        onScroll={handleScroll}
      >
        {isLoadingMessages && conversationMessages.length === 0 ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`flex gap-2 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}
              >
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-12 w-48 rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        ) : conversationMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No messages yet. Say hello!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {hasMore && (
              <div className="flex justify-center py-2">
                {isLoadingMessages ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <button
                    onClick={() => fetchOlderMessages(conversationId)}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    Load older messages
                  </button>
                )}
              </div>
            )}
            {conversationMessages.map((message, index) => {
              const prevMessage =
                index > 0 ? conversationMessages[index - 1] : null;
              const showDate =
                !prevMessage ||
                !isSameDay(prevMessage.createdAt, message.createdAt);
              const showSender =
                !prevMessage ||
                prevMessage.senderId !== message.senderId ||
                showDate;

              return (
                <div key={message.id}>
                  {showDate && <DateSeparator date={message.createdAt} />}
                  <MessageBubble
                    message={message}
                    isOwn={message.senderId === currentUserId}
                    showSender={showSender}
                  />
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Typing indicator */}
      <TypingIndicator users={typing} />

      {/* Message input */}
      <MessageInput conversationId={conversationId} />

      {/* Group settings dialog */}
      {conversation?.type === ConversationType.Group && conversation && (
        <GroupSettingsDialog
          conversation={conversation}
          open={groupSettingsOpen}
          onOpenChange={setGroupSettingsOpen}
        />
      )}
    </div>
  );
}
