import type { ComponentPropsWithRef } from "react";
import { cn } from "@/shared/lib/cn";

const BASE_CLASSES =
  "min-h-24 w-full resize-y rounded-kontrol border border-garis bg-kertas px-3 py-2.5 text-base text-ink placeholder:text-ink-lemah disabled:cursor-not-allowed disabled:opacity-50";

export interface TextareaProps extends ComponentPropsWithRef<"textarea"> {
  readonly invalid?: boolean;
}

export function Textarea({ invalid = false, className, rows = 4, ...rest }: TextareaProps) {
  return (
    <textarea
      {...rest}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(BASE_CLASSES, invalid && "border-bata", className)}
    />
  );
}