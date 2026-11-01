import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg whitespace-nowrap text-sm font-medium select-none transition-[background-color,color,border-color,box-shadow,transform] duration-[var(--dur-micro)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-px motion-reduce:transition-none motion-reduce:active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 aria-invalid:outline-2 aria-invalid:outline-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-secondary disabled:text-muted-foreground disabled:opacity-100",
        outline: "border border-input bg-background text-foreground hover:bg-secondary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-foreground/[0.07]",
        ghost: "text-foreground hover:bg-foreground/[0.05]",
        quiet: "text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground",
        destructive: "text-destructive hover:bg-destructive/[0.08]",
        link: "text-primary-ink underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-2.5",
        xs: "h-6 px-1.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        row: "h-8 px-1.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        lg: "h-9 px-3 text-sm",
        icon: "size-8",
        "icon-sm": "size-7",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
