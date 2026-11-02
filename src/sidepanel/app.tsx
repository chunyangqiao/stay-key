import * as React from "react";

import { useSessionStore } from "@/shared/session-store";

import { HomeScreen } from "./screens/home-screen";
import { MasterPasswordScreen } from "./screens/master-password-screen";
import { RecoverScreen } from "./screens/recover-screen";
import { RecoveryQuestionScreen } from "./screens/recovery-question-screen";
import { ResetMasterPasswordScreen } from "./screens/reset-master-password-screen";
import { SettingsAboutScreen } from "./screens/settings-about-screen";
import { SettingsRecoveryScreen } from "./screens/settings-recovery-screen";
import { SettingsClipboardScreen } from "./screens/settings-clipboard-screen";
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
      <main className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
        <div className="mx-auto flex h-full w-full max-w-app flex-col overflow-hidden">
          <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
            <span className="size-4 animate-pulse rounded-full bg-secondary motion-reduce:animate-none" />
            <span className="h-3 w-20 animate-pulse rounded-sm bg-secondary motion-reduce:animate-none" />
          </div>
          <div className="flex flex-col gap-5 px-4 pt-5" role="status">
            <span className="sr-only">加载中…</span>
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="flex flex-col gap-2">
                <span className="h-3 w-2/5 animate-pulse rounded-sm bg-secondary motion-reduce:animate-none" />
                <span className="h-2.5 w-3/5 animate-pulse rounded-sm bg-secondary motion-reduce:animate-none" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <div className="mx-auto flex h-full w-full max-w-app flex-col overflow-hidden">
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
        {screen === "settings-clipboard" ? <SettingsClipboardScreen /> : null}
        {screen === "settings-about" ? <SettingsAboutScreen /> : null}
        {screen === "settings-recovery" ? <SettingsRecoveryScreen /> : null}
      </div>
    </main>
  );
}
