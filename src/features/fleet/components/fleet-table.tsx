import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Ban } from "lucide-react";
import {
  DataTable,
  type Column,
} from "../../../shared/components/ui/data-table";
import { StatusBadge } from "../../../shared/components/ui/status-badge";
import { Button } from "../../../shared/components/ui/button";
import { EmptyState } from "../../../shared/components/feedback/empty-state";
import { useDelayedLoading } from "../../../shared/hooks/use-delayed-loading";
import { useAuthStore } from "../../auth/store/auth.store";
import { cn } from "../../../lib/cn";
import type { Fleet } from "../../../shared/types/fleet.types";

interface FleetTableProps {
  data: readonly Fleet[] | undefined;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  onEdit: (fleet: Fleet) => void;
  onDelete: (fleet: Fleet) => void;
  onRevokeDevice: (fleet: Fleet) => void;
}

function maskContact(contact: string | null): string {
  if (!contact) return "—";
  if (contact.length <= 4) return "****";
  if (contact.length <= 8) {
    return contact.slice(0, 2) + "****";
  }
  return contact.slice(0, 2) + "****" + contact.slice(-4);
}


function FleetRowActions({
  fleet,
  canModify,
  onEdit,
  onDelete,
  onRevokeDevice,
}: {
  fleet: Fleet;
  canModify: boolean;
  onEdit: (fleet: Fleet) => void;
  onDelete: (fleet: Fleet) => void;
  onRevokeDevice: (fleet: Fleet) => void;
}) {
  if (!canModify) return null;

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(fleet);
        }}
        aria-label="Edit armada"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      {fleet.deviceRevokedAt === null && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onRevokeDevice(fleet);
          }}
          aria-label="Cabut perangkat"
          title="Cabut perangkat"
        >
          <Ban className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(fleet);
        }}
        aria-label="Hapus armada"
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

const MemoizedRowActions = memo(FleetRowActions, (prev, next) => {
  return (
    prev.fleet.id === next.fleet.id &&
    prev.fleet.deviceRevokedAt === next.fleet.deviceRevokedAt &&
    prev.canModify === next.canModify &&
    prev.onEdit === next.onEdit &&
    prev.onDelete === next.onDelete &&
    prev.onRevokeDevice === next.onRevokeDevice
  );
});

export function FleetTable({
  data,
  loading,
  error,
  onRetry,
  onEdit,
  onDelete,
  onRevokeDevice,
}: FleetTableProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const showSkeleton = useDelayedLoading(loading);
  const canModify = user?.role === "admin";

  const columns = useMemo<Column<Fleet>[]>(
    () => [
      {
        key: "plateNumber",
        header: "Plat Nomor",
        accessor: (row) => (
          <span className="font-medium">{row.plateNumber}</span>
        ),
        width: "120px",
      },
      {
        key: "driverName",
        header: "Sopir",
        accessor: (row) => row.driverName ?? "—",
        width: "160px",
      },
      {
        key: "driverContact",
        header: "Kontak",
        accessor: (row) => (
          <span className="text-muted-foreground">
            {maskContact(row.driverContact)}
          </span>
        ),
        width: "140px",
      },
      {
        key: "capacityKg",
        header: "Kapasitas",
        accessor: (row) => `${row.capacityKg.toLocaleString("id-ID")} kg`,
        width: "120px",
      },
      {
        key: "operationalStatus",
        header: "Status",
        accessor: (row) => (
          <StatusBadge status={row.operationalStatus} size="sm" />
        ),
        width: "140px",
      },
      {
        key: "hardwareStatus",
        header: "Hardware",
        accessor: (row) => (
          <StatusBadge type="hardware" status={row.statusHardware} size="sm" />
        ),
        width: "120px",
      },
      {
        key: "actions",
        header: "Aksi",
        accessor: (row) => (
          <MemoizedRowActions
            fleet={row}
            canModify={canModify}
            onEdit={onEdit}
            onDelete={onDelete}
            onRevokeDevice={onRevokeDevice}
          />
        ),
        width: "120px",
        className: "text-right",
      },
    ],
    [canModify, onEdit, onDelete, onRevokeDevice],
  );

  if (error) {
    return (
      <EmptyState
        title="Gagal memuat data armada"
        description="Terjadi kesalahan saat memuat daftar armada."
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
        canModify ? "Belum ada armada terdaftar." : "Belum ada data armada."
      }
      getRowKey={(row) => row.id}
      onRowClick={(row) => navigate(`/fleet/${row.id}`)}
      className="w-full"
    />
  );
}