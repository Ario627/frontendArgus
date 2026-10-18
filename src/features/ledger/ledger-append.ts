import { appendableLedgerEvents } from "@/shared/constants/transitions.constant";
import type { BatchStatus } from "@/shared/constants/batch.constant";
import type { LedgerEventType, TransferSide } from "@/shared/constants/ledger.constant";
import type { UserRole } from "@/shared/constants/roles.constant";
import type { AppendEventInput } from "@/shared/types/ledger.types";

export const UI_APPEND_TYPES = Object.freeze([
  "SERAH_TERIMA",
  "DITERIMA",
  "DIOLAH",
  "KELUARAN"
] as const);

export type UiAppendType = (typeof UI_APPEND_TYPES)[number];

export interface AppendTypeSpec {
  readonly tipe: UiAppendType;
  readonly label: string;
  readonly verb: string;
  readonly needsWeight: boolean;
  readonly prefillWeight: boolean;
  readonly adminSideRequired: boolean;
}

export const APPEND_TYPE_SPECS: Readonly<Record<UiAppendType, AppendTypeSpec>> = Object.freeze({
  SERAH_TERIMA: {
    tipe: "SERAH_TERIMA",
    label: "Serah terima",
    verb: "Catat serah terima",
    needsWeight: true,
    prefillWeight: true,
    adminSideRequired: true
  },
  DITERIMA: {
    tipe: "DITERIMA",
    label: "Diterima",
    verb: "Catat penerimaan",
    needsWeight: true,
    prefillWeight: true,
    adminSideRequired: false
  },
  DIOLAH: {
    tipe: "DIOLAH",
    label: "Diolah",
    verb: "Catat pengolahan",
    needsWeight: false,
    prefillWeight: false,
    adminSideRequired: false
  },
  KELUARAN: {
    tipe: "KELUARAN",
    label: "Keluaran",
    verb: "Catat keluaran",
    needsWeight: true,
    prefillWeight: false,
    adminSideRequired: false
  }
});

const UI_APPEND_SET: ReadonlySet<string> = new Set(UI_APPEND_TYPES);

function isUiAppendType(value: LedgerEventType): value is UiAppendType {
  return UI_APPEND_SET.has(value);
}

export function uiAppendOptions(role: UserRole, status: BatchStatus): readonly AppendTypeSpec[] {
  return appendableLedgerEvents(role, status).filter(isUiAppendType).map((tipe) => APPEND_TYPE_SPECS[tipe]);
}

export function defaultUiAppendType(status: BatchStatus): UiAppendType | null {
  if (status === "MENUNGGU_ANGKUT" || status === "DIANGKUT" || status === "GAGAL_GATE") return "SERAH_TERIMA";
  if (status === "DITERIMA") return "DIOLAH";
  if (status === "DIOLAH") return "KELUARAN";
  return null;
}

export interface AppendFormValues {
  readonly weightKg: number | null;
  readonly occurredAtIso: string;
  readonly note: string;
  readonly sisi: TransferSide | null;
}

export function buildAppendPayload(
  spec: AppendTypeSpec,
  values: AppendFormValues,
  clientEventId: string
): AppendEventInput {
  const note = values.note.trim();
  return {
    clientEventId,
    tipe: spec.tipe,
    occurredAt: values.occurredAtIso,
    ...(spec.needsWeight && values.weightKg !== null ? { weightKg: values.weightKg } : {}),
    ...(note === "" ? {} : { note }),
    ...(spec.adminSideRequired && values.sisi !== null ? { sisi: values.sisi } : {})
  };
}