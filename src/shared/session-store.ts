import { create } from "zustand";

import {
  clearUnlockedSession,
  exportDekRaw,
  importDekRaw,
  readUnlockedSession,
  writeUnlockedSession,
} from "./session-persistence";
import { readPersistedVault } from "./vault-storage";
import { loadVaultPayload, vaultExists } from "./vault";

import type { PersistedVault, VaultPayload } from "./vault-types";

export type AppScreen = "welcome" | "master" | "question" | "unlock" | "recover" | "reset" | "home";

type SessionStore = {
  hydrated: boolean;
  hasVault: boolean;
  unlocked: boolean;
  screen: AppScreen;
  vault: PersistedVault | undefined;
  payload: VaultPayload | undefined;
  /** In-memory data-encryption key; never written to disk storage.local. */
  dek: CryptoKey | undefined;
  hydrate: () => Promise<void>;
  setScreen: (screen: AppScreen) => void;
  setUnlockedSession: (input: {
    dek: CryptoKey;
    vault: PersistedVault;
    payload: VaultPayload;
    screen: AppScreen;
  }) => Promise<void>;
  lock: () => Promise<void>;
  touchActivity: () => Promise<void>;
};

export const useSessionStore = create<SessionStore>((set, get) => ({
  hydrated: false,
  hasVault: false,
  unlocked: false,
  screen: "welcome",
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
        screen: "welcome",
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
            screen: "home",
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
      screen: "unlock",
    });
  },

  setScreen: (screen) => set({ screen }),

  setUnlockedSession: async ({ dek, vault, payload, screen }) => {
    const dekRaw = await exportDekRaw(dek);
    await writeUnlockedSession({ dekRaw, lastActivityAt: Date.now() });
    set({
      hasVault: true,
      unlocked: true,
      dek,
      vault,
      payload,
      screen,
    });
  },

  lock: async () => {
    await clearUnlockedSession();
    set((state) => ({
      unlocked: false,
      dek: undefined,
      payload: undefined,
      screen: state.hasVault ? "unlock" : "welcome",
    }));
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
}));
