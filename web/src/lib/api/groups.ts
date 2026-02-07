import { apiClient } from "./client";
import type { Group, Participant, ParticipantRole } from "@/types";

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
}

export async function getGroup(conversationId: string) {
  return apiClient.get<Group>(`/groups/${conversationId}`);
}

export async function updateGroup(
  conversationId: string,
  data: UpdateGroupRequest
) {
  return apiClient.put<Group>(`/groups/${conversationId}`, data);
}

export async function addGroupMember(
  conversationId: string,
  userId: string
) {
  return apiClient.post<Participant>(
    `/groups/${conversationId}/members`,
    { userId }
  );
}

export async function removeGroupMember(
  conversationId: string,
  userId: string
) {
  return apiClient.delete<void>(
    `/groups/${conversationId}/members/${userId}`
  );
}

export async function updateMemberRole(
  conversationId: string,
  userId: string,
  role: ParticipantRole
) {
  return apiClient.put<Participant>(
    `/groups/${conversationId}/members/${userId}/role`,
    { role }
  );
}

export async function leaveGroup(conversationId: string) {
  return apiClient.post<void>(`/groups/${conversationId}/leave`);
}
