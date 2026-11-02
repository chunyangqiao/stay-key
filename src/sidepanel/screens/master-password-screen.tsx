import * as React from "react";

import { Button } from "@/components/ui/button";
import { isValidMasterPin } from "@/shared/constants";
import { setPendingMasterPassword } from "@/shared/onboarding/onboarding-draft";
import { useSessionStore } from "@/shared/session/session-store";

import { BrandHeader } from "../components/app-header";
import { MasterPinOtp } from "../components/master-pin-otp";
import { Screen, ScreenBody } from "../components/screen";

export function MasterPasswordScreen() {
  const setScreen = useSessionStore((state) => state.setScreen);
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | undefined>();

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
    <Screen>
      <BrandHeader />
      <ScreenBody className="relative flex flex-col px-4 pt-7 pb-8">
        <h2 className="text-title font-semibold text-foreground">设置主密码</h2>
        <p className="mt-2 text-sm leading-5 text-muted-foreground">
          用于解锁本机保险库，请设置 6 位数字
        </p>

        <MasterPinOtp
          className="mt-9"
          id="master-password"
          value={password}
          onChange={(next) => {
            setPassword(next);
            if (error) {
              setError(undefined);
            }
          }}
          invalid={Boolean(error)}
          aria-label="主密码"
          autoFocus
          onEnterSubmit={handleNext}
        />
        <p className="mt-2 min-h-5 text-micro text-muted-foreground">
          {error ? <span className="text-destructive">{error}</span> : null}
        </p>

        <div className="mt-auto pt-8">
          <Button className="w-full" disabled={!isValidMasterPin(password)} onClick={handleNext}>
            下一步
          </Button>
        </div>
      </ScreenBody>
    </Screen>
  );
}
