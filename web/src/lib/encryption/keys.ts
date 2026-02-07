import sodium from "libsodium-wrappers";
import {
  storeIdentityKeyPair,
  storePreKey,
  storeSignedPreKey,
} from "./store";

let sodiumReady = false;

async function ensureSodium(): Promise<void> {
  if (!sodiumReady) {
    await sodium.ready;
    sodiumReady = true;
  }
}

export interface KeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export interface SignedKeyPair extends KeyPair {
  keyId: number;
  signature: Uint8Array;
}

export interface OneTimeKeyPair extends KeyPair {
  keyId: number;
}

export async function generateIdentityKeyPair(): Promise<KeyPair> {
  await ensureSodium();
  const keyPair = sodium.crypto_box_keypair();
  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  };
}

export async function generateSignedPreKey(
  identityPrivateKey: Uint8Array,
  keyId: number
): Promise<SignedKeyPair> {
  await ensureSodium();
  const keyPair = sodium.crypto_box_keypair();
  const signature = sodium.crypto_sign_detached(
    keyPair.publicKey,
    sodium.crypto_sign_seed_keypair(
      sodium.crypto_generichash(32, identityPrivateKey)
    ).privateKey
  );
  return {
    keyId,
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
    signature,
  };
}

export async function generateOneTimePreKeys(
  startId: number,
  count: number
): Promise<OneTimeKeyPair[]> {
  await ensureSodium();
  const keys: OneTimeKeyPair[] = [];
  for (let i = 0; i < count; i++) {
    const keyPair = sodium.crypto_box_keypair();
    keys.push({
      keyId: startId + i,
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
    });
  }
  return keys;
}

export async function generateAndStoreKeys(
  userId: string,
  oneTimePreKeyCount: number = 100
): Promise<{
  identityKeyPair: KeyPair;
  signedPreKey: SignedKeyPair;
  oneTimePreKeys: OneTimeKeyPair[];
}> {
  const identityKeyPair = await generateIdentityKeyPair();
  await storeIdentityKeyPair(userId, identityKeyPair.publicKey, identityKeyPair.privateKey);

  const signedPreKey = await generateSignedPreKey(identityKeyPair.privateKey, 1);
  await storeSignedPreKey(
    signedPreKey.keyId,
    signedPreKey.publicKey,
    signedPreKey.privateKey,
    signedPreKey.signature
  );

  const oneTimePreKeys = await generateOneTimePreKeys(1, oneTimePreKeyCount);
  for (const otpk of oneTimePreKeys) {
    await storePreKey(otpk.keyId, otpk.publicKey, otpk.privateKey);
  }

  return { identityKeyPair, signedPreKey, oneTimePreKeys };
}

export function toBase64(data: Uint8Array): string {
  return sodium.to_base64(data, sodium.base64_variants.ORIGINAL);
}

export function fromBase64(data: string): Uint8Array {
  return sodium.from_base64(data, sodium.base64_variants.ORIGINAL);
}
