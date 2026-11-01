import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/shared/session-store";

export function WelcomeScreen() {
  const setScreen = useSessionStore((state) => state.setScreen);

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="flex w-full max-w-full flex-col items-center gap-4 text-center">
        <img src="/icon128.png" alt="" width={56} height={56} className="size-14" />
        <h1 className="text-xl font-semibold text-foreground">Stay Key</h1>
        <p className="text-sm text-muted-foreground">本机密文保管账号与密码。</p>
        <Button className="w-full" onClick={() => setScreen("master")}>
          开始设置
        </Button>
      </div>
    </div>
  );
}
