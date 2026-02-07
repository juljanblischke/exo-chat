import sodium from "libsodium-wrappers";
import { encrypt, decrypt, deriveKey } from "./crypto";

let sodiumReady = false;

async function ensureSodium(): Promise<void> {
  if (!sodiumReady) {
    await sodium.ready;
    sodiumReady = true;
  }
}

export interface RatchetState {
  rootKey: Uint8Array;
  sendChainKey: Uint8Array;
  receiveChainKey: Uint8Array;
  sendMessageNumber: number;
  receiveMessageNumber: number;
  sendRatchetKeyPair: { publicKey: Uint8Array; privateKey: Uint8Array };
  receiveRatchetKey: Uint8Array;
}

export interface EncryptedPayload {
  ciphertext: string;
  nonce: string;
  senderRatchetKey: string;
  messageNumber: number;
  previousChainLength: number;
}

export async function initSenderRatchet(
  sharedSecret: Uint8Array,
  receiverRatchetKey: Uint8Array
): Promise<RatchetState> {
  await ensureSodium();

  const sendRatchetKeyPair = sodium.crypto_box_keypair();
  const dhOutput = sodium.crypto_scalarmult(sendRatchetKeyPair.privateKey, receiverRatchetKey);

  const rootKey = await deriveKey(
    new Uint8Array([...sharedSecret, ...dhOutput]),
    "RootChain"
  );
  const sendChainKey = await deriveKey(rootKey, "SendChain");

  return {
    rootKey,
    sendChainKey,
    receiveChainKey: new Uint8Array(32),
    sendMessageNumber: 0,
    receiveMessageNumber: 0,
    sendRatchetKeyPair,
    receiveRatchetKey: receiverRatchetKey,
  };
}

export async function initReceiverRatchet(
  sharedSecret: Uint8Array,
  ratchetKeyPair: { publicKey: Uint8Array; privateKey: Uint8Array }
): Promise<RatchetState> {
  await ensureSodium();

  return {
    rootKey: sharedSecret,
    sendChainKey: new Uint8Array(32),
    receiveChainKey: new Uint8Array(32),
    sendMessageNumber: 0,
    receiveMessageNumber: 0,
    sendRatchetKeyPair: ratchetKeyPair,
    receiveRatchetKey: new Uint8Array(32),
  };
}

export async function ratchetEncrypt(
  state: RatchetState,
  plaintext: string
): Promise<{ payload: EncryptedPayload; newState: RatchetState }> {
  await ensureSodium();

  // Derive message key from chain key
  const messageKey = await deriveKey(state.sendChainKey, `MessageKey-${state.sendMessageNumber}`);
  const nextChainKey = await deriveKey(state.sendChainKey, "ChainKey");

  // Encrypt
  const { ciphertext, nonce } = await encrypt(plaintext, messageKey);

  const payload: EncryptedPayload = {
    ciphertext: sodium.to_base64(ciphertext, sodium.base64_variants.ORIGINAL),
    nonce: sodium.to_base64(nonce, sodium.base64_variants.ORIGINAL),
    senderRatchetKey: sodium.to_base64(
      state.sendRatchetKeyPair.publicKey,
      sodium.base64_variants.ORIGINAL
    ),
    messageNumber: state.sendMessageNumber,
    previousChainLength: 0,
  };

  const newState: RatchetState = {
    ...state,
    sendChainKey: nextChainKey,
    sendMessageNumber: state.sendMessageNumber + 1,
  };

  return { payload, newState };
}

export async function ratchetDecrypt(
  state: RatchetState,
  payload: EncryptedPayload
): Promise<{ plaintext: string; newState: RatchetState }> {
  await ensureSodium();

  const senderRatchetKey = sodium.from_base64(
    payload.senderRatchetKey,
    sodium.base64_variants.ORIGINAL
  );

  let currentState = state;

  // Check if we need to perform a DH ratchet step
  const keysMatch =
    currentState.receiveRatchetKey.length > 0 &&
    sodium.memcmp(currentState.receiveRatchetKey, senderRatchetKey);

  if (!keysMatch) {
    // Perform DH ratchet
    currentState = await performDHRatchet(currentState, senderRatchetKey);
  }

  // Derive message key
  const messageKey = await deriveKey(
    currentState.receiveChainKey,
    `MessageKey-${payload.messageNumber}`
  );
  const nextChainKey = await deriveKey(currentState.receiveChainKey, "ChainKey");

  // Decrypt
  const ciphertext = sodium.from_base64(payload.ciphertext, sodium.base64_variants.ORIGINAL);
  const nonce = sodium.from_base64(payload.nonce, sodium.base64_variants.ORIGINAL);
  const plaintext = await decrypt(ciphertext, nonce, messageKey);

  const newState: RatchetState = {
    ...currentState,
    receiveChainKey: nextChainKey,
    receiveMessageNumber: currentState.receiveMessageNumber + 1,
  };

  return { plaintext, newState };
}

async function performDHRatchet(
  state: RatchetState,
  newReceiveRatchetKey: Uint8Array
): Promise<RatchetState> {
  await ensureSodium();

  // Receive ratchet step
  const dhReceive = sodium.crypto_scalarmult(
    state.sendRatchetKeyPair.privateKey,
    newReceiveRatchetKey
  );
  const receiveRootKey = await deriveKey(
    new Uint8Array([...state.rootKey, ...dhReceive]),
    "RootChain"
  );
  const receiveChainKey = await deriveKey(receiveRootKey, "ReceiveChain");

  // Send ratchet step
  const newSendRatchetKeyPair = sodium.crypto_box_keypair();
  const dhSend = sodium.crypto_scalarmult(
    newSendRatchetKeyPair.privateKey,
    newReceiveRatchetKey
  );
  const sendRootKey = await deriveKey(
    new Uint8Array([...receiveRootKey, ...dhSend]),
    "RootChain"
  );
  const sendChainKey = await deriveKey(sendRootKey, "SendChain");

  return {
    rootKey: sendRootKey,
    sendChainKey,
    receiveChainKey,
    sendMessageNumber: 0,
    receiveMessageNumber: 0,
    sendRatchetKeyPair: newSendRatchetKeyPair,
    receiveRatchetKey: newReceiveRatchetKey,
  };
}
