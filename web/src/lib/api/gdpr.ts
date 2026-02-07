import { apiClient } from "./client";
import type { ApiResponse } from "@/types";
import type {
  DataExportDto,
  AccountDeletionDto,
  UserConsentDto,
  UpdateConsentRequest,
} from "@/types/gdpr";

export async function requestDataExport(): Promise<ApiResponse<DataExportDto>> {
  return apiClient.get<DataExportDto>("/users/me/export");
}

export async function getExportDownload(
  exportId: string
): Promise<ApiResponse<DataExportDto>> {
  return apiClient.get<DataExportDto>(
    `/users/me/export/${exportId}/download`
  );
}

export async function requestAccountDeletion(
  reason?: string
): Promise<ApiResponse<AccountDeletionDto>> {
  return apiClient.delete<AccountDeletionDto>("/users/me");
}

export async function cancelAccountDeletion(): Promise<ApiResponse<void>> {
  return apiClient.post<void>("/users/me/cancel-deletion");
}

export async function getUserConsents(): Promise<
  ApiResponse<UserConsentDto[]>
> {
  return apiClient.get<UserConsentDto[]>("/users/me/consents");
}

export async function updateConsent(
  request: UpdateConsentRequest
): Promise<ApiResponse<UserConsentDto>> {
  return apiClient.put<UserConsentDto>("/users/me/consents", request);
}
