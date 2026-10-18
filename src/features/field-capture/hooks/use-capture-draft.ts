import { useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  clearCaptureDraft,
  readCaptureDraft,
  writeCaptureDraft,
  type CaptureDraftRecord
} from "@/shared/lib/outbox-db";
import type { CaptureFormValues } from "@/features/field-capture/schemas/create-batch.schema";

const DRAFT_DEBOUNCE_MS = 800;

export interface CaptureDraftControls {
  readonly pending: CaptureDraftRecord | null;
  readonly restore: () => void;
  readonly discard: () => void;
  readonly clear: () => void;
}

export function useCaptureDraft(form: UseFormReturn<CaptureFormValues>): CaptureDraftControls {
  const [pending, setPending] = useState<CaptureDraftRecord | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    void readCaptureDraft().then((record) => {
      if (active) setPending(record);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const flush = () => {
      if (timer.current === null) return;
      clearTimeout(timer.current);
      timer.current = null;
    };
    const subscription = form.watch((values) => {
      flush();
      timer.current = setTimeout(() => {
        timer.current = null;
        void writeCaptureDraft(values as Partial<CaptureFormValues>);
      }, DRAFT_DEBOUNCE_MS);
    });
    return () => {
      subscription.unsubscribe();
      flush();
    };
  }, [form]);

  return {
    pending,
    restore: () => {
      if (pending === null) return;
      const base = form.formState.defaultValues ?? {};
      form.reset({ ...base, ...(pending.values as Partial<CaptureFormValues>) });
      setPending(null);
    },
    discard: () => {
      void clearCaptureDraft();
      setPending(null);
    },
    clear: () => {
      void clearCaptureDraft();
      setPending(null);
    }
  };
}