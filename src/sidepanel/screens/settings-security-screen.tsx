import { toast } from "sonner";

import { DEFAULT_CLIPBOARD_CLEAR_MS, DEFAULT_IDLE_LOCK_MS } from "@/shared/constants";
import { CLIPBOARD_CLEAR_OPTIONS_MS, IDLE_LOCK_OPTIONS_MS } from "@/shared/settings-options";
import { useSessionStore } from "@/shared/session-store";
import { updateVaultSettings } from "@/shared/vault";

import {
  SettingsHeader,
  SettingsOptionList,
  SettingsSectionLabel,
  SettingsSegmented,
} from "./settings-shell";

const CLIPBOARD_SEGMENTED = CLIPBOARD_CLEAR_OPTIONS_MS.map((option) => ({
  value: option.value,
  // Canvas / Edward: full-width Segmented labels are 15 / 30 / 60
  label: String(Math.round(option.value / 1000)),
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
    <div className="flex flex-col gap-4">
      <SettingsHeader title="安全" backTo="settings" onBack={setScreen} />
      <div className="flex flex-col gap-1.5">
        <SettingsSectionLabel>空闲自动锁定</SettingsSectionLabel>
        <p className="text-xs text-muted-foreground">
          离开一段时间后自动锁定保险库。收起面板时计时继续。
        </p>
        <SettingsOptionList
          name="空闲自动锁定"
          options={IDLE_LOCK_OPTIONS_MS}
          value={idleLockMs}
          onChange={(next) => void patch({ idleLockMs: next })}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <SettingsSectionLabel>剪贴板自动清除</SettingsSectionLabel>
        <p className="text-xs text-muted-foreground">
          复制账号或密码后，短时清空剪贴板中的敏感内容。
        </p>
        <SettingsSegmented
          name="剪贴板自动清除"
          options={CLIPBOARD_SEGMENTED}
          value={clipboardClearMs}
          onChange={(next) => void patch({ clipboardClearMs: next })}
        />
      </div>
    </div>
  );
}
