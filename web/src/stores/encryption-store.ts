import { create } from "zustand";
import {
  generateAndStoreKeys,
  getIdentityKeyPair,
  toBase64,
  initSession,
  hasSession,
  encryptMessage,
  decryptMessage,
  destroySession,
  generateSafetyNumber,
  type EncryptedPayload,
  type PreKeyBundleData,
} from "@/lib/encryption";
import {
  uploadPreKeys,
  getPreKeyBundle,
  getOneTimePreKeyCount,
  type KeyUploadRequest,
} from "@/lib/api/encryption";

interface EncryptionState {
  isInitialized: boolean;
  isInitializing: boolean;
  encryptedConversations: Record<string, boolean>;
  remainingOneTimePreKeys: number;

  initialize: (userId: string) => Promise<void>;
  toggleEncryption: (conversationId: string) => void;
  isConversationEncrypted: (conversationId: string) => boolean;
  ensureSession: (
    userId: string,
    conversationId: string,
    peerUserId: string
  ) => Promise<void>;
  encrypt: (
    conversationId: string,
    peerUserId: string,
    plaintext: string
  ) => Promise<EncryptedPayload>;
  decrypt: (
    conversationId: string,
    peerUserId: string,
    payload: EncryptedPayload
  ) => Promise<string>;
  endSession: (conversationId: string, peerUserId: string) => Promise<void>;
  getSafetyNumber: (userId: string, peerUserId: string) => Promise<string>;
  refreshKeyCount: () => Promise<void>;
}

export const useEncryptionStore = create<EncryptionState>((set, get) => ({
  isInitialized: false,
  isInitializing: false,
  encryptedConversations: {},
  remainingOneTimePreKeys: 0,

  initialize: async (userId: string) => {
    if (get().isInitialized || get().isInitializing) return;
    set({ isInitializing: true });

    try {
      // Check if we already have keys in IndexedDB
      const existingKeys = await getIdentityKeyPair(userId);
      if (existingKeys) {
        set({ isInitialized: true });
        await get().refreshKeyCount();
        return;
      }

      // Generate new keys
      const { identityKeyPair, signedPreKey, oneTimePreKeys } =
        await generateAndStoreKeys(userId);

      // Upload public keys to server
      const uploadData: KeyUploadRequest = {
        identityPublicKey: toBase64(identityKeyPair.publicKey),
        identityPrivateKeyEncrypted: toBase64(identityKeyPair.privateKey), // In production, encrypt with user's password
        signedPreKey: {
          keyId: signedPreKey.keyId,
          publicKey: toBase64(signedPreKey.publicKey),
          privateKeyEncrypted: toBase64(signedPreKey.privateKey),
          signature: toBase64(signedPreKey.signature),
        },
        oneTimePreKeys: oneTimePreKeys.map((otpk) => ({
          keyId: otpk.keyId,
          publicKey: toBase64(otpk.publicKey),
          privateKeyEncrypted: toBase64(otpk.privateKey),
        })),
      };

      await uploadPreKeys(uploadData);
      set({ isInitialized: true });
      await get().refreshKeyCount();
    } catch (error) {
      console.error("Failed to initialize encryption:", error);
    } finally {
      set({ isInitializing: false });
    }
  },

  toggleEncryption: (conversationId: string) => {
    set((state) => ({
      encryptedConversations: {
        ...state.encryptedConversations,
        [conversationId]: !state.encryptedConversations[conversationId],
      },
    }));
  },

  isConversationEncrypted: (conversationId: string) => {
    return get().encryptedConversations[conversationId] ?? false;
  },

  ensureSession: async (
    userId: string,
    conversationId: string,
    peerUserId: string
  ) => {
    const sessionExists = await hasSession(conversationId, peerUserId);
    if (sessionExists) return;

    const response = await getPreKeyBundle(peerUserId);
    if (!response.success || !response.data) {
      throw new Error("Failed to fetch pre-key bundle");
    }

    const bundle: PreKeyBundleData = {
      userId: response.data.userId,
      identityKey: response.data.identityKey,
      signedPreKeyId: response.data.signedPreKeyId,
      signedPreKey: response.data.signedPreKey,
      signedPreKeySignature: response.data.signedPreKeySignature,
      oneTimePreKeyId: response.data.oneTimePreKeyId,
      oneTimePreKey: response.data.oneTimePreKey,
    };

    await initSession(userId, conversationId, peerUserId, bundle);
  },

  encrypt: async (
    conversationId: string,
    peerUserId: string,
    plaintext: string
  ) => {
    return encryptMessage(conversationId, peerUserId, plaintext);
  },

  decrypt: async (
    conversationId: string,
    peerUserId: string,
    payload: EncryptedPayload
  ) => {
    return decryptMessage(conversationId, peerUserId, payload);
  },

  endSession: async (conversationId: string, peerUserId: string) => {
    await destroySession(conversationId, peerUserId);
  },

  getSafetyNumber: async (userId: string, peerUserId: string) => {
    return generateSafetyNumber(userId, peerUserId);
  },

  refreshKeyCount: async () => {
    try {
      const response = await getOneTimePreKeyCount();
      if (response.success && response.data) {
        set({ remainingOneTimePreKeys: response.data.remainingOneTimePreKeys });
      }
    } catch {
      // Silently fail - key count is informational
    }
  },
}));
