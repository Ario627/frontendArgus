import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  readonly children: ReactNode;
}

interface State {
  readonly hasError: boolean;
  readonly retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true, retryCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(
      "[ErrorBoundary] Uncaught error:",
      error.message,
      errorInfo.componentStack,
    );
  }

  private handleRetry = (): void => {
    this.setState((prev) => ({
      hasError: prev.retryCount >= 2,
      retryCount: prev.retryCount + 1,
    }));
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const exhausted = this.state.retryCount >= 3;

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md rounded-lg border border-border bg-muted p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--destructive)/0.1)]">
            <span className="text-xl text-destructive">!</span>
          </div>
          <h1 className="mb-2 text-lg font-semibold text-foreground">
            Terjadi kesalahan tidak terduga
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            {exhausted
              ? "Percobaan pemulihan berulang kali gagal. Muat ulang halaman untuk melanjutkan."
              : "Sebagian halaman gagal dimuat. Coba muat ulang konten tanpa kehilangan sesi Anda."}
          </p>
          <div className="flex flex-col gap-2">
            {!exhausted && (
              <button
                type="button"
                onClick={this.handleRetry}
                className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
              >
                Coba lagi
              </button>
            )}
            <button
              type="button"
              onClick={this.handleReload}
              className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Muat ulang halaman
            </button>
          </div>
        </div>
      </div>
    );
  }
}