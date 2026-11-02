import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RECOVERY_ANSWER_MIN_LENGTH } from "@/shared/constants";
import { getErrorMessage } from "@/shared/error-message";
import { useSessionStore } from "@/shared/session/session-store";
import { updateRecoveryCredentials } from "@/shared/vault/vault";

import { AppHeader } from "../components/app-header";
import { Screen, ScreenBody } from "../components/screen";

export function SettingsRecoveryScreen() {
  const setScreen = useSessionStore((state) => state.setScreen);
  const dek = useSessionStore((state) => state.dek);
  const vault = useSessionStore((state) => state.vault);
  const applyVault = useSessionStore((state) => state.applyVault);

  const currentQuestion = vault?.recoveryQuestion ?? "";
  const [question, setQuestion] = React.useState(currentQuestion);
  const [answer, setAnswer] = React.useState("");
  const [acceptedRisk, setAcceptedRisk] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    setQuestion(currentQuestion);
  }, [currentQuestion]);

  const answerTooShort = answer.length > 0 && answer.length < RECOVERY_ANSWER_MIN_LENGTH;
  const canSubmit =
    Boolean(dek && vault) &&
    question.trim().length > 0 &&
    answer.length >= RECOVERY_ANSWER_MIN_LENGTH &&
    acceptedRisk &&
    !pending;

  async function handleSave() {
    if (!dek || !vault) {
      setError("会话已失效，请重新解锁后再试。");
      return;
    }

    setPending(true);
    setError(undefined);
    try {
      const next = await updateRecoveryCredentials({
        dek,
        vault,
        recoveryQuestion: question,
        recoveryAnswer: answer,
      });
      applyVault(next);
      setAnswer("");
      setAcceptedRisk(false);
      toast.success("安全提示问题已更新");
      setScreen("settings");
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setPending(false);
    }
  }

  return (
    <Screen>
      <AppHeader title="安全提示问题" onBack={() => setScreen("settings")} />
      <ScreenBody className="px-4 py-5">
        <p className="text-sm text-muted-foreground">
          当前问题仅供查看。更新时需设置新的问题与答案；不会清空保险库条目。
        </p>

        <div className="mt-4 rounded-xl border border-border bg-secondary/50 px-3 py-2.5">
          <p className="text-micro text-muted-foreground">当前提示问题</p>
          <p className="mt-1 text-sm leading-5 text-foreground">
            {currentQuestion || "（未设置）"}
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <div>
            <Label htmlFor="settings-recovery-question">新提示问题</Label>
            <Textarea
              className="mt-2"
              id="settings-recovery-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={2}
              placeholder="例如：我小学的名字叫什么？"
            />
          </div>

          <div>
            <Label htmlFor="settings-recovery-answer">新答案</Label>
            <Input
              className="mt-2"
              id="settings-recovery-answer"
              type="text"
              autoComplete="off"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              aria-invalid={answerTooShort || undefined}
            />
            <p className="mt-2 min-h-4 text-micro leading-4 text-muted-foreground">
              {answerTooShort ? (
                <span className="text-destructive">答案至少 8 个字符</span>
              ) : (
                "答案至少 8 个字符，请妥善保管"
              )}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5">
          <p className="text-meta leading-5 text-foreground">
            ⚠️ 警告：该答案是您的第二把密钥，请妥善保存
          </p>
        </div>

        <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-meta leading-5 text-foreground">
          <Checkbox
            checked={acceptedRisk}
            onCheckedChange={(checked) => setAcceptedRisk(checked === true)}
            className="mt-0.5"
          />
          <span>我已了解风险，并确认更新提示问题与答案</span>
        </label>

        {error ? <p className="mt-3 text-micro text-destructive">{error}</p> : null}

        <Button className="mt-6 w-full" disabled={!canSubmit} onClick={() => void handleSave()}>
          {pending ? "保存中…" : "保存"}
        </Button>
      </ScreenBody>
    </Screen>
  );
}
