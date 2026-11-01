import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSessionStore } from "@/shared/session-store";

export function HomeScreen() {
  const lock = useSessionStore((state) => state.lock);
  const payload = useSessionStore((state) => state.payload);
  const entryCount = payload?.entries.length ?? 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-foreground">Stay Key</h1>
        <Button variant="ghost" size="sm" onClick={() => lock()}>
          锁定
        </Button>
      </div>
      <Input type="search" placeholder="搜索账号或站点" />
      <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        {entryCount === 0
          ? "暂无条目。保存与复制功能下一步再接。"
          : `已有 ${entryCount} 条（列表细则后续补齐）。`}
      </div>
      <p className="text-xs text-muted-foreground">
        空闲 2 分钟无交互 → 自动锁定（收起面板计时继续）
      </p>
    </div>
  );
}
