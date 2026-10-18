import { useState } from "react";
import { isApiError } from "@/api/api-error";
import { useSppgDetail } from "@/features/sppg/hooks/use-sppg-detail";
import {
  useCreateSppgPoint,
  useUpdateSppgPoint
} from "@/features/sppg/hooks/use-sppg-mutations";
import { Button } from "@/shared/components/ui/button";
import { Chip } from "@/shared/components/ui/chip";
import { Field } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { Sheet } from "@/shared/components/ui/sheet";
import { useToastStore } from "@/shared/components/ui/toast-store";
import { cn } from "@/shared/lib/cn";
import { DISTRIBUTION_POINT_KINDS, POINT_KIND_LABELS } from "@/shared/constants/point.constant";
import type { SppgDto } from "@/shared/types/sppg.types";

export interface SppgPointsSheetProps {
  readonly sppg: SppgDto | null;
  readonly onOpenChange: (open: boolean) => void;
}

export function SppgPointsSheet({ sppg, onOpenChange }: SppgPointsSheetProps) {
  const detail = useSppgDetail(sppg?.id ?? null);
  const createPoint = useCreateSppgPoint();
  const updatePoint = useUpdateSppgPoint();
  const showToast = useToastStore((state) => state.show);
  const [nama, setNama] = useState("");
  const [jenis, setJenis] = useState<(typeof DISTRIBUTION_POINT_KINDS)[number]>("sekolah");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const close = () => {
    onOpenChange(false);
    setNama("");
    setLat("");
    setLng("");
  };

  const addPoint = () => {
    if (sppg === null || nama.trim().length < 2) return;
    createPoint.mutate(
      {
        sppgId: sppg.id,
        input: {
          nama: nama.trim(),
          jenis,
          ...(lat.trim() === "" ? {} : { lat: Number(lat) }),
          ...(lng.trim() === "" ? {} : { lng: Number(lng) })
        }
      },
      {
        onSuccess: () => {
          showToast({ message: "Titik penyerahan ditambahkan." });
          setNama("");
          setLat("");
          setLng("");
        },
        onError: (cause) => {
          showToast({
            message: isApiError(cause) ? cause.message : "Titik tidak dapat ditambahkan.",
            tone: "bata"
          });
        }
      }
    );
  };

  const togglePoint = (pointId: string, aktif: boolean) => {
    if (sppg === null) return;
    updatePoint.mutate(
      { sppgId: sppg.id, pointId, input: { aktif: !aktif } },
      {
        onSuccess: () => {
          showToast({ message: aktif ? "Titik dinonaktifkan." : "Titik diaktifkan kembali." });
        },
        onError: (cause) => {
          showToast({
            message: isApiError(cause) ? cause.message : "Titik tidak dapat diubah.",
            tone: "bata"
          });
        }
      }
    );
  };

  const points = detail.data?.points ?? [];

  return (
    <Sheet
      open={sppg !== null}
      onOpenChange={(open) => {
        if (!open) close();
        else onOpenChange(true);
      }}
      title="Titik penyerahan"
      description={sppg === null ? "" : `Titik distribusi untuk ${sppg.nama}.`}
    >
      {detail.isPending ? <p className="text-sm text-ink-lemah">Memuat titik...</p> : null}

      {detail.isError ? (
        <p className="text-sm text-bata">Titik tidak dapat dimuat. Tutup lalu coba lagi.</p>
      ) : null}

      {!detail.isPending && points.length === 0 ? (
        <p className="text-sm text-ink-lemah">
          Belum ada titik. Titik dipakai saat mencatat observasi sisa makan.
        </p>
      ) : null}

      {points.length > 0 ? (
        <ul className="flex flex-col">
          {points.map((point) => (
            <li
              key={point.id}
              className="flex items-center justify-between gap-3 border-b border-garis py-2.5 last:border-b-0"
            >
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm text-ink">{point.nama}</span>
                <span className="flex gap-x-3 text-xs text-ink-lemah">
                  <span>{POINT_KIND_LABELS[point.jenis]}</span>
                  <span className="font-mono">
                    {point.lat === null || point.lng === null
                      ? "tanpa koordinat"
                      : `${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`}
                  </span>
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Chip className={cn("h-7", point.aktif ? "text-daun" : "text-bata")}>
                  {point.aktif ? "aktif" : "nonaktif"}
                </Chip>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={updatePoint.isPending}
                  onClick={() => togglePoint(point.id, point.aktif)}
                >
                  {point.aktif ? "Nonaktifkan" : "Aktifkan"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4 flex flex-col gap-3 border-t border-garis pt-4">
        <p className="text-sm font-medium text-ink">Tambah titik</p>
        <Field label="Nama" required>
          {(control) => (
            <Input
              id={control.id}
              value={nama}
              onChange={(event) => setNama(event.target.value)}
            />
          )}
        </Field>
        <Field label="Jenis">
          {(control) => (
            <Select
              id={control.id}
              value={jenis}
              onChange={(event) =>
                setJenis(event.target.value as (typeof DISTRIBUTION_POINT_KINDS)[number])
              }
            >
              {DISTRIBUTION_POINT_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {POINT_KIND_LABELS[kind]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Latitude" hint="Opsional.">
            {(control) => (
              <Input
                id={control.id}
                value={lat}
                inputMode="decimal"
                className="font-mono"
                onChange={(event) => setLat(event.target.value)}
              />
            )}
          </Field>
          <Field label="Longitude" hint="Opsional.">
            {(control) => (
              <Input
                id={control.id}
                value={lng}
                inputMode="decimal"
                className="font-mono"
                onChange={(event) => setLng(event.target.value)}
              />
            )}
          </Field>
        </div>
        <Button
          variant="secondary"
          fullWidth
          disabled={nama.trim().length < 2}
          loading={createPoint.isPending}
          onClick={addPoint}
        >
          Tambah titik
        </Button>
      </div>
    </Sheet>
  );
}
