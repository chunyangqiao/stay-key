import { create } from "zustand";

import { readPersistedVault } from "./vault-storage";
import { vaultExists } from "./vault";

import type { PersistedVault, VaultPayload } from "./vault-types";

export type AppScreen = "welcome" | "master" | "question" | "unlock" | "recover" | "reset" | "home";

type SessionStore = {
  hydrated: boolean;
  hasVault: boolean;
  unlocked: boolean;
  screen: AppScreen;
  vault: PersistedVault | undefined;
  payload: VaultPayload | undefined;
  /** In-memory data-encryption key; never persisted. */
  dek: CryptoKey | undefined;
  hydrate: () => Promise<void>;
  setScreen: (screen: AppScreen) => void;
  setUnlockedSession: (input: {
    dek: CryptoKey;
    vault: PersistedVault;
    payload: VaultPayload;
    screen: AppScreen;
  }) => void;
  lock: () => void;
};

export const useSessionStore = create<SessionStore>((set) => ({
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
    set({
      hydrated: true,
      hasVault: exists,
      unlocked: false,
      vault,
      payload: undefined,
      dek: undefined,
      screen: exists ? "unlock" : "welcome",
    });
  },

  setScreen: (screen) => set({ screen }),

  setUnlockedSession: ({ dek, vault, payload, screen }) =>
    set({
      hasVault: true,
      unlocked: true,
      dek,
      vault,
      payload,
      screen,
    }),

  lock: () =>
    set((state) => ({
      unlocked: false,
      dek: undefined,
      payload: undefined,
      screen: state.hasVault ? "unlock" : "welcome",
    })),
}));
