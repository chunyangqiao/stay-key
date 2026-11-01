import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/shared/session-store";

export function WelcomeScreen() {
  const setScreen = useSessionStore((state) => state.setScreen);

  return (
    <div className="flex flex-col gap-3">
      <img
        src="/icon128.png"
        alt=""
        width={56}
        height={56}
        className="mx-auto size-14 rounded-full"
      />
      <h1 className="text-center text-xl font-semibold text-foreground">欢迎使用 Stay Key</h1>
      <p className="text-sm text-muted-foreground">
        本机密文保管站点账号与密码，打开面板即可查看与复制。
      </p>
      <p className="text-sm text-muted-foreground">
        凭证仅以密文保存在本机；解锁需 6 位数字主密码。本期不做生成与自动填充。
      </p>
      <Button className="mt-2 w-full" onClick={() => setScreen("master")}>
        开始设置
      </Button>
    </div>
  );
}
