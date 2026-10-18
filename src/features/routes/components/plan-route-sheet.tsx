import { useState } from "react";
import { isApiError } from "@/api/api-error";
import { RouteStatusChip } from "@/features/routes/components/route-status-chip";
import { usePlanRoute } from "@/features/routes/hooks/use-plan-route";
import { useSppgList } from "@/features/sppg/hooks/use-sppg-list";
import { Button } from "@/shared/components/ui/button";
import { Field } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { Sheet } from "@/shared/components/ui/sheet";
import { useToastStore } from "@/shared/components/ui/toast-store";
import { ROUTE_SOURCE_LABELS } from "@/features/routes/route-labels";
import { formatInt, formatKgValue, formatNumber, wibIsoDate } from "@/shared/lib/format";
import type { PlanRouteResult } from "@/shared/types/route.types";

export interface PlanRouteSheetProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly defaultDate: string;
}

export function PlanRouteSheet({ open, onOpenChange, defaultDate }: PlanRouteSheetProps) {
  const sppgQuery = useSppgList(true);
  const plan = usePlanRoute();
  const showToast = useToastStore((state) => state.show);
  const [sppgId, setSppgId] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [result, setResult] = useState<PlanRouteResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setSppgId("");
      setDate(defaultDate === "" ? wibIsoDate(0) : defaultDate);
      setResult(null);
      setError(null);
    }
  }

  const submit = () => {
    setError(null);
    if (sppgId === "") {
      setError("Pilih dapur terlebih dahulu.");
      return;
    }
    plan.mutate(
      { sppgId, ...(date === "" ? {} : { tanggal: date }) },
      {
        onSuccess: (data) => {
          setResult(data);
          showToast({
            message: data.degraded
              ? "Rute dibuat tanpa optimizer — perlu penjadwalan manual"
              : "Rute direncanakan"
          });
        },
        onError: (cause) => {
          setError(isApiError(cause) ? cause.message : "Tidak dapat merencanakan rute saat ini.");
        }
      }
    );
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Rencanakan rute"
      description="Optimizer menyusun urutan stop per armada dari batch yang menunggu angkut."
      footer={
        result === null ? (
          <Button size="lg" fullWidth loading={plan.isPending} onClick={submit}>
            Rencanakan sekarang
          </Button>
        ) : (
          <Button size="lg" fullWidth variant="secondary" onClick={() => onOpenChange(false)}>
            Selesai
          </Button>
        )
      }
    >
      {result === null ? (
        <div className="flex flex-col gap-4">
          <Field label="Dapur (SPPG)" required hint="Satu rute aktif per dapur per tanggal.">
            {(control) => (
              <Select
                id={control.id}
                aria-describedby={control.describedBy}
                value={sppgId}
                onChange={(event) => setSppgId(event.target.value)}
              >
                <option value="">Pilih dapur</option>
                {(sppgQuery.data?.items ?? []).map((sppg) => (
                  <option key={sppg.id} value={sppg.id}>
                    {sppg.nama}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Tanggal (WIB)">
            {(control) => (
              <Input
                id={control.id}
                aria-describedby={control.describedBy}
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            )}
          </Field>
          {error === null ? null : (
            <p role="alert" className="text-sm text-bata">
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <RouteStatusChip status={result.plan.status} />
            <span className="text-sm text-ink-lemah">
              {ROUTE_SOURCE_LABELS[result.plan.source]} · {formatInt(result.plan.stops.length)} stop
            </span>
          </div>
          <p className="text-sm text-ink">
            {formatKgValue(result.plan.totalKg)} kg
            {result.plan.totalKm === null ? "" : ` · ${formatNumber(result.plan.totalKm, 1)} km`}
          </p>
          {result.degraded ? (
            <p className="rounded-kontrol border border-kunyit/40 bg-kunyit/5 px-3 py-2 text-xs text-kunyit">
              Optimizer tidak tersedia. Rute dibuat dengan metode cadangan dan menunggu penjadwalan
              manual oleh admin.
            </p>
          ) : null}
          {result.plan.ringkasan !== null && result.plan.ringkasan.unassigned.length > 0 ? (
            <p className="text-xs text-kunyit">
              {formatInt(result.plan.ringkasan.unassigned.length)} batch tidak masuk rute — rincian di
              halaman detail.
            </p>
          ) : null}
        </div>
      )}
    </Sheet>
  );
}