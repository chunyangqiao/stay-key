import * as React from "react";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AppHeader({
  title,
  onBack,
  actions,
}: {
  title: string;
  onBack?: () => void;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-1.5 border-b border-border px-2.5">
      {onBack ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="-ml-0.5"
          aria-label="返回"
          onClick={onBack}
        >
          <ArrowLeft />
        </Button>
      ) : null}
      <h1 className="min-w-0 flex-1 truncate pl-1 text-row font-semibold tracking-[-0.01em] text-foreground">
        {title}
      </h1>
      {actions ? <div className="flex shrink-0 items-center gap-0.5">{actions}</div> : null}
    </header>
  );
}

export function BrandHeader({ actions }: { actions?: React.ReactNode }) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-1.5 border-b border-border px-2.5">
      <span className="flex items-center gap-2 pl-1.5">
        <img src="/icon32.png" alt="" width={18} height={18} className="size-[1.125rem]" />
        <h1 className="text-row font-semibold tracking-[-0.01em] text-foreground">Stay Key</h1>
      </span>
      {actions ? <div className="ml-auto flex shrink-0 items-center gap-0.5">{actions}</div> : null}
    </header>
  );
}
