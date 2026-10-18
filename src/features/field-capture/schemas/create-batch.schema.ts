import { z } from "zod";
import { BATCH_WEIGHT_LIMITS } from "@/shared/constants/batch.constant";
import {
  MOISTURE_PROXIES,
  WASTE_FLOWS,
  type MoistureProxy,
  type WasteFlow
} from "@/shared/constants/flow.constant";
import { buildFractionsFromForm, type FractionBuildReason } from "@/shared/lib/fraction-input";
import { parseKg } from "@/shared/lib/format";
import type { CreateBatchInput } from "@/shared/types/batch.types";

export interface CaptureFormValues {
  aliran: WasteFlow;
  weightText: string;
  dominant: string;
  extras: string[];
  rinciEnabled: boolean;
  rinci: Record<string, string>;
  visibleOil: boolean;
  moistureProxy: string;
  occurredAt: string;
}

const MAX_FUTURE_SKEW_MS = 5 * 60 * 1000;
const MAX_PAST_MS = 24 * 60 * 60 * 1000;

const FRACTION_REASON_MESSAGES: Readonly<Record<FractionBuildReason, string>> = Object.freeze({
  NEED_DOMINANT: "Pilih sisa yang paling banyak.",
  RINCI_INVALID: "Persen tidak valid (0–100, maks 2 desimal).",
  RINCI_EMPTY: "Isi minimal satu fraksi lebih dari 0.",
  RINCI_OVER: "Total fraksi melebihi 100%."
});

export const captureSchema: z.ZodType<CaptureFormValues> = z
  .object({
    aliran: z.enum(WASTE_FLOWS),
    weightText: z.string(),
    dominant: z.string(),
    extras: z.array(z.string()),
    rinciEnabled: z.boolean(),
    rinci: z.record(z.string(), z.string()),
    visibleOil: z.boolean(),
    moistureProxy: z.string(),
    occurredAt: z.string()
  })
  .superRefine((values, ctx) => {
    const weight = parseKg(values.weightText);
    if (weight === null) {
      ctx.addIssue({ code: "custom", path: ["weightText"], message: "Isi berat dalam kg (contoh: 12,4)." });
    } else if (weight < BATCH_WEIGHT_LIMITS.minKg) {
      ctx.addIssue({ code: "custom", path: ["weightText"], message: "Berat minimal 0,1 kg." });
    } else if (values.aliran === "minyak" && weight > BATCH_WEIGHT_LIMITS.minyakMaxKg) {
      ctx.addIssue({ code: "custom", path: ["weightText"], message: "Berat maksimal 200 kg untuk aliran minyak." });
    } else if (weight > BATCH_WEIGHT_LIMITS.maxKg) {
      ctx.addIssue({ code: "custom", path: ["weightText"], message: "Berat maksimal 500 kg." });
    }

    if (values.moistureProxy !== "" && !MOISTURE_PROXIES.includes(values.moistureProxy as MoistureProxy)) {
      ctx.addIssue({ code: "custom", path: ["moistureProxy"], message: "Pilih kadar air yang tersedia." });
    }

    const occurredAtMs = Date.parse(values.occurredAt);
    const now = Date.now();
    if (Number.isNaN(occurredAtMs)) {
      ctx.addIssue({ code: "custom", path: ["occurredAt"], message: "Waktu tidak valid." });
    } else if (occurredAtMs > now + MAX_FUTURE_SKEW_MS) {
      ctx.addIssue({ code: "custom", path: ["occurredAt"], message: "Waktu tidak boleh lebih dari 5 menit ke depan." });
    } else if (occurredAtMs < now - MAX_PAST_MS) {
      ctx.addIssue({
        code: "custom",
        path: ["occurredAt"],
        message: "Waktu lebih dari 24 jam lalu. Hubungi admin bila memang perlu."
      });
    }

    if (values.aliran === "organik") {
      const built = buildFractionsFromForm(values);
      if (!built.ok) {
        const message = FRACTION_REASON_MESSAGES[built.reason];
        const path =
          built.reason === "NEED_DOMINANT"
            ? (["dominant"] as const)
            : built.field === undefined
              ? (["rinci"] as const)
              : (["rinci", built.field] as const);
        ctx.addIssue({ code: "custom", path: [...path], message });
      }
    }
  });

export interface CapturePayloadContext {
  readonly sppgId: string;
  readonly clientEventId: string;
}

export function toCreateBatchPayload(
  values: CaptureFormValues,
  context: CapturePayloadContext
): CreateBatchInput {
  const weightKg = parseKg(values.weightText);
  if (weightKg === null) {
    throw new Error("Berat tidak valid saat menyusun payload");
  }
  const moisture = values.moistureProxy === "" ? null : (values.moistureProxy as MoistureProxy);
  let fractions: Record<string, number> | null = null;
  if (values.aliran === "organik") {
    const built = buildFractionsFromForm(values);
    fractions = built.ok ? { ...built.fractions } : {};
  }
  return {
    clientEventId: context.clientEventId,
    sppgId: context.sppgId,
    aliran: values.aliran,
    weightKg,
    occurredAt: new Date(values.occurredAt).toISOString(),
    visibleOil: values.visibleOil,
    ...(fractions === null ? {} : { fractions }),
    ...(moisture === null ? {} : { moistureProxy: moisture })
  };
}