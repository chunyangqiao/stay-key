import { ChevronRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/shared/utils";

export function SettingsNavCard({
  items,
}: {
  items: {
    title: string;
    description: string;
    icon: LucideIcon;
    onClick: () => void;
  }[];
}) {
  return (
    <ul className="divide-y divide-border/70">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.title}>
            <button
              type="button"
              onClick={item.onClick}
              className="flex min-h-14 w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-foreground/[0.03] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
            >
              <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-row font-medium text-foreground">{item.title}</span>
                <span className="text-meta text-muted-foreground">{item.description}</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function SettingsOptionList<T extends string | number>({
  options,
  value,
  onChange,
  name,
  className,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
  name: string;
  className?: string;
}) {
  return (
    <div
      className={cn("overflow-hidden rounded-xl border border-border bg-background", className)}
      role="radiogroup"
      aria-label={name}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex h-10 w-full items-center gap-3 px-3 text-left transition-colors",
              index > 0 && "border-t border-border",
              selected ? "bg-secondary/70" : "hover:bg-foreground/[0.03]",
              "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "grid size-4 shrink-0 place-items-center rounded-full border transition-colors",
                selected ? "border-primary" : "border-input",
              )}
            >
              {selected ? <span className="size-2 rounded-full bg-primary" /> : null}
            </span>
            <span
              className={cn(
                "text-sm",
                selected ? "font-medium text-foreground" : "text-foreground/90",
              )}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function SettingsSegmented<T extends string | number>({
  options,
  value,
  onChange,
  name,
  className,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
  name: string;
  className?: string;
}) {
  return (
    <div
      className={cn("grid grid-cols-3 gap-0.5 rounded-lg bg-secondary p-0.5", className)}
      role="radiogroup"
      aria-label={name}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-8 rounded-md text-xs font-medium transition-colors",
              selected
                ? "bg-segment-thumb text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
              "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function SettingsGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-background", className)}>
      {children}
    </div>
  );
}

export function SettingsNavRow({
  label,
  value,
  onClick,
}: {
  label: string;
  value?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 w-full items-center justify-between gap-3 border-t border-border px-3 text-left transition-colors first:border-t-0 hover:bg-foreground/[0.03] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
    >
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="flex min-w-0 items-center gap-1 text-meta text-muted-foreground">
        {value ? <span className="truncate">{value}</span> : null}
        <ChevronRight className="size-4 shrink-0" aria-hidden />
      </span>
    </button>
  );
}

export function SettingsActionRow({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-11 w-full items-center px-3 text-left text-sm font-medium text-foreground transition-colors border-t border-border first:border-t-0 hover:bg-foreground/[0.03] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
    >
      {label}
    </button>
  );
}

export function SettingsStaticRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex h-11 w-full items-center justify-between gap-3 border-t border-border px-3 first:border-t-0">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="text-meta text-muted-foreground">{value}</span>
    </div>
  );
}
