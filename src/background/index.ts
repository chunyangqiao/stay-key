import { clearUnlockedSession, readUnlockedSession } from "@/shared/session/session-persistence";
import { readPersistedVault } from "@/shared/vault/vault-storage";

const IDLE_ALARM = "stay-key.idle-lock";

chrome.runtime.onInstalled.addListener(() => {
  void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  void ensureIdleAlarm();
});

void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
void ensureIdleAlarm();

async function ensureIdleAlarm(): Promise<void> {
  await chrome.alarms.create(IDLE_ALARM, { periodInMinutes: 0.5 });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== IDLE_ALARM) {
    return;
  }
  void checkIdleLock();
});

/** OS screen lock clears the in-memory unlock session (PRD v0.7). */
chrome.idle.onStateChanged.addListener((newState) => {
  if (newState === "locked") {
    void clearUnlockedSession();
  }
});

async function checkIdleLock(): Promise<void> {
  const session = await readUnlockedSession();
  if (!session) {
    return;
  }
  const vault = await readPersistedVault();
  const idleLockMs = vault?.settings.idleLockMs ?? 2 * 60 * 1000;
  if (Date.now() - session.lastActivityAt >= idleLockMs) {
    await clearUnlockedSession();
  }
}
