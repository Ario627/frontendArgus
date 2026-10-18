import { useMemo, useState } from "react";
import { isApiError } from "@/api/api-error";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { FleetDetailSheet } from "@/features/fleet/components/fleet-detail-sheet";
import { FleetFormSheet } from "@/features/fleet/components/fleet-form-sheet";
import { FleetMapPanel } from "@/features/fleet/components/fleet-map-panel";
import { FleetTable } from "@/features/fleet/components/fleet-table";
import { useFleetList, type FleetFilterState } from "@/features/fleet/hooks/use-fleet-list";
import { isAttentionStatus } from "@/features/fleet/liveness";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Button } from "@/shared/components/ui/button";
import { Select } from "@/shared/components/ui/select";
import { SkeletonList } from "@/shared/components/ui/skeleton";
import { FLEET_STATUSES, FLEET_STATUS_LABELS, type FleetStatus } from "@/shared/constants/fleet.constant";
import { useDelayedLoading } from "@/shared/hooks/use-delayed-loading";
import { formatInt } from "@/shared/lib/format";
import type { FleetDto } from "@/shared/types/fleet.types";

export function FleetPage() {
  const role = useAuthStore((state) => state.role);
  const [statusFilter, setStatusFilter] = useState<FleetStatus | "">("");
  const [selected, setSelected] = useState<FleetDto | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FleetDto | null>(null);

  const filters: FleetFilterState = statusFilter === "" ? {} : { status: statusFilter };
  const query = useFleetList(filters);
  const showSkeleton = useDelayedLoading(query.isPending);
  const apiError = isApiError(query.error) ? query.error : null;
  const canEdit = role === "admin";

  const fleets = useMemo(() => query.data?.items ?? [], [query.data]);
  const attentionCount = useMemo(
    () => fleets.filter((fleet) => isAttentionStatus(fleet.statusOperasional)).length,
    [fleets]
  );

  return (
    <div className="flex max-w-5xl flex-col gap-5">
      <PageHeader
        title="Armada"
        description={
          query.data === undefined
            ? "Status perangkat dan posisi terakhir."
            : attentionCount === 0
              ? `${formatInt(fleets.length)} armada, semua melapor normal.`
              : `${formatInt(fleets.length)} armada · ${formatInt(attentionCount)} perlu perhatian.`
        }
        actions={
          <div className="flex items-center gap-2">
            <Select
              aria-label="Filter status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as FleetStatus | "")}
              className="w-48"
            >
              <option value="">Semua status</option>
              {FLEET_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {FLEET_STATUS_LABELS[status]}
                </option>
              ))}
            </Select>
            {canEdit ? (
              <Button
                size="sm"
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                Tambah
              </Button>
            ) : null}
          </div>
        }
      />

      {showSkeleton ? <SkeletonList rows={6} /> : null}

      {query.isError ? (
        <ErrorState
          description={apiError?.message ?? "Periksa jaringan lalu coba lagi."}
          requestId={apiError?.requestId}
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {query.data !== undefined && fleets.length === 0 ? (
        statusFilter === "" ? (
          <EmptyState
            title="Belum ada armada terdaftar."
            description="Armada ditambahkan admin dari konsol sebelum rute dapat direncanakan."
          />
        ) : (
          <EmptyState
            title="Tidak ada armada dengan status ini."
            action={
              <Button variant="secondary" size="sm" onClick={() => setStatusFilter("")}>
                Hapus filter
              </Button>
            }
          />
        )
      ) : null}

      {fleets.length > 0 ? (
        <>
          <FleetMapPanel fleets={fleets} />
          <FleetTable fleets={fleets} onOpen={setSelected} />
        </>
      ) : null}

      <FleetDetailSheet
        fleet={selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        onEdit={
          canEdit
            ? () => {
                setEditing(selected);
                setFormOpen(true);
              }
            : undefined
        }
      />

      <FleetFormSheet
        fleet={editing}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
      />
    </div>
  );
}