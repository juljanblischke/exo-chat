import sodium from "libsodium-wrappers";

let sodiumReady = false;

async function ensureSodium(): Promise<void> {
  if (!sodiumReady) {
    await sodium.ready;
    sodiumReady = true;
  }
}

export async function encrypt(
  plaintext: string,
  key: Uint8Array
): Promise<{ ciphertext: Uint8Array; nonce: Uint8Array }> {
  await ensureSodium();
  const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
  const encoder = new TextEncoder();
  const plaintextBytes = encoder.encode(plaintext);

  const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    plaintextBytes,
    null,
    null,
    nonce,
    key
  );

  return { ciphertext, nonce };
}

export async function decrypt(
  ciphertext: Uint8Array,
  nonce: Uint8Array,
  key: Uint8Array
): Promise<string> {
  await ensureSodium();
  const plaintextBytes = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    null,
    ciphertext,
    null,
    nonce,
    key
  );

  const decoder = new TextDecoder();
  return decoder.decode(plaintextBytes);
}

export async function deriveKey(
  sharedSecret: Uint8Array,
  info: string
): Promise<Uint8Array> {
  await ensureSodium();
  const infoBytes = new TextEncoder().encode(info);
  return sodium.crypto_generichash(32, new Uint8Array([...sharedSecret, ...infoBytes]), null);
}

export async function generateSharedSecret(
  privateKey: Uint8Array,
  publicKey: Uint8Array
): Promise<Uint8Array> {
  await ensureSodium();
  return sodium.crypto_scalarmult(privateKey, publicKey);
}
