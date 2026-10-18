export const OUTBOX_ITEM_TYPES = Object.freeze(["batch", "ledger_event", "observasi_sisa"] as const);

export type OutboxItemType = (typeof OUTBOX_ITEM_TYPES)[number];

export type OutboxStatus = "menunggu" | "terkirim" | "ditolak";

export interface OutboxError {
  readonly code: string;
  readonly field?: string;
}

export interface OutboxItem {
  readonly id: string;
  readonly tipe: OutboxItemType;
  readonly refId?: string;
  readonly payload: Record<string, unknown>;
  readonly photoBlobId?: string;
  readonly createdAt: number;
  readonly attempts: number;
  readonly status: OutboxStatus;
  readonly errors?: readonly OutboxError[];
  readonly nextAttemptAt?: number;
  readonly lastErrorCode?: string;
  readonly deliveredAt?: number;
  readonly resourceId?: string;
  readonly resultStatus?: "DIBUAT" | "DUPLIKAT";
}

export interface OutboxEnqueueInput {
  readonly tipe: OutboxItemType;
  readonly tipeLabel?: never;
  readonly payload: Record<string, unknown>;
  readonly refId?: string;
  readonly photoBlobId?: string;
}