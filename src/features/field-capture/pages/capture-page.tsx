import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { isApiError } from "@/api/api-error";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { GateVerdictPanel } from "@/features/field-capture/components/gate-verdict-panel";
import { StepConfirm } from "@/features/field-capture/components/step-confirm";
import { StepContent } from "@/features/field-capture/components/step-content";
import { StepWeight } from "@/features/field-capture/components/step-weight";
import { useCaptureDraft } from "@/features/field-capture/hooks/use-capture-draft";
import { useCreateBatch } from "@/features/field-capture/hooks/use-create-batch";
import { useRegateBatch } from "@/features/field-capture/hooks/use-regate-batch";
import {
  captureSchema,
  toCreateBatchPayload,
  type CaptureFormValues
} from "@/features/field-capture/schemas/create-batch.schema";
import { Button } from "@/shared/components/ui/button";
import { FieldActionBar } from "@/shared/components/layout/field-action-bar";
import { formatTime } from "@/shared/lib/format";
import { newClientEventId } from "@/shared/lib/id";
import type { BatchDetailDto, ReGateInput } from "@/shared/types/batch.types";

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
  const clientEventIdRef = useRef(newClientEventId());
  const [step, setStep] = useState<CaptureStep>(1);
  const [batch, setBatch] = useState<BatchDetailDto | null>(null);
  const [duplicate, setDuplicate] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<CaptureFormValues>({
    resolver: zodResolver(
      captureSchema as unknown as Parameters<typeof zodResolver>[0]
    ) as unknown as Resolver<CaptureFormValues, unknown, CaptureFormValues>,
    mode: "onTouched",
    defaultValues: makeDefaults()
  });

  const draft = useCaptureDraft(form);
  const createBatch = useCreateBatch();
  const regate = useRegateBatch();
  const pending = createBatch.isPending;

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

  const submit = form.handleSubmit((values) => {
    if (sppgId === null) {
      setSubmitError("Akun ini tidak terhubung ke dapur mana pun.");
      return;
    }
    setSubmitError(null);
    const payload = toCreateBatchPayload(values, {
      sppgId,
      clientEventId: clientEventIdRef.current
    });
    createBatch.mutate(payload, {
      onSuccess: (result) => {
        draft.clear();
        setBatch(result.batch);
        setDuplicate(result.duplicate);
      },
      onError: (error) => {
        setSubmitError(
          isApiError(error) ? error.message : "Tidak dapat menyimpan saat ini. Coba lagi."
        );
      }
    });
  });

  const handleRegate = (patch: ReGateInput) => {
    if (batch === null) return;
    regate.mutate(
      { batchId: batch.id, patch },
      {
        onSuccess: (updated) => {
          setBatch(updated);
        },
        onError: (error) => {
          setSubmitError(
            isApiError(error) ? error.message : "Tidak dapat menilai ulang saat ini. Coba lagi."
          );
        }
      }
    );
  };

  const startNew = () => {
    clientEventIdRef.current = newClientEventId();
    setBatch(null);
    setDuplicate(false);
    setSubmitError(null);
    setStep(1);
    form.reset(makeDefaults());
    draft.clear();
  };

  if (batch !== null) {
    return (
      <div className="flex flex-col gap-4">
        {submitError === null ? null : (
          <p role="alert" className="rounded-kontainer border border-bata/40 bg-bata/5 px-3 py-2 text-sm text-bata">
            {submitError}
          </p>
        )}
        <GateVerdictPanel
          batch={batch}
          duplicate={duplicate}
          regatePending={regate.isPending}
          onRegate={handleRegate}
          onNew={startNew}
        />
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

      <p className="text-xs text-ink-lemah">
        Langkah {step} dari 3 · {STEP_LABELS[step]}
      </p>

      {step === 1 ? <StepWeight form={form} /> : null}
      {step === 2 ? <StepContent form={form} /> : null}
      {step === 3 ? <StepConfirm form={form} /> : null}

      <FieldActionBar>
        <div className="flex gap-2">
          {step > 1 ? (
            <Button
              variant="ghost"
              disabled={pending}
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
            <Button size="lg" fullWidth loading={pending} onClick={() => void submit()}>
              Simpan batch
            </Button>
          )}
        </div>
      </FieldActionBar>
    </div>
  );
}