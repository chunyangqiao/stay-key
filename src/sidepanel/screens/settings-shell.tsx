import type { ReactNode } from "react";
import { ArrowLeft, ChevronRight, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { AppScreen } from "@/shared/session-store";

export function SettingsHeader({
  title,
  backTo,
  onBack,
}: {
  title: string;
  backTo: AppScreen;
  onBack: (screen: AppScreen) => void;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border pb-2">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8"
        aria-label="返回"
        onClick={() => onBack(backTo)}
      >
        <ArrowLeft />
      </Button>
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
    </div>
  );
}

export function SettingsSectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-xs font-medium tracking-wide text-muted-foreground">{children}</p>;
}

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
    <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.title}
            type="button"
            onClick={item.onClick}
            className="flex min-h-11 w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-accent"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-foreground">{item.title}</span>
              <span className="block text-xs text-muted-foreground">{item.description}</span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </button>
        );
      })}
    </div>
  );
}

export function SettingsOptionList<T extends string | number>({
  options,
  value,
  onChange,
  name,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
  name: string;
}) {
  return (
    <div
      className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card"
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
            className={`flex w-full items-center gap-2.5 border-0 px-3 py-2 text-left outline-none ${
              selected
                ? "bg-[color-mix(in_oklab,var(--primary)_10%,transparent)]"
                : "bg-transparent hover:bg-accent"
            }`}
          >
            <span
              aria-hidden
              className={`size-3.5 shrink-0 rounded-full border-2 ${
                selected
                  ? "border-primary bg-primary shadow-[inset_0_0_0_3px_var(--card)]"
                  : "border-border bg-transparent"
              }`}
            />
            <span className="text-sm font-medium text-foreground">{option.label}</span>
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
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
  name: string;
}) {
  return (
    <div
      className="grid w-full grid-cols-3 divide-x divide-border overflow-hidden rounded-xl border border-border bg-card"
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
            className={`border-0 px-2 py-2 text-center text-sm font-medium outline-none ${
              selected
                ? "bg-[color-mix(in_oklab,var(--primary)_10%,transparent)] text-foreground"
                : "bg-transparent text-muted-foreground hover:bg-accent"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
