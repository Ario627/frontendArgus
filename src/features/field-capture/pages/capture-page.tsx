import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { StepConfirm } from "@/features/field-capture/components/step-confirm";
import { StepContent } from "@/features/field-capture/components/step-content";
import { StepWeight } from "@/features/field-capture/components/step-weight";
import { SubmissionPanel } from "@/features/field-capture/components/submission-panel";
import { useCaptureDraft } from "@/features/field-capture/hooks/use-capture-draft";
import {
  captureSchema,
  toCreateBatchPayload,
  type CaptureFormValues
} from "@/features/field-capture/schemas/create-batch.schema";
import { useOutbox } from "@/features/outbox/hooks/use-outbox";
import { PhotoCaptureField } from "@/features/photo/components/photo-capture-field";
import { uploadPhoto } from "@/features/photo/api/photo.api";
import { Button } from "@/shared/components/ui/button";
import { FieldActionBar } from "@/shared/components/layout/field-action-bar";
import { formatTime } from "@/shared/lib/format";
import { newClientEventId, newId } from "@/shared/lib/id";
import type { CompressedPhoto } from "@/features/photo/photo-compress";

type CaptureStep = 1 | 2 | 3;

const STEP_LABELS: Readonly<Record<CaptureStep, string>> = Object.freeze({
  1: "Berat",
  2: "Isi",
  3: "Konfirmasi"
});

function makeDefaults(): CaptureFormValues {
  return {
    aliran: "organik",
    weightText: "",
    dominant: "",
    extras: [],
    rinciEnabled: false,
    rinci: {},
    visibleOil: false,
    moistureProxy: "",
    occurredAt: new Date().toISOString()
  };
}

