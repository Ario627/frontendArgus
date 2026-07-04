import { cn } from "../../../lib/cn";
import { AlertCircleIcon, RefreshCwIcon } from "lucide-react";
import type { ReactNode } from "react";

interface ErrorStateProps {
  title?: string;
  message?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  isRetrying?: boolean;
  className?: string;
  variant?: "inline" | "page";
}

export function ErrorState({
  title = "Gagal memuat data",
  message = "Terjadi kesalahan saat memuat data. Silakan coba lagi.",
  onRetry,
  retryLabel = "Coba Lagi",
  isRetrying = false,
  className,
  variant = "inline",
}: ErrorStateProps) {
  const isPage = variant === "page";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        isPage ? "min-h-[400px] rounded-lg border border-border bg-background p-8" : "rounded-lg border border-destructive/20 bg-destructive/5 p-6",
        className,
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className={cn(
        "flex h-12 w-12 items-center justify-center rounded-full",
        isPage ? "bg-destructive/10" : "bg-destructive/20",
      )}>
        <AlertCircleIcon className="h-6 w-6 text-destructive" aria-hidden />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3>

      {message && (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{message}</p>
      )}

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className={cn(
            "mt-6 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "bg-brand text-brand-foreground hover:bg-brand/90",
            "disabled:pointer-events-none disabled:opacity-50",
          )}
        >
          <RefreshCwIcon
            className={cn("h-4 w-4", isRetrying && "animate-spin")}
            aria-hidden
          />
          <span>{isRetrying ? "Memuat ulang..." : retryLabel}</span>
        </button>
      )}
    </div>
  );
}

interface NetworkErrorProps extends Omit<ErrorStateProps, "title" | "message"> {
  onRetry: () => void;
}

export function NetworkError(props: NetworkErrorProps) {
  return (
    <ErrorState
      {...props}
      title="Tidak dapat terhubung ke server"
      message="Periksa koneksi internet Anda dan coba lagi."
    />
  );
}

interface ForbiddenErrorProps {
  className?: string;
}

export function ForbiddenError({ className }: ForbiddenErrorProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-border bg-background p-8 text-center",
        className,
      )}
      role="alert"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-status-offline/10">
        <AlertCircleIcon className="h-6 w-6 text-status-offline" aria-hidden />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-foreground">Akses Ditolak</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Anda tidak memiliki izin untuk mengakses halaman ini. Hubungi administrator jika ini adalah kesalahan.
      </p>
    </div>
  );
}