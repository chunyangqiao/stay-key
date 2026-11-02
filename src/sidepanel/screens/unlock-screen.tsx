import * as React from "react";

import { Button } from "@/components/ui/button";
import { isValidMasterPin } from "@/shared/constants";
import { useSessionStore } from "@/shared/session/session-store";
import { unlockWithMasterPassword } from "@/shared/vault/vault";

import { MasterPinOtp } from "../components/master-pin-otp";
import { Screen, ScreenBody } from "../components/screen";

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
  const pendingRef = React.useRef(false);

  const coolingDown = cooldownUntil !== undefined && cooldownUntil > Date.now();
  const otpDisabled = coolingDown || pending;

  const handleUnlock = React.useCallback(
    async (pin: string) => {
      if (!isValidMasterPin(pin) || pendingRef.current) {
        return;
      }
      if (cooldownUntil !== undefined && cooldownUntil > Date.now()) {
        return;
      }

      pendingRef.current = true;
      setPending(true);
      setError(undefined);
      try {
        const result = await unlockWithMasterPassword(pin);
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
          setPassword("");
          setCooldownUntil(result.cooldownUntil);
          setError(undefined);
          return;
        }

        if (result.reason === "wrong-secret") {
          setPassword("");
          setError("主密码错误，请重试");
          if (result.vault) {
            setCooldownUntil(result.vault.masterCooldownUntil);
          }
          return;
        }

        setPassword("");
        setError("未找到保险库，请重新设置。");
      } finally {
        pendingRef.current = false;
        setPending(false);
      }
    },
    [cooldownUntil, setUnlockedSession],
  );

  return (
    <Screen>
      <ScreenBody className="flex flex-col items-center justify-center px-4 pt-10 pb-14">
        <img src="/icon128.png" alt="" width={64} height={64} className="size-16" />
        <h2 className="mt-4 text-center text-title font-semibold text-foreground">保险库已锁定</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">请输入 6 位主密码</p>

        <MasterPinOtp
          className="mt-8 w-full max-w-[20rem]"
          id="unlock-password"
          value={password}
          onChange={(next) => {
            setPassword(next);
            if (error) {
              setError(undefined);
            }
          }}
          disabled={otpDisabled}
          invalid={Boolean(error) || coolingDown}
          aria-label="主密码"
          autoFocus
          onComplete={(pin) => {
            void handleUnlock(pin);
          }}
        />

        {coolingDown ? (
          <div className="mt-3 w-full max-w-[20rem] text-center">
            <p className="text-micro text-destructive">尝试过多，请 30 分钟后重试</p>
            <p className="mt-1.5 text-micro text-muted-foreground">冷却结束后可再次输入</p>
          </div>
        ) : (
          <div className="mt-3 w-full max-w-[20rem] text-center">
            {error ? <p className="text-micro text-destructive">{error}</p> : null}
            <p className={`text-micro text-muted-foreground ${error ? "mt-1.5" : ""}`}>
              {pending ? "解锁中…" : "输入满 6 位后自动解锁"}
            </p>
          </div>
        )}

        <Button
          variant="link"
          className="mt-8"
          disabled={coolingDown}
          onClick={() => setScreen("recover")}
        >
          忘记主密码？
        </Button>
      </ScreenBody>
    </Screen>
  );
}
