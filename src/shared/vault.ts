import { z } from "zod";

import { fromBase64, toBase64, decodeUtf8, encodeUtf8 } from "./bytes";
import {
  COOLDOWN_MS,
  DEFAULT_CLIPBOARD_CLEAR_MS,
  DEFAULT_IDLE_LOCK_MS,
  MASTER_PASSWORD_MIN_LENGTH,
  MAX_FAILED_ATTEMPTS,
  RECOVERY_ANSWER_MIN_LENGTH,
} from "./constants";
import {
  createSalt,
  decryptAesGcm,
  deriveAesKey,
  encryptAesGcm,
  generateDek,
  unwrapDek,
  wrapDek,
} from "./crypto";
import { readPersistedVault, writePersistedVault } from "./vault-storage";

import type { CipherBlob, PersistedVault, VaultPayload } from "./vault-types";

const masterPasswordSchema = z
  .string()
  .min(MASTER_PASSWORD_MIN_LENGTH, "主密码过短，请设置更长、更难猜的口令。");

const recoveryAnswerSchema = z
  .string()
  .min(RECOVERY_ANSWER_MIN_LENGTH, "答案长度不足，请加长后再试。");

function blobToStored(blob: { iv: Uint8Array; ciphertext: Uint8Array }): CipherBlob {
  return {
    iv: toBase64(blob.iv),
    ciphertext: toBase64(blob.ciphertext),
  };
}

function storedToBlob(blob: CipherBlob): { iv: Uint8Array; ciphertext: Uint8Array } {
  return {
    iv: fromBase64(blob.iv),
    ciphertext: fromBase64(blob.ciphertext),
  };
}

function emptyPayload(): VaultPayload {
  return { entries: [] };
}

function now(): number {
  return Date.now();
}

function isCoolingDown(until: number | undefined): boolean {
  return until !== undefined && until > now();
}

export type UnlockResult =
  | { ok: true; dek: CryptoKey; vault: PersistedVault; payload: VaultPayload }
  | {
      ok: false;
      reason: "wrong-secret" | "cooldown" | "missing-vault";
      remainingAttempts?: number;
      cooldownUntil?: number;
      vault?: PersistedVault;
    };

export async function vaultExists(): Promise<boolean> {
  const vault = await readPersistedVault();
  return vault !== undefined;
}

export async function createVault(input: {
  masterPassword: string;
  confirmMasterPassword: string;
  recoveryQuestion: string;
  recoveryAnswer: string;
  confirmRecoveryAnswer: string;
}): Promise<{ dek: CryptoKey; vault: PersistedVault }> {
  masterPasswordSchema.parse(input.masterPassword);
  if (input.masterPassword !== input.confirmMasterPassword) {
    throw new Error("两次输入的主密码不一致。");
  }

  const question = input.recoveryQuestion.trim();
  if (question.length === 0) {
    throw new Error("请填写安全提示问题。");
  }

  recoveryAnswerSchema.parse(input.recoveryAnswer);
  if (input.recoveryAnswer !== input.confirmRecoveryAnswer) {
    throw new Error("两次输入的答案不一致。");
  }

  const normalizedQuestion = question.toLowerCase();
  const normalizedAnswer = input.recoveryAnswer.trim().toLowerCase();
  if (
    normalizedAnswer.length > 0 &&
    (normalizedQuestion.includes(normalizedAnswer) || normalizedAnswer.includes(normalizedQuestion))
  ) {
    throw new Error("答案请勿与提示问题过于相似。");
  }

  const dek = await generateDek();
  const masterSalt = createSalt();
  const recoverySalt = createSalt();
  const masterKek = await deriveAesKey(input.masterPassword, masterSalt);
  const recoveryKek = await deriveAesKey(input.recoveryAnswer, recoverySalt);

  const wrappedByMaster = blobToStored(await wrapDek(masterKek, dek));
  const wrappedByRecovery = blobToStored(await wrapDek(recoveryKek, dek));
  const payloadBytes = encodeUtf8(JSON.stringify(emptyPayload()));
  const encryptedPayload = blobToStored(await encryptAesGcm(dek, payloadBytes));

  const vault: PersistedVault = {
    version: 1,
    masterSalt: toBase64(masterSalt),
    recoverySalt: toBase64(recoverySalt),
    recoveryQuestion: question,
    wrappedDekByMaster: wrappedByMaster,
    wrappedDekByRecovery: wrappedByRecovery,
    payload: encryptedPayload,
    masterFailCount: 0,
    masterCooldownUntil: undefined,
    recoveryFailCount: 0,
    recoveryCooldownUntil: undefined,
    settings: {
      idleLockMs: DEFAULT_IDLE_LOCK_MS,
      clipboardClearMs: DEFAULT_CLIPBOARD_CLEAR_MS,
    },
  };

  await writePersistedVault(vault);
  return { dek, vault };
}

export async function loadVaultPayload(
  dek: CryptoKey,
  vault: PersistedVault,
): Promise<VaultPayload> {
  const blob = storedToBlob(vault.payload);
  const bytes = await decryptAesGcm(dek, blob.iv, blob.ciphertext);
  return JSON.parse(decodeUtf8(bytes)) as VaultPayload;
}

async function recordMasterFailure(vault: PersistedVault): Promise<PersistedVault> {
  const masterFailCount = vault.masterFailCount + 1;
  const next: PersistedVault = {
    ...vault,
    masterFailCount,
    masterCooldownUntil:
      masterFailCount >= MAX_FAILED_ATTEMPTS ? now() + COOLDOWN_MS : vault.masterCooldownUntil,
  };
  await writePersistedVault(next);
  return next;
}

async function recordRecoveryFailure(vault: PersistedVault): Promise<PersistedVault> {
  const recoveryFailCount = vault.recoveryFailCount + 1;
  const next: PersistedVault = {
    ...vault,
    recoveryFailCount,
    recoveryCooldownUntil:
      recoveryFailCount >= MAX_FAILED_ATTEMPTS ? now() + COOLDOWN_MS : vault.recoveryCooldownUntil,
  };
  await writePersistedVault(next);
  return next;
}

export async function unlockWithMasterPassword(masterPassword: string): Promise<UnlockResult> {
  const vault = await readPersistedVault();
  if (!vault) {
    return { ok: false, reason: "missing-vault" };
  }

  if (isCoolingDown(vault.masterCooldownUntil)) {
    return {
      ok: false,
      reason: "cooldown",
      cooldownUntil: vault.masterCooldownUntil,
      vault,
    };
  }

  try {
    const kek = await deriveAesKey(masterPassword, fromBase64(vault.masterSalt));
    const wrapped = storedToBlob(vault.wrappedDekByMaster);
    const dek = await unwrapDek(kek, wrapped.iv, wrapped.ciphertext);
    const payload = await loadVaultPayload(dek, vault);
    const cleared: PersistedVault = {
      ...vault,
      masterFailCount: 0,
      masterCooldownUntil: undefined,
    };
    await writePersistedVault(cleared);
    return { ok: true, dek, vault: cleared, payload };
  } catch {
    const failed = await recordMasterFailure(vault);
    if (isCoolingDown(failed.masterCooldownUntil)) {
      return {
        ok: false,
        reason: "cooldown",
        cooldownUntil: failed.masterCooldownUntil,
        vault: failed,
      };
    }
    return {
      ok: false,
      reason: "wrong-secret",
      remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - failed.masterFailCount),
      vault: failed,
    };
  }
}

export async function unlockWithRecoveryAnswer(answer: string): Promise<UnlockResult> {
  const vault = await readPersistedVault();
  if (!vault) {
    return { ok: false, reason: "missing-vault" };
  }

  if (isCoolingDown(vault.recoveryCooldownUntil)) {
    return {
      ok: false,
      reason: "cooldown",
      cooldownUntil: vault.recoveryCooldownUntil,
      vault,
    };
  }

  try {
    const kek = await deriveAesKey(answer, fromBase64(vault.recoverySalt));
    const wrapped = storedToBlob(vault.wrappedDekByRecovery);
    const dek = await unwrapDek(kek, wrapped.iv, wrapped.ciphertext);
    const payload = await loadVaultPayload(dek, vault);
    const cleared: PersistedVault = {
      ...vault,
      recoveryFailCount: 0,
      recoveryCooldownUntil: undefined,
      masterFailCount: 0,
      masterCooldownUntil: undefined,
    };
    await writePersistedVault(cleared);
    return { ok: true, dek, vault: cleared, payload };
  } catch {
    const failed = await recordRecoveryFailure(vault);
    if (isCoolingDown(failed.recoveryCooldownUntil)) {
      return {
        ok: false,
        reason: "cooldown",
        cooldownUntil: failed.recoveryCooldownUntil,
        vault: failed,
      };
    }
    return {
      ok: false,
      reason: "wrong-secret",
      remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - failed.recoveryFailCount),
      vault: failed,
    };
  }
}

export async function resetMasterPassword(input: {
  dek: CryptoKey;
  vault: PersistedVault;
  masterPassword: string;
  confirmMasterPassword: string;
}): Promise<PersistedVault> {
  masterPasswordSchema.parse(input.masterPassword);
  if (input.masterPassword !== input.confirmMasterPassword) {
    throw new Error("两次输入的主密码不一致。");
  }

  const masterSalt = createSalt();
  const masterKek = await deriveAesKey(input.masterPassword, masterSalt);
  const wrappedByMaster = blobToStored(await wrapDek(masterKek, input.dek));

  const next: PersistedVault = {
    ...input.vault,
    masterSalt: toBase64(masterSalt),
    wrappedDekByMaster: wrappedByMaster,
    masterFailCount: 0,
    masterCooldownUntil: undefined,
  };
  await writePersistedVault(next);
  return next;
}

export async function readRecoveryQuestion(): Promise<string | undefined> {
  const vault = await readPersistedVault();
  return vault?.recoveryQuestion;
}

export async function saveVaultPayload(
  dek: CryptoKey,
  vault: PersistedVault,
  payload: VaultPayload,
): Promise<PersistedVault> {
  const encrypted = await encryptAesGcm(dek, encodeUtf8(JSON.stringify(payload)));
  const next: PersistedVault = {
    ...vault,
    payload: blobToStored(encrypted),
  };
  await writePersistedVault(next);
  return next;
}
