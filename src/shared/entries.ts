import Fuse from "fuse.js";

import type { VaultEntry } from "./vault-types";

export function createEntryId(): string {
  return crypto.randomUUID();
}

export function sortEntries(entries: VaultEntry[]): VaultEntry[] {
  return [...entries].sort((a, b) => {
    const host = a.host.localeCompare(b.host, "zh-CN");
    if (host !== 0) {
      return host;
    }
    return a.username.localeCompare(b.username, "zh-CN");
  });
}

export function searchEntries(entries: VaultEntry[], query: string): VaultEntry[] {
  const trimmed = query.trim();
  const sorted = sortEntries(entries);
  if (!trimmed) {
    return sorted;
  }
  const fuse = new Fuse(sorted, {
    keys: ["host", "username", "tags"],
    threshold: 0.35,
    ignoreLocation: true,
  });
  return fuse.search(trimmed).map((result) => result.item);
}

export function parseTags(raw: string): string[] {
  return raw
    .split(/[,，\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}
