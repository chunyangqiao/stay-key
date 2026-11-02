import * as React from "react";
import { toast } from "sonner";

import { useSessionStore } from "@/shared/session/session-store";

const ACTIVITY_EVENTS = ["pointerdown", "keydown", "scroll", "input"] as const;

/**
 * While unlocked, bump session activity on user input and auto-lock after idleLockMs.
 * Activity is stored in chrome.storage.session so the timer continues when the panel is collapsed.
 * Also locks immediately when the OS reports screen lock (chrome.idle "locked").
 */
export function useIdleLock() {
  const unlocked = useSessionStore((state) => state.unlocked);
  const vault = useSessionStore((state) => state.vault);
  const lock = useSessionStore((state) => state.lock);
  const touchActivity = useSessionStore((state) => state.touchActivity);
  const idleLockMs = vault?.settings.idleLockMs;

  React.useEffect(() => {
    if (!unlocked || idleLockMs === undefined) {
      return;
    }

    void touchActivity();

    const onActivity = () => {
      void touchActivity();
    };

    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, onActivity, { passive: true });
    }

    const onIdleStateChanged = (newState: "active" | "idle" | "locked") => {
      if (newState === "locked") {
        toast.message("系统已锁屏，保险库已锁定");
        void lock();
      }
    };
    chrome.idle.onStateChanged.addListener(onIdleStateChanged);

    const intervalId = window.setInterval(() => {
      void (async () => {
        const { readUnlockedSession } = await import("@/shared/session/session-persistence");
        const session = await readUnlockedSession();
        if (!session) {
          toast.message("已自动锁定");
          await lock();
          return;
        }
        if (Date.now() - session.lastActivityAt >= idleLockMs) {
          toast.message("已自动锁定");
          await lock();
        }
      })();
    }, 5_000);

    return () => {
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, onActivity);
      }
      chrome.idle.onStateChanged.removeListener(onIdleStateChanged);
      window.clearInterval(intervalId);
    };
  }, [unlocked, idleLockMs, lock, touchActivity]);
}
