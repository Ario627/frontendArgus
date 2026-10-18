import type { BatchStatus } from "@/shared/constants/batch.constant";
import type { WasteFlow } from "@/shared/constants/flow.constant";
import type { FractionCode } from "@/shared/constants/fraction.constant";
import type { GateStatus } from "@/shared/constants/gate.constant";
import type { LedgerEventType } from "@/shared/constants/ledger.constant";

export interface StrukFractionDto {
  readonly kode: FractionCode;
  readonly persen: number;
}

export interface StrukTraceDto {
  readonly tipe: LedgerEventType;
  readonly waktu: string;
}

export interface PublicStrukDto {
  readonly batchId: string;
  readonly sppgNama: string;
  readonly sppgAlamat: string | null;
  readonly aliran: WasteFlow;
  readonly tanggalWib: string;
  readonly jamWib: string;
  readonly beratKg: number;
  readonly fraksi: readonly StrukFractionDto[];
  readonly gateStatus: GateStatus | null;
  readonly tingkatPutusan: string | null;
  readonly status: BatchStatus;
  readonly rantaiUtuh: boolean;
  readonly jumlahEvent: number;
  readonly jejak: readonly StrukTraceDto[];
  readonly isDemo: boolean;
  readonly berlakuSampai: string;
}

export interface StrukLinkDto {
  readonly url: string;
  readonly berlakuSampai: string;
}

const STRUK_TOKEN_PATTERN = /^v1\.[0-9a-f-]{36}\.[0-9]{1,10}\.[A-Za-z0-9_-]{43}$/;

export function isStrukToken(value: string): boolean {
  return STRUK_TOKEN_PATTERN.test(value);
}