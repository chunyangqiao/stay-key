export type ActiveTabInfo = { kind: "host"; host: string } | { kind: "none" };

/** Best-effort current tab hostname for Side Panel (main frame document URL). */
export async function readActiveTabInfo(): Promise<ActiveTabInfo> {
  try {
    const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const url = tabs[0]?.url;
    if (!url) {
      return { kind: "none" };
    }
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { kind: "none" };
    }
    const host = parsed.hostname.replace(/^www\./i, "");
    if (!host) {
      return { kind: "none" };
    }
    return { kind: "host", host };
  } catch {
    return { kind: "none" };
  }
}

export async function readActiveTabHost(): Promise<string | undefined> {
  const info = await readActiveTabInfo();
  return info.kind === "host" ? info.host : undefined;
}
