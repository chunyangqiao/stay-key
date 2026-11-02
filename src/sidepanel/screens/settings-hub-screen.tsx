import { ChevronRight, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DEFAULT_CLIPBOARD_CLEAR_MS,
  DEFAULT_CURRENT_SITE_SEGMENT_ENABLED,
  DEFAULT_IDLE_LOCK_MS,
  DEFAULT_LIST_MASK_ENABLED,
} from "@/shared/constants";
import { IDLE_LOCK_OPTIONS_MS } from "@/shared/settings/settings-options";
import { useSessionStore } from "@/shared/session/session-store";
import { updateVaultSettings } from "@/shared/vault/vault";

import { AppHeader } from "../components/app-header";
import { Screen, ScreenBody, ScreenFooter, SectionLabel } from "../components/screen";
import { SettingsGroup, SettingsNavRow, SettingsStaticRow } from "./settings-shell";

const VERSION = chrome.runtime.getManifest().version;

export function SettingsHubScreen() {
  const setScreen = useSessionStore((state) => state.setScreen);
  const lock = useSessionStore((state) => state.lock);
  const vault = useSessionStore((state) => state.vault);
  const applyVault = useSessionStore((state) => state.applyVault);
  const { resolvedTheme, setTheme } = useTheme();

  const idleLockMs = vault?.settings.idleLockMs ?? DEFAULT_IDLE_LOCK_MS;
  const clipboardClearMs = vault?.settings.clipboardClearMs ?? DEFAULT_CLIPBOARD_CLEAR_MS;
  const listMaskEnabled = vault?.settings.listMaskEnabled ?? DEFAULT_LIST_MASK_ENABLED;
  const currentSiteSegmentEnabled =
    vault?.settings.currentSiteSegmentEnabled ?? DEFAULT_CURRENT_SITE_SEGMENT_ENABLED;

  const idleLabel =
    IDLE_LOCK_OPTIONS_MS.find((option) => option.value === idleLockMs)?.label ??
    `${Math.round(idleLockMs / 60_000)} 分钟`;
  const clipboardSeconds = Math.round(clipboardClearMs / 1000);
  const isDark = resolvedTheme === "dark";

  const patchSettings = async (partial: Parameters<typeof updateVaultSettings>[0]) => {
    try {
      const next = await updateVaultSettings(partial);
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
      <AppHeader
        title="设置"
        onBack={() => setScreen("home")}
        actions={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={isDark ? "切换为浅色" : "切换为深色"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? <Sun /> : <Moon />}
          </Button>
        }
      />

      <ScreenBody className="px-4 py-5">
        <SectionLabel>安全与隐私</SectionLabel>
        <SettingsGroup className="mt-2">
          <SettingsNavRow
            label="空闲自动锁定"
            value={idleLabel.replace("（默认）", "")}
            onClick={() => setScreen("settings-security")}
          />
          <SettingsStaticRow label="系统锁屏后锁定" value="(锁定状态, 无法关闭)" />
          <SettingsNavRow label="安全提示问题" onClick={() => setScreen("settings-recovery")} />
        </SettingsGroup>

        <SectionLabel className="mt-6">使用体验</SectionLabel>
        <SettingsGroup className="mt-2">
          <div className="flex h-11 items-center justify-between gap-3 px-3">
            <span className="text-sm font-medium text-foreground">列表掩码</span>
            <Switch
              checked={listMaskEnabled}
              onCheckedChange={(checked) =>
                void patchSettings({ listMaskEnabled: checked === true })
              }
              aria-label="列表掩码"
            />
          </div>
          <div className="flex h-11 items-center justify-between gap-3 border-t border-border px-3">
            <span className="text-sm font-medium text-foreground">当前站点块</span>
            <Switch
              checked={currentSiteSegmentEnabled}
              onCheckedChange={(checked) =>
                void patchSettings({ currentSiteSegmentEnabled: checked === true })
              }
              aria-label="当前站点块"
            />
          </div>
          <button
            type="button"
            className="flex h-11 w-full items-center justify-between gap-3 border-t border-border px-3 text-left transition-colors hover:bg-foreground/[0.03] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
            onClick={() => setScreen("settings-clipboard")}
          >
            <span className="text-sm font-medium text-foreground">复制后清除剪贴板</span>
            <span className="flex items-center gap-1 text-meta text-muted-foreground">
              {clipboardSeconds}秒
              <ChevronRight className="size-4" aria-hidden />
            </span>
          </button>
        </SettingsGroup>

        <SectionLabel className="mt-6">关于</SectionLabel>
        <SettingsGroup className="mt-2">
          <SettingsNavRow
            label="Stay Key"
            value={VERSION}
            onClick={() => setScreen("settings-about")}
          />
        </SettingsGroup>
      </ScreenBody>

      <ScreenFooter className="justify-center border-t border-border px-4 py-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full border-primary text-primary hover:bg-primary/5 hover:text-primary"
          onClick={() => void lock()}
        >
          立即锁定
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
