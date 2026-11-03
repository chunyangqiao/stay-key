import { afterEach, describe, expect, it } from "vitest";

import { generateDek } from "../src/shared/crypto/crypto";
import { saveVaultPayload } from "../src/shared/vault/vault";
import { readPersistedVault, writePersistedVault } from "../src/shared/vault/vault-storage";

import type { PersistedVault } from "../src/shared/vault/vault-types";

function savedVault(): PersistedVault {
  return {
    version: 1,
    masterSalt: "bWFzdGVyLXNhbHQ=",
    recoverySalt: "cmVjb3Zlcnktc2FsdA==",
    recoveryQuestion: "第一只宠物的名字",
    wrappedDekByMaster: { iv: "bWFzdGVyLWl2", ciphertext: "bWFzdGVyLXdyYXA=" },
    wrappedDekByRecovery: { iv: "cmVjb3ZlcnktaXY=", ciphertext: "cmVjb3Zlcnktd3JhcA==" },
    payload: { iv: "cHJldmlvdXMtaXY=", ciphertext: "cHJldmlvdXMtcGF5bG9hZA==" },
    masterFailCount: 0,
    masterCooldownUntil: undefined,
    recoveryFailCount: 0,
    recoveryCooldownUntil: undefined,
    settings: { idleLockMs: 120_000, clipboardClearMs: 30_000 },
  };
}

function installVaultStorage(): {
  armLockOnWrite: () => void;
  isVaultLocked: () => boolean;
} {
  const records = new Map<string, unknown>();
  let lockOnWrite = false;
  let vaultLocked = false;

  const local = {
    async get(key: string): Promise<Record<string, unknown>> {
      return { [key]: records.get(key) };
    },
    async set(items: Record<string, unknown>): Promise<void> {
      for (const [key, value] of Object.entries(items)) {
        records.set(key, value);
      }
      if (lockOnWrite) {
        vaultLocked = true;
      }
    },
    async remove(key: string): Promise<void> {
      records.delete(key);
    },
  };

  Reflect.set(globalThis, "chrome", { storage: { local } });

  return {
    armLockOnWrite() {
      lockOnWrite = true;
    },
    isVaultLocked() {
      return vaultLocked;
    },
  };
}

describe("saveVaultPayload", () => {
  afterEach(() => {
    Reflect.deleteProperty(globalThis, "chrome");
  });

  it("leaves the saved vault unchanged when the vault locks after the new payload is written", async () => {
    const storage = installVaultStorage();
    const previous = savedVault();
    await writePersistedVault(previous);
    storage.armLockOnWrite();

    const saved = await saveVaultPayload(
      await generateDek(),
      previous,
      {
        entries: [
          {
            id: "entry-1",
            host: "github.com",
            username: "ada",
            password: "correct horse",
            tags: ["work"],
            updatedAt: "2026-11-02T00:00:00.000Z",
          },
        ],
      },
      () => !storage.isVaultLocked(),
    );

    expect(saved).toBeUndefined();
    expect(await readPersistedVault()).toEqual(previous);
  });
});
