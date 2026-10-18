import { useRef, useState } from "react";
import { isApiError } from "@/api/api-error";
import {
  submitPublicTicket,
  uploadPublicPhoto
} from "@/features/public-report/api/public-report.api";
import {
  isHoneypotFilled,
  validateReportDraft,
  type ReportDraft
} from "@/features/public-report/report-validation";
import { newClientEventId } from "@/shared/lib/id";
import type { PublicTicketCreatedDto } from "@/shared/types/ticket.types";

const RATE_LIMIT_MESSAGE =
  "Batas laporan tercapai untuk jaringan ini saat ini. Coba lagi dalam 1 jam.";

export type SubmitPhase = "idle" | "uploading-photo" | "submitting" | "done";

export interface SubmitState {
  readonly phase: SubmitPhase;
  readonly result: PublicTicketCreatedDto | null;
  readonly error: string | null;
}

export interface UseSubmitReport {
  readonly state: SubmitState;
  readonly submit: (draft: ReportDraft, photo: File | null) => void;
  readonly reset: () => void;
}

export function useSubmitReport(slug: string): UseSubmitReport {
  const [state, setState] = useState<SubmitState>({ phase: "idle", result: null, error: null });
  const clientEventIdRef = useRef(newClientEventId());

  const submit = (draft: ReportDraft, photo: File | null) => {
    if (state.phase === "uploading-photo" || state.phase === "submitting") return;

    if (isHoneypotFilled(draft)) {
      setState({
        phase: "idle",
        result: null,
        error: "Laporan tidak dapat dikirim. Coba lagi sebentar lagi."
      });
      return;
    }

    const validation = validateReportDraft(draft);
    if (!validation.ok) {
      setState({ phase: "idle", result: null, error: validation.message ?? "Periksa kembali laporan Anda." });
      return;
    }

    const run = async () => {
      try {
        let fotoHash: string | undefined;
        if (photo !== null) {
          setState({ phase: "uploading-photo", result: null, error: null });
          const { compressImageToJpeg } = await import("@/features/public-report/lib/compress-image");
          const compressed = await compressImageToJpeg(photo);
          if (compressed === null) {
            setState({
              phase: "idle",
              result: null,
              error: "Foto tidak dapat diproses. Hapus foto untuk mengirim tanpa foto, atau pilih foto lain."
            });
            return;
          }
          const upload = await uploadPublicPhoto(compressed);
          fotoHash = upload.fotoHash;
        }
        setState({ phase: "submitting", result: null, error: null });
        const result = await submitPublicTicket({
          sppgPublicId: slug,
          jenis: draft.jenis ?? "lainnya",
          deskripsi: draft.deskripsi.trim(),
          clientEventId: clientEventIdRef.current,
          ...(fotoHash === undefined ? {} : { fotoHash })
        });
        setState({ phase: "done", result, error: null });
      } catch (cause) {
        const message = isApiError(cause)
          ? cause.code === "TICKET_RATE_LIMITED"
            ? RATE_LIMIT_MESSAGE
            : cause.message
          : "Laporan tidak dapat dikirim. Periksa jaringan lalu coba lagi.";
        setState({ phase: "idle", result: null, error: message });
      }
    };

    void run();
  };

  const reset = () => {
    clientEventIdRef.current = newClientEventId();
    setState({ phase: "idle", result: null, error: null });
  };

  return { state, submit, reset };
}