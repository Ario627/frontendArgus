import { SkeletonTableRow } from "./skeleton";
import { cn } from "../../../lib/cn";
import { type ReactNode, type Key, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

export interface Column<T> {
  key: string;
  header: ReactNode;
  accessor: (row: T) => ReactNode;
  width?: string;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: readonly T[] | undefined;
  loading?: boolean;
  error?: boolean;
  emptyMessage?: ReactNode;
  errorMessage?: ReactNode;
  onRetry?: () => void;
  mode?: "client" | "server";
  className?: string;
  getRowKey: (row: T) => Key;
  enableVirtualization?: boolean;
  virtualizationThreshold?: number;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  loading,
  error,
  emptyMessage = "Tidak ada data",
  errorMessage = "Gagal memuat data",
  onRetry,
  className,
  getRowKey,
  enableVirtualization = true,
  virtualizationThreshold = 100,
  onRowClick,
}: DataTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [, setScrollTop] = useState(0);

  const resolvedData = data ?? [];
  const shouldVirtualize =
    enableVirtualization && resolvedData.length > virtualizationThreshold;

  const virtualizer = useVirtualizer({
    count: resolvedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 5,
    enabled: shouldVirtualize,
  });

  const virtualRows = virtualizer.getVirtualItems();

  const headerRow = useMemo(
    () => (
      <tr className="border-b border-border bg-muted/50">
        {columns.map((col) => (
          <th
            key={col.key}
            className={cn(
              "px-4 py-3 text-left text-sm font-medium text-muted-foreground",
              col.className,
            )}
            style={col.width ? { width: col.width } : undefined}
          >
            {col.header}
          </th>
        ))}
      </tr>
    ),
    [columns],
  );

  if (loading) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-lg border border-border",
          className,
        )}
        aria-busy="true"
        aria-live="polite"
      >
        <table className="w-full">
          <thead>{headerRow}</thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonTableRow key={i} columns={columns.length} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border border-border bg-background p-8",
          className,
        )}
        role="alert"
      >
        <p className="mb-4 text-sm text-destructive">{errorMessage}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:bg-brand/90"
          >
            Coba Lagi
          </button>
        )}
      </div>
    );
  }

  if (resolvedData.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border border-border bg-background p-8",
          className,
        )}
      >
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  if (!shouldVirtualize) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-lg border border-border",
          className,
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>{headerRow}</thead>
            <tbody>
              {resolvedData.map((row) => (
                <tr
                  key={getRowKey(row)}
                  className={cn(
                    "border-b border-border transition-colors hover:bg-muted/50",
                    onRowClick && "cursor-pointer",
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn("px-4 py-3 text-sm", col.className)}
                    >
                      {col.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border",
        className,
      )}
    >
      <table className="w-full">
        <thead>{headerRow}</thead>
      </table>
      <div
        ref={parentRef}
        className="max-h-[600px] overflow-auto"
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      >
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: "100%",
            position: "relative",
          }}
        >
          <table className="w-full">
            <tbody>
              {virtualRows.map((virtualRow) => {
                const row = resolvedData[virtualRow.index];
                return (
                  <tr
                    key={getRowKey(row)}
                    className={cn(
                      "absolute w-full border-b border-border transition-colors hover:bg-muted/50",
                      onRowClick && "cursor-pointer",
                    )}
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                      height: `${virtualRow.size}px`,
                    }}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "px-4 py-3 text-sm leading-[48px]",
                          col.className,
                        )}
                      >
                        {col.accessor(row)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}