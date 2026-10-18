import type { ComponentPropsWithRef } from "react";
import { cn } from "@/shared/lib/cn";

const CHIP_BASE_CLASSES =
  "inline-flex items-center rounded-full border px-2.5 font-mono text-xs whitespace-nowrap";

export interface ChipProps extends ComponentPropsWithRef<"span"> {}

export function Chip({ className, ...rest }: ChipProps) {
  return <span {...rest} className={cn(CHIP_BASE_CLASSES, "h-7 border-garis text-ink", className)} />;
}

export interface ChipButtonProps extends ComponentPropsWithRef<"button"> {
  readonly selected?: boolean;
}

export function ChipButton({
  selected = false,
  className,
  type = "button",
  ...rest
}: ChipButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      aria-pressed={selected}
      className={cn(
        CHIP_BASE_CLASSES,
        "h-7 transition-colors duration-150 ease-out pointer-coarse:h-11 pointer-coarse:px-4",
        selected
          ? "border-ink bg-ink text-kertas"
          : "border-garis bg-kertas text-ink hover:border-ink-lemah",
        className
      )}
    />
  );
}