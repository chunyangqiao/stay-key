import { useTheme } from "next-themes";

import { THEME_OPTIONS, type ThemePreference } from "@/shared/settings-options";
import { useSessionStore } from "@/shared/session-store";

import { AppHeader } from "../components/app-header";
import { Screen, ScreenBody, SectionLabel } from "../components/screen";
import { SettingsOptionList } from "./settings-shell";

export function SettingsGeneralScreen() {
  const setScreen = useSessionStore((state) => state.setScreen);
  const { theme, setTheme } = useTheme();
  const current = (theme ?? "system") as ThemePreference;

  return (
    <Screen>
      <AppHeader title="通用" onBack={() => setScreen("settings")} />
      <ScreenBody className="px-4 py-5">
        <SectionLabel>外观</SectionLabel>
        <SettingsOptionList
          className="mt-2"
          name="外观"
          options={THEME_OPTIONS}
          value={THEME_OPTIONS.some((o) => o.value === current) ? current : "system"}
          onChange={(next) => setTheme(next)}
        />
        <SectionLabel className="mt-6">语言</SectionLabel>
        <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5">
          <span className="text-meta font-medium text-foreground">简体中文</span>
          <span className="text-micro text-muted-foreground">暂不可切换</span>
        </div>
      </ScreenBody>
    </Screen>
  );
}
