import type { ComponentPropsWithRef } from "react";
import { cn } from "@/shared/lib/cn";

export interface CheckboxProps extends ComponentPropsWithRef<"input"> {
  readonly label: string;
}

export function Checkbox({ label, className, ...rest }: CheckboxProps) {
  return (
    <label className={cn("flex min-h-11 cursor-pointer items-center gap-3", className)}>
      <input {...rest} type="checkbox" className="size-5 shrink-0 accent-biru-tinta" />
      <span className="text-base text-ink">{label}</span>
    </label>
  );
}