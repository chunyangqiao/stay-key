import { afterEach, describe, expect, it } from "vitest";

import {
  sessionIsCurrent,
  sessionStamp,
  useSessionStore,
} from "../src/shared/session/session-store";

describe("lock", () => {
  afterEach(() => {
    useSessionStore.setState({
      hydrated: false,
      hasVault: false,
      unlocked: false,
      sessionEpoch: 0,
      vault: undefined,
      payload: undefined,
      dek: undefined,
    });
    Reflect.deleteProperty(globalThis, "chrome");
  });

  it("stops treating the session as current as soon as lock starts", async () => {
    let finishClear = () => {};
    const clearStarted = new Promise<void>((resolve) => {
      finishClear = resolve;
    });
    Reflect.set(globalThis, "chrome", {
      storage: {
        session: {
          remove: () => clearStarted,
        },
      },
    });

    useSessionStore.setState({
      unlocked: true,
      sessionEpoch: 2,
      dek: {} as CryptoKey,
      payload: { entries: [] },
    });

    const locking = useSessionStore.getState().lock();
    const stamp = sessionStamp();

    expect(useSessionStore.getState().unlocked).toBe(false);
    expect(useSessionStore.getState().dek).toBeUndefined();
    expect(sessionIsCurrent(stamp)).toBe(false);

    finishClear();
    await locking;
  });
});
