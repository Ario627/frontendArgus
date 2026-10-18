import { useState } from "react";
import { isApiError } from "@/api/api-error";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { FacilityDetailSheet } from "@/features/facilities/components/facility-detail-sheet";
import { FacilityTable } from "@/features/facilities/components/facility-table";
import { useFacilityList } from "@/features/facilities/hooks/use-facility-list";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { SkeletonList } from "@/shared/components/ui/skeleton";
import { useDelayedLoading } from "@/shared/hooks/use-delayed-loading";
import { formatInt } from "@/shared/lib/format";
import type { FacilityDto } from "@/shared/types/facility.types";

export function FacilitiesPage() {
  const role = useAuthStore((state) => state.role);
  const query = useFacilityList(true);
  const showSkeleton = useDelayedLoading(query.isPending);
  const apiError = isApiError(query.error) ? query.error : null;
  const [selected, setSelected] = useState<FacilityDto | null>(null);

  const facilities = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const showVersions = role === "admin" || role === "dlh_auditor";

  return (
    <div className="flex max-w-5xl flex-col gap-5">
      <PageHeader
        title="Fasilitas"
        description={
          query.data === undefined
            ? "Daftar fasilitas penerima limpahan dan profil penerimaannya."
            : `${formatInt(total)} fasilitas aktif.`
        }
      />

      {showSkeleton ? <SkeletonList rows={8} /> : null}

      {query.isError ? (
        <ErrorState
          description={apiError?.message ?? "Periksa jaringan lalu coba lagi."}
          requestId={apiError?.requestId}
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {query.data !== undefined && facilities.length === 0 ? (
        <EmptyState
          title="Belum ada fasilitas terdaftar."
          description="Fasilitas ditambahkan admin sebelum disposisi dapat mengarahkan limpahan ke sana."
        />
      ) : null}

      {facilities.length > 0 ? <FacilityTable facilities={facilities} onOpen={setSelected} /> : null}

      <p className="text-xs text-ink-lemah">
        Profil penerimaan menentukan gerbang: kadar air, kontaminan, umur, dan kapasitas harian.
      </p>

      <FacilityDetailSheet
        facility={selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        showVersions={showVersions}
      />
    </div>
  );
}
