import { useState } from "react";
import { isApiError } from "@/api/api-error";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { CreateDeviceSheet } from "@/features/devices/components/create-device-sheet";
import { DeviceDetailSheet } from "@/features/devices/components/device-detail-sheet";
import { DeviceTable } from "@/features/devices/components/device-table";
import { useDeviceList } from "@/features/devices/hooks/use-device-list";
import { LinkScaleSheet } from "@/features/scale/components/link-scale-sheet";
import { ScalePendingTable } from "@/features/scale/components/scale-pending-table";
import { useScalePending } from "@/features/scale/hooks/use-scale-pending";
import { useSppgList } from "@/features/sppg/hooks/use-sppg-list";
import { Button } from "@/shared/components/ui/button";
import { ChipButton } from "@/shared/components/ui/chip";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { SkeletonList } from "@/shared/components/ui/skeleton";
import { useDelayedLoading } from "@/shared/hooks/use-delayed-loading";
import { formatInt } from "@/shared/lib/format";
import type { DeviceDto } from "@/shared/types/device.types";
import type { ScalePendingDto } from "@/shared/types/scale.types";

type RevokedFilter = "aktif" | "dicabut" | "semua";

const REVOKED_OPTIONS: readonly { readonly value: RevokedFilter; readonly label: string }[] =
  Object.freeze([
    { value: "aktif", label: "Aktif" },
    { value: "dicabut", label: "Dicabut" },
    { value: "semua", label: "Semua" }
  ]);

export function DevicesPage() {
  const role = useAuthStore((state) => state.role);
  const [revokedFilter, setRevokedFilter] = useState<RevokedFilter>("aktif");
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<DeviceDto | null>(null);
  const [pendingSelected, setPendingSelected] = useState<ScalePendingDto | null>(null);

  const query = useDeviceList(
    revokedFilter === "semua" ? {} : { revoked: revokedFilter === "dicabut" }
  );
  const pending = useScalePending();
  const sppgList = useSppgList();
  const showSkeleton = useDelayedLoading(query.isPending);
  const apiError = isApiError(query.error) ? query.error : null;
  const devices = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const canLink = role === "admin";
  const pendingItems = pending.data?.items ?? [];
  const sppgNames = new Map(
    (sppgList.data?.items ?? []).map((sppg) => [sppg.id, sppg.nama] as const)
  );

  return (
    <div className="flex max-w-5xl flex-col gap-5">
      <PageHeader
        title="Perangkat"
        description={
          query.data === undefined
            ? "Pelacak armada dan timbangan SPPG yang terhubung lewat MQTT."
            : `${formatInt(total)} perangkat terdaftar untuk filter ini.`
        }
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            Daftarkan
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter status perangkat">
        {REVOKED_OPTIONS.map((option) => (
          <ChipButton
            key={option.value}
            selected={revokedFilter === option.value}
            onClick={() => setRevokedFilter(option.value)}
          >
            {option.label}
          </ChipButton>
        ))}
      </div>

      {showSkeleton ? <SkeletonList rows={6} /> : null}

      {query.isError ? (
        <ErrorState
          description={apiError?.message ?? "Periksa jaringan lalu coba lagi."}
          requestId={apiError?.requestId}
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {query.data !== undefined && devices.length === 0 ? (
        <EmptyState
          title={
            revokedFilter === "dicabut"
              ? "Tidak ada perangkat tercabut."
              : "Belum ada perangkat terdaftar."
          }
          description="Daftarkan pelacak untuk armada atau timbangan untuk SPPG. Kredensial MQTT dibuat sekali dan hanya tampil saat pendaftaran."
        />
      ) : null}

      {devices.length > 0 ? <DeviceTable devices={devices} onOpen={setSelected} /> : null}

      <section className="flex flex-col gap-3 border-t border-garis pt-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-ink">Bacaan timbangan menunggu</h2>
          <span className="font-mono text-2xs text-ink-lemah">{pendingItems.length} bacaan</span>
        </div>
        {pending.isPending ? <SkeletonList rows={3} /> : null}
        {pending.isError ? (
          <p className="text-sm text-bata">Bacaan timbangan tidak dapat dimuat.</p>
        ) : null}
        {!pending.isPending && pendingItems.length === 0 ? (
          <p className="text-sm text-ink-lemah">
            Tidak ada bacaan menunggu penautan. Bacaan hadir otomatis dari timbangan melalui MQTT.
          </p>
        ) : null}
        {pendingItems.length > 0 ? (
          <ScalePendingTable
            items={pendingItems}
            sppgNames={sppgNames}
            onLink={setPendingSelected}
            canLink={canLink}
          />
        ) : null}
      </section>

      <p className="text-xs text-ink-lemah">
        Pelacak mengirim posisi armada; timbangan mengirim bacaan berat yang menunggu ditautkan ke
        batch.
      </p>

      <CreateDeviceSheet open={createOpen} onOpenChange={setCreateOpen} />
      <DeviceDetailSheet
        device={selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
      <LinkScaleSheet
        pending={pendingSelected}
        onOpenChange={(open) => {
          if (!open) setPendingSelected(null);
        }}
      />
    </div>
  );
}
