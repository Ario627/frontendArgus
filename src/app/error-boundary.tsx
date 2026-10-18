import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link, useRouteError } from "react-router";
import { isApiError } from "@/api/api-error";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { logError } from "@/shared/lib/logger";

interface BoundaryProps {
  readonly children: ReactNode;
}

interface BoundaryState {
  readonly failed: boolean;
}

export class AppErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  override state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  override componentDidCatch(error: unknown, info: ErrorInfo): void {
    logError("boundary", error instanceof Error ? error.message : "non-error", {
      componentStack: info.componentStack ?? ""
    });
  }

  override render(): ReactNode {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10">
        <ErrorState
          title="Aplikasi tidak dapat dimuat"
          description="Muat ulang halaman. Bila tetap gagal, laporkan ke admin."
          onRetry={() => window.location.reload()}
        />
      </main>
    );
  }
}

export function RouteError() {
  const error = useRouteError();
  const apiError = isApiError(error) ? error : null;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10">
      <ErrorState
        title="Halaman tidak dapat dimuat"
        description={apiError?.message ?? "Terjadi kesalahan saat memuat halaman ini."}
        requestId={apiError?.requestId}
        onRetry={() => window.location.reload()}
      />
      <div className="mt-4">
        <Link to="/" className="text-sm text-biru-tinta underline underline-offset-2">
          Kembali ke beranda
        </Link>
      </div>
    </main>
  );
}