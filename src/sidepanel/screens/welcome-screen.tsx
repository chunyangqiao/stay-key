import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";

import { panelPaths } from "../paths";

export function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col px-4 pb-16">
      <div className="flex flex-1 flex-col items-center justify-center">
        <img src="/icon128.png" alt="" width={56} height={56} className="size-14" />
        <h1 className="mt-6 text-title font-semibold text-foreground">Stay Key</h1>
        <p className="mt-2 max-w-[24rem] text-center text-sm leading-5 text-muted-foreground">
          本机密文保管账号与密码。
        </p>
        <Button className="mt-8 w-full" onClick={() => void navigate(panelPaths.setupPin)}>
          开始设置
        </Button>
      </div>
    </div>
  );
}
