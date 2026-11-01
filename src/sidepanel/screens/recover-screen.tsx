import * as React from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSessionStore } from "@/shared/session-store";
import { unlockWithRecoveryAnswer } from "@/shared/vault";

import { BrandHeader } from "../components/app-header";
import { Screen, ScreenBody } from "../components/screen";

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
    <Screen>
      <BrandHeader />
      <ScreenBody className="px-4 pt-7 pb-8">
        <h2 className="text-title font-semibold text-foreground">找回访问权限</h2>
        <p className="mt-2 text-sm leading-5 text-muted-foreground">你的安全提示问题</p>

        <div className="mt-5 rounded-xl bg-secondary px-3.5 py-3">
          <p className="text-row font-medium text-secondary-foreground">{question}</p>
          <p className="mt-1 text-micro leading-4 text-muted-foreground">
            请输入你设置时的答案。答案按掩码输入。
          </p>
        </div>

        <div className="mt-5">
          <Label htmlFor="recovery-unlock-answer">答案</Label>
          <Input
            className="mt-2"
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
          <p className="mt-2 min-h-5 text-micro text-muted-foreground">
            {error ? <span className="text-destructive">{error}</span> : ""}
          </p>
        </div>

        {coolingDown ? (
          <Alert variant="destructive" className="mt-1">
            <AlertTitle>尝试次数已用尽</AlertTitle>
            <AlertDescription>
              请{formatCooldown(cooldownUntil)}后再试。冷却结束后可重新验证；本机保险库不会被清空。
            </AlertDescription>
          </Alert>
        ) : null}

        <Button
          className="mt-3 w-full"
          disabled={coolingDown || pending || answer.length === 0}
          onClick={() => void handleVerify()}
        >
          {pending ? "验证中…" : "验证并继续"}
        </Button>

        <Button variant="ghost" className="mt-2 w-full" onClick={() => setScreen("unlock")}>
          返回解锁
        </Button>
      </ScreenBody>
    </Screen>
  );
}
