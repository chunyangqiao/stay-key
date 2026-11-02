import * as React from "react";

import { cn } from "@/shared/utils";
import { MASTER_PIN_LENGTH, sanitizeMasterPinInput } from "@/shared/constants";

export type MasterPinOtpProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  "aria-label"?: string;
  /** Enter when all 6 filled (user keypress only; never fires on fill alone). */
  onEnterSubmit?: () => void;
  /** Fires once when input reaches MASTER_PIN_LENGTH via typing/paste. */
  onComplete?: (value: string) => void;
  className?: string;
};

function digitAt(value: string, index: number): string {
  return value[index] ?? "";
}

/** Contiguous digit string: set/replace one index, or delete at index (no holes). */
function mutateDigit(value: string, index: number, digit: string): string {
  const current = sanitizeMasterPinInput(value);
  if (digit === "") {
    return current.slice(0, index) + current.slice(index + 1);
  }
  if (index >= current.length) {
    return sanitizeMasterPinInput(current + digit);
  }
  return sanitizeMasterPinInput(current.slice(0, index) + digit + current.slice(index + 1));
}

export function MasterPinOtp({
  id = "master-pin-otp",
  value,
  onChange,
  disabled = false,
  invalid = false,
  autoFocus = false,
  "aria-label": ariaLabel = "主密码",
  onEnterSubmit,
  onComplete,
  className,
}: MasterPinOtpProps) {
  const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);
  const onCompleteRef = React.useRef<MasterPinOtpProps["onComplete"]>(onComplete);
  const lastCompletedRef = React.useRef<string | undefined>(undefined);
  const sanitized = sanitizeMasterPinInput(value);

  React.useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  React.useEffect(() => {
    if (sanitized.length === 0) {
      lastCompletedRef.current = undefined;
      if (autoFocus && !disabled) {
        requestAnimationFrame(() => focusIndex(0));
      }
    }
  }, [sanitized, autoFocus, disabled]);

  function focusIndex(index: number) {
    const clamped = Math.max(0, Math.min(MASTER_PIN_LENGTH - 1, index));
    const node = inputsRef.current[clamped];
    node?.focus();
    node?.select();
  }

  function commit(next: string, focusAt?: number) {
    const cleaned = sanitizeMasterPinInput(next);
    onChange(cleaned);
    if (
      cleaned.length === MASTER_PIN_LENGTH &&
      cleaned !== lastCompletedRef.current &&
      onCompleteRef.current
    ) {
      lastCompletedRef.current = cleaned;
      onCompleteRef.current(cleaned);
    }
    if (focusAt !== undefined) {
      requestAnimationFrame(() => focusIndex(focusAt));
    }
  }

  function handleChange(index: number, raw: string) {
    if (disabled) {
      return;
    }
    const digitsOnly = raw.replace(/\D/g, "");
    if (digitsOnly.length === 0) {
      commit(mutateDigit(sanitized, index, ""), index);
      return;
    }

    if (digitsOnly.length > 1) {
      const merged = sanitizeMasterPinInput(sanitized.slice(0, index) + digitsOnly);
      const nextFocus = Math.min(Math.max(merged.length - 1, index), MASTER_PIN_LENGTH - 1);
      commit(merged, nextFocus);
      return;
    }

    const nextValue = mutateDigit(sanitized, index, digitsOnly);
    const nextFocus =
      nextValue.length >= MASTER_PIN_LENGTH
        ? MASTER_PIN_LENGTH - 1
        : Math.min(Math.max(index + 1, nextValue.length), MASTER_PIN_LENGTH - 1);
    commit(nextValue, nextFocus);
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (disabled) {
      return;
    }

    if (event.key === "Enter") {
      if (sanitized.length === MASTER_PIN_LENGTH && onEnterSubmit) {
        event.preventDefault();
        onEnterSubmit();
      }
      return;
    }

    if (event.key === "Backspace") {
      event.preventDefault();
      if (digitAt(sanitized, index)) {
        commit(mutateDigit(sanitized, index, ""), index);
      } else if (index > 0) {
        commit(mutateDigit(sanitized, index - 1, ""), index - 1);
      }
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusIndex(index - 1);
      return;
    }

    if (event.key === "ArrowRight" && index < MASTER_PIN_LENGTH - 1) {
      event.preventDefault();
      focusIndex(index + 1);
      return;
    }

    if (event.key.length === 1 && !/\d/.test(event.key) && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
    }
  }

  function handlePaste(index: number, event: React.ClipboardEvent<HTMLInputElement>) {
    if (disabled) {
      return;
    }
    event.preventDefault();
    const pasted = sanitizeMasterPinInput(event.clipboardData.getData("text"));
    if (!pasted) {
      return;
    }
    const merged =
      index === 0 || pasted.length >= MASTER_PIN_LENGTH
        ? pasted
        : sanitizeMasterPinInput(sanitized.slice(0, index) + pasted);
    commit(merged, Math.min(Math.max(merged.length - 1, 0), MASTER_PIN_LENGTH - 1));
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      aria-invalid={invalid || undefined}
      className={cn("grid grid-cols-6 gap-2.5", className)}
    >
      {Array.from({ length: MASTER_PIN_LENGTH }, (_, index) => (
        <input
          key={index}
          ref={(node) => {
            inputsRef.current[index] = node;
          }}
          id={index === 0 ? id : `${id}-${index}`}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={1}
          value={digitAt(sanitized, index)}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          aria-label={`${ariaLabel} 第 ${index + 1} 位`}
          aria-invalid={invalid || undefined}
          className={cn(
            "h-12 w-full min-w-0 appearance-none rounded-lg border bg-background text-center text-lg font-medium tabular-nums text-foreground transition-colors",
            "focus-visible:outline-2 focus-visible:outline-offset-[-1px]",
            "disabled:cursor-not-allowed disabled:opacity-45 disabled:bg-secondary disabled:text-muted-foreground",
            invalid
              ? "border-destructive focus-visible:border-destructive focus-visible:outline-destructive"
              : "border-input focus-visible:border-primary focus-visible:outline-ring",
          )}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          onFocus={(event) => event.target.select()}
        />
      ))}
    </div>
  );
}
