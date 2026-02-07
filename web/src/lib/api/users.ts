import { apiClient } from "./client";
import type {
  UserProfile,
  UserPrivacySettings,
  BlockedUser,
  StatusVisibility,
} from "@/types";

export async function getProfile() {
  return apiClient.get<UserProfile>("/users/me/profile");
}

export async function updateProfile(data: {
  displayName?: string;
  avatarUrl?: string;
  statusMessage?: string | null;
}) {
  return apiClient.put<UserProfile>("/users/me/profile", data);
}

export async function getPrivacySettings() {
  return apiClient.get<UserPrivacySettings>("/users/me/privacy");
}

export async function updatePrivacySettings(data: {
  readReceiptsEnabled: boolean;
  onlineStatusVisibility: StatusVisibility;
}) {
  return apiClient.put<UserPrivacySettings>("/users/me/privacy", data);
}

export async function getBlockedUsers() {
  return apiClient.get<BlockedUser[]>("/users/me/blocked");
}

export async function blockUser(userId: string) {
  return apiClient.post<void>(`/users/me/blocked/${userId}`);
}

export async function unblockUser(userId: string) {
  return apiClient.delete<void>(`/users/me/blocked/${userId}`);
}
