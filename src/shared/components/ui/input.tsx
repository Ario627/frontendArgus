import type { ComponentPropsWithRef } from "react";
import { cn } from "@/shared/lib/cn";

export type InputSize = "md" | "field";

const BASE_CLASSES =
  "w-full rounded-kontrol border border-garis bg-kertas px-3 text-base text-ink placeholder:text-ink-lemah disabled:cursor-not-allowed disabled:opacity-50";

const SIZE_CLASSES: Readonly<Record<InputSize, string>> = Object.freeze({
  md: "h-11",
  field: "h-13 text-md"
});

export interface InputProps extends ComponentPropsWithRef<"input"> {
  readonly inputSize?: InputSize;
  readonly invalid?: boolean;
  readonly suffix?: string;
}

export function Input({
  inputSize = "md",
  invalid = false,
  suffix,
  className,
  type = "text",
  ...rest
}: InputProps) {
  const control = (
    <input
      {...rest}
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(
        BASE_CLASSES,
        SIZE_CLASSES[inputSize],
        invalid && "border-bata",
        suffix !== undefined && "pr-12",
        className
      )}
    />
  );

  if (suffix === undefined) return control;

  return (
    <span className="relative block">
      {control}
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-sm text-ink-lemah">
        {suffix}
      </span>
    </span>
  );
}