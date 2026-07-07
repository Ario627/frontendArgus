import { memo, useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { DataTable, type Column } from "../../../shared/components/ui/data-table";
import type { SkippedDestination } from "../../../shared/types/optimization.types";

interface SkippedDestinationsListProps {
  skipped: readonly SkippedDestination[] | undefined;
}

const REASON_LABELS: Readonly<Record<string, string>> = Object.freeze({
  low_volume: "Volume rendah",
  capacity_exceeded: "Kapasitas tidak cukup",
  time_window: "Di luar jendela waktu",
});

function getReasonLabel(reason: string): string {
  return REASON_LABELS[reason] ?? reason;
}

function SkippedDestinationsListInner({
  skipped,
}: SkippedDestinationsListProps) {
  const columns = useMemo<Column<SkippedDestination>[]>(
    () => [
      {
        key: "destId",
        header: "Destinasi",
        accessor: (row) => (
          <span className="font-medium">{row.destId}</span>
        ),
        width: "200px",
      },
      {
        key: "reason",
        header: "Alasan Skip",
        accessor: (row) => (
          <span className="inline-flex items-center gap-1.5 text-amber-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            {getReasonLabel(row.reason)}
          </span>
        ),
        width: "200px",
      },
    ],
    [],
  );

  if (!skipped || skipped.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">
        Destinasi Dilewati ({skipped.length})
      </h3>
      <DataTable
        columns={columns}
        data={skipped}
        emptyMessage="Tidak ada destinasi dilewati"
        getRowKey={(row) => row.destId}
      />
    </div>
  );
}

export const SkippedDestinationsList = memo(SkippedDestinationsListInner);