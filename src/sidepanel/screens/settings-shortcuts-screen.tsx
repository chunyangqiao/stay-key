import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { openChromeShortcutsPage, readActionShortcut } from "@/shared/open-chrome-page";
import { useSessionStore } from "@/shared/session-store";

import { AppHeader } from "../components/app-header";
import { Screen, ScreenBody, SectionLabel } from "../components/screen";

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
    <Screen>
      <AppHeader title="快捷操作" onBack={() => setScreen("settings")} />
      <ScreenBody className="px-4 py-5">
        <SectionLabel>打开 Side Panel</SectionLabel>
        <div className="mt-2 flex items-center justify-between gap-3 border-y border-border py-2.5">
          <span className="text-micro text-muted-foreground">当前快捷键</span>
          <kbd className="rounded-md border border-border bg-secondary px-2 py-0.5 font-mono text-micro font-medium tabular-nums text-foreground">
            {!loaded ? "读取中…" : shortcut ? shortcut : "未设置"}
          </kbd>
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-3 w-full"
          onClick={() => void onChangeInChrome()}
        >
          在 Chrome 中更改
        </Button>
        <p className="mt-2 text-micro leading-4 text-muted-foreground">
          在浏览器扩展快捷键页修改；面板内不录制全局快捷键。
        </p>
      </ScreenBody>
    </Screen>
  );
}
