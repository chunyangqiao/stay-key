import { toast } from "sonner";

import { DEFAULT_CLIPBOARD_CLEAR_MS } from "@/shared/constants";
import { CLIPBOARD_CLEAR_OPTIONS_MS } from "@/shared/settings/settings-options";
import { useSessionStore } from "@/shared/session/session-store";
import { updateVaultSettings } from "@/shared/vault/vault";

import { AppHeader } from "../components/app-header";
import { Screen, ScreenBody } from "../components/screen";
import { SettingsOptionList } from "./settings-shell";

export function SettingsClipboardScreen() {
  const setScreen = useSessionStore((state) => state.setScreen);
  const vault = useSessionStore((state) => state.vault);
  const applyVault = useSessionStore((state) => state.applyVault);

  const clipboardClearMs = vault?.settings.clipboardClearMs ?? DEFAULT_CLIPBOARD_CLEAR_MS;

  const options = CLIPBOARD_CLEAR_OPTIONS_MS.map((option) => ({
    value: option.value,
    label: `${Math.round(option.value / 1000)}秒`,
  }));

  const patch = async (nextMs: number) => {
    try {
      const next = await updateVaultSettings({ clipboardClearMs: nextMs });
      if (!next) {
        toast.message("保存失败");
        return;
      }
      applyVault(next);
    } catch {
      toast.message("保存失败");
    }
  };

  return (
    <Screen>
      <AppHeader title="清除剪贴板" onBack={() => setScreen("settings")} />
      <ScreenBody className="px-4 py-5">
        <p className="mb-3 text-sm text-muted-foreground">复制后自动清除的等待时间</p>
        <SettingsOptionList
          name="清除剪贴板"
          options={options}
          value={clipboardClearMs}
          onChange={(next) => void patch(next)}
        />
      </ScreenBody>
    </Screen>
  );
}
