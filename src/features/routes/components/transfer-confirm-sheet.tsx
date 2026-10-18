import { useState } from "react";
import { isApiError } from "@/api/api-error";
import { useBatchDetail } from "@/features/batch/hooks/use-batch-detail";
import { useConfirmTransfer } from "@/features/ledger/hooks/use-confirm-transfer";
import { Button } from "@/shared/components/ui/button";
import { Field } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Sheet } from "@/shared/components/ui/sheet";
import { Textarea } from "@/shared/components/ui/textarea";
import { useToastStore } from "@/shared/components/ui/toast-store";
import { newClientEventId } from "@/shared/lib/id";
import { nowIso } from "@/shared/lib/format";
import type { TransferEvaluation } from "@/shared/types/ledger.types";
import type { LatLng } from "@/shared/types/maps.types";

const TRANSFER_NOTE_LABELS: Readonly<Record<string, string>> = Object.freeze({
  TOLERANSI_BELUM_TERKALIBRASI: "toleransi neraca belum dikalibrasi",
  SAKSI_SELISIH_MELEBIHI_TOLERANSI: "selisih berat melebihi toleransi",
  MENUNGGU_SAKSI_PENGIRIM: "menunggu saksi pengirim",
  MENUNGGU_SAKSI_PENERIMA: "menunggu saksi penerima",
  SAKSI_AKTOR_SAMA: "pengirim dan penerima tercatat sebagai orang yang sama"
});

export interface TransferConfirmSheetProps {
  readonly batchId: string | null;
  readonly onOpenChange: (open: boolean) => void;
  readonly position: LatLng | null;
  readonly roleNote: string;
}

export function TransferConfirmSheet({
  batchId,
  onOpenChange,
  position,
  roleNote
}: TransferConfirmSheetProps) {
  const batch = useBatchDetail(batchId ?? undefined);
  const mutation = useConfirmTransfer();
  const showToast = useToastStore((state) => state.show);
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [transfer, setTransfer] = useState<TransferEvaluation | null>(null);
  const [prefilledFor, setPrefilledFor] = useState<string | null>(null);

  if (batchId !== null && batch.data !== undefined && prefilledFor !== batchId) {
    setPrefilledFor(batchId);
    setWeight(String(batch.data.weightKg));
    setNote("");
    setError(null);
    setTransfer(null);
  }

  const submit = () => {
    if (batchId === null) return;
    const parsed = Number(weight);
    if (!Number.isFinite(parsed) || parsed < 0.1 || parsed > 500) {
      setError("Berat harus angka 0,1 sampai 500 kg.");
      return;
    }
    mutation.mutate(
      {
        batchId,
        input: {
          clientEventId: newClientEventId(),
          weightKg: parsed,
          occurredAt: nowIso(),
          ...(position === null ? {} : { lat: position.lat, lng: position.lng }),
          ...(note.trim().length === 0 ? {} : { note: note.trim() })
        }
      },
      {
        onSuccess: (result) => {
          setTransfer(result.transfer);
          showToast({
            message:
              result.transfer.status === "SAH"
                ? "Serah terima sah — dua saksi cocok."
                : "Serah terima tercatat, menunggu saksi pihak lain."
          });
        },
        onError: (cause) => {
          setError(isApiError(cause) ? cause.message : "Serah terima tidak dapat dicatat.");
        }
      }
    );
  };

  const close = () => {
    onOpenChange(false);
    setTransfer(null);
  };

  return (
    <Sheet
      open={batchId !== null}
      onOpenChange={(open) => {
        if (!open) close();
        else onOpenChange(true);
      }}
      title="Serah terima"
      description={roleNote}
      footer={
        transfer === null ? (
          <Button fullWidth loading={mutation.isPending} onClick={submit}>
            Catat serah terima
          </Button>
        ) : (
          <Button fullWidth variant="secondary" onClick={close}>
            Tutup
          </Button>
        )
      }
    >
      {batch.isPending ? <p className="text-sm text-ink-lemah">Memuat batch...</p> : null}

      {transfer === null ? (
        <div className="flex flex-col gap-4">
          {batch.isError ? (
            <p className="text-sm text-bata">Batch tidak dapat dimuat. Tutup lalu coba lagi.</p>
          ) : null}

          <div className="flex flex-col gap-1 rounded-kontainer border border-garis px-3 py-2">
            <span className="label-cap text-ink-lemah">Batch</span>
            <span className="font-mono text-sm text-ink">{batchId?.slice(0, 8) ?? ""}</span>
            {batch.data === undefined ? null : (
              <span className="text-xs text-ink-lemah">
                tercatat {batch.data.weightKg} kg · {batch.data.aliran}
              </span>
            )}
          </div>

          {error === null ? null : (
            <p role="alert" className="rounded-kontainer border border-bata/40 bg-bata/5 px-3 py-2 text-sm text-bata">
              {error}
            </p>
          )}

          <Field label="Berat saat diserahkan (kg)" required>
            {(control) => (
              <Input
                id={control.id}
                value={weight}
                inputMode="decimal"
                className="font-mono"
                onChange={(event) => setWeight(event.target.value)}
              />
            )}
          </Field>

          <Field label="Catatan" hint="Opsional. Kondisi wadah, tumpahan, atau kesepakatan lain.">
            {(control) => (
              <Textarea
                id={control.id}
                value={note}
                maxLength={240}
                rows={3}
                onChange={(event) => setNote(event.target.value)}
              />
            )}
          </Field>

          <p className="text-xs text-ink-lemah">
            {position === null
              ? "Lokasi tidak tersedia — bukti dicatat tanpa koordinat."
              : "Koordinat saat ini ikut tercatat sebagai bukti."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-md font-medium text-ink">
            {transfer.status === "SAH" ? "Serah terima sah." : "Menunggu konfirmasi."}
          </p>
          <dl className="flex flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-garis py-2">
              <dt className="text-sm text-ink-lemah">Berat pengirim</dt>
              <dd className="font-mono text-sm text-ink">
                {transfer.senderKg === null ? "—" : `${transfer.senderKg} kg`}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-garis py-2">
              <dt className="text-sm text-ink-lemah">Berat penerima</dt>
              <dd className="font-mono text-sm text-ink">
                {transfer.receiverKg === null ? "belum ada saksi" : `${transfer.receiverKg} kg`}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 py-2">
              <dt className="text-sm text-ink-lemah">Selisih</dt>
              <dd className="font-mono text-sm text-ink">
                {transfer.diffKg === null ? "—" : `${transfer.diffKg} kg`}
              </dd>
            </div>
          </dl>
          {transfer.notes.length === 0 ? null : (
            <ul className="flex flex-col gap-1 text-xs text-kunyit">
              {transfer.notes.map((code) => (
                <li key={code}>{TRANSFER_NOTE_LABELS[code] ?? code}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Sheet>
  );
}
