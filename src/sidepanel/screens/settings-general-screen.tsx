import { useTheme } from "next-themes";

import { THEME_OPTIONS, type ThemePreference } from "@/shared/settings-options";
import { useSessionStore } from "@/shared/session-store";

import { SettingsHeader, SettingsOptionList, SettingsSectionLabel } from "./settings-shell";

export function SettingsGeneralScreen() {
  const setScreen = useSessionStore((state) => state.setScreen);
  const { theme, setTheme } = useTheme();
  const current = (theme ?? "system") as ThemePreference;

  return (
    <div className="flex flex-col gap-4">
      <SettingsHeader title="通用" backTo="settings" onBack={setScreen} />
      <div className="flex flex-col gap-1.5">
        <SettingsSectionLabel>外观</SettingsSectionLabel>
        <SettingsOptionList
          name="外观"
          options={THEME_OPTIONS}
          value={THEME_OPTIONS.some((o) => o.value === current) ? current : "system"}
          onChange={(next) => setTheme(next)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <SettingsSectionLabel>语言</SettingsSectionLabel>
        <div className="rounded-xl border border-border bg-card px-3 py-2.5">
          <p className="text-sm font-medium text-foreground">简体中文</p>
          <p className="text-xs text-muted-foreground">暂不可切换</p>
        </div>
      </div>
    </div>
  );
}
