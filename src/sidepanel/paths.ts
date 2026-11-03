export const panelPaths = {
  welcome: "/welcome",
  setupPin: "/setup/pin",
  setupRecovery: "/setup/recovery",
  unlock: "/unlock",
  recover: "/unlock/recover",
  reset: "/unlock/reset",
  home: "/",
  settings: "/settings",
  settingsSecurity: "/settings/security",
  settingsClipboard: "/settings/clipboard",
  settingsAbout: "/settings/about",
  settingsRecovery: "/settings/recovery",
} as const;

export type SessionRegion = "setup" | "locked" | "app";

let stagedAppPath: string | undefined;

export function sessionRegion(hasVault: boolean, unlocked: boolean): SessionRegion {
  if (!hasVault) {
    return "setup";
  }
  if (!unlocked) {
    return "locked";
  }
  return "app";
}

export function regionHomePath(region: SessionRegion): string {
  if (region === "setup") {
    return panelPaths.welcome;
  }
  if (region === "locked") {
    return panelPaths.unlock;
  }
  return stagedAppPath ?? panelPaths.home;
}

export function entryPathForRegion(region: SessionRegion): string {
  if (region !== "app") {
    stagedAppPath = undefined;
  }
  return regionHomePath(region);
}

export function stageAppPath(path: string): void {
  stagedAppPath = path;
}

export function clearStagedAppPath(): void {
  stagedAppPath = undefined;
}
