import { toast } from "sonner";

import { DEFAULT_CLIPBOARD_CLEAR_MS, DEFAULT_IDLE_LOCK_MS } from "@/shared/constants";
import { CLIPBOARD_CLEAR_OPTIONS_MS, IDLE_LOCK_OPTIONS_MS } from "@/shared/settings-options";
import { useSessionStore } from "@/shared/session-store";
import { updateVaultSettings } from "@/shared/vault";

import { AppHeader } from "../components/app-header";
import { Screen, ScreenBody, SectionLabel } from "../components/screen";
import { SettingsOptionList, SettingsSegmented } from "./settings-shell";

const CLIPBOARD_SEGMENTED = CLIPBOARD_CLEAR_OPTIONS_MS.map((option) => ({
  value: option.value,
  label: `${Math.round(option.value / 1000)} 秒`,
}));

export function SettingsSecurityScreen() {
  const setScreen = useSessionStore((state) => state.setScreen);
  const vault = useSessionStore((state) => state.vault);
  const applyVault = useSessionStore((state) => state.applyVault);
  const touchActivity = useSessionStore((state) => state.touchActivity);

  const idleLockMs = vault?.settings.idleLockMs ?? DEFAULT_IDLE_LOCK_MS;
  const clipboardClearMs = vault?.settings.clipboardClearMs ?? DEFAULT_CLIPBOARD_CLEAR_MS;

  const patch = async (partial: { idleLockMs?: number; clipboardClearMs?: number }) => {
    try {
      const next = await updateVaultSettings(partial);
      if (!next) {
        toast.message("保存失败");
        return;
      }
      applyVault(next);
      if (partial.idleLockMs !== undefined) {
        await touchActivity();
      }
    } catch {
      toast.message("保存失败");
    }
  };

  return (
    <Screen>
      <AppHeader title="安全" onBack={() => setScreen("settings")} />
      <ScreenBody className="px-4 py-5">
        <SectionLabel>空闲自动锁定</SectionLabel>
        <p className="mt-1 text-meta text-muted-foreground">
          离开一段时间后自动锁定保险库。收起面板时计时继续。
        </p>
        <SettingsOptionList
          className="mt-3"
          name="空闲自动锁定"
          options={IDLE_LOCK_OPTIONS_MS}
          value={idleLockMs}
          onChange={(next) => void patch({ idleLockMs: next })}
        />
        <SectionLabel className="mt-6">剪贴板自动清除</SectionLabel>
        <p className="mt-1 text-meta text-muted-foreground">
          复制账号或密码后，短时清空剪贴板中的敏感内容。
        </p>
        <SettingsSegmented
          className="mt-3"
          name="剪贴板自动清除"
          options={CLIPBOARD_SEGMENTED}
          value={clipboardClearMs}
          onChange={(next) => void patch({ clipboardClearMs: next })}
        />
      </ScreenBody>
    </Screen>
  );
}
