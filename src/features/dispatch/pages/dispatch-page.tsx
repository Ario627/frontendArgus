import { useState } from "react";
import { isApiError } from "@/api/api-error";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useDispatchBoard } from "@/features/dispatch/hooks/use-dispatch-board";
import {
  useAssignBatch,
  useAutoDispatch
} from "@/features/dispatch/hooks/use-dispatch-mutations";
import { useSppgList } from "@/features/sppg/hooks/use-sppg-list";
import { Button } from "@/shared/components/ui/button";
import { Chip, ChipButton } from "@/shared/components/ui/chip";
import { Select } from "@/shared/components/ui/select";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { SkeletonList } from "@/shared/components/ui/skeleton";
import { useToastStore } from "@/shared/components/ui/toast-store";
import { useDelayedLoading } from "@/shared/hooks/use-delayed-loading";
import { cn } from "@/shared/lib/cn";
import { formatKgValue, formatMoment, formatNumber } from "@/shared/lib/format";
import { GATE_LABELS } from "@/shared/constants/gate.constant";
import type { StatusTone } from "@/shared/constants/tone.constant";
import type {
  DispatchBoard,
  DispatchBoardItem,
  DispatchLeg
} from "@/shared/types/dispatch.types";

const TONE_TEXT: Readonly<Record<StatusTone, string>> = Object.freeze({
  daun: "text-daun",
  kunyit: "text-kunyit",
  "biru-tinta": "text-biru-tinta",
  bata: "text-bata",
  netral: "text-ink-lemah"
});

const TONE_CHIP: Readonly<Record<StatusTone, string>> = Object.freeze({
  daun: "border-daun/50 text-daun",
  kunyit: "border-kunyit/60 text-kunyit",
  "biru-tinta": "border-biru-tinta/40 text-biru-tinta",
  bata: "border-bata/50 text-bata",
  netral: "border-garis text-ink-lemah"
});

const PRIORITY_TONE = (priority: number): StatusTone =>
  priority >= 70 ? "bata" : priority >= 45 ? "kunyit" : "netral";

function PriorityMeter({ value }: { readonly value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-1.5 w-16 overflow-hidden rounded-full bg-ink/10"
        role="img"
        aria-label={`Skor prioritas ${formatNumber(value, 1)} dari 100`}
      >
        <span
          className={cn(
            "block h-full rounded-full",
            value >= 70 ? "bg-bata" : value >= 45 ? "bg-kunyit" : "bg-biru-tinta"
          )}
          style={{ width: `${Math.min(100, Math.max(2, value))}%` }}
        />
      </div>
      <span className={cn("font-mono text-xs tabular-nums", TONE_TEXT[PRIORITY_TONE(value)])}>
        {formatNumber(value, 1)}
      </span>
    </div>
  );
}

function EtaText({ leg }: { readonly leg: DispatchLeg }) {
  const minutes = Math.round(leg.etaSeconds / 60);
  const congested = leg.congestionRatio !== null && leg.congestionRatio >= 1.35;
  return (
    <span className="flex items-center gap-1.5 font-mono text-xs text-ink-lemah">
      <span
        aria-hidden
        className={cn("size-2 rounded-full", congested ? "bg-kunyit" : "bg-daun")}
      />
      {formatNumber(minutes, 0)} mnt · {formatNumber(leg.distanceMeters / 1000, 1)} km
    </span>
  );
}

interface ItemCardProps {
  readonly item: DispatchBoardItem;
  readonly board: DispatchBoard;
  readonly busy: boolean;
  readonly onAssign: (batchId: string, fleetId: string) => void;
}

function ItemCard({ item, board, busy, onAssign }: ItemCardProps) {
  const [open, setOpen] = useState(false);
  const recommended = item.legs.find((leg) => leg.vehicleId === item.recommendedVehicleId) ?? null;

  return (
    <li className="flex flex-col border-b border-garis last:border-b-0">
      <div className="flex flex-wrap items-start gap-x-4 gap-y-2 py-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="font-mono text-sm text-ink">{item.batchId.slice(0, 8)}</span>
            <span className="text-sm text-ink-lemah">{item.sppgNama}</span>
            <Chip className="h-6 text-2xs">{formatKgValue(item.weightKg, "device")} kg</Chip>
            {item.gateStatus === null ? null : (
              <Chip className={cn("h-6 text-2xs", TONE_CHIP[item.gateStatus === "LOLOS" ? "daun" : item.gateStatus === "TOLAK" ? "bata" : "kunyit"])}>
                {GATE_LABELS[item.gateStatus]}
              </Chip>
            )}
            <span className="font-mono text-2xs text-ink-lemah">{formatMoment(item.createdAt)}</span>
            {item.eligible ? null : (
              <Chip className="h-6 border-bata/50 text-2xs text-bata">tidak diangkut</Chip>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {item.reasons.map((reason) => (
              <span
                key={reason.code}
                className={cn("rounded-full border px-2 py-0.5 text-2xs", TONE_CHIP[reason.tone])}
              >
                {reason.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <PriorityMeter value={item.priority} />
          {recommended === null ? (
            <span className="text-2xs text-bata">tanpa armada</span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xs text-ink-lemah">{recommended.kode}</span>
              <EtaText leg={recommended} />
            </div>
          )}
          <Button variant="secondary" size="sm" disabled={busy} onClick={() => setOpen((value) => !value)}>
            {open ? "Tutup" : "Pilih armada"}
          </Button>
        </div>
      </div>

      {open ? (
        <div className="grid gap-4 rounded-kontrol border border-garis bg-ink/[0.02] px-3 py-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <section className="flex flex-col gap-1.5">
            <p className="label-cap text-ink-lemah">Dasar skor</p>
            {(
              [
                ["Umur & susut", item.components.age],
                ["Gerbang", item.components.gate],
                ["Bobot muatan", item.components.weight],
                ["Jangkauan armada", item.components.reach]
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-32 shrink-0 text-2xs text-ink-lemah">{label}</span>
                <span className="h-1 flex-1 overflow-hidden rounded-full bg-ink/10">
                  <span
                    className="block h-full rounded-full bg-biru-tinta"
                    style={{ width: `${Math.min(100, Math.max(2, value))}%` }}
                  />
                </span>
                <span className="w-8 text-right font-mono text-2xs text-ink-lemah">
                  {formatNumber(value, 0)}
                </span>
              </div>
            ))}
            <p className="mt-1 text-2xs text-ink-lemah">
              Bobot: umur 34% · gerbang 18% · muatan 18% · jangkauan 30%. Matriks jarak:{" "}
              {board.matrixSource === "mapbox" ? "Mapbox" : "haversine"}.
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <p className="label-cap text-ink-lemah">Armada</p>
            {item.legs.length === 0 ? (
              <p className="text-sm text-ink-lemah">
                Tidak ada armada aktif dengan posisi. Perangkat armada harus menyala.
              </p>
            ) : (
              item.legs.map((leg) => {
                const vehicle = board.vehicles.find((entry) => entry.id === leg.vehicleId);
                const freeKg =
                  vehicle?.kapasitasKg === null || vehicle?.kapasitasKg === undefined
                    ? null
                    : vehicle.kapasitasKg - vehicle.loadKg;
                return (
                  <div
                    key={leg.vehicleId}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-kontrol border border-garis bg-kertas px-2.5 py-1.5"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="font-mono text-xs text-ink">{leg.kode}</span>
                      <span className="text-2xs text-ink-lemah">
                        {freeKg === null
                          ? "kapasitas tidak diisi"
                          : `sisa muatan ${formatNumber(Math.max(0, freeKg), 1)} kg`}
                        {vehicle === undefined || vehicle.openStops === 0
                          ? ""
                          : ` · ${vehicle.openStops} tugas terbuka`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <EtaText leg={leg} />
                      <Button
                        size="sm"
                        disabled={busy || !leg.capacityOk || !item.eligible}
                        onClick={() => onAssign(item.batchId, leg.vehicleId)}
                      >
                        Tugaskan
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </section>
        </div>
      ) : null}
    </li>
  );
}

export function DispatchPage() {
  const role = useAuthStore((state) => state.role);
  const ownSppgId = useAuthStore((state) => state.user?.sppgId ?? null);
  const isStaff = role === "sppg_staff";
  const [scope, setScope] = useState("");
  const scopeSppgId = isStaff ? ownSppgId : scope === "" ? null : scope;

  const board = useDispatchBoard(scopeSppgId, true);
  const sppgList = useSppgList(true, { enabled: !isStaff });
  const assign = useAssignBatch();
  const auto = useAutoDispatch();
  const showToast = useToastStore((state) => state.show);
  const showSkeleton = useDelayedLoading(board.isPending);
  const apiError = isApiError(board.error) ? board.error : null;

  const data = board.data;
  const items = data?.items ?? [];
  const busy = assign.isPending || auto.isPending;

  const handleAssign = (batchId: string, fleetId: string) => {
    assign.mutate(
      { batchId, fleetId },
      {
        onSuccess: () => {
          showToast({ message: "Batch masuk rute. Pengemudi melihatnya di halaman rute." });
        },
        onError: (cause) => {
          showToast({
            message: isApiError(cause) ? cause.message : "Batch tidak dapat ditugaskan.",
            tone: "bata"
          });
        }
      }
    );
  };

  const handleAuto = () => {
    auto.mutate(scopeSppgId, {
      onSuccess: (result) => {
        showToast({
          message:
            result.assigned.length === 0
              ? "Tidak ada batch yang bisa ditugaskan otomatis sekarang."
              : `${result.assigned.length} batch ditugaskan otomatis${result.skipped.length === 0 ? "." : `, ${result.skipped.length} dilewati.`}`,
          tone: result.assigned.length === 0 ? "netral" : undefined
        });
      },
      onError: (cause) => {
        showToast({
          message: isApiError(cause) ? cause.message : "Penugasan otomatis gagal.",
          tone: "bata"
        });
      }
    });
  };

  return (
    <div className="flex max-w-5xl flex-col gap-5">
      <PageHeader
        title="Antrean penugasan"
        description={
          data === undefined
            ? "Batch yang menunggu diangkut, diurutkan algoritma: umur, gerbang, muatan, dan jarak armada."
            : `${formatNumber(data.waitingCount, 0)} batch · ${formatNumber(data.waitingKg, 1)} kg menunggu diangkut.`
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {isStaff || sppgList.data === undefined ? null : (
              <Select
                aria-label="Cakupan dapur"
                value={scope}
                onChange={(event) => setScope(event.target.value)}
                className="w-48"
              >
                <option value="">Semua dapur</option>
                {(sppgList.data?.items ?? []).map((sppg) => (
                  <option key={sppg.id} value={sppg.id}>
                    {sppg.nama}
                  </option>
                ))}
              </Select>
            )}
            <ChipButton selected onClick={() => void board.refetch()}>
              Segarkan
            </ChipButton>
            {items.length === 0 ? null : (
              <Button size="sm" loading={auto.isPending} disabled={busy} onClick={handleAuto}>
                Tugaskan otomatis
              </Button>
            )}
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-2xs text-ink-lemah">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-full bg-daun" /> dekat &amp; lancar
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-full bg-kunyit" /> perjalanan lebih lambat
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-full bg-bata" /> prioritas tinggi
        </span>
        {data === null || data === undefined ? null : (
          <span className="ml-auto font-mono">
            diperbarui {formatMoment(data.generatedAt)} · matriks {data.matrixSource}
          </span>
        )}
      </div>

      {showSkeleton ? <SkeletonList rows={5} /> : null}

      {board.isError ? (
        <ErrorState
          description={apiError?.message ?? "Antrean tidak dapat dimuat."}
          requestId={apiError?.requestId}
          onRetry={() => void board.refetch()}
        />
      ) : null}

      {data?.note === null || data === undefined ? null : (
        <p className="rounded-kontainer border border-kunyit/60 bg-kunyit/5 px-3 py-2 text-sm text-ink">
          {data.note}
        </p>
      )}

      {data !== undefined && items.length === 0 ? (
        <EmptyState
          title="Tidak ada batch menunggu."
          description="Batch baru otomatis masuk antrean ini saat dicatat staf, lalu langsung ditugaskan bila ada armada dengan kapasitas."
        />
      ) : null}

      {items.length > 0 ? (
        <ul className="flex flex-col rounded-kontainer border border-garis px-3">
          {items.map((item) => (
            <ItemCard
              key={item.batchId}
              item={item}
              board={data ?? {
                generatedAt: "",
                tanggal: "",
                scopeSppgId: null,
                matrixSource: "haversine",
                vehicles: [],
                items: [],
                waitingCount: 0,
                waitingKg: 0,
                note: null
              }}
              busy={busy}
              onAssign={handleAssign}
            />
          ))}
        </ul>
      ) : null}

      <p className="text-xs text-ink-lemah">
        Penugasan membuat stop AMBIL pada rute aktif hari ini. Pengemudi menandai muatan
        terangkut; status batch berpindah ke diangkut dan fasilitas melanjutkan pencatatan
        penerimaan.
      </p>
    </div>
  );
}
