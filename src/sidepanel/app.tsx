import * as React from "react";

import { useSessionStore } from "@/shared/session-store";

import { HomeScreen } from "./screens/home-screen";
import { MasterPasswordScreen } from "./screens/master-password-screen";
import { RecoveryQuestionScreen } from "./screens/recovery-question-screen";
import { UnlockScreen } from "./screens/unlock-screen";
import { WelcomeScreen } from "./screens/welcome-screen";

export function SidePanel() {
  const hydrate = useSessionStore((state) => state.hydrate);
  const hydrated = useSessionStore((state) => state.hydrated);
  const screen = useSessionStore((state) => state.screen);

  React.useEffect(() => {
    void hydrate();
  }, [hydrate]);

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
      {screen === "home" ? <HomeScreen /> : null}
      {screen === "recover" || screen === "reset" ? (
        <p className="text-sm text-muted-foreground">找回 / 重设流程下一步接入。</p>
      ) : null}
    </main>
  );
}
