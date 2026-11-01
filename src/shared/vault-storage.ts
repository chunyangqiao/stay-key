import { VAULT_STORAGE_KEY } from "./constants";

import type { PersistedVault } from "./vault-types";

export async function readPersistedVault(): Promise<PersistedVault | undefined> {
  const result = await chrome.storage.local.get(VAULT_STORAGE_KEY);
  const value = result[VAULT_STORAGE_KEY];
  if (!value) {
    return undefined;
  }
  return value as PersistedVault;
}

export async function writePersistedVault(vault: PersistedVault): Promise<void> {
  await chrome.storage.local.set({ [VAULT_STORAGE_KEY]: vault });
}

export async function clearPersistedVault(): Promise<void> {
  await chrome.storage.local.remove(VAULT_STORAGE_KEY);
}
