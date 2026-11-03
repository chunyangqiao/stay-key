import { useNavigate } from "react-router";
import { toast } from "sonner";

import { DEFAULT_IDLE_LOCK_MS } from "@/shared/constants";
import { idleLockOptionsMs } from "@/shared/settings/settings-options";
import { useSessionStore } from "@/shared/session/session-store";
import { updateVaultSettings } from "@/shared/vault/vault";
import { AppHeader } from "../components/app-header";
import { panelPaths } from "../paths";
import { Screen, ScreenBody } from "../components/screen";
import { SettingsOptionList } from "./settings-shell";

export function SettingsSecurityScreen() {
  const navigate = useNavigate();
  const vault = useSessionStore((state) => state.vault);
  const applyVault = useSessionStore((state) => state.applyVault);
  const touchActivity = useSessionStore((state) => state.touchActivity);

  const idleLockMs = vault?.settings.idleLockMs ?? DEFAULT_IDLE_LOCK_MS;

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
      <AppHeader title="空闲自动锁定" onBack={() => void navigate(panelPaths.settings)} />
      <ScreenBody className="px-4 py-5">
        <p className="mb-3 text-sm text-muted-foreground">
          离开一段时间后自动锁定保险库。收起面板时计时继续。
        </p>
        <SettingsOptionList
          name="空闲自动锁定"
          options={idleLockOptionsMs}
          value={idleLockMs}
          onChange={(next) => void patchIdle(next)}
        />
      </ScreenBody>
    </Screen>
  );
}
