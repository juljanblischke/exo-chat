import { apiClient } from "./client";
import type { ApiResponse } from "@/types";

export interface PreKeyBundleResponse {
  userId: string;
  identityKey: string;
  signedPreKeyId: number;
  signedPreKey: string;
  signedPreKeySignature: string;
  oneTimePreKeyId: number | null;
  oneTimePreKey: string | null;
}

export interface KeyUploadRequest {
  identityPublicKey: string;
  identityPrivateKeyEncrypted: string;
  signedPreKey: {
    keyId: number;
    publicKey: string;
    privateKeyEncrypted: string;
    signature: string;
  };
  oneTimePreKeys: {
    keyId: number;
    publicKey: string;
    privateKeyEncrypted: string;
  }[];
}

export interface SignedPreKeyRotateRequest {
  keyId: number;
  publicKey: string;
  privateKeyEncrypted: string;
  signature: string;
}

export interface KeyCountResponse {
  remainingOneTimePreKeys: number;
}

export async function uploadPreKeys(
  data: KeyUploadRequest
): Promise<ApiResponse<null>> {
  return apiClient.post("/encryption/keys", data);
}

export async function getPreKeyBundle(
  userId: string
): Promise<ApiResponse<PreKeyBundleResponse>> {
  return apiClient.get(`/encryption/keys/${userId}/bundle`);
}

export async function rotateSignedPreKey(
  data: SignedPreKeyRotateRequest
): Promise<ApiResponse<null>> {
  return apiClient.post("/encryption/keys/rotate", data);
}

export async function getOneTimePreKeyCount(): Promise<ApiResponse<KeyCountResponse>> {
  return apiClient.get("/encryption/keys/count");
}