export function CapturePage() {
  const sppgId = useAuthStore((state) => state.user?.sppgId ?? null);
  const [clientEventId, setClientEventId] = useState(() => newClientEventId());
  const [batchId, setBatchId] = useState(() => newId());
  const [step, setStep] = useState<CaptureStep>(1);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<CompressedPhoto | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoPending, setPhotoPending] = useState(false);
  const [pendingValues, setPendingValues] = useState<CaptureFormValues | null>(null);

  const form = useForm<CaptureFormValues>({
    resolver: zodResolver(
      captureSchema as unknown as Parameters<typeof zodResolver>[0]
    ) as unknown as Resolver<CaptureFormValues, unknown, CaptureFormValues>,
    mode: "onTouched",
    defaultValues: makeDefaults()
  });

  const draft = useCaptureDraft(form);
  const outbox = useOutbox();

  const goNext = async () => {
    if (step === 1) {
      const ok = await form.trigger(["weightText"]);
      if (ok) setStep(2);
      return;
    }
    const ok = await form.trigger([
      "aliran",
      "dominant",
      "extras",
      "rinciEnabled",
      "rinci",
      "moistureProxy",
      "weightText"
    ]);
    if (ok) setStep(3);
  };

  const finishSubmit = async (values: CaptureFormValues, photoHash: string | null) => {
    try {
      const payload = toCreateBatchPayload(values, {
        sppgId: sppgId ?? "",
        clientEventId,
        batchId,
        ...(photoHash === null ? {} : { photoHash })
      });
      await outbox.enqueue({ tipe: "batch", payload: { ...payload } as Record<string, unknown> });
      setPhotoPending(false);
      setPendingValues(null);
      draft.clear();
      setSubmissionId(clientEventId);
    } catch {
      setSubmitError("Tidak dapat menyimpan di perangkat. Coba lagi.");
    }
  };

  const runSubmit = (values: CaptureFormValues) => {
    if (sppgId === null) {
      setSubmitError("Akun ini tidak terhubung ke dapur mana pun.");
      return;
    }
    setSubmitError(null);
    setPhotoPending(false);
    if (photo === null) {
      void finishSubmit(values, null);
      return;
    }
    setPendingValues(values);
    setPhotoBusy(true);
    void uploadPhoto({ blob: photo.blob, sha256: photo.sha256, refType: "batch", refId: batchId })
      .then((uploaded) => finishSubmit(values, uploaded.sha256))
      .catch(() => {
        setPhotoPending(true);
      })
      .finally(() => {
        setPhotoBusy(false);
      });
  };

  const submit = form.handleSubmit(runSubmit);

  const retryPhoto = () => {
    if (pendingValues !== null) runSubmit(pendingValues);
  };

  const skipPhoto = () => {
    setPhoto(null);
    setPhotoPending(false);
    if (pendingValues !== null) void finishSubmit(pendingValues, null);
  };

  const startNew = () => {
    setClientEventId(newClientEventId());
    setBatchId(newId());
    setPhoto(null);
    setPhotoPending(false);
    setPendingValues(null);
    setSubmissionId(null);
    setSubmitError(null);
    setStep(1);
    form.reset(makeDefaults());
    draft.clear();
  };

  if (submissionId !== null) {
    return (
      <div className="flex flex-col gap-4">
        {submitError === null ? null : (
          <p role="alert" className="rounded-kontainer border border-bata/40 bg-bata/5 px-3 py-2 text-sm text-bata">
            {submitError}
          </p>
        )}
        <SubmissionPanel clientEventId={submissionId} onNew={startNew} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {draft.pending === null ? null : (
        <div className="flex items-center justify-between gap-3 rounded-kontainer border border-garis px-3 py-2">
          <span className="text-sm text-ink">
            Lanjutkan draft {formatTime(new Date(draft.pending.savedAt))}?
          </span>
          <div className="flex shrink-0 gap-2">
            <Button variant="secondary" size="sm" onClick={draft.restore}>
              Lanjutkan
            </Button>
            <Button variant="ghost" size="sm" onClick={draft.discard}>
              Mulai baru
            </Button>
          </div>
        </div>
      )}

      {submitError === null ? null : (
        <p role="alert" className="rounded-kontainer border border-bata/40 bg-bata/5 px-3 py-2 text-sm text-bata">
          {submitError}
        </p>
      )}

      {photoPending ? (
        <div className="flex flex-col gap-2 rounded-kontainer border border-kunyit/60 bg-kunyit/5 px-3 py-2">
          <p className="text-sm text-ink">
            Foto belum terkirim. Coba lagi saat sinyal membaik, atau simpan batch tanpa foto.
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" loading={photoBusy} onClick={retryPhoto}>
              Coba kirim foto lagi
            </Button>
            <Button variant="ghost" size="sm" onClick={skipPhoto}>
              Simpan tanpa foto
            </Button>
          </div>
        </div>
      ) : null}

      <p className="text-xs text-ink-lemah">
        Langkah {step} dari 3 · {STEP_LABELS[step]}
      </p>

      {step === 1 ? <StepWeight form={form} /> : null}
      {step === 2 ? <StepContent form={form} /> : null}
      {step === 3 ? <StepConfirm form={form} /> : null}
      {step === 3 ? (
        <PhotoCaptureField
          label="Foto bukti (opsional)"
          hint="Menjadi lampiran bukti saat audit. Dikompres di perangkat, dikirim bila sinyal tersedia."
          disabled={photoBusy}
          onPhotoChange={setPhoto}
        />
      ) : null}

      <FieldActionBar>
        <div className="flex gap-2">
          {step > 1 ? (
            <Button
              variant="ghost"
              onClick={() => setStep(step === 3 ? 2 : 1)}
            >
              Kembali
            </Button>
          ) : null}
          {step < 3 ? (
            <Button size="lg" fullWidth onClick={() => void goNext()}>
              Lanjut: {STEP_LABELS[step === 1 ? 2 : 3]}
            </Button>
          ) : (
            <Button size="lg" fullWidth loading={photoBusy} onClick={() => void submit()}>
              Simpan batch
            </Button>
          )}
        </div>
      </FieldActionBar>
    </div>
  );
}