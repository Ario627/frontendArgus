import { useState } from "react";
import { isApiError } from "@/api/api-error";
import {
  useCloseTicket,
  useRespondTicket,
  useVerifyTicket
} from "@/features/tickets/hooks/use-ticket-actions";
import { Button } from "@/shared/components/ui/button";
import { ChipButton } from "@/shared/components/ui/chip";
import { Field } from "@/shared/components/ui/field";
import { Sheet } from "@/shared/components/ui/sheet";
import { Textarea } from "@/shared/components/ui/textarea";
import { useToastStore } from "@/shared/components/ui/toast-store";
import type { VerifyTicketInput } from "@/shared/types/ticket.types";

export type TicketActionMode = "verify" | "respond" | "close";

const NOTE_MIN_FOR_REJECT = 10;
const NOTE_MAX = 400;
const ANSWER_MIN = 10;
const ANSWER_MAX = 600;

const MODE_TITLES: Readonly<Record<TicketActionMode, string>> = Object.freeze({
  verify: "Moderasi laporan",
  respond: "Jawab laporan",
  close: "Tutup laporan"
});

const MODE_DESCRIPTIONS: Readonly<Record<TicketActionMode, string>> = Object.freeze({
  verify: "Verifikasi laporan atau tolak dengan catatan yang jelas.",
  respond: "Jawaban dapur akan terlihat pada riwayat laporan.",
  close: "Tutup laporan setelah ditindaklanjuti."
});

export interface TicketActionSheetProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly ticketId: string;
  readonly mode: TicketActionMode;
  readonly canVerifyTarget?: boolean;
  readonly onSuccess?: () => void;
}

export function TicketActionSheet({
  open,
  onOpenChange,
  ticketId,
  mode,
  canVerifyTarget = true,
  onSuccess
}: TicketActionSheetProps) {
  const verify = useVerifyTicket();
  const respond = useRespondTicket();
  const close = useCloseTicket();
  const showToast = useToastStore((state) => state.show);

  const [verifyTarget, setVerifyTarget] = useState<VerifyTicketInput["status"]>("DIVERIFIKASI");
  const [note, setNote] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setVerifyTarget(canVerifyTarget ? "DIVERIFIKASI" : "DITOLAK_MODERASI");
      setNote("");
      setAnswer("");
      setError(null);
    }
  }

  const pending = verify.isPending || respond.isPending || close.isPending;

  const finish = (message: string) => {
    showToast({ message });
    onOpenChange(false);
    onSuccess?.();
  };

  const handleError = (cause: unknown, fallback: string) => {
    setError(isApiError(cause) ? cause.message : fallback);
  };

  const submit = () => {
    setError(null);
    if (mode === "verify") {
      const trimmedNote = note.trim();
      if (verifyTarget === "DITOLAK_MODERASI" && trimmedNote.length < NOTE_MIN_FOR_REJECT) {
        setError(`Catatan penolakan minimal ${NOTE_MIN_FOR_REJECT} karakter.`);
        return;
      }
      verify.mutate(
        {
          ticketId,
          input: {
            status: verifyTarget,
            ...(trimmedNote === "" ? {} : { catatan: trimmedNote })
          }
        },
        {
          onSuccess: () =>
            finish(verifyTarget === "DIVERIFIKASI" ? "Laporan diverifikasi" : "Laporan ditolak moderasi"),
          onError: (cause) => handleError(cause, "Tidak dapat memoderasi saat ini.")
        }
      );
      return;
    }
    if (mode === "respond") {
      const trimmedAnswer = answer.trim();
      if (trimmedAnswer.length < ANSWER_MIN || trimmedAnswer.length > ANSWER_MAX) {
        setError(`Jawaban ${ANSWER_MIN}–${ANSWER_MAX} karakter.`);
        return;
      }
      respond.mutate(
        { ticketId, input: { jawaban: trimmedAnswer } },
        {
          onSuccess: () => finish("Jawaban terkirim"),
          onError: (cause) => handleError(cause, "Tidak dapat mengirim jawaban saat ini.")
        }
      );
      return;
    }
    const trimmedNote = note.trim();
    if (trimmedNote.length > NOTE_MAX) {
      setError(`Catatan maksimal ${NOTE_MAX} karakter.`);
      return;
    }
    close.mutate(
      { ticketId, input: trimmedNote === "" ? {} : { catatan: trimmedNote } },
      {
        onSuccess: () => finish("Laporan ditutup"),
        onError: (cause) => handleError(cause, "Tidak dapat menutup laporan saat ini.")
      }
    );
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={MODE_TITLES[mode]}
      description={MODE_DESCRIPTIONS[mode]}
      footer={
        <Button size="lg" fullWidth loading={pending} onClick={submit}>
          {mode === "verify" ? "Simpan moderasi" : mode === "respond" ? "Kirim jawaban" : "Tutup laporan"}
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        {mode === "verify" && canVerifyTarget ? (
          <div role="group" aria-label="Hasil moderasi" className="flex flex-col gap-2">
            <p className="text-sm font-medium text-ink">Hasil</p>
            <div className="flex flex-wrap gap-2">
              <ChipButton
                selected={verifyTarget === "DIVERIFIKASI"}
                onClick={() => setVerifyTarget("DIVERIFIKASI")}
              >
                Diverifikasi
              </ChipButton>
              <ChipButton
                selected={verifyTarget === "DITOLAK_MODERASI"}
                onClick={() => setVerifyTarget("DITOLAK_MODERASI")}
              >
                Tolak moderasi
              </ChipButton>
            </div>
          </div>
        ) : null}

        {mode === "respond" ? (
          <Field
            label="Jawaban dapur"
            required
            hint={`${ANSWER_MIN}–${ANSWER_MAX} karakter. Jelaskan tindakan yang dilakukan.`}
          >
            {(control) => (
              <Textarea
                id={control.id}
                aria-describedby={control.describedBy}
                rows={5}
                maxLength={ANSWER_MAX}
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
              />
            )}
          </Field>
        ) : (
          <Field
            label={mode === "verify" && verifyTarget === "DITOLAK_MODERASI" ? "Catatan penolakan" : "Catatan"}
            required={mode === "verify" && verifyTarget === "DITOLAK_MODERASI"}
            hint={
              mode === "verify" && verifyTarget === "DITOLAK_MODERASI"
                ? `Wajib, minimal ${NOTE_MIN_FOR_REJECT} karakter — alasan penolakan terlihat pada riwayat.`
                : "Opsional."
            }
          >
            {(control) => (
              <Textarea
                id={control.id}
                aria-describedby={control.describedBy}
                rows={4}
                maxLength={NOTE_MAX}
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            )}
          </Field>
        )}

        {error === null ? null : (
          <p role="alert" className="text-sm text-bata">
            {error}
          </p>
        )}
      </div>
    </Sheet>
  );
}