export type CipherBlob = {
  iv: string;
  ciphertext: string;
};

export type VaultSettings = {
  idleLockMs: number;
  clipboardClearMs: number;
};

export type VaultEntry = {
  id: string;
  host: string;
  username: string;
  password: string;
  tags: string[];
  updatedAt: string;
};

export type VaultPayload = {
  entries: VaultEntry[];
};

export type PersistedVault = {
  version: 1;
  masterSalt: string;
  recoverySalt: string;
  recoveryQuestion: string;
  wrappedDekByMaster: CipherBlob;
  wrappedDekByRecovery: CipherBlob;
  payload: CipherBlob;
  masterFailCount: number;
  masterCooldownUntil: number | undefined;
  recoveryFailCount: number;
  recoveryCooldownUntil: number | undefined;
  settings: VaultSettings;
};
