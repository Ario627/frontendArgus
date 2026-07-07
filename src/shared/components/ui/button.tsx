import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, Ref } from "react";
import { cn } from "../../../lib/cn";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-brand text-brand-foreground shadow-sm shadow-brand/20 hover:bg-brand/90 hover:shadow-md hover:shadow-brand/25",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm shadow-destructive/15 hover:bg-destructive/90 hover:shadow-md hover:shadow-destructive/20",
        outline:
          "border border-border bg-card/50 text-foreground hover:border-brand/40 hover:bg-brand-soft/60 hover:text-brand",
        secondary:
          "bg-muted text-foreground hover:bg-muted/80",
        ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
        link: "text-brand underline-offset-4 hover:underline",
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

