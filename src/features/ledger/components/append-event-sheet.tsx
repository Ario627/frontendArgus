import { useMemo, useState } from "react";
import { ChipButton } from "@/shared/components/ui/chip";
import { Field } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Sheet } from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { useToastStore } from "@/shared/components/ui/toast-store";
import {
  APPEND_TYPE_SPECS,
  uiAppendOptions,
  type UiAppendType
} from "@/features/ledger/ledger-append";
import { useAppendLedgerEvent } from "@/features/ledger/hooks/use-append-ledger-event";
import { PhotoCaptureField } from "@/features/photo/components/photo-capture-field";
import { uploadPhoto } from "@/features/photo/api/photo.api";
import { TRANSFER_SIDES, type TransferSide } from "@/shared/constants/ledger.constant";
import type { UserRole } from "@/shared/constants/roles.constant";
import type { BatchStatus } from "@/shared/constants/batch.constant";
import { formatKgValue, parseKg } from "@/shared/lib/format";
import type { CompressedPhoto } from "@/features/photo/photo-compress";
import {
  OCCURRED_AT_MODE_LABELS,
  OCCURRED_AT_MODES,
  occurredAtIsoFor,
  type OccurredAtMode
} from "@/shared/lib/occurred-at";

const NOTE_MAX_LENGTH = 240;

export interface AppendEventSheetProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly batchId: string;
  readonly batchWeightKg: number;
  readonly status: BatchStatus;
  readonly role: UserRole | null;
  readonly defaultType?: UiAppendType;
}

export function AppendEventSheet({
  open,
  onOpenChange,
  batchId,
  batchWeightKg,
  status,
  role,
  defaultType
}: AppendEventSheetProps) {
  const append = useAppendLedgerEvent();
  const showToast = useToastStore((state) => state.show);
  const options = useMemo(() => (role === null ? [] : uiAppendOptions(role, status)), [role, status]);
  const initial = defaultType ?? options[0]?.tipe ?? "DITERIMA";
  const [tipe, setTipe] = useState<UiAppendType>(initial);
  const [weightText, setWeightText] = useState("");
  const [mode, setMode] = useState<OccurredAtMode>("now");
  const [note, setNote] = useState("");
  const [sisi, setSisi] = useState<TransferSide | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<CompressedPhoto | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      const next = defaultType ?? options[0]?.tipe ?? "DITERIMA";
      setTipe(next);
      setWeightText(APPEND_TYPE_SPECS[next].prefillWeight ? formatKgValue(batchWeightKg, "manual") : "");
      setMode("now");
      setNote("");
      setSisi(null);
      setError(null);
      setPhoto(null);
    }
  }

  const spec = APPEND_TYPE_SPECS[tipe];

  if (options.length === 0) return null;

