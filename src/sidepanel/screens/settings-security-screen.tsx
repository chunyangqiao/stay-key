import { ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { DEFAULT_CLIPBOARD_CLEAR_MS, DEFAULT_IDLE_LOCK_MS } from "@/shared/constants";
import { IDLE_LOCK_OPTIONS_MS } from "@/shared/settings-options";
import { useSessionStore } from "@/shared/session-store";
import { updateVaultSettings } from "@/shared/vault";

import { AppHeader } from "../components/app-header";
import { Screen, ScreenBody, SectionLabel } from "../components/screen";
import { SettingsOptionList } from "./settings-shell";

export function SettingsSecurityScreen() {
  const setScreen = useSessionStore((state) => state.setScreen);
  const vault = useSessionStore((state) => state.vault);
  const applyVault = useSessionStore((state) => state.applyVault);
  const touchActivity = useSessionStore((state) => state.touchActivity);

  const idleLockMs = vault?.settings.idleLockMs ?? DEFAULT_IDLE_LOCK_MS;
  const clipboardClearMs = vault?.settings.clipboardClearMs ?? DEFAULT_CLIPBOARD_CLEAR_MS;
  const clipboardSeconds = Math.round(clipboardClearMs / 1000);

  const patchIdle = async (nextMs: number) => {
    try {
      const next = await updateVaultSettings({ idleLockMs: nextMs });
      if (!next) {
        toast.message("保存失败");
        return;
      }
      applyVault(next);
      await touchActivity();
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
          onChange={(next) => void patchIdle(next)}
        />

        <div
          className="mt-3 flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-border bg-background px-3"
          role="group"
          aria-label="系统锁屏后锁定"
        >
          <span className="text-sm font-medium text-foreground">系统锁屏后锁定</span>
          <span className="text-meta text-muted-foreground">无法关闭</span>
        </div>

        <SectionLabel className="mt-6">剪贴板</SectionLabel>
        <button
          type="button"
          className="mt-3 flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 text-left transition-colors hover:bg-foreground/[0.03] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
          onClick={() => setScreen("settings-clipboard")}
        >
          <span className="text-sm font-medium text-foreground">复制后清除剪贴板</span>
          <span className="flex items-center gap-1 text-meta text-muted-foreground">
            {clipboardSeconds}秒
            <ChevronRight className="size-4" aria-hidden />
          </span>
        </button>
      </ScreenBody>
    </Screen>
  );
}
