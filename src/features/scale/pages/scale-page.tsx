import { useState } from "react";
import { isApiError } from "@/api/api-error";
import { LinkScaleSheet } from "@/features/scale/components/link-scale-sheet";
import { ScalePendingTable } from "@/features/scale/components/scale-pending-table";
import { useScalePending } from "@/features/scale/hooks/use-scale-pending";
import { useSppgList } from "@/features/sppg/hooks/use-sppg-list";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { SkeletonList } from "@/shared/components/ui/skeleton";
import { useDelayedLoading } from "@/shared/hooks/use-delayed-loading";
import { formatInt } from "@/shared/lib/format";
import type { ScalePendingDto } from "@/shared/types/scale.types";

export function ScalePendingPage({ variant = "console" }: { readonly variant?: "console" | "field" }) {
  const query = useScalePending();
  const sppgList = useSppgList();
  const showSkeleton = useDelayedLoading(query.isPending);
  const apiError = isApiError(query.error) ? query.error : null;
  const [selected, setSelected] = useState<ScalePendingDto | null>(null);

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const sppgNames = new Map(
    (sppgList.data?.items ?? []).map((sppg) => [sppg.id, sppg.nama] as const)
  );

  return (
    <div className={variant === "console" ? "flex max-w-4xl flex-col gap-5" : "flex flex-col gap-4"}>
      <PageHeader
        title="Timbangan"
        description={
          query.data === undefined
            ? "Bacaan timbangan SPPG yang menunggu ditautkan ke batch."
            : `${formatInt(total)} bacaan menunggu tindakan.`
        }
      />

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
          title="Tidak ada bacaan menunggu."
          description="Bacaan muncul di sini setelah timbangan mengirim berat lewat MQTT. Data kedaluwarsa ditandai merah dan tidak bisa ditautkan."
        />
      ) : null}

      {items.length > 0 ? (
        <ScalePendingTable items={items} sppgNames={sppgNames} onLink={setSelected} />
      ) : null}

      <p className="text-xs text-ink-lemah">
        Penautan menulis bukti DITIMBANG ke buku besar batch: berat, waktu, dan identitas
        timbangan. Bacaan yang sama tidak bisa dipakai dua kali.
      </p>

      <LinkScaleSheet
        pending={selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
}
