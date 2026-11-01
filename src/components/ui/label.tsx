import * as React from "react";
import { cn } from "cn";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm font-medium text-foreground select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-60 peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
