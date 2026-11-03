import * as React from "react";

import { MemoryRouter } from "react-router";

import { useSessionStore } from "@/shared/session/session-store";
import { useIdleLock } from "./hooks/use-idle-lock";
import { entryPathForRegion, sessionRegion } from "./paths";
import { PanelRoutes } from "./routes";

export function SidePanel() {
  const hydrate = useSessionStore((state) => state.hydrate);
  const hydrated = useSessionStore((state) => state.hydrated);
  const hasVault = useSessionStore((state) => state.hasVault);
  const unlocked = useSessionStore((state) => state.unlocked);
  const region = sessionRegion(hasVault, unlocked);
  const entryPath = React.useMemo(
    () => (hydrated ? entryPathForRegion(region) : undefined),
    [hydrated, region],
  );

  React.useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useIdleLock();

  if (!hydrated || !entryPath) {
    return (
      <main className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
        <div className="mx-auto flex h-full w-full max-w-app flex-col overflow-hidden">
          <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
            <span className="size-4 animate-pulse rounded-full bg-secondary motion-reduce:animate-none" />
            <span className="h-3 w-20 animate-pulse rounded-sm bg-secondary motion-reduce:animate-none" />
          </div>
          <div className="flex flex-col gap-5 px-4 pt-5" role="status">
            <span className="sr-only">加载中…</span>
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="flex flex-col gap-2">
                <span className="h-3 w-2/5 animate-pulse rounded-sm bg-secondary motion-reduce:animate-none" />
                <span className="h-2.5 w-3/5 animate-pulse rounded-sm bg-secondary motion-reduce:animate-none" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <div className="mx-auto flex h-full w-full max-w-app flex-col overflow-hidden">
        <MemoryRouter key={region} initialEntries={[entryPath]}>
          <PanelRoutes />
        </MemoryRouter>
      </div>
    </main>
  );
}
