import { ArrowLeft, ChevronRight } from "lucide-react";

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
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="返回"
        onClick={() => onBack(backTo)}
      >
        <ArrowLeft />
      </Button>
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>
    </div>
  );
}

export function SettingsNavRow({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-xl border border-border bg-card px-3 py-3 text-left hover:bg-accent"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground">{title}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </button>
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
    <div className="flex flex-col gap-2" role="radiogroup" aria-label={name}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left ${
              selected ? "border-primary" : "border-border"
            }`}
          >
            <span
              className={`size-3.5 shrink-0 rounded-full border-2 ${
                selected
                  ? "border-primary bg-primary shadow-[inset_0_0_0_3px_var(--card)]"
                  : "border-border"
              }`}
            />
            <span className="text-sm font-medium text-foreground">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
