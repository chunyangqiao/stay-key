import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { openChromeShortcutsPage, readActionShortcut } from "@/shared/open-chrome-page";
import { useSessionStore } from "@/shared/session-store";

import { SettingsHeader, SettingsSectionLabel } from "./settings-shell";

export function SettingsShortcutsScreen() {
  const setScreen = useSessionStore((state) => state.setScreen);
  const [shortcut, setShortcut] = React.useState<string | undefined>();
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    void (async () => {
      setShortcut(await readActionShortcut());
      setLoaded(true);
    })();
  }, []);

  const onChangeInChrome = async () => {
    const result = await openChromeShortcutsPage();
    if (result === "fallback") {
      toast.message("请打开 chrome://extensions/shortcuts，找到 Stay Key 后修改");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <SettingsHeader title="快捷操作" backTo="settings" onBack={setScreen} />
      <div className="flex flex-col gap-1.5">
        <SettingsSectionLabel>打开 Side Panel</SettingsSectionLabel>
        <div className="rounded-xl border border-border bg-card px-3 py-2.5">
          <p className="text-xs text-muted-foreground">当前快捷键</p>
          <p className="mt-0.5 font-mono text-sm tabular-nums text-foreground">
            {!loaded ? "读取中…" : shortcut ? shortcut : "未设置"}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => void onChangeInChrome()}
        >
          在 Chrome 中更改
        </Button>
        <p className="text-xs text-muted-foreground">
          在浏览器扩展快捷键页修改；面板内不录制全局快捷键。
        </p>
      </div>
    </div>
  );
}
