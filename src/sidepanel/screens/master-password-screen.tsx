import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MASTER_PASSWORD_MIN_LENGTH } from "@/shared/constants";
import { setPendingMasterPassword } from "@/shared/onboarding-draft";
import { useSessionStore } from "@/shared/session-store";

export function MasterPasswordScreen() {
  const setScreen = useSessionStore((state) => state.setScreen);
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [error, setError] = React.useState<string | undefined>();

  const tooShort = password.length > 0 && password.length < MASTER_PASSWORD_MIN_LENGTH;
  const mismatch = confirm.length > 0 && password !== confirm;
  const canSubmit =
    password.length >= MASTER_PASSWORD_MIN_LENGTH && password === confirm && !mismatch;

  function handleNext() {
    if (password.length < MASTER_PASSWORD_MIN_LENGTH) {
      setError("主密码过短，请设置更长、更难猜的口令。");
      return;
    }
    if (password !== confirm) {
      setError("两次输入的主密码不一致。");
      return;
    }
    setError(undefined);
    setPendingMasterPassword(password);
    setScreen("question");
  }

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-semibold text-foreground">设置主密码</h1>
      <p className="text-sm text-muted-foreground">
        用于解锁本机保险库。请设置较长、难猜的口令（至少 {MASTER_PASSWORD_MIN_LENGTH} 位）。
      </p>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="master-password">主密码</Label>
        <Input
          id="master-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={tooShort || undefined}
        />
        {tooShort ? (
          <p className="text-xs text-muted-foreground">建议更长、混合字符</p>
        ) : (
          <p className="text-xs text-muted-foreground">建议更长、混合字符</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="master-password-confirm">确认主密码</Label>
        <Input
          id="master-password-confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          aria-invalid={mismatch || undefined}
        />
        {mismatch ? <p className="text-xs text-destructive">两次输入的主密码不一致。</p> : null}
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      <Button className="mt-1 w-full" disabled={!canSubmit} onClick={handleNext}>
        下一步
      </Button>
    </div>
  );
}
