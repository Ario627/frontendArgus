import { cn } from "../../../lib/cn";
import { InboxIcon, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = InboxIcon,
  title = "Tidak ada data",
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" aria-hidden />
      </div>
      <h3 className="mt-4 text-sm font-medium text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

interface EmptyStateWithCTAProps extends Omit<EmptyStateProps, "action"> {
  ctaLabel: string;
  onCtaClick: () => void;
}

export function EmptyStateWithCTA({
  ctaLabel,
  onCtaClick,
  ...props
}: EmptyStateWithCTAProps) {
  return (
    <EmptyState
      {...props}
      action={
        <button
          type="button"
          onClick={onCtaClick}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {ctaLabel}
        </button>
      }
    />
  );
}