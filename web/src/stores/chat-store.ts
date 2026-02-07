import { create } from "zustand";
import type { Conversation, Message, User } from "@/types";
import {
  getConversations,
  getMessages,
  sendMessage as apiSendMessage,
  type SendMessageRequest,
  type CursorPagedResult,
} from "@/lib/api/conversations";

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  messageCursors: Record<string, string | null>;
  hasMoreMessages: Record<string, boolean>;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  typingUsers: Record<string, User[]>;
  searchQuery: string;

  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, message: Message) => void;
  removeMessage: (conversationId: string, messageId: string) => void;
  setLoadingConversations: (loading: boolean) => void;
  setLoadingMessages: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
  setTypingUsers: (conversationId: string, users: User[]) => void;

  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  fetchOlderMessages: (conversationId: string) => Promise<void>;
  sendMessage: (
    conversationId: string,
    data: SendMessageRequest
  ) => Promise<Message | null>;
  updateConversationLastMessage: (
    conversationId: string,
    message: Message
  ) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  messageCursors: {},
  hasMoreMessages: {},
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  typingUsers: {},
  searchQuery: "",

  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (activeConversationId) =>
    set({ activeConversationId }),
  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [conversationId]: messages },
    })),
  addMessage: (conversationId, message) =>
    set((state) => {
      const existing = state.messages[conversationId] ?? [];
      if (existing.some((m) => m.id === message.id)) return state;
      return {
        messages: {
          ...state.messages,
          [conversationId]: [...existing, message],
        },
      };
    }),
  updateMessage: (conversationId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] ?? []).map((m) =>
          m.id === message.id ? message : m
        ),
      },
    })),
  removeMessage: (conversationId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] ?? []).filter(
          (m) => m.id !== messageId
        ),
      },
    })),
  setLoadingConversations: (isLoadingConversations) =>
    set({ isLoadingConversations }),
  setLoadingMessages: (isLoadingMessages) => set({ isLoadingMessages }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setTypingUsers: (conversationId, users) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [conversationId]: users },
    })),

  fetchConversations: async () => {
    set({ isLoadingConversations: true });
    try {
      const response = await getConversations();
      if (response.success && response.data) {
        set({ conversations: response.data });
      }
    } finally {
      set({ isLoadingConversations: false });
    }
  },

  fetchMessages: async (conversationId: string) => {
    set({ isLoadingMessages: true });
    try {
      const response = await getMessages(conversationId);
      if (response.success && response.data) {
        const result = response.data as CursorPagedResult<Message>;
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: result.items.reverse(),
          },
          messageCursors: {
            ...state.messageCursors,
            [conversationId]: result.nextCursor,
          },
          hasMoreMessages: {
            ...state.hasMoreMessages,
            [conversationId]: result.hasMore,
          },
        }));
      }
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  fetchOlderMessages: async (conversationId: string) => {
    const { messageCursors, hasMoreMessages, isLoadingMessages } = get();
    if (isLoadingMessages || !hasMoreMessages[conversationId]) return;

    const cursor = messageCursors[conversationId];
    if (!cursor) return;

    set({ isLoadingMessages: true });
    try {
      const response = await getMessages(conversationId, cursor);
      if (response.success && response.data) {
        const result = response.data as CursorPagedResult<Message>;
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: [
              ...result.items.reverse(),
              ...(state.messages[conversationId] ?? []),
            ],
          },
          messageCursors: {
            ...state.messageCursors,
            [conversationId]: result.nextCursor,
          },
          hasMoreMessages: {
            ...state.hasMoreMessages,
            [conversationId]: result.hasMore,
          },
        }));
      }
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  sendMessage: async (conversationId, data) => {
    set({ isSendingMessage: true });
    try {
      const response = await apiSendMessage(conversationId, data);
      if (response.success && response.data) {
        get().addMessage(conversationId, response.data);
        get().updateConversationLastMessage(conversationId, response.data);
        return response.data;
      }
      return null;
    } finally {
      set({ isSendingMessage: false });
    }
  },

  updateConversationLastMessage: (conversationId, message) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, lastMessage: message, updatedAt: message.createdAt }
          : c
      ),
    })),
}));
