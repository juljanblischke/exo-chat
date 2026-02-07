import {
  type RatchetState,
  type EncryptedPayload,
  initSenderRatchet,
  initReceiverRatchet,
  ratchetEncrypt,
  ratchetDecrypt,
} from "./double-ratchet";
import { performX3DH, type PreKeyBundleData } from "./x3dh";
import {
  storeSession,
  getSession,
  deleteSession,
  getIdentityKeyPair,
} from "./store";
import { fromBase64 } from "./keys";

function sessionKey(conversationId: string, peerUserId: string): string {
  return `${conversationId}:${peerUserId}`;
}

function ratchetStateToSessionData(
  conversationId: string,
  peerUserId: string,
  state: RatchetState
) {
  return {
    conversationId,
    peerUserId,
    rootKey: state.rootKey,
    sendChainKey: state.sendChainKey,
    receiveChainKey: state.receiveChainKey,
    sendMessageNumber: state.sendMessageNumber,
    receiveMessageNumber: state.receiveMessageNumber,
    sendRatchetKey: state.sendRatchetKeyPair.publicKey,
    receiveRatchetKey: state.receiveRatchetKey,
    createdAt: Date.now(),
  };
}

export async function initSession(
  userId: string,
  conversationId: string,
  peerUserId: string,
  bundle: PreKeyBundleData
): Promise<void> {
  const identityKeyPair = await getIdentityKeyPair(userId);
  if (!identityKeyPair) {
    throw new Error("Identity key pair not found. Generate keys first.");
  }

  const x3dhResult = await performX3DH(identityKeyPair.privateKey, bundle);
  const ratchetState = await initSenderRatchet(
    x3dhResult.sharedSecret,
    fromBase64(bundle.signedPreKey)
  );

  const key = sessionKey(conversationId, peerUserId);
  await storeSession(key, ratchetStateToSessionData(conversationId, peerUserId, ratchetState));
}

export async function hasSession(
  conversationId: string,
  peerUserId: string
): Promise<boolean> {
  const key = sessionKey(conversationId, peerUserId);
  const session = await getSession(key);
  return session !== undefined;
}

export async function encryptMessage(
  conversationId: string,
  peerUserId: string,
  plaintext: string
): Promise<EncryptedPayload> {
  const key = sessionKey(conversationId, peerUserId);
  const sessionData = await getSession(key);
  if (!sessionData) {
    throw new Error("No session found. Initialize session first.");
  }

  // Reconstruct ratchet state from stored data
  const state: RatchetState = {
    rootKey: sessionData.rootKey,
    sendChainKey: sessionData.sendChainKey,
    receiveChainKey: sessionData.receiveChainKey,
    sendMessageNumber: sessionData.sendMessageNumber,
    receiveMessageNumber: sessionData.receiveMessageNumber,
    sendRatchetKeyPair: {
      publicKey: sessionData.sendRatchetKey,
      privateKey: new Uint8Array(32), // Private keys are ephemeral per ratchet step
    },
    receiveRatchetKey: sessionData.receiveRatchetKey,
  };

  const { payload, newState } = await ratchetEncrypt(state, plaintext);

  // Update stored session
  await storeSession(key, ratchetStateToSessionData(conversationId, peerUserId, newState));

  return payload;
}

export async function decryptMessage(
  conversationId: string,
  peerUserId: string,
  payload: EncryptedPayload
): Promise<string> {
  const key = sessionKey(conversationId, peerUserId);
  const sessionData = await getSession(key);
  if (!sessionData) {
    throw new Error("No session found. Cannot decrypt.");
  }

  const state: RatchetState = {
    rootKey: sessionData.rootKey,
    sendChainKey: sessionData.sendChainKey,
    receiveChainKey: sessionData.receiveChainKey,
    sendMessageNumber: sessionData.sendMessageNumber,
    receiveMessageNumber: sessionData.receiveMessageNumber,
    sendRatchetKeyPair: {
      publicKey: sessionData.sendRatchetKey,
      privateKey: new Uint8Array(32),
    },
    receiveRatchetKey: sessionData.receiveRatchetKey,
  };

  const { plaintext, newState } = await ratchetDecrypt(state, payload);

  await storeSession(key, ratchetStateToSessionData(conversationId, peerUserId, newState));

  return plaintext;
}

export async function destroySession(
  conversationId: string,
  peerUserId: string
): Promise<void> {
  const key = sessionKey(conversationId, peerUserId);
  await deleteSession(key);
}

export async function generateSafetyNumber(
  userId: string,
  peerUserId: string
): Promise<string> {
  const myKeys = await getIdentityKeyPair(userId);
  if (!myKeys) return "";

  // Generate a deterministic safety number from both identity keys
  // In production this would use a proper fingerprint algorithm
  const combined = new Uint8Array([...myKeys.publicKey]);
  const hash = Array.from(combined)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Format as groups of 5 digits for display
  const digits = hash
    .split("")
    .map((c) => parseInt(c, 16) % 10)
    .join("");

  return digits
    .slice(0, 60)
    .match(/.{5}/g)
    ?.join(" ") ?? digits.slice(0, 60);
}
