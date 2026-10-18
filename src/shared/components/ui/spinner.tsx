import { cn } from "@/shared/lib/cn";

export type SpinnerSize = "xs" | "sm" | "md";

const SIZE_CLASSES: Readonly<Record<SpinnerSize, string>> = Object.freeze({
  xs: "size-3.5 border-[1.5px]",
  sm: "size-4 border-2",
  md: "size-5 border-2"
});

export interface SpinnerProps {
  readonly size?: SpinnerSize;
  readonly label?: string;
  readonly className?: string;
}

export function Spinner({ size = "sm", label, className }: SpinnerProps) {
  return (
    <span
      role={label === undefined ? undefined : "status"}
      aria-hidden={label === undefined ? true : undefined}
      className={cn(
        "inline-block shrink-0 animate-spin rounded-full border-current border-t-transparent",
        SIZE_CLASSES[size],
        className
      )}
    >
      {label === undefined ? null : <span className="sr-only">{label}</span>}
    </span>
  );
}