import * as React from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { isValidMasterPin } from "@/shared/constants";
import { useSessionStore } from "@/shared/session-store";
import { unlockWithMasterPassword } from "@/shared/vault";

import { BrandHeader } from "../components/app-header";
import { MasterPinOtp } from "../components/master-pin-otp";
import { Screen, ScreenBody } from "../components/screen";

function formatCooldown(until: number | undefined): string {
  if (!until) {
    return "约 30 分钟";
  }
  const remainingMs = Math.max(0, until - Date.now());
  const minutes = Math.max(1, Math.ceil(remainingMs / 60_000));
  return `约 ${minutes} 分钟`;
}

export function UnlockScreen() {
  const setScreen = useSessionStore((state) => state.setScreen);
  const setUnlockedSession = useSessionStore((state) => state.setUnlockedSession);
  const vault = useSessionStore((state) => state.vault);

  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | undefined>();
  const [cooldownUntil, setCooldownUntil] = React.useState<number | undefined>(
    vault?.masterCooldownUntil,
  );
  const [pending, setPending] = React.useState(false);

  const coolingDown = cooldownUntil !== undefined && cooldownUntil > Date.now();
  const canSubmit = isValidMasterPin(password) && !coolingDown && !pending;
  const otpDisabled = coolingDown || pending;

  async function handleUnlock() {
    if (!isValidMasterPin(password)) {
      setError("请输入 6 位数字。");
      return;
    }
    setPending(true);
    setError(undefined);
    try {
      const result = await unlockWithMasterPassword(password);
      if (result.ok) {
        setPassword("");
        void setUnlockedSession({
          dek: result.dek,
          vault: result.vault,
          payload: result.payload,
          screen: "home",
        });
        return;
      }

      if (result.reason === "cooldown") {
        setCooldownUntil(result.cooldownUntil);
        setError(undefined);
        return;
      }

      if (result.reason === "wrong-secret") {
        setPassword("");
        const remaining = result.remainingAttempts;
        setError(
          remaining !== undefined ? `主密码不正确。还可尝试 ${remaining} 次` : "主密码不正确。",
        );
        if (result.vault) {
          setCooldownUntil(result.vault.masterCooldownUntil);
        }
        return;
      }

      setError("未找到保险库，请重新设置。");
    } finally {
      setPending(false);
    }
  }

  return (
    <Screen>
      <BrandHeader />
      <ScreenBody className="flex flex-col justify-center px-4 pt-6 pb-14">
        <h2 className="text-center text-title font-semibold text-foreground">保险库已锁定</h2>

        <div className="mt-7">
          <Label htmlFor="unlock-password">主密码</Label>
          <MasterPinOtp
            className="mt-2"
            id="unlock-password"
            value={password}
            onChange={(next) => {
              setPassword(next);
              if (error) {
                setError(undefined);
              }
            }}
            disabled={otpDisabled}
            invalid={Boolean(error)}
            aria-label="主密码"
            autoFocus
            onEnterSubmit={() => {
              if (canSubmit) {
                void handleUnlock();
              }
            }}
          />
          <p className="mt-2 min-h-5 text-micro text-muted-foreground">
            {error ? <span className="text-destructive">{error}</span> : "请输入 6 位数字"}
          </p>
        </div>

        {coolingDown ? (
          <Alert variant="destructive" className="mt-1">
            <AlertTitle>尝试次数过多</AlertTitle>
            <AlertDescription>
              请{formatCooldown(cooldownUntil)}后再试（不会清空保险库）。
            </AlertDescription>
          </Alert>
        ) : null}

        <Button className="mt-4 w-full" disabled={!canSubmit} onClick={() => void handleUnlock()}>
          {pending ? "解锁中…" : "解锁"}
        </Button>

        <Button variant="link" className="mt-2 w-full" onClick={() => setScreen("recover")}>
          忘记主密码？
        </Button>
      </ScreenBody>
    </Screen>
  );
}
