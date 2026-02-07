import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "exochat-encryption";
const DB_VERSION = 1;

interface EncryptionDB {
  identityKeys: {
    key: string;
    value: {
      userId: string;
      publicKey: Uint8Array;
      privateKey: Uint8Array;
    };
  };
  sessions: {
    key: string;
    value: {
      conversationId: string;
      peerUserId: string;
      rootKey: Uint8Array;
      sendChainKey: Uint8Array;
      receiveChainKey: Uint8Array;
      sendMessageNumber: number;
      receiveMessageNumber: number;
      sendRatchetKey: Uint8Array;
      receiveRatchetKey: Uint8Array;
      createdAt: number;
    };
  };
  preKeys: {
    key: number;
    value: {
      keyId: number;
      publicKey: Uint8Array;
      privateKey: Uint8Array;
    };
  };
  signedPreKeys: {
    key: number;
    value: {
      keyId: number;
      publicKey: Uint8Array;
      privateKey: Uint8Array;
      signature: Uint8Array;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<EncryptionDB>> | null = null;

function getDb(): Promise<IDBPDatabase<EncryptionDB>> {
  if (!dbPromise) {
    dbPromise = openDB<EncryptionDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("identityKeys")) {
          db.createObjectStore("identityKeys");
        }
        if (!db.objectStoreNames.contains("sessions")) {
          db.createObjectStore("sessions");
        }
        if (!db.objectStoreNames.contains("preKeys")) {
          db.createObjectStore("preKeys");
        }
        if (!db.objectStoreNames.contains("signedPreKeys")) {
          db.createObjectStore("signedPreKeys");
        }
      },
    });
  }
  return dbPromise;
}

export async function storeIdentityKeyPair(
  userId: string,
  publicKey: Uint8Array,
  privateKey: Uint8Array
): Promise<void> {
  const db = await getDb();
  await db.put("identityKeys", { userId, publicKey, privateKey }, userId);
}

export async function getIdentityKeyPair(
  userId: string
): Promise<{ publicKey: Uint8Array; privateKey: Uint8Array } | undefined> {
  const db = await getDb();
  return db.get("identityKeys", userId);
}

export async function storeSession(
  sessionKey: string,
  session: EncryptionDB["sessions"]["value"]
): Promise<void> {
  const db = await getDb();
  await db.put("sessions", session, sessionKey);
}

export async function getSession(
  sessionKey: string
): Promise<EncryptionDB["sessions"]["value"] | undefined> {
  const db = await getDb();
  return db.get("sessions", sessionKey);
}

export async function deleteSession(sessionKey: string): Promise<void> {
  const db = await getDb();
  await db.delete("sessions", sessionKey);
}

export async function storePreKey(
  keyId: number,
  publicKey: Uint8Array,
  privateKey: Uint8Array
): Promise<void> {
  const db = await getDb();
  await db.put("preKeys", { keyId, publicKey, privateKey }, keyId);
}

export async function getPreKey(
  keyId: number
): Promise<{ keyId: number; publicKey: Uint8Array; privateKey: Uint8Array } | undefined> {
  const db = await getDb();
  return db.get("preKeys", keyId);
}

export async function storeSignedPreKey(
  keyId: number,
  publicKey: Uint8Array,
  privateKey: Uint8Array,
  signature: Uint8Array
): Promise<void> {
  const db = await getDb();
  await db.put("signedPreKeys", { keyId, publicKey, privateKey, signature }, keyId);
}

export async function getSignedPreKey(
  keyId: number
): Promise<{ keyId: number; publicKey: Uint8Array; privateKey: Uint8Array; signature: Uint8Array } | undefined> {
  const db = await getDb();
  return db.get("signedPreKeys", keyId);
}

export async function clearAllEncryptionData(): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(
    ["identityKeys", "sessions", "preKeys", "signedPreKeys"],
    "readwrite"
  );
  await Promise.all([
    tx.objectStore("identityKeys").clear(),
    tx.objectStore("sessions").clear(),
    tx.objectStore("preKeys").clear(),
    tx.objectStore("signedPreKeys").clear(),
    tx.done,
  ]);
}
