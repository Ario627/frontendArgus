import { useState } from "react";
import { isApiError } from "@/api/api-error";
import { useSppgList } from "@/features/sppg/hooks/use-sppg-list";
import { SppgFormSheet } from "@/features/sppg/components/sppg-form-sheet";
import { SppgPointsSheet } from "@/features/sppg/components/sppg-points-sheet";
import { Button } from "@/shared/components/ui/button";
import { ChipButton } from "@/shared/components/ui/chip";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { SkeletonList } from "@/shared/components/ui/skeleton";
import { useDelayedLoading } from "@/shared/hooks/use-delayed-loading";
import { cn } from "@/shared/lib/cn";
import { formatInt } from "@/shared/lib/format";
import type { SppgDto } from "@/shared/types/sppg.types";

type ActiveFilter = "aktif" | "semua";

export function SppgAdminPage() {
  const [filter, setFilter] = useState<ActiveFilter>("aktif");
  const query = useSppgList(filter === "aktif");
  const showSkeleton = useDelayedLoading(query.isPending);
  const apiError = isApiError(query.error) ? query.error : null;
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SppgDto | null>(null);
  const [pointsFor, setPointsFor] = useState<SppgDto | null>(null);

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;

  return (
    <div className="flex max-w-5xl flex-col gap-5">
      <PageHeader
        title="SPPG"
        description={
          query.data === undefined
            ? "Dapur umum tempat batch dikeluarkan."
            : `${formatInt(total)} SPPG untuk filter ini.`
        }
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Tambah SPPG
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter SPPG">
        <ChipButton selected={filter === "aktif"} onClick={() => setFilter("aktif")}>
          Aktif
        </ChipButton>
        <ChipButton selected={filter === "semua"} onClick={() => setFilter("semua")}>
          Semua
        </ChipButton>
      </div>

      {showSkeleton ? <SkeletonList rows={5} /> : null}

      {query.isError ? (
        <ErrorState
          description={apiError?.message ?? "Periksa jaringan lalu coba lagi."}
          requestId={apiError?.requestId}
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {query.data !== undefined && items.length === 0 ? (
        <EmptyState
          title="Belum ada SPPG."
          description="SPPG menentukan titik awal batch dan perencanaan rute harian."
        />
      ) : null}

      {items.length > 0 ? (
        <ul className="flex flex-col">
          {items.map((sppg) => (
            <li
              key={sppg.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-garis py-3 last:border-b-0"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-base text-ink">{sppg.nama}</span>
                <span className="flex flex-wrap gap-x-3 text-xs text-ink-lemah">
                  <span className="font-mono">{sppg.publicSlug}</span>
                  <span>{formatInt(sppg.porsiPerHari)} porsi/hari</span>
                  {sppg.alamat === null ? null : <span className="truncate">{sppg.alamat}</span>}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={cn("font-mono text-xs", sppg.aktif ? "text-daun" : "text-bata")}
                >
                  {sppg.aktif ? "aktif" : "nonaktif"}
                </span>
                <Button variant="secondary" size="sm" onClick={() => setPointsFor(sppg)}>
                  Titik
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditing(sppg);
                    setFormOpen(true);
                  }}
                >
                  Ubah
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="text-xs text-ink-lemah">
        Titik penyerahan dipakai untuk mencatat observasi sisa makan per lokasi distribusi.
      </p>

      <SppgFormSheet sppg={editing} open={formOpen} onOpenChange={setFormOpen} />
      <SppgPointsSheet
        sppg={pointsFor}
        onOpenChange={(open) => {
          if (!open) setPointsFor(null);
        }}
      />
    </div>
  );
}
