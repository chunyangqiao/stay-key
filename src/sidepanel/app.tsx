import * as React from "react";

import { useSessionStore } from "@/shared/session-store";

import { HomeScreen } from "./screens/home-screen";
import { MasterPasswordScreen } from "./screens/master-password-screen";
import { RecoverScreen } from "./screens/recover-screen";
import { RecoveryQuestionScreen } from "./screens/recovery-question-screen";
import { ResetMasterPasswordScreen } from "./screens/reset-master-password-screen";
import { SettingsAboutScreen } from "./screens/settings-about-screen";
import { SettingsGeneralScreen } from "./screens/settings-general-screen";
import { SettingsHubScreen } from "./screens/settings-hub-screen";
import { SettingsSecurityScreen } from "./screens/settings-security-screen";
import { SettingsShortcutsScreen } from "./screens/settings-shortcuts-screen";
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
      <main className="flex min-h-dvh flex-col p-4">
        <p className="text-sm text-muted-foreground">加载中…</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col p-4">
      {screen === "welcome" ? <WelcomeScreen /> : null}
      {screen === "master" ? <MasterPasswordScreen /> : null}
      {screen === "question" ? <RecoveryQuestionScreen /> : null}
      {screen === "unlock" ? <UnlockScreen /> : null}
      {screen === "recover" ? <RecoverScreen /> : null}
      {screen === "reset" ? <ResetMasterPasswordScreen /> : null}
      {screen === "home" ? <HomeScreen /> : null}
      {screen === "settings" ? <SettingsHubScreen /> : null}
      {screen === "settings-general" ? <SettingsGeneralScreen /> : null}
      {screen === "settings-shortcuts" ? <SettingsShortcutsScreen /> : null}
      {screen === "settings-security" ? <SettingsSecurityScreen /> : null}
      {screen === "settings-about" ? <SettingsAboutScreen /> : null}
    </main>
  );
}
