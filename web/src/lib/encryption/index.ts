export {
  generateAndStoreKeys,
  generateIdentityKeyPair,
  generateSignedPreKey,
  generateOneTimePreKeys,
  toBase64,
  fromBase64,
  type KeyPair,
  type SignedKeyPair,
  type OneTimeKeyPair,
} from "./keys";

export {
  initSession,
  hasSession,
  encryptMessage,
  decryptMessage,
  destroySession,
  generateSafetyNumber,
} from "./session";

export {
  type EncryptedPayload,
} from "./double-ratchet";

export {
  performX3DH,
  respondToX3DH,
  type PreKeyBundleData,
} from "./x3dh";

export {
  clearAllEncryptionData,
  getIdentityKeyPair,
} from "./store";
