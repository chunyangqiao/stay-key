import * as React from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { isValidMasterPin, MASTER_PIN_LENGTH } from "@/shared/constants";
import { setPendingMasterPassword } from "@/shared/onboarding-draft";
import { useSessionStore } from "@/shared/session-store";

import { MasterPinOtp } from "../components/master-pin-otp";

export function MasterPasswordScreen() {
  const setScreen = useSessionStore((state) => state.setScreen);
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | undefined>();

  const invalidLength = password.length > 0 && password.length !== MASTER_PIN_LENGTH;
  const canSubmit = isValidMasterPin(password);

  function handleNext() {
    if (!isValidMasterPin(password)) {
      setError("请输入 6 位数字。");
      return;
    }
    setError(undefined);
    setPendingMasterPassword(password);
    setScreen("question");
  }

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-semibold text-foreground">设置主密码</h1>
      <p className="text-sm text-muted-foreground">用于解锁本机保险库。请设置 6 位数字。</p>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="master-password">主密码</Label>
        <MasterPinOtp
          id="master-password"
          value={password}
          onChange={(next) => {
            setPassword(next);
            if (error) {
              setError(undefined);
            }
          }}
          invalid={Boolean(error) || invalidLength}
          aria-label="主密码"
          autoFocus
          onEnterSubmit={handleNext}
        />
        {invalidLength ? (
          <p className="text-xs text-destructive">请输入 6 位数字。</p>
        ) : (
          <p className="text-xs text-muted-foreground">请输入 6 位数字</p>
        )}
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      <Button className="mt-1 w-full" disabled={!canSubmit} onClick={handleNext}>
        下一步
      </Button>
    </div>
  );
}
