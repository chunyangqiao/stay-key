import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { isValidMasterPin } from "@/shared/constants";
import { getErrorMessage } from "@/shared/error-message";
import { useSessionStore } from "@/shared/session-store";
import { resetMasterPassword } from "@/shared/vault";

import { BrandHeader } from "../components/app-header";
import { MasterPinOtp } from "../components/master-pin-otp";
import { Screen, ScreenBody } from "../components/screen";

export function ResetMasterPasswordScreen() {
  const dek = useSessionStore((state) => state.dek);
  const vault = useSessionStore((state) => state.vault);
  const payload = useSessionStore((state) => state.payload);
  const setUnlockedSession = useSessionStore((state) => state.setUnlockedSession);

  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | undefined>();
  const [pending, setPending] = React.useState(false);

  const canSubmit = Boolean(dek && vault) && isValidMasterPin(password) && !pending;

  async function handleSave() {
    if (!dek || !vault) {
      setError("会话已失效，请重新找回。");
      return;
    }
    if (!isValidMasterPin(password)) {
      setError("请输入 6 位数字。");
      return;
    }

    setPending(true);
    setError(undefined);
    try {
      const nextVault = await resetMasterPassword({
        dek,
        vault,
        masterPassword: password,
      });
      void setUnlockedSession({
        dek,
        vault: nextVault,
        payload: payload ?? { entries: [] },
        screen: "home",
      });
      toast.success("主密码已更新");
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setPending(false);
    }
  }

  return (
    <Screen>
      <BrandHeader />
      <ScreenBody className="px-4 pt-7 pb-8">
        <h2 className="text-title font-semibold text-foreground">设置新的主密码</h2>
        <p className="mt-2 text-sm leading-5 text-muted-foreground">
          验证通过。请设置新的 6 位数字主密码。
        </p>

        <div className="mt-7">
          <Label htmlFor="reset-master-password">新主密码</Label>
          <MasterPinOtp
            className="mt-2"
            id="reset-master-password"
            value={password}
            onChange={(next) => {
              setPassword(next);
              if (error) {
                setError(undefined);
              }
            }}
            disabled={pending}
            invalid={Boolean(error)}
            aria-label="新主密码"
            autoFocus
            onEnterSubmit={() => {
              if (canSubmit) {
                void handleSave();
              }
            }}
          />
          <p className="mt-2 min-h-5 text-micro text-muted-foreground">
            {error ? <span className="text-destructive">{error}</span> : "请输入 6 位数字"}
          </p>
        </div>

        <Button className="mt-4 w-full" disabled={pending} onClick={() => void handleSave()}>
          {pending ? "保存中…" : "保存并继续"}
        </Button>
      </ScreenBody>
    </Screen>
  );
}