const submit = () => {
    setError(null);
    const weightKg = weightText.trim() === "" ? null : parseKg(weightText);
    if (spec.needsWeight) {
      if (weightKg === null) {
        setError("Isi berat dalam kg (contoh: 12,4).");
        return;
      }
      if (weightKg < 0.1 || weightKg > 500) {
        setError("Berat harus antara 0,1–500 kg.");
        return;
      }
    } else if (weightText.trim() !== "" && weightKg === null) {
      setError("Format berat tidak valid (contoh: 12,4).");
      return;
    }
    if (spec.adminSideRequired && sisi === null) {
      setError("Pilih sisi serah terima (kirim atau terima).");
      return;
    }

    const proceed = (photoHash: string | null) => {
      append.mutate(
        {
          batchId,
          input: {
            tipe: spec.tipe,
            occurredAt: mode === "custom" ? new Date().toISOString() : occurredAtIsoFor(mode),
            ...(spec.needsWeight && weightKg !== null ? { weightKg } : {}),
            ...(note.trim() === "" ? {} : { note: note.trim() }),
            ...(spec.adminSideRequired && sisi !== null ? { sisi } : {}),
            ...(photoHash === null ? {} : { photoHash })
          }
        },
        {
          onSuccess: (result) => {
            showToast({
              message:
                result.outcome === "terkirim"
                  ? `${spec.label} tercatat`
                  : `${spec.label} tersimpan — menunggu sinkron`
            });
            onOpenChange(false);
          },
          onError: () => {
            setError("Tidak dapat menyimpan di perangkat. Coba lagi.");
          }
        }
      );
    };

    if (photo === null) {
      proceed(null);
      return;
    }
    setUploadingPhoto(true);
    void uploadPhoto({ blob: photo.blob, sha256: photo.sha256, refType: "batch", refId: batchId })
      .then((uploaded) => proceed(uploaded.sha256))
      .catch(() => {
        setError("Foto gagal diunggah. Periksa sinyal, atau hapus foto lalu simpan.");
      })
      .finally(() => {
        setUploadingPhoto(false);
      });
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Catat peristiwa"
      description="Peristiwa masuk antrean sinkron dan tidak bisa diubah setelah tercatat."
      footer={
        <Button size="lg" fullWidth loading={append.isPending || uploadingPhoto} onClick={submit}>
          {spec.verb}
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        {options.length <= 1 ? null : (
          <div role="group" aria-label="Jenis peristiwa" className="flex flex-col gap-2">
            <p className="text-sm font-medium text-ink">Peristiwa</p>
            <div className="flex flex-wrap gap-2">
              {options.map((option) => (
                <ChipButton
                  key={option.tipe}
                  selected={tipe === option.tipe}
                  onClick={() => {
                    setTipe(option.tipe);
                    setError(null);
                    setWeightText(
                      option.prefillWeight ? formatKgValue(batchWeightKg, "manual") : ""
                    );
                  }}
                >
                  {option.label}
                </ChipButton>
              ))}
            </div>
          </div>
        )}

        {spec.adminSideRequired ? (
          <div role="group" aria-label="Sisi serah terima" className="flex flex-col gap-2">
            <p className="text-sm font-medium text-ink">Sisi</p>
            <div className="flex flex-wrap gap-2">
              {TRANSFER_SIDES.map((side) => (
                <ChipButton
                  key={side}
                  selected={sisi === side}
                  onClick={() => setSisi(sisi === side ? null : side)}
                >
                  {side === "KIRIM" ? "Kirim" : "Terima"}
                </ChipButton>
              ))}
            </div>
          </div>
        ) : null}

        {spec.needsWeight ? (
          <Field label="Berat" required hint="Isi sesuai timbangan sisi Anda.">
            {(control) => (
              <Input
                id={control.id}
                aria-describedby={control.describedBy}
                invalid={control.invalid}
                inputSize="field"
                inputMode="decimal"
                autoComplete="off"
                suffix="kg"
                placeholder="Contoh: 12,4"
                className="font-mono text-lg"
                value={weightText}
                onChange={(event) => setWeightText(event.target.value)}
              />
            )}
          </Field>
        ) : null}

        <div role="group" aria-label="Waktu kejadian" className="flex flex-col gap-2">
          <p className="text-sm font-medium text-ink">Kapan terjadi?</p>
          <div className="flex flex-wrap gap-2">
            {OCCURRED_AT_MODES.filter((entry) => entry !== "custom").map((entry) => (
              <ChipButton key={entry} selected={mode === entry} onClick={() => setMode(entry)}>
                {OCCURRED_AT_MODE_LABELS[entry]}
              </ChipButton>
            ))}
          </div>
        </div>

        <Field label="Catatan" hint={`Opsional, maksimal ${NOTE_MAX_LENGTH} karakter.`}>
          {(control) => (
            <Textarea
              id={control.id}
              aria-describedby={control.describedBy}
              maxLength={NOTE_MAX_LENGTH}
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          )}
        </Field>

        <PhotoCaptureField
          label="Foto bukti (opsional)"
          hint="Lampiran visual untuk peristiwa ini. Dikompres di perangkat sebelum dikirim."
          disabled={uploadingPhoto}
          onPhotoChange={setPhoto}
        />

        {error === null ? null : (
          <p role="alert" className="text-sm text-bata">
            {error}
          </p>
        )}
      </div>
    </Sheet>
  );
}