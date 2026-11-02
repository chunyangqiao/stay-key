import { create } from "zustand";

import {
  clearUnlockedSession,
  exportDekRaw,
  importDekRaw,
  readUnlockedSession,
  writeUnlockedSession,
} from "./session-persistence";
import { readPersistedVault } from "../vault/vault-storage";
import { loadVaultPayload, vaultExists } from "../vault/vault";

import type { PersistedVault, VaultPayload } from "../vault/vault-types";

type SessionStore = {
  hydrated: boolean;
  hasVault: boolean;
  unlocked: boolean;
  /** Bumps at the start of lock so an in-flight import or export can abort. */
  sessionEpoch: number;
  vault: PersistedVault | undefined;
  payload: VaultPayload | undefined;
  /** In-memory data-encryption key; never written to disk storage.local. */
  dek: CryptoKey | undefined;
  hydrate: () => Promise<void>;
  setUnlockedSession: (input: {
    dek: CryptoKey;
    vault: PersistedVault;
    payload: VaultPayload;
  }) => Promise<void>;
  lock: () => Promise<void>;
  touchActivity: () => Promise<void>;
  applyPayload: (payload: VaultPayload, vault: PersistedVault) => void;
  applyVault: (vault: PersistedVault) => void;
};

export const useSessionStore = create<SessionStore>((set, get) => ({
  hydrated: false,
  hasVault: false,
  unlocked: false,
  sessionEpoch: 0,
  vault: undefined,
  payload: undefined,
  dek: undefined,

  hydrate: async () => {
    const exists = await vaultExists();
    const vault = exists ? await readPersistedVault() : undefined;

    if (!exists || !vault) {
      await clearUnlockedSession();
      set({
        hydrated: true,
        hasVault: false,
        unlocked: false,
        vault: undefined,
        payload: undefined,
        dek: undefined,
      });
      return;
    }

    const session = await readUnlockedSession();
    if (session) {
      const idleLockMs = vault.settings.idleLockMs;
      const idleExpired = Date.now() - session.lastActivityAt >= idleLockMs;
      if (!idleExpired) {
        try {
          const dek = await importDekRaw(session.dekRaw);
          const payload = await loadVaultPayload(dek, vault);
          set({
            hydrated: true,
            hasVault: true,
            unlocked: true,
            vault,
            payload,
            dek,
          });
          return;
        } catch {
          await clearUnlockedSession();
        }
      } else {
        await clearUnlockedSession();
      }
    }

    set({
      hydrated: true,
      hasVault: true,
      unlocked: false,
      vault,
      payload: undefined,
      dek: undefined,
    });
  },

  setUnlockedSession: async ({ dek, vault, payload }) => {
    const dekRaw = await exportDekRaw(dek);
    await writeUnlockedSession({ dekRaw, lastActivityAt: Date.now() });
    set({
      hasVault: true,
      unlocked: true,
      dek,
      vault,
      payload,
    });
  },

  lock: async () => {
    set((state) => ({
      sessionEpoch: state.sessionEpoch + 1,
      unlocked: false,
      dek: undefined,
      payload: undefined,
    }));
    await clearUnlockedSession();
  },

  touchActivity: async () => {
    const { unlocked } = get();
    if (!unlocked) {
      return;
    }
    const existing = await readUnlockedSession();
    if (!existing) {
      return;
    }
    await writeUnlockedSession({ ...existing, lastActivityAt: Date.now() });
  },

  applyPayload: (payload, vault) => {
    set({ payload, vault });
  },

  applyVault: (vault) => {
    set({ vault });
  },
}));

export function sessionStamp(): number {
  return useSessionStore.getState().sessionEpoch;
}

export function sessionIsCurrent(stamp: number): boolean {
  const state = useSessionStore.getState();
  return state.unlocked && state.sessionEpoch === stamp;
}
