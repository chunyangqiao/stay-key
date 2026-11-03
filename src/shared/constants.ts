export const VAULT_STORAGE_KEY = "stay-key.vault";

/** Master secret is a 6-digit numeric PIN (PRD v0.7). */
export const MASTER_PIN_LENGTH = 6;
export const masterPinPattern = /^\d{6}$/;

export const RECOVERY_ANSWER_MIN_LENGTH = 8;

export const MAX_FAILED_ATTEMPTS = 5;
export const COOLDOWN_MS = 30 * 60 * 1000;

export const DEFAULT_IDLE_LOCK_MS = 2 * 60 * 1000;
export const DEFAULT_CLIPBOARD_CLEAR_MS = 30 * 1000;

/** Home list username masking (settings「列表掩码」). */
export const DEFAULT_LIST_MASK_ENABLED = true;

/** Home 当前站 / 其他 segments (settings「当前站点块」). */
export const DEFAULT_CURRENT_SITE_SEGMENT_ENABLED = true;

/** PBKDF2-SHA-256 iteration count for master and recovery key derivation. */
export const PBKDF2_ITERATIONS = 600_000;

export const SALT_BYTE_LENGTH = 16;
export const IV_BYTE_LENGTH = 12;
export const AES_KEY_BITS = 256;

export function isValidMasterPin(value: string): boolean {
  return masterPinPattern.test(value);
}

/** Keep digits only, truncate to MASTER_PIN_LENGTH. */
export function sanitizeMasterPinInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, MASTER_PIN_LENGTH);
}
