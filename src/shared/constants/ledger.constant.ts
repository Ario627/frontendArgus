import type { UserRole } from "@/shared/constants/roles.constant";

export const LEDGER_EVENT_TYPES = Object.freeze([
  "DIKELUARKAN",
  "DITIMBANG",
  "SERAH_TERIMA",
  "DITERIMA",
  "DIOLAH",
  "KELUARAN",
  "KOREKSI"
] as const);

export type LedgerEventType = (typeof LEDGER_EVENT_TYPES)[number];

export const LEDGER_EVENT_LABELS: Readonly<Record<LedgerEventType, string>> = Object.freeze({
  DIKELUARKAN: "Dikeluarkan",
  DITIMBANG: "Ditimbang",
  SERAH_TERIMA: "Serah terima",
  DITERIMA: "Diterima",
  DIOLAH: "Diolah",
  KELUARAN: "Keluaran",
  KOREKSI: "Koreksi"
});

export const LEDGER_APPEND_ROLES: Readonly<Record<LedgerEventType, readonly UserRole[]>> = Object.freeze({
  DIKELUARKAN: Object.freeze([] as const),
  DITIMBANG: Object.freeze(["sppg_staff", "admin"] as const),
  SERAH_TERIMA: Object.freeze(["sppg_staff", "driver", "facility", "admin"] as const),
  DITERIMA: Object.freeze(["facility", "admin"] as const),
  DIOLAH: Object.freeze(["facility", "admin"] as const),
  KELUARAN: Object.freeze(["facility", "admin"] as const),
  KOREKSI: Object.freeze(["admin"] as const)
});

export const TRANSFER_SIDES = Object.freeze(["KIRIM", "TERIMA"] as const);

export type TransferSide = (typeof TRANSFER_SIDES)[number];

const LEDGER_EVENT_SET: ReadonlySet<string> = new Set(LEDGER_EVENT_TYPES);

export function isLedgerEventType(value: unknown): value is LedgerEventType {
  return typeof value === "string" && LEDGER_EVENT_SET.has(value);
}

export function defaultTransferSide(role: UserRole): TransferSide | null {
  if (role === "sppg_staff" || role === "driver") return "KIRIM";
  if (role === "facility") return "TERIMA";
  return null;
}