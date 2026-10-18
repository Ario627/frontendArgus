import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/components/ui/button";

export interface ErrorStateProps {
  readonly title?: string;
  readonly description?: string;
  readonly requestId?: string | null;
  readonly onRetry?: () => void;
  readonly className?: string;
}

export function ErrorState({
  title = "Data tidak dapat dimuat",
  description = "Periksa jaringan lalu coba lagi.",
  requestId,
  onRetry,
  className
}: ErrorStateProps) {
  const code = requestId ?? null;

  return (
    <div role="alert" className={cn("flex flex-col items-start gap-2 py-8", className)}>
      <p className="text-md font-medium text-ink">{title}</p>
      <p className="max-w-prose text-sm text-ink-lemah">{description}</p>
      {onRetry === undefined ? null : (
        <Button variant="secondary" onClick={onRetry} className="mt-2">
          Coba lagi
        </Button>
      )}
      {code === null || code === "" ? null : (
        <p className="mt-1 font-mono text-xs text-ink-lemah">
          Sertakan kode ini saat melapor: {code}
        </p>
      )}
    </div>
  );
}