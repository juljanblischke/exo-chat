"use client";

import { useEffect, useMemo, useCallback, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquarePlus, Search, Users } from "lucide-react";
import { useChatStore } from "@/stores/chat-store";
import { useAuth } from "@/hooks/use-auth";
import { ConversationType } from "@/types";
import type { Conversation } from "@/types";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { NewConversationDialog } from "@/components/chat/new-conversation-dialog";
import { OnlineStatusIndicator } from "@/components/chat/online-status";

function getConversationName(
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

function getConversationInitials(
  conversation: Conversation,
  currentUserId?: string
): string {
  const name = getConversationName(conversation, currentUserId);
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getOtherUserKeycloakId(
  conversation: Conversation,
  currentUserId?: string
): string | undefined {
  if (conversation.type === ConversationType.Group) return undefined;
  const other = conversation.participants.find(
    (p) => p.userId !== currentUserId
  );
  return other?.user?.keycloakId;
}

export function Sidebar() {
  const router = useRouter();
  const params = useParams();
  const activeId = (params?.conversationId as string) ?? null;
  const { session } = useAuth();
  const currentUserId = session?.user?.id;

  const {
    conversations,
    isLoadingConversations,
    searchQuery,
    setSearchQuery,
    fetchConversations,
    setActiveConversation,
  } = useChatStore();

  const [newConversationOpen, setNewConversationOpen] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    setActiveConversation(activeId);
  }, [activeId, setActiveConversation]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter((c) => {
      const name = getConversationName(c, currentUserId).toLowerCase();
      const lastMsg = c.lastMessage?.content?.toLowerCase() ?? "";
      return name.includes(query) || lastMsg.includes(query);
    });
  }, [conversations, searchQuery, currentUserId]);

  const handleConversationClick = useCallback(
    (conversationId: string) => {
      router.push(`/chat/${conversationId}`);
    },
    [router]
  );

  return (
    <aside className="flex h-full w-72 flex-col border-r lg:w-80">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-sm font-semibold">Conversations</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setNewConversationOpen(true)}
        >
          <MessageSquarePlus className="h-4 w-4" />
          <span className="sr-only">New conversation</span>
        </Button>
      </div>
      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {isLoadingConversations ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg p-3"
              >
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))
          ) : filteredConversations.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const otherKeycloakId = getOtherUserKeycloakId(conversation, currentUserId);
              const unreadCount = conversation.unreadCount ?? 0;

              return (
                <button
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent",
                    activeId === conversation.id && "bg-accent"
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {conversation.type === ConversationType.Group ? (
                          <Users className="h-4 w-4" />
                        ) : (
                          getConversationInitials(conversation, currentUserId)
                        )}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.type === ConversationType.Direct && otherKeycloakId && (
                      <OnlineStatusIndicator
                        userId={otherKeycloakId}
                        size="sm"
                        className="absolute -bottom-0.5 -right-0.5"
                      />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "truncate text-sm",
                        unreadCount > 0 ? "font-semibold" : "font-medium"
                      )}>
                        {getConversationName(conversation, currentUserId)}
                      </span>
                      <div className="ml-2 flex shrink-0 items-center gap-1.5">
                        {conversation.lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(
                              conversation.lastMessage.createdAt
                            )}
                          </span>
                        )}
                        {unreadCount > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    {conversation.lastMessage && (
                      <p className={cn(
                        "truncate text-xs",
                        unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground"
                      )}>
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>

      <NewConversationDialog
        open={newConversationOpen}
        onOpenChange={setNewConversationOpen}
      />
    </aside>
  );
}
