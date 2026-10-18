import type { ComponentPropsWithRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { InputSize } from "@/shared/components/ui/input";

const BASE_CLASSES =
  "h-11 w-full appearance-none rounded-kontrol border border-garis bg-kertas px-3 pr-9 text-base text-ink disabled:cursor-not-allowed disabled:opacity-50";

const SIZE_CLASSES: Readonly<Record<InputSize, string>> = Object.freeze({
  md: "h-11",
  field: "h-13 text-md"
});

export interface SelectProps extends ComponentPropsWithRef<"select"> {
  readonly selectSize?: InputSize;
  readonly invalid?: boolean;
}

export function Select({
  selectSize = "md",
  invalid = false,
  className,
  children,
  ...rest
}: SelectProps) {
  return (
    <span className="relative block">
      <select
        {...rest}
        aria-invalid={invalid || undefined}
        className={cn(BASE_CLASSES, SIZE_CLASSES[selectSize], invalid && "border-bata", className)}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        strokeWidth={1.75}
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-ink-lemah"
      />
    </span>
  );
}