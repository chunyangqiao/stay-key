export const VAULT_STORAGE_KEY = "stay-key.vault";

export const MASTER_PASSWORD_MIN_LENGTH = 12;
export const RECOVERY_ANSWER_MIN_LENGTH = 8;

export const MAX_FAILED_ATTEMPTS = 5;
export const COOLDOWN_MS = 30 * 60 * 1000;

export const DEFAULT_IDLE_LOCK_MS = 2 * 60 * 1000;
export const DEFAULT_CLIPBOARD_CLEAR_MS = 30 * 1000;

/** PBKDF2-SHA-256 iteration count for master and recovery key derivation. */
export const PBKDF2_ITERATIONS = 600_000;

export const SALT_BYTE_LENGTH = 16;
export const IV_BYTE_LENGTH = 12;
export const AES_KEY_BITS = 256;
