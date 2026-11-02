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
  const [acceptedRisk, setAcceptedRisk] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();
  const [pending, setPending] = React.useState(false);

  const answerTooShort = answer.length > 0 && answer.length < RECOVERY_ANSWER_MIN_LENGTH;
  const canSubmit =
    question.trim().length > 0 &&
    answer.length >= RECOVERY_ANSWER_MIN_LENGTH &&
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
      <ScreenBody className="relative flex flex-col px-4 pt-7 pb-10">
        <button
          type="button"
          className="mb-3 flex items-center gap-1 text-left text-title font-semibold text-foreground"
          onClick={() => setScreen("master")}
        >
          <span aria-hidden className="text-lg leading-none">
            ←
          </span>
          设置安全提示问题
        </button>

        <div className="flex flex-col gap-5">
          <div>
            <Label htmlFor="recovery-question">提示问题</Label>
            <Textarea
              className="mt-2"
              id="recovery-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={2}
              placeholder="例如：我小学的名字叫什么？"
            />
          </div>

          <div>
            <Label htmlFor="recovery-answer">答案</Label>
            <Input
              className="mt-2"
              id="recovery-answer"
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

        <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5">
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
          <span>我已了解风险</span>
        </label>

        {error ? <p className="mt-3 text-micro text-destructive">{error}</p> : null}

        <div className="mt-auto pt-8">
          <Button className="w-full" disabled={!canSubmit} onClick={() => void handleComplete()}>
            {pending ? "创建中…" : "完成设置"}
          </Button>
        </div>
      </ScreenBody>
    </Screen>
  );
}
