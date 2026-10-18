import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export interface EmptyStateProps {
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
  readonly className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-start gap-2 py-10", className)}>
      <p className="text-md font-medium text-ink">{title}</p>
      {description === undefined ? null : (
        <p className="max-w-prose text-sm text-ink-lemah">{description}</p>
      )}
      {action === undefined ? null : <div className="mt-2">{action}</div>}
    </div>
  );
}