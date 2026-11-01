import { toast } from "sonner";

import { CLIPBOARD_CLEAR_OPTIONS_MS, IDLE_LOCK_OPTIONS_MS } from "@/shared/settings-options";
import { useSessionStore } from "@/shared/session-store";
import { updateVaultSettings } from "@/shared/vault";
import { DEFAULT_CLIPBOARD_CLEAR_MS, DEFAULT_IDLE_LOCK_MS } from "@/shared/constants";

import { SettingsHeader, SettingsOptionList } from "./settings-shell";

export function SettingsSecurityScreen() {
  const setScreen = useSessionStore((state) => state.setScreen);
  const vault = useSessionStore((state) => state.vault);
  const applyVault = useSessionStore((state) => state.applyVault);
  const touchActivity = useSessionStore((state) => state.touchActivity);

  const idleLockMs = vault?.settings.idleLockMs ?? DEFAULT_IDLE_LOCK_MS;
  const clipboardClearMs = vault?.settings.clipboardClearMs ?? DEFAULT_CLIPBOARD_CLEAR_MS;

  const patch = async (partial: { idleLockMs?: number; clipboardClearMs?: number }) => {
    const next = await updateVaultSettings(partial);
    if (!next) {
      toast.message("保存失败");
      return;
    }
    applyVault(next);
    if (partial.idleLockMs !== undefined) {
      await touchActivity();
    }
    toast.message("已更新");
  };

  return (
    <div className="flex flex-col gap-4">
      <SettingsHeader title="安全" backTo="settings" onBack={setScreen} />
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">空闲自动锁定</p>
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
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">剪贴板自动清除</p>
        <p className="text-xs text-muted-foreground">
          复制账号或密码后，短时清空剪贴板中的敏感内容。
        </p>
        <SettingsOptionList
          name="剪贴板自动清除"
          options={CLIPBOARD_CLEAR_OPTIONS_MS}
          value={clipboardClearMs}
          onChange={(next) => void patch({ clipboardClearMs: next })}
        />
      </div>
    </div>
  );
}
