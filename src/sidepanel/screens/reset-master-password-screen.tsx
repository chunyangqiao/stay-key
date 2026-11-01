import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MASTER_PASSWORD_MIN_LENGTH } from "@/shared/constants";
import { getErrorMessage } from "@/shared/error-message";
import { useSessionStore } from "@/shared/session-store";
import { resetMasterPassword } from "@/shared/vault";

export function ResetMasterPasswordScreen() {
  const dek = useSessionStore((state) => state.dek);
  const vault = useSessionStore((state) => state.vault);
  const payload = useSessionStore((state) => state.payload);
  const setUnlockedSession = useSessionStore((state) => state.setUnlockedSession);

  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [error, setError] = React.useState<string | undefined>();
  const [pending, setPending] = React.useState(false);

  const tooShort = password.length > 0 && password.length < MASTER_PASSWORD_MIN_LENGTH;
  const mismatch = confirm.length > 0 && password !== confirm;
  const canSubmit =
    Boolean(dek && vault) &&
    password.length >= MASTER_PASSWORD_MIN_LENGTH &&
    password === confirm &&
    !pending;

  async function handleSave() {
    if (!dek || !vault) {
      setError("会话已失效，请重新找回。");
      return;
    }
    if (password.length < MASTER_PASSWORD_MIN_LENGTH) {
      setError("主密码过短，请设置更长、更难猜的口令。");
      return;
    }
    if (password !== confirm) {
      setError("两次输入的主密码不一致。");
      return;
    }

    setPending(true);
    setError(undefined);
    try {
      const nextVault = await resetMasterPassword({
        dek,
        vault,
        masterPassword: password,
        confirmMasterPassword: confirm,
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
      <p className="text-sm text-muted-foreground">
        验证通过。为继续保护保险库，请立即设置新的主密码。
      </p>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reset-master-password">新主密码</Label>
        <Input
          id="reset-master-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={tooShort || undefined}
        />
        {tooShort ? (
          <p className="text-xs text-destructive">主密码过短，请设置更长、更难猜的口令。</p>
        ) : (
          <p className="text-xs text-muted-foreground">至少 {MASTER_PASSWORD_MIN_LENGTH} 位</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reset-master-password-confirm">确认新主密码</Label>
        <Input
          id="reset-master-password-confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          aria-invalid={mismatch || undefined}
        />
        {mismatch ? <p className="text-xs text-destructive">两次输入的主密码不一致。</p> : null}
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      <Button className="w-full" disabled={!canSubmit} onClick={() => void handleSave()}>
        {pending ? "保存中…" : "保存并继续"}
      </Button>
    </div>
  );
}
