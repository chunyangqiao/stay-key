let clearTimer: ReturnType<typeof setTimeout> | undefined;
let pendingClearValue: string | undefined;

/**
 * Copy text to the clipboard and clear it after `clearAfterMs` if it still matches.
 */
export async function copySecret(value: string, clearAfterMs: number): Promise<void> {
  await navigator.clipboard.writeText(value);
  if (clearTimer !== undefined) {
    clearTimeout(clearTimer);
  }
  pendingClearValue = value;
  clearTimer = setTimeout(() => {
    void (async () => {
      try {
        const current = await navigator.clipboard.readText();
        if (current === pendingClearValue) {
          await navigator.clipboard.writeText("");
        }
      } catch {
        // Clipboard read may be blocked; best-effort clear.
        try {
          await navigator.clipboard.writeText("");
        } catch {
          // ignore
        }
      } finally {
        clearTimer = undefined;
        pendingClearValue = undefined;
      }
    })();
  }, clearAfterMs);
}
