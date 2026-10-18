import type { BatchStatus } from "@/shared/constants/batch.constant";
import { LEDGER_APPEND_ROLES, type LedgerEventType } from "@/shared/constants/ledger.constant";
import type { UserRole } from "@/shared/constants/roles.constant";
import type { TicketStatus } from "@/shared/constants/ticket.constant";

export const BATCH_STATUS_TRANSITIONS: Readonly<Record<BatchStatus, readonly BatchStatus[]>> = Object.freeze({
  DICATAT: Object.freeze(["MENUNGGU_ANGKUT", "GAGAL_GATE", "TERSANGKUT"] as const),
  MENUNGGU_ANGKUT: Object.freeze(["DIANGKUT", "GAGAL_GATE", "TERSANGKUT"] as const),
  DIANGKUT: Object.freeze(["DITERIMA", "TERSANGKUT"] as const),
  DITERIMA: Object.freeze(["DIOLAH"] as const),
  DIOLAH: Object.freeze(["SELESAI"] as const),
  GAGAL_GATE: Object.freeze(["MENUNGGU_ANGKUT", "TERSANGKUT"] as const),
  SELESAI: Object.freeze([] as const),
  TERSANGKUT: Object.freeze([] as const)
});

export const LEDGER_EVENTS_BY_BATCH_STATUS: Readonly<Record<BatchStatus, readonly LedgerEventType[]>> = Object.freeze({
  DICATAT: Object.freeze(["DIKELUARKAN", "DITIMBANG", "KOREKSI"] as const),
  MENUNGGU_ANGKUT: Object.freeze(["DITIMBANG", "SERAH_TERIMA", "KOREKSI"] as const),
  DIANGKUT: Object.freeze(["SERAH_TERIMA", "DITERIMA", "KOREKSI"] as const),
  DITERIMA: Object.freeze(["DITERIMA", "DIOLAH", "KOREKSI"] as const),
  DIOLAH: Object.freeze(["DIOLAH", "KELUARAN", "KOREKSI"] as const),
  GAGAL_GATE: Object.freeze(["DITIMBANG", "KOREKSI"] as const),
  SELESAI: Object.freeze(["KOREKSI"] as const),
  TERSANGKUT: Object.freeze(["KOREKSI"] as const)
});

export const TICKET_TRANSITIONS: Readonly<Record<TicketStatus, readonly TicketStatus[]>> = Object.freeze({
  BARU: Object.freeze(["DIVERIFIKASI", "DITOLAK_MODERASI"] as const),
  DIVERIFIKASI: Object.freeze(["DITANGGAPI", "DITOLAK_MODERASI"] as const),
  DITANGGAPI: Object.freeze(["SELESAI"] as const),
  SELESAI: Object.freeze([] as const),
  DITOLAK_MODERASI: Object.freeze([] as const)
});

export function isLedgerEventAllowed(status: BatchStatus, tipe: LedgerEventType): boolean {
  return LEDGER_EVENTS_BY_BATCH_STATUS[status].includes(tipe);
}

export function appendableLedgerEvents(role: UserRole, status: BatchStatus): readonly LedgerEventType[] {
  return LEDGER_EVENTS_BY_BATCH_STATUS[status].filter((tipe) => LEDGER_APPEND_ROLES[tipe].includes(role));
}

export function isTicketTransitionAllowed(from: TicketStatus, to: TicketStatus): boolean {
  return TICKET_TRANSITIONS[from].includes(to);
}