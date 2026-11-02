export function hostsMatch(entryHost: string, activeHost: string): boolean {
  const a = entryHost.trim().toLowerCase();
  const b = activeHost.trim().toLowerCase();
  if (!a || !b) {
    return false;
  }
  return a === b || a.endsWith(`.${b}`) || b.endsWith(`.${a}`);
}

export function filterEntriesForHost<T extends { host: string }>(
  entries: T[],
  activeHost: string,
): T[] {
  return entries.filter((entry) => hostsMatch(entry.host, activeHost));
}
