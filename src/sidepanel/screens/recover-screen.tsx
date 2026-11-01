import * as React from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSessionStore } from "@/shared/session-store";
import { unlockWithRecoveryAnswer } from "@/shared/vault";

function formatCooldown(until: number | undefined): string {
  if (!until) {
    return "约 30 分钟";
  }
  const remainingMs = Math.max(0, until - Date.now());
  const minutes = Math.max(1, Math.ceil(remainingMs / 60_000));
  return `约 ${minutes} 分钟`;
}

export function RecoverScreen() {
  const setScreen = useSessionStore((state) => state.setScreen);
  const setUnlockedSession = useSessionStore((state) => state.setUnlockedSession);
  const vault = useSessionStore((state) => state.vault);

  const [answer, setAnswer] = React.useState("");
  const [error, setError] = React.useState<string | undefined>();
  const [cooldownUntil, setCooldownUntil] = React.useState<number | undefined>(
    vault?.recoveryCooldownUntil,
  );
  const [pending, setPending] = React.useState(false);

  const question = vault?.recoveryQuestion ?? "（未找到提示问题）";
  const coolingDown = cooldownUntil !== undefined && cooldownUntil > Date.now();

  async function handleVerify() {
    setPending(true);
    setError(undefined);
    try {
      const result = await unlockWithRecoveryAnswer(answer);
      if (result.ok) {
        setAnswer("");
        void setUnlockedSession({
          dek: result.dek,
          vault: result.vault,
          payload: result.payload,
          screen: "reset",
        });
        return;
      }

      if (result.reason === "cooldown") {
        setCooldownUntil(result.cooldownUntil);
        return;
      }

      if (result.reason === "wrong-secret") {
        setAnswer("");
        const remaining = result.remainingAttempts;
        setError(remaining !== undefined ? `答案不正确。还可尝试 ${remaining} 次` : "答案不正确。");
        if (result.vault) {
          setCooldownUntil(result.vault.recoveryCooldownUntil);
        }
        return;
      }

      setError("未找到保险库。");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-semibold text-foreground">找回访问权限</h1>
      <p className="text-sm text-muted-foreground">你的安全提示问题</p>

      <Alert>
        <AlertTitle>{question}</AlertTitle>
        <AlertDescription>请输入你设置时的答案。答案按掩码输入。</AlertDescription>
      </Alert>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="recovery-unlock-answer">答案</Label>
        <Input
          id="recovery-unlock-answer"
          type="password"
          autoComplete="off"
          value={answer}
          disabled={coolingDown || pending}
          onChange={(event) => setAnswer(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && answer && !coolingDown) {
              void handleVerify();
            }
          }}
        />
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      {coolingDown ? (
        <Alert variant="destructive">
          <AlertTitle>尝试次数已用尽</AlertTitle>
          <AlertDescription>
            请{formatCooldown(cooldownUntil)}后再试。冷却结束后可重新验证；本机保险库不会被清空。
          </AlertDescription>
        </Alert>
      ) : null}

      <Button
        className="w-full"
        disabled={coolingDown || pending || answer.length === 0}
        onClick={() => void handleVerify()}
      >
        {pending ? "验证中…" : "验证并继续"}
      </Button>

      <Button variant="ghost" className="w-full" onClick={() => setScreen("unlock")}>
        返回解锁
      </Button>
    </div>
  );
}
