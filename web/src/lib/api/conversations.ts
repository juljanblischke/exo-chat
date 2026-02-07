import { apiClient } from "./client";
import type {
  Conversation,
  Message,
  PagedResult,
  User,
  ConversationType,
} from "@/types";

export interface CreateConversationRequest {
  type: ConversationType;
  participantIds: string[];
  groupName?: string;
  groupDescription?: string;
}

export interface SendMessageRequest {
  content: string;
  messageType?: number;
}

export interface CursorPagedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export async function getConversations() {
  return apiClient.get<Conversation[]>("/conversations");
}

export async function getConversation(conversationId: string) {
  return apiClient.get<Conversation>(`/conversations/${conversationId}`);
}

export async function createConversation(data: CreateConversationRequest) {
  return apiClient.post<Conversation>("/conversations", data);
}

export async function getMessages(
  conversationId: string,
  cursor?: string,
  limit: number = 50
) {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (cursor) params.set("cursor", cursor);
  return apiClient.get<CursorPagedResult<Message>>(
    `/conversations/${conversationId}/messages?${params.toString()}`
  );
}

export async function sendMessage(
  conversationId: string,
  data: SendMessageRequest
) {
  return apiClient.post<Message>(
    `/conversations/${conversationId}/messages`,
    data
  );
}

export async function editMessage(
  conversationId: string,
  messageId: string,
  content: string
) {
  return apiClient.put<Message>(
    `/conversations/${conversationId}/messages/${messageId}`,
    { content }
  );
}

export async function deleteMessage(
  conversationId: string,
  messageId: string
) {
  return apiClient.delete<void>(
    `/conversations/${conversationId}/messages/${messageId}`
  );
}

export async function searchUsers(query: string) {
  return apiClient.get<User[]>(`/users/search?query=${encodeURIComponent(query)}`);
}
