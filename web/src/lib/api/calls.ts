import { apiClient } from "./client";
import type { CallTokenData } from "@/types";

export async function initiateCall(conversationId: string, isVideo: boolean) {
  return apiClient.post<{ roomName: string; conversationId: string; isVideo: boolean }>(
    `/conversations/${conversationId}/call`,
    { isVideo }
  );
}

export async function joinCall(conversationId: string) {
  return apiClient.post<CallTokenData>(
    `/conversations/${conversationId}/call/join`
  );
}

export async function endCallApi(conversationId: string) {
  return apiClient.post(`/conversations/${conversationId}/call/end`);
}

export async function getCallStatus(conversationId: string) {
  return apiClient.get<{
    roomName: string;
    numParticipants: number;
    maxParticipants: number;
    isActive: boolean;
  }>(`/conversations/${conversationId}/call/status`);
}
