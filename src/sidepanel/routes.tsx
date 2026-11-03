import * as React from "react";

import { Navigate, Route, Routes } from "react-router";

import { useSessionStore } from "@/shared/session/session-store";
import { panelPaths, regionHomePath, sessionRegion, type SessionRegion } from "./paths";
import { HomeScreen } from "./screens/home-screen";
import { MasterPasswordScreen } from "./screens/master-password-screen";
import { RecoverScreen } from "./screens/recover-screen";
import { RecoveryQuestionScreen } from "./screens/recovery-question-screen";
import { ResetMasterPasswordScreen } from "./screens/reset-master-password-screen";
import { SettingsAboutScreen } from "./screens/settings-about-screen";
import { SettingsClipboardScreen } from "./screens/settings-clipboard-screen";
import { SettingsHubScreen } from "./screens/settings-hub-screen";
import { SettingsRecoveryScreen } from "./screens/settings-recovery-screen";
import { SettingsSecurityScreen } from "./screens/settings-security-screen";
import { UnlockScreen } from "./screens/unlock-screen";
import { WelcomeScreen } from "./screens/welcome-screen";

function RegionScreen({ region, children }: { region: SessionRegion; children: React.ReactNode }) {
  const hasVault = useSessionStore((state) => state.hasVault);
  const unlocked = useSessionStore((state) => state.unlocked);
  const actual = sessionRegion(hasVault, unlocked);
  if (actual !== region) {
    return <Navigate to={regionHomePath(actual)} replace />;
  }
  return children;
}

function RegionFallback() {
  const hasVault = useSessionStore((state) => state.hasVault);
  const unlocked = useSessionStore((state) => state.unlocked);
  return <Navigate to={regionHomePath(sessionRegion(hasVault, unlocked))} replace />;
}

function gated(region: SessionRegion, element: React.ReactElement) {
  return <RegionScreen region={region}>{element}</RegionScreen>;
}

export function PanelRoutes() {
  return (
    <Routes>
      <Route path={panelPaths.welcome} element={gated("setup", <WelcomeScreen />)} />
      <Route path={panelPaths.setupPin} element={gated("setup", <MasterPasswordScreen />)} />
      <Route path={panelPaths.setupRecovery} element={gated("setup", <RecoveryQuestionScreen />)} />
      <Route path={panelPaths.unlock} element={gated("locked", <UnlockScreen />)} />
      <Route path={panelPaths.recover} element={gated("locked", <RecoverScreen />)} />
      <Route path={panelPaths.reset} element={gated("app", <ResetMasterPasswordScreen />)} />
      <Route path={panelPaths.home} element={gated("app", <HomeScreen />)} />
      <Route path={panelPaths.settings} element={gated("app", <SettingsHubScreen />)} />
      <Route
        path={panelPaths.settingsSecurity}
        element={gated("app", <SettingsSecurityScreen />)}
      />
      <Route
        path={panelPaths.settingsClipboard}
        element={gated("app", <SettingsClipboardScreen />)}
      />
      <Route path={panelPaths.settingsAbout} element={gated("app", <SettingsAboutScreen />)} />
      <Route
        path={panelPaths.settingsRecovery}
        element={gated("app", <SettingsRecoveryScreen />)}
      />
      <Route path="*" element={<RegionFallback />} />
    </Routes>
  );
}
