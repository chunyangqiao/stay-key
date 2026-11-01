import * as React from "react";
import { toast } from "sonner";

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

import { BrandHeader } from "../components/app-header";
import { Screen, ScreenBody } from "../components/screen";

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
        recoveryQuestion: question,
        recoveryAnswer: answer,
        confirmRecoveryAnswer: confirm,
      });
      clearPendingMasterPassword();
      void setUnlockedSession({
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
    <Screen>
      <BrandHeader />
      <ScreenBody className="px-4 pt-7 pb-10">
        <h2 className="text-title font-semibold text-foreground">设置安全提示问题</h2>
        <p className="mt-2 text-sm leading-5 text-muted-foreground">
          忘记主密码时，答对即可找回访问权限。请自己编写问题与答案。
        </p>

        <div className="mt-7 flex flex-col gap-5">
          <div>
            <Label htmlFor="recovery-question">安全提示问题（请自己编写）</Label>
            <Textarea
              className="mt-2"
              id="recovery-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="recovery-answer">答案</Label>
            <Input
              className="mt-2"
              id="recovery-answer"
              type="password"
              autoComplete="off"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              aria-invalid={answerTooShort || undefined}
            />
            <p className="mt-2 min-h-4 text-micro leading-4 text-muted-foreground">
              {answerTooShort ? (
                <span className="text-destructive">答案长度不足，请加长后再试。</span>
              ) : (
                "答案请当作第二密码保管；过短或常见词会显著降低安全性。"
              )}
            </p>
          </div>

          <div>
            <Label htmlFor="recovery-answer-confirm">确认答案</Label>
            <Input
              className="mt-2"
              id="recovery-answer-confirm"
              type="password"
              autoComplete="off"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              aria-invalid={mismatch || undefined}
            />
            <p className="mt-2 min-h-4 text-micro leading-4 text-destructive">
              {mismatch ? "两次输入的答案不一致。" : ""}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-secondary px-3 py-2.5">
          <p className="text-meta font-medium text-secondary-foreground">
            请注意：提示问题答案是第二把钥匙
          </p>
          <p className="mt-1 text-micro leading-4 text-muted-foreground">
            答对即可解锁保险库。攻击者若猜到或获知该答案，即可打开保险库。请使用足够长、难以猜测的答案，并勿与公开信息相同。
          </p>
        </div>

        <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-meta leading-5 text-foreground">
          <Checkbox
            checked={acceptedRisk}
            onCheckedChange={(checked) => setAcceptedRisk(checked === true)}
            className="mt-0.5"
          />
          <span>我已了解上述风险，并将妥善保管答案</span>
        </label>

        {error ? <p className="mt-3 text-micro text-destructive">{error}</p> : null}

        <Button className="mt-4 w-full" disabled={!canSubmit} onClick={() => void handleComplete()}>
          {pending ? "创建中…" : "完成设置"}
        </Button>
      </ScreenBody>
    </Screen>
  );
}
