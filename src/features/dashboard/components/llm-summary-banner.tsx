import { cn } from "../../../lib/cn";
import { SparklesIcon, InfoIcon } from "lucide-react";
import { Skeleton } from "../../../shared/components/ui/skeleton";
import { useDelayedLoading } from "../../../shared/hooks/use-delayed-loading";

interface LlmSummaryBannerProps {
  llmSummary: string | null;
  generatedAt: string | null;
  isLoading: boolean;
  className?: string;
}

function formatGeneratedAt(isoTimestamp: string | null): string {
  if (!isoTimestamp) return "";
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  }).format(date);
}

export function LlmSummaryBanner({
  llmSummary,
  generatedAt,
  isLoading,
  className,
}: LlmSummaryBannerProps) {
  const showSkeleton = useDelayedLoading(isLoading);

  if (showSkeleton) {
    return (
      <div
        className={cn(
          "rounded-xl border border-border bg-card p-5 shadow-sm",
          className,
        )}
        aria-busy="true"
        aria-live="polite"
      >
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-6 w-6 rounded-md" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-5/6" />
        <Skeleton className="mt-2 h-4 w-4/6" />
      </div>
    );
  }

  if (!llmSummary) {
    return (
      <div
        className={cn(
          "flex items-start gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-5",
          className,
        )}
        role="status"
        aria-live="polite"
      >
        <InfoIcon
          className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <div>
          <p className="text-sm font-medium text-foreground">
            Ringkasan naratif tidak tersedia saat ini
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Data operasional tetap ditampilkan secara lengkap di bawah ini.
          </p>
        </div>
      </div>
    );
  }

  const formattedTime = formatGeneratedAt(generatedAt);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-brand/15 bg-linear-to-br from-brand-soft via-card to-card p-5 shadow-sm",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div
        className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand/5 blur-3xl"
        aria-hidden
      />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-brand/10 text-brand">
              <SparklesIcon className="h-4 w-4" aria-hidden />
            </span>
            <p className="text-sm font-semibold text-foreground">
              Ringkasan Operasional
            </p>
          </div>
          {formattedTime && (
            <span className="text-xs font-medium tabular-nums text-muted-foreground">
              Diperbarui {formattedTime}
            </span>
          )}
        </div>
        <p className="mt-4 text-sm leading-7 text-foreground/90">
          {llmSummary}
        </p>
      </div>
    </div>
  );
}
