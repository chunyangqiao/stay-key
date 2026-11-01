import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidMasterPin, MASTER_PIN_LENGTH, sanitizeMasterPinInput } from "@/shared/constants";
import { getErrorMessage } from "@/shared/error-message";
import { useSessionStore } from "@/shared/session-store";
import { resetMasterPassword } from "@/shared/vault";

export function ResetMasterPasswordScreen() {
  const dek = useSessionStore((state) => state.dek);
  const vault = useSessionStore((state) => state.vault);
  const payload = useSessionStore((state) => state.payload);
  const setUnlockedSession = useSessionStore((state) => state.setUnlockedSession);

  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | undefined>();
  const [pending, setPending] = React.useState(false);

  const invalidLength = password.length > 0 && password.length !== MASTER_PIN_LENGTH;
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
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-semibold text-foreground">设置新的主密码</h1>
      <p className="text-sm text-muted-foreground">验证通过。请设置新的 6 位数字主密码。</p>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reset-master-password">新主密码</Label>
        <Input
          id="reset-master-password"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          pattern="[0-9]*"
          maxLength={MASTER_PIN_LENGTH}
          value={password}
          className="tracking-[0.2em]"
          onChange={(event) => setPassword(sanitizeMasterPinInput(event.target.value))}
          onKeyDown={(event) => {
            if (event.key === "Enter" && canSubmit) {
              void handleSave();
            }
          }}
          aria-invalid={invalidLength || undefined}
        />
        {invalidLength ? (
          <p className="text-xs text-destructive">请输入 6 位数字。</p>
        ) : (
          <p className="text-xs text-muted-foreground">请输入 6 位数字</p>
        )}
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      <Button className="w-full" disabled={!canSubmit} onClick={() => void handleSave()}>
        {pending ? "保存中…" : "保存并继续"}
      </Button>
    </div>
  );
}
