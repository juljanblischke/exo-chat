"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  getConnection,
  startConnection,
  stopConnection,
  joinConversation,
  leaveConversation,
  sendTyping,
  sendStopTyping,
  sendHeartbeat,
  type ConnectionState,
} from "@/lib/signalr/client";
import { useChatStore } from "@/stores/chat-store";
import { useCallStore } from "@/stores/call-store";
import { usePresenceStore } from "@/stores/presence-store";
import { useAuth } from "@/hooks/use-auth";
import { OnlineStatus } from "@/types";
import type { Message, User, IncomingCallData } from "@/types";

interface MessagesReadData {
  userId: string;
  userEntityId: string;
  conversationId: string;
  messageId: string;
}

interface UserStatusChangedData {
  userId: string;
  status: OnlineStatus;
  lastSeenAt?: string;
}

export function useSignalR() {
  const { isAuthenticated } = useAuth();
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const {
    addMessage,
    updateMessage,
    removeMessage,
    updateConversationLastMessage,
    setTypingUsers,
    activeConversationId,
    fetchConversations,
  } = useChatStore();

  const joinedConversationRef = useRef<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const conn = getConnection();

    conn.on("ReceiveMessage", (message: Message) => {
      addMessage(message.conversationId, message);
      updateConversationLastMessage(message.conversationId, message);
    });

    conn.on("MessageEdited", (message: Message) => {
      updateMessage(message.conversationId, message);
    });

    conn.on("MessageDeleted", (data: { conversationId: string; messageId: string }) => {
      removeMessage(data.conversationId, data.messageId);
    });

    conn.on("UserTyping", (data: { conversationId: string; userId: string; displayName: string }) => {
      const store = useChatStore.getState();
      const current = store.typingUsers[data.conversationId] ?? [];
      const typingUser: User = {
        id: data.userId,
        keycloakId: data.userId,
        displayName: data.displayName,
        avatarUrl: null,
        lastSeenAt: null,
        onlineStatus: OnlineStatus.Online,
      };
      if (!current.some((u) => u.id === data.userId)) {
        setTypingUsers(data.conversationId, [...current, typingUser]);
      }
    });

    conn.on("UserStoppedTyping", (data: { conversationId: string; userId: string }) => {
      const store = useChatStore.getState();
      const current = store.typingUsers[data.conversationId] ?? [];
      setTypingUsers(
        data.conversationId,
        current.filter((u) => u.id !== data.userId)
      );
    });

    conn.on("MessagesRead", (data: MessagesReadData) => {
      const store = useChatStore.getState();
      const conversations = store.conversations.map((c) => {
        if (c.id !== data.conversationId) return c;
        return {
          ...c,
          participants: c.participants.map((p) =>
            p.userId === data.userEntityId
              ? { ...p, lastReadMessageId: data.messageId }
              : p
          ),
        };
      });
      store.setConversations(conversations);
    });

    conn.on("UserStatusChanged", (data: UserStatusChangedData) => {
      const presenceStore = usePresenceStore.getState();
      presenceStore.setUserStatus(data.userId, data.status, data.lastSeenAt);
      fetchConversations();
    });

    conn.on("IncomingCall", (data: IncomingCallData) => {
      useCallStore.getState().setIncomingCall(data);
    });

    conn.on("CallAccepted", (data: { conversationId: string; userId: string; displayName: string }) => {
      useCallStore.getState().onCallAccepted(data.conversationId);
    });

    conn.on("CallRejected", (data: { conversationId: string; userId: string }) => {
      useCallStore.getState().onCallRejected(data.conversationId);
    });

    conn.on("CallEnded", (data: { conversationId: string; endedBy: string }) => {
      useCallStore.getState().onCallEnded(data.conversationId);
    });

    conn.onreconnecting(() => setConnectionState("reconnecting"));
    conn.onreconnected(() => {
      setConnectionState("connected");
      if (joinedConversationRef.current) {
        joinConversation(joinedConversationRef.current);
      }
    });
    conn.onclose(() => setConnectionState("disconnected"));

    startConnection()
      .then(() => {
        setConnectionState("connected");
        heartbeatIntervalRef.current = setInterval(() => {
          sendHeartbeat().catch(() => {});
        }, 30000);
      })
      .catch(() => setConnectionState("disconnected"));

    return () => {
      conn.off("ReceiveMessage");
      conn.off("MessageEdited");
      conn.off("MessageDeleted");
      conn.off("UserTyping");
      conn.off("UserStoppedTyping");
      conn.off("MessagesRead");
      conn.off("UserStatusChanged");
      conn.off("IncomingCall");
      conn.off("CallAccepted");
      conn.off("CallRejected");
      conn.off("CallEnded");
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      stopConnection();
    };
  }, [
    isAuthenticated,
    addMessage,
    updateMessage,
    removeMessage,
    updateConversationLastMessage,
    setTypingUsers,
    fetchConversations,
  ]);

  useEffect(() => {
    const prev = joinedConversationRef.current;
    if (prev && prev !== activeConversationId) {
      leaveConversation(prev);
    }
    if (activeConversationId) {
      joinConversation(activeConversationId);
      joinedConversationRef.current = activeConversationId;
    } else {
      joinedConversationRef.current = null;
    }
  }, [activeConversationId]);

  const startTypingIndicator = useCallback(
    (conversationId: string) => {
      sendTyping(conversationId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        sendStopTyping(conversationId);
      }, 3000);
    },
    []
  );

  const stopTypingIndicator = useCallback(
    (conversationId: string) => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      sendStopTyping(conversationId);
    },
    []
  );

  return {
    connectionState,
    startTyping: startTypingIndicator,
    stopTyping: stopTypingIndicator,
  };
}
