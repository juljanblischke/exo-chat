import sodium from "libsodium-wrappers";
import { generateSharedSecret, deriveKey } from "./crypto";
import { fromBase64 } from "./keys";

let sodiumReady = false;

async function ensureSodium(): Promise<void> {
  if (!sodiumReady) {
    await sodium.ready;
    sodiumReady = true;
  }
}

export interface PreKeyBundleData {
  userId: string;
  identityKey: string;
  signedPreKeyId: number;
  signedPreKey: string;
  signedPreKeySignature: string;
  oneTimePreKeyId: number | null;
  oneTimePreKey: string | null;
}

export interface X3DHResult {
  sharedSecret: Uint8Array;
  ephemeralPublicKey: Uint8Array;
  usedOneTimePreKeyId: number | null;
}

export async function performX3DH(
  identityPrivateKey: Uint8Array,
  bundle: PreKeyBundleData
): Promise<X3DHResult> {
  await ensureSodium();

  const peerIdentityKey = fromBase64(bundle.identityKey);
  const peerSignedPreKey = fromBase64(bundle.signedPreKey);

  // Verify signed pre-key signature
  const signatureValid = verifySignedPreKey(
    peerSignedPreKey,
    fromBase64(bundle.signedPreKeySignature),
    peerIdentityKey
  );
  if (!signatureValid) {
    throw new Error("Invalid signed pre-key signature");
  }

  // Generate ephemeral key pair
  const ephemeralKeyPair = sodium.crypto_box_keypair();

  // X3DH: compute DH values
  // DH1 = DH(IK_A, SPK_B)
  const dh1 = await generateSharedSecret(identityPrivateKey, peerSignedPreKey);
  // DH2 = DH(EK_A, IK_B)
  const dh2 = await generateSharedSecret(ephemeralKeyPair.privateKey, peerIdentityKey);
  // DH3 = DH(EK_A, SPK_B)
  const dh3 = await generateSharedSecret(ephemeralKeyPair.privateKey, peerSignedPreKey);

  let combinedSecret: Uint8Array;
  let usedOneTimePreKeyId: number | null = null;

  if (bundle.oneTimePreKey && bundle.oneTimePreKeyId !== null) {
    const peerOneTimePreKey = fromBase64(bundle.oneTimePreKey);
    // DH4 = DH(EK_A, OPK_B)
    const dh4 = await generateSharedSecret(ephemeralKeyPair.privateKey, peerOneTimePreKey);
    combinedSecret = new Uint8Array([...dh1, ...dh2, ...dh3, ...dh4]);
    usedOneTimePreKeyId = bundle.oneTimePreKeyId;
  } else {
    combinedSecret = new Uint8Array([...dh1, ...dh2, ...dh3]);
  }

  // Derive shared secret using KDF
  const sharedSecret = await deriveKey(combinedSecret, "X3DH-SharedSecret");

  return {
    sharedSecret,
    ephemeralPublicKey: ephemeralKeyPair.publicKey,
    usedOneTimePreKeyId,
  };
}

export async function respondToX3DH(
  identityPrivateKey: Uint8Array,
  signedPreKeyPrivate: Uint8Array,
  oneTimePreKeyPrivate: Uint8Array | null,
  senderIdentityKey: Uint8Array,
  senderEphemeralKey: Uint8Array
): Promise<Uint8Array> {
  await ensureSodium();

  // DH1 = DH(SPK_B, IK_A)
  const dh1 = await generateSharedSecret(signedPreKeyPrivate, senderIdentityKey);
  // DH2 = DH(IK_B, EK_A)
  const dh2 = await generateSharedSecret(identityPrivateKey, senderEphemeralKey);
  // DH3 = DH(SPK_B, EK_A)
  const dh3 = await generateSharedSecret(signedPreKeyPrivate, senderEphemeralKey);

  let combinedSecret: Uint8Array;

  if (oneTimePreKeyPrivate) {
    // DH4 = DH(OPK_B, EK_A)
    const dh4 = await generateSharedSecret(oneTimePreKeyPrivate, senderEphemeralKey);
    combinedSecret = new Uint8Array([...dh1, ...dh2, ...dh3, ...dh4]);
  } else {
    combinedSecret = new Uint8Array([...dh1, ...dh2, ...dh3]);
  }

  return deriveKey(combinedSecret, "X3DH-SharedSecret");
}

function verifySignedPreKey(
  publicKey: Uint8Array,
  signature: Uint8Array,
  identityKey: Uint8Array
): boolean {
  try {
    // Derive signing key from identity key for verification
    const signingKeyPair = sodium.crypto_sign_seed_keypair(
      sodium.crypto_generichash(32, identityKey, null)
    );
    return sodium.crypto_sign_verify_detached(signature, publicKey, signingKeyPair.publicKey);
  } catch {
    return false;
  }
}
