export const TICKET_KINDS = Object.freeze(["bau", "limbah_cair", "tumpukan", "lainnya"] as const);

export type TicketKind = (typeof TICKET_KINDS)[number];

export const TICKET_KIND_LABELS: Readonly<Record<TicketKind, string>> = Object.freeze({
  bau: "Bau",
  limbah_cair: "Limbah cair",
  tumpukan: "Tumpukan",
  lainnya: "Lainnya"
});

export const TICKET_STATUSES = Object.freeze([
  "BARU",
  "DIVERIFIKASI",
  "DITANGGAPI",
  "SELESAI",
  "DITOLAK_MODERASI"
] as const);

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_STATUS_LABELS: Readonly<Record<TicketStatus, string>> = Object.freeze({
  BARU: "Baru",
  DIVERIFIKASI: "Diverifikasi",
  DITANGGAPI: "Ditanggapi",
  SELESAI: "Selesai",
  DITOLAK_MODERASI: "Ditolak moderasi"
});

const TICKET_KIND_SET: ReadonlySet<string> = new Set(TICKET_KINDS);
const TICKET_STATUS_SET: ReadonlySet<string> = new Set(TICKET_STATUSES);

export function isTicketKind(value: unknown): value is TicketKind {
  return typeof value === "string" && TICKET_KIND_SET.has(value);
}

export function isTicketStatus(value: unknown): value is TicketStatus {
  return typeof value === "string" && TICKET_STATUS_SET.has(value);
}