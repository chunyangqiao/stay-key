import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "cn";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-background px-2.5 text-base text-foreground transition-[border-color,background-color] duration-[var(--dur-micro)] placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-[-1px] focus-visible:outline-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-secondary disabled:opacity-60 aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
