import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, Ref } from "react";
import { cn } from "../../../lib/cn";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap border border-border text-sm font-medium uppercase tracking-wide transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 active:opacity-80",
  {
    variants: {
      variant: {
        default:
          "border-brand bg-brand text-brand-foreground hover:bg-brand/90 hover:border-brand",
        destructive:
          "border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:border-destructive",
        outline:
          "border-border bg-transparent text-foreground hover:border-foreground hover:bg-muted",
        secondary:
          "border-border bg-muted text-foreground hover:bg-muted/70",
        ghost: "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
        link: "border-transparent text-brand underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ref,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...(!asChild && { disabled: disabled ?? loading })}
      {...props}
    >
      {loading && !asChild ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      ) : (
        children
      )}
    </Comp>
  );
}

