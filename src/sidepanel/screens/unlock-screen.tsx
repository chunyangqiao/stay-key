import * as React from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSessionStore } from "@/shared/session-store";
import { unlockWithMasterPassword } from "@/shared/vault";

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

  async function handleUnlock() {
    setPending(true);
    setError(undefined);
    try {
      const result = await unlockWithMasterPassword(password);
      if (result.ok) {
        setPassword("");
        setUnlockedSession({
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
    <div className="flex flex-col gap-3">
      <img
        src="/icon128.png"
        alt=""
        width={40}
        height={40}
        className="mx-auto size-10 rounded-full"
      />
      <h1 className="text-center text-xl font-semibold text-foreground">保险库已锁定</h1>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="unlock-password">主密码</Label>
        <Input
          id="unlock-password"
          type="password"
          autoComplete="current-password"
          value={password}
          disabled={coolingDown || pending}
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && password && !coolingDown) {
              void handleUnlock();
            }
          }}
        />
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      {coolingDown ? (
        <Alert variant="destructive">
          <AlertTitle>尝试次数过多</AlertTitle>
          <AlertDescription>
            请{formatCooldown(cooldownUntil)}后再试（不会清空保险库）。
          </AlertDescription>
        </Alert>
      ) : null}

      <Button
        className="w-full"
        disabled={coolingDown || pending || password.length === 0}
        onClick={() => void handleUnlock()}
      >
        {pending ? "解锁中…" : "解锁"}
      </Button>

      <Button variant="link" className="w-full" onClick={() => setScreen("recover")}>
        忘记主密码？
      </Button>
    </div>
  );
}
