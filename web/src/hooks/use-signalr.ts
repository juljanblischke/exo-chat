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
  type ConnectionState,
} from "@/lib/signalr/client";
import { useChatStore } from "@/stores/chat-store";
import { useCallStore } from "@/stores/call-store";
import { useAuth } from "@/hooks/use-auth";
import type { Message, User, IncomingCallData } from "@/types";

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

    conn.on("UserTyping", (data: { conversationId: string; user: User }) => {
      const store = useChatStore.getState();
      const current = store.typingUsers[data.conversationId] ?? [];
      if (!current.some((u) => u.id === data.user.id)) {
        setTypingUsers(data.conversationId, [...current, data.user]);
      }
    });

    conn.on("UserStoppedTyping", (data: { conversationId: string; user: User }) => {
      const store = useChatStore.getState();
      const current = store.typingUsers[data.conversationId] ?? [];
      setTypingUsers(
        data.conversationId,
        current.filter((u) => u.id !== data.user.id)
      );
    });

    conn.on("UserOnlineStatusChanged", () => {
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
      .then(() => setConnectionState("connected"))
      .catch(() => setConnectionState("disconnected"));

    return () => {
      conn.off("ReceiveMessage");
      conn.off("MessageEdited");
      conn.off("MessageDeleted");
      conn.off("UserTyping");
      conn.off("UserStoppedTyping");
      conn.off("UserOnlineStatusChanged");
      conn.off("IncomingCall");
      conn.off("CallAccepted");
      conn.off("CallRejected");
      conn.off("CallEnded");
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
