import { create } from "zustand";
import type { Conversation, Message } from "@/types";

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  setLoadingConversations: (loading: boolean) => void;
  setLoadingMessages: (loading: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  isLoadingConversations: false,
  isLoadingMessages: false,
  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (activeConversationId) => set({ activeConversationId }),
  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [conversationId]: messages },
    })),
  addMessage: (conversationId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] ?? []), message],
      },
    })),
  setLoadingConversations: (isLoadingConversations) => set({ isLoadingConversations }),
  setLoadingMessages: (isLoadingMessages) => set({ isLoadingMessages }),
}));
