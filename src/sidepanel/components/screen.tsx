import * as React from "react";

import { cn } from "@/shared/utils";

export function Screen({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex h-full min-h-0 flex-col", className)}>{children}</div>;
}

export function ScreenBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain", className)}>
      {children}
    </div>
  );
}

export function ScreenFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <footer
      className={cn(
        "flex shrink-0 items-center justify-between gap-3 border-t border-border px-4 py-2 text-xs text-muted-foreground",
        className,
      )}
    >
      {children}
    </footer>
  );
}

export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn("text-xs font-medium text-muted-foreground", className)}>{children}</p>;
}
