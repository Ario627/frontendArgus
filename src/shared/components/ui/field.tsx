import { useId, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export interface FieldControl {
  readonly id: string;
  readonly describedBy: string | undefined;
  readonly invalid: boolean;
  readonly required: boolean;
}

export interface FieldProps {
  readonly label: string;
  readonly hint?: string;
  readonly error?: string;
  readonly required?: boolean;
  readonly className?: string;
  readonly children: (control: FieldControl) => ReactNode;
}

export function Field({ label, hint, error, required = false, className, children }: FieldProps) {
  const id = useId();
  const hintId = hint === undefined ? undefined : `${id}-hint`;
  const errorId = error === undefined ? undefined : `${id}-error`;
  const describedBy =
    [hintId, errorId].filter((value): value is string => value !== undefined).join(" ") || undefined;
  const invalid = error !== undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required ? (
          <>
            <span aria-hidden className="text-bata">
              {" *"}
            </span>
            <span className="sr-only"> (wajib)</span>
          </>
        ) : null}
      </label>
      {hint !== undefined ? (
        <p id={hintId} className="text-xs text-ink-lemah">
          {hint}
        </p>
      ) : null}
      {children({ id, describedBy, invalid, required })}
      {error !== undefined ? (
        <p id={errorId} className="text-sm text-bata">
          {error}
        </p>
      ) : null}
    </div>
  );
}