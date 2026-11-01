import * as React from "react";

import { useSessionStore } from "@/shared/session-store";

import { HomeScreen } from "./screens/home-screen";
import { MasterPasswordScreen } from "./screens/master-password-screen";
import { RecoverScreen } from "./screens/recover-screen";
import { RecoveryQuestionScreen } from "./screens/recovery-question-screen";
import { ResetMasterPasswordScreen } from "./screens/reset-master-password-screen";
import { UnlockScreen } from "./screens/unlock-screen";
import { WelcomeScreen } from "./screens/welcome-screen";
import { useIdleLock } from "./use-idle-lock";

export function SidePanel() {
  const hydrate = useSessionStore((state) => state.hydrate);
  const hydrated = useSessionStore((state) => state.hydrated);
  const screen = useSessionStore((state) => state.screen);

  React.useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useIdleLock();

  if (!hydrated) {
    return (
      <main className="p-4">
        <p className="text-sm text-muted-foreground">加载中…</p>
      </main>
    );
  }

  return (
    <main className="p-4">
      {screen === "welcome" ? <WelcomeScreen /> : null}
      {screen === "master" ? <MasterPasswordScreen /> : null}
      {screen === "question" ? <RecoveryQuestionScreen /> : null}
      {screen === "unlock" ? <UnlockScreen /> : null}
      {screen === "recover" ? <RecoverScreen /> : null}
      {screen === "reset" ? <ResetMasterPasswordScreen /> : null}
      {screen === "home" ? <HomeScreen /> : null}
    </main>
  );
}
