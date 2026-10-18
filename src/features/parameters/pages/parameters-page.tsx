import { useMemo, useState } from "react";
import { isApiError } from "@/api/api-error";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { ParameterEditSheet } from "@/features/parameters/components/parameter-edit-sheet";
import { useParameters } from "@/features/parameters/hooks/use-parameters";
import {
  PARAMETER_LABELS,
  PARAMETER_SOURCE_LABELS,
  PARAMETER_SOURCE_TONES,
  formatParameterValue
} from "@/features/parameters/parameter-format";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Chip } from "@/shared/components/ui/chip";
import { SkeletonList } from "@/shared/components/ui/skeleton";
import type { StatusTone } from "@/shared/constants/tone.constant";
import { useDelayedLoading } from "@/shared/hooks/use-delayed-loading";
import { cn } from "@/shared/lib/cn";
import { formatInt, formatMoment } from "@/shared/lib/format";
import type { ParameterDto } from "@/shared/types/parameter.types";

const TONE_CHIP_CLASSES: Readonly<Record<StatusTone, string>> = Object.freeze({
  daun: "border-daun/50 text-daun",
  kunyit: "border-kunyit/50 text-kunyit",
  "biru-tinta": "border-biru-tinta/50 text-biru-tinta",
  bata: "border-bata/50 text-bata",
  netral: "border-garis text-ink-lemah"
});

export function ParametersPage() {
  const role = useAuthStore((state) => state.role);
  const query = useParameters();
  const showSkeleton = useDelayedLoading(query.isPending);
  const [selected, setSelected] = useState<ParameterDto | null>(null);
  const apiError = isApiError(query.error) ? query.error : null;

  const parameters = useMemo(() => query.data ?? [], [query.data]);
  const calibratedCount = useMemo(
    () => parameters.filter((parameter) => parameter.terkalibrasi).length,
    [parameters]
  );

  return (
    <div className="flex max-w-4xl flex-col gap-5">
      <PageHeader
        title="Parameter kalibrasi"
        description={
          query.data === undefined
            ? "Koefisien yang dipakai skor disposisi, gerbang, dan neraca massa."
            : `${formatInt(calibratedCount)} dari ${formatInt(parameters.length)} parameter terkalibrasi.`
        }
      />

      {parameters.length > 0 && calibratedCount === 0 ? (
        <div className="rounded-kontainer border border-kunyit/40 bg-kunyit/5 px-4 py-3">
          <p className="text-sm text-kunyit">
            Belum ada parameter terkalibrasi. Sistem berjalan dengan jalur aman T4 untuk keputusan
            disposisi sampai parameter diisi.
          </p>
        </div>
      ) : null}

      {showSkeleton ? <SkeletonList rows={8} /> : null}

      {query.isError ? (
        <ErrorState
          description={apiError?.message ?? "Periksa jaringan lalu coba lagi."}
          requestId={apiError?.requestId}
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {parameters.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-garis">
                <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Parameter</th>
                <th scope="col" className="label-cap px-2 py-2 text-right text-ink-lemah">Nilai</th>
                <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Sumber</th>
                <th scope="col" className="label-cap px-2 py-2 text-left text-ink-lemah">Diperbarui</th>
              </tr>
            </thead>
            <tbody>
              {parameters.map((parameter) => (
                <tr
                  key={parameter.kunci}
                  className="relative h-12 border-b border-garis transition-colors duration-150 ease-out hover:bg-ink/5"
                >
                  <td className="px-2">
                    <button
                      type="button"
                      onClick={() => setSelected(parameter)}
                      className="flex flex-col items-start text-left after:absolute after:inset-0"
                    >
                      <span className="text-sm text-ink">{PARAMETER_LABELS[parameter.kunci]}</span>
                      <span className="font-mono text-2xs text-ink-lemah">{parameter.kunci}</span>
                    </button>
                  </td>
                  <td className="px-2 text-right">
                    {parameter.nilai === null ? (
                      <span className="text-xs text-bata">Belum diisi</span>
                    ) : (
                      <span className="font-mono text-xs tabular-nums text-ink">
                        {formatParameterValue(parameter.nilai)}
                        {parameter.satuan === null ? null : (
                          <span className="text-ink-lemah"> {parameter.satuan}</span>
                        )}
                      </span>
                    )}
                  </td>
                  <td className="px-2">
                    <Chip
                      className={cn("h-6", TONE_CHIP_CLASSES[PARAMETER_SOURCE_TONES[parameter.sumber]])}
                    >
                      {PARAMETER_SOURCE_LABELS[parameter.sumber]}
                    </Chip>
                  </td>
                  <td className="px-2 font-mono text-2xs text-ink-lemah">
                    {parameter.updatedAt === null ? "—" : formatMoment(parameter.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <p className="text-xs text-ink-lemah">
        {role === "admin"
          ? "Ketuk baris untuk mengubah nilai dan sumber."
          : "Ketuk baris untuk melihat rincian. Perubahan hanya oleh admin."}
      </p>

      <ParameterEditSheet
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        parameter={selected}
        canEdit={role === "admin"}
      />
    </div>
  );
}