import * as React from "react";

import { useNavigate } from "react-router";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { openExternalUrl } from "@/shared/chrome/open-chrome-page";
import { GITHUB_ISSUES_URL } from "@/shared/settings/settings-options";
import { AppHeader } from "../components/app-header";
import { panelPaths } from "../paths";
import { Screen, ScreenBody } from "../components/screen";

const manifest = chrome.runtime.getManifest();
const VERSION = manifest.version_name ?? manifest.version;

export function SettingsAboutScreen() {
  const navigate = useNavigate();
  const [showRisk, setShowRisk] = React.useState(false);

  return (
    <Screen>
      <AppHeader title="关于" onBack={() => void navigate(panelPaths.settings)} />
      <ScreenBody className="px-4 py-7">
        <div className="flex flex-col items-center gap-2 text-center">
          <img src="/icon48.png" alt="" width={48} height={48} className="size-12 rounded-full" />
          <h2 className="text-section font-semibold text-foreground">Stay Key</h2>
          <p className="max-w-[24rem] text-meta leading-5 text-muted-foreground">
            本机密文保管站点账号与密码。凭证仅保存在本机。
          </p>
        </div>

        <div className="mt-7 flex items-center justify-between gap-3 border-y border-border py-2.5">
          <span className="text-micro text-muted-foreground">版本</span>
          <span className="text-meta font-medium tabular-nums text-foreground">v{VERSION}</span>
        </div>

        <button
          type="button"
          aria-expanded={showRisk}
          className="mt-4 flex w-full items-center justify-between gap-2 py-1.5 text-left text-meta font-medium text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          onClick={() => setShowRisk((v) => !v)}
        >
          关于提示问题与第二把钥匙
          <ChevronDown
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground transition-transform duration-[var(--dur-short)] ease-[var(--ease-out)] data-[open=true]:rotate-180"
            data-open={showRisk}
          />
        </button>
        {showRisk ? (
          <div className="mt-2 rounded-xl bg-secondary px-3 py-2.5">
            <p className="text-meta font-medium text-secondary-foreground">
              请注意：提示问题答案是第二把钥匙
            </p>
            <p className="mt-1 text-meta leading-5 text-muted-foreground">
              答对即可解锁保险库。攻击者若猜到或获知该答案，即可打开保险库。请使用足够长、难以猜测的答案，并勿与公开信息相同。
            </p>
          </div>
        ) : null}

        <Button
          type="button"
          variant="outline"
          className="mt-7 w-full"
          disabled={!GITHUB_ISSUES_URL}
          onClick={() => {
            if (GITHUB_ISSUES_URL) {
              void openExternalUrl(GITHUB_ISSUES_URL);
            }
          }}
        >
          反馈问题（GitHub Issues）
        </Button>
      </ScreenBody>
    </Screen>
  );
}
