/** Best-effort current tab hostname for Side Panel create flow. */
export async function readActiveTabHost(): Promise<string | undefined> {
  try {
    const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const url = tabs[0]?.url;
    if (!url) {
      return undefined;
    }
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return undefined;
    }
    return parsed.hostname.replace(/^www\./i, "");
  } catch {
    return undefined;
  }
}
