import { memo, useMemo } from "react";
import { Pencil, Trash2, MapPin } from "lucide-react";
import { DataTable, type Column } from "../../../shared/components/ui/data-table";
import { Button } from "../../../shared/components/ui/button";
import { EmptyState } from "../../../shared/components/feedback/empty-state";
import { useDelayedLoading } from "../../../shared/hooks/use-delayed-loading";
import { useAuthStore } from "../../auth/store/auth.store";
import type { Destination } from "../../../shared/types/destination.types";
import type { DestinationType } from "../../../shared/types/common.types";
import { cn } from "../../../lib/cn";

interface DestinationTableProps {
  data: readonly Destination[] | undefined;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  onEdit: (destination: Destination) => void;
  onDelete: (destination: Destination) => void;
}

const DESTINATION_TYPE_LABELS: Readonly<Record<DestinationType, string>> = Object.freeze({
  TPA: "TPA",
  RDF: "RDF",
  TPS_3R: "TPS 3R",
});

const DESTINATION_TYPE_BADGE_CLASSES: Readonly<Record<DestinationType, string>> = Object.freeze({
  TPA: "bg-blue-100 text-blue-700",
  RDF: "bg-green-100 text-green-700",
  TPS_3R: "bg-purple-100 text-purple-700",
});

function DestinationTypeBadge({ type }: { type: DestinationType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        DESTINATION_TYPE_BADGE_CLASSES[type],
      )}
    >
      {DESTINATION_TYPE_LABELS[type]}
    </span>
  );
}


function DestinationRowActions({
  destination,
  canModify,
  onEdit,
  onDelete,
}: {
  destination: Destination;
  canModify: boolean;
  onEdit: (destination: Destination) => void;
  onDelete: (destination: Destination) => void;
}) {
  if (!canModify) return null;

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(destination);
        }}
        aria-label="Edit destinasi"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(destination);
        }}
        aria-label="Hapus destinasi"
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

const MemoizedRowActions = memo(DestinationRowActions, (prev, next) => {
  return (
    prev.destination.id === next.destination.id &&
    prev.canModify === next.canModify &&
    prev.onEdit === next.onEdit &&
    prev.onDelete === next.onDelete
  );
});

function formatCoordinate(value: number): string {
  return value.toFixed(6);
}

export function DestinationTable({
  data,
  loading,
  error,
  onRetry,
  onEdit,
  onDelete,
}: DestinationTableProps) {
  const user = useAuthStore((s) => s.user);
  const showSkeleton = useDelayedLoading(loading);
  const canModify = user?.role === "admin";

  const columns = useMemo<Column<Destination>[]>(
    () => [
      {
        key: "name",
        header: "Nama",
        accessor: (row) => (
          <span className="font-medium">{row.name}</span>
        ),
        width: "200px",
      },
      {
        key: "type",
        header: "Tipe",
        accessor: (row) => <DestinationTypeBadge type={row.type} />,
        width: "100px",
      },
      {
        key: "coordinates",
        header: "Koordinat",
        accessor: (row) => (
          <span className="font-mono text-xs text-muted-foreground">
            <MapPin className="mr-1 inline h-3 w-3" aria-hidden />
            {formatCoordinate(row.latitude)}, {formatCoordinate(row.longitude)}
          </span>
        ),
        width: "200px",
      },
      {
        key: "capacityKg",
        header: "Kapasitas",
        accessor: (row) => `${row.capacityKg.toLocaleString("id-ID")} kg`,
        width: "120px",
      },
      {
        key: "priority",
        header: "Prioritas",
        accessor: (row) => (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
            {row.priority}
          </span>
        ),
        width: "100px",
      },
      {
        key: "lowVolumeFlag",
        header: "Volume",
        accessor: (row) => (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              row.lowVolumeFlag
                ? "bg-status-stale/20 text-status-stale"
                : "bg-status-normal/20 text-status-normal",
            )}
          >
            {row.lowVolumeFlag ? "Rendah" : "Normal"}
          </span>
        ),
        width: "100px",
      },
      {
        key: "actions",
        header: "Aksi",
        accessor: (row) => (
          <MemoizedRowActions
            destination={row}
            canModify={canModify}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ),
        width: "100px",
        className: "text-right",
      },
    ],
    [canModify, onEdit, onDelete],
  );

  if (error) {
    return (
      <EmptyState
        title="Gagal memuat data destinasi"
        description="Terjadi kesalahan saat memuat daftar destinasi."
        action={
          <Button variant="outline" onClick={onRetry}>
            Coba Lagi
          </Button>
        }
      />
    );
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={showSkeleton}
      error={false}
      emptyMessage={
        canModify ? "Belum ada destinasi terdaftar." : "Belum ada data destinasi."
      }
      getRowKey={(row) => row.id}
      className="w-full"
    />
  );
}
