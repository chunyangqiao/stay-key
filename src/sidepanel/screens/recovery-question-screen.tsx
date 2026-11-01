import * as React from "react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RECOVERY_ANSWER_MIN_LENGTH } from "@/shared/constants";
import { getErrorMessage } from "@/shared/error-message";
import {
  clearPendingMasterPassword,
  setPendingMasterPassword,
  takePendingMasterPassword,
} from "@/shared/onboarding-draft";
import { useSessionStore } from "@/shared/session-store";
import { createVault } from "@/shared/vault";

export function RecoveryQuestionScreen() {
  const setUnlockedSession = useSessionStore((state) => state.setUnlockedSession);
  const setScreen = useSessionStore((state) => state.setScreen);

  const [question, setQuestion] = React.useState("");
  const [answer, setAnswer] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [acceptedRisk, setAcceptedRisk] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();
  const [pending, setPending] = React.useState(false);

  const answerTooShort = answer.length > 0 && answer.length < RECOVERY_ANSWER_MIN_LENGTH;
  const mismatch = confirm.length > 0 && answer !== confirm;
  const canSubmit =
    question.trim().length > 0 &&
    answer.length >= RECOVERY_ANSWER_MIN_LENGTH &&
    answer === confirm &&
    acceptedRisk &&
    !pending;

  async function handleComplete() {
    const masterPassword = takePendingMasterPassword();
    if (!masterPassword) {
      setError("主密码已失效，请返回重新设置。");
      setScreen("master");
      return;
    }

    setPending(true);
    setError(undefined);
    try {
      const { dek, vault } = await createVault({
        masterPassword,
        confirmMasterPassword: masterPassword,
        recoveryQuestion: question,
        recoveryAnswer: answer,
        confirmRecoveryAnswer: confirm,
      });
      clearPendingMasterPassword();
      setUnlockedSession({
        dek,
        vault,
        payload: { entries: [] },
        screen: "home",
      });
      toast.success("保险库已就绪");
    } catch (caught) {
      setPendingMasterPassword(masterPassword);
      setError(getErrorMessage(caught));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-semibold text-foreground">设置安全提示问题</h1>
      <p className="text-sm text-muted-foreground">
        忘记主密码时，答对即可找回访问权限。请自己编写问题与答案。
      </p>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="recovery-question">安全提示问题（请自己编写）</Label>
        <Textarea
          id="recovery-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={2}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="recovery-answer">答案</Label>
        <Input
          id="recovery-answer"
          type="password"
          autoComplete="off"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          aria-invalid={answerTooShort || undefined}
        />
        <p className="text-xs text-muted-foreground">
          答案请当作第二密码保管；过短或常见词会显著降低安全性。
        </p>
        {answerTooShort ? (
          <p className="text-xs text-destructive">答案长度不足，请加长后再试。</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="recovery-answer-confirm">确认答案</Label>
        <Input
          id="recovery-answer-confirm"
          type="password"
          autoComplete="off"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          aria-invalid={mismatch || undefined}
        />
        {mismatch ? <p className="text-xs text-destructive">两次输入的答案不一致。</p> : null}
      </div>

      <Alert>
        <AlertTitle>请注意：提示问题答案是第二把钥匙</AlertTitle>
        <AlertDescription>
          答对即可解锁保险库。攻击者若猜到或获知该答案，即可打开
          vault。请使用足够长、难以猜测的答案，并勿与公开信息相同。
        </AlertDescription>
      </Alert>

      <label className="flex items-start gap-2 text-sm text-foreground">
        <Checkbox
          checked={acceptedRisk}
          onCheckedChange={(checked) => setAcceptedRisk(checked === true)}
          className="mt-0.5"
        />
        <span>我已了解上述风险，并将妥善保管答案</span>
      </label>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      <Button className="w-full" disabled={!canSubmit} onClick={() => void handleComplete()}>
        {pending ? "创建中…" : "完成设置"}
      </Button>
    </div>
  );
}
