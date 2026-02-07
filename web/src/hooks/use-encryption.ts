"use client";

import { useCallback, useEffect } from "react";
import { useEncryptionStore } from "@/stores/encryption-store";
import type { EncryptedPayload } from "@/lib/encryption";

export function useEncryption(userId: string | undefined) {
  const {
    isInitialized,
    isInitializing,
    encryptedConversations,
    remainingOneTimePreKeys,
    initialize,
    toggleEncryption,
    isConversationEncrypted,
    ensureSession,
    encrypt,
    decrypt,
    getSafetyNumber,
    refreshKeyCount,
  } = useEncryptionStore();

  useEffect(() => {
    if (userId && !isInitialized && !isInitializing) {
      initialize(userId);
    }
  }, [userId, isInitialized, isInitializing, initialize]);

  const encryptMessageForPeer = useCallback(
    async (
      conversationId: string,
      peerUserId: string,
      plaintext: string
    ): Promise<EncryptedPayload | null> => {
      if (!userId || !isConversationEncrypted(conversationId)) return null;

      try {
        await ensureSession(userId, conversationId, peerUserId);
        return encrypt(conversationId, peerUserId, plaintext);
      } catch (error) {
        console.error("Encryption failed:", error);
        return null;
      }
    },
    [userId, isConversationEncrypted, ensureSession, encrypt]
  );

  const decryptMessageFromPeer = useCallback(
    async (
      conversationId: string,
      peerUserId: string,
      payload: EncryptedPayload
    ): Promise<string | null> => {
      if (!userId) return null;

      try {
        return decrypt(conversationId, peerUserId, payload);
      } catch (error) {
        console.error("Decryption failed:", error);
        return null;
      }
    },
    [userId, decrypt]
  );

  const getVerificationCode = useCallback(
    async (peerUserId: string): Promise<string> => {
      if (!userId) return "";
      return getSafetyNumber(userId, peerUserId);
    },
    [userId, getSafetyNumber]
  );

  return {
    isInitialized,
    isInitializing,
    encryptedConversations,
    remainingOneTimePreKeys,
    toggleEncryption,
    isConversationEncrypted,
    encryptMessageForPeer,
    decryptMessageFromPeer,
    getVerificationCode,
    refreshKeyCount,
  };
}
