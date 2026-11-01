import * as React from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { GITHUB_ISSUES_URL } from "@/shared/settings-options";
import { openExternalUrl } from "@/shared/open-chrome-page";
import { useSessionStore } from "@/shared/session-store";

import { SettingsHeader } from "./settings-shell";

const VERSION = chrome.runtime.getManifest().version;

export function SettingsAboutScreen() {
  const setScreen = useSessionStore((state) => state.setScreen);
  const [showRisk, setShowRisk] = React.useState(false);

  return (
    <div className="flex flex-col gap-3">
      <SettingsHeader title="关于" backTo="settings" onBack={setScreen} />
      <div className="flex flex-col items-center gap-2 py-2">
        <img src="/icon48.png" alt="" width={48} height={48} className="rounded-full" />
        <h2 className="text-lg font-semibold text-foreground">Stay Key</h2>
        <p className="text-center text-sm text-muted-foreground">
          本机密文保管站点账号与密码。凭证仅保存在本机。
        </p>
      </div>
      <div className="rounded-xl border border-border px-3 py-2.5">
        <p className="text-sm font-medium text-foreground">版本</p>
        <p className="text-xs text-muted-foreground">v{VERSION}</p>
      </div>
      <Button type="button" variant="link" className="px-0" onClick={() => setShowRisk((v) => !v)}>
        关于提示问题与第二把钥匙
      </Button>
      {showRisk ? (
        <Alert>
          <AlertTitle>请注意：提示问题答案是第二把钥匙</AlertTitle>
          <AlertDescription>
            答对即可解锁保险库。攻击者若猜到或获知该答案，即可打开
            vault。请使用足够长、难以猜测的答案，并勿与公开信息相同。
          </AlertDescription>
        </Alert>
      ) : null}
      <Button
        type="button"
        variant="outline"
        disabled={!GITHUB_ISSUES_URL}
        onClick={() => {
          if (GITHUB_ISSUES_URL) {
            void openExternalUrl(GITHUB_ISSUES_URL);
          }
        }}
      >
        {GITHUB_ISSUES_URL ? "反馈问题（GitHub Issues）" : "反馈问题（后续开放）"}
      </Button>
    </div>
  );
}
