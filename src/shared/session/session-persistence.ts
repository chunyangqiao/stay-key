import { AES_KEY_BITS } from "../constants";
import { fromBase64, toBase64 } from "../bytes";

const SESSION_KEY = "stay-key.unlocked-session";

export type UnlockedSessionRecord = {
  dekRaw: string;
  lastActivityAt: number;
};

export async function readUnlockedSession(): Promise<UnlockedSessionRecord | undefined> {
  const result = await chrome.storage.session.get(SESSION_KEY);
  const value = result[SESSION_KEY];
  if (!value) {
    return undefined;
  }
  return value as UnlockedSessionRecord;
}

export async function writeUnlockedSession(record: UnlockedSessionRecord): Promise<void> {
  await chrome.storage.session.set({ [SESSION_KEY]: record });
}

export async function clearUnlockedSession(): Promise<void> {
  await chrome.storage.session.remove(SESSION_KEY);
}

export async function touchUnlockedSessionActivity(at = Date.now()): Promise<void> {
  const existing = await readUnlockedSession();
  if (!existing) {
    return;
  }
  await writeUnlockedSession({ ...existing, lastActivityAt: at });
}

export async function exportDekRaw(dek: CryptoKey): Promise<string> {
  const raw = new Uint8Array(await crypto.subtle.exportKey("raw", dek));
  return toBase64(raw);
}

export async function importDekRaw(dekRaw: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    fromBase64(dekRaw).buffer as ArrayBuffer,
    { name: "AES-GCM", length: AES_KEY_BITS },
    false,
    ["encrypt", "decrypt"],
  );
}
