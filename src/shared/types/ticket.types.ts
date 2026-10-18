import type { TicketKind, TicketStatus } from "@/shared/constants/ticket.constant";

export interface TicketDto {
  readonly id: string;
  readonly sppgId: string;
  readonly jenis: TicketKind;
  readonly deskripsi: string;
  readonly fotoHash: string | null;
  readonly lat: number | null;
  readonly lng: number | null;
  readonly status: TicketStatus;
  readonly jawabanSppg: string | null;
  readonly jawabanAt: string | null;
  readonly skorRisiko: number | null;
  readonly isDemo: boolean;
  readonly createdAt: string;
}

export interface TicketEventDto {
  readonly id: string;
  readonly dariStatus: TicketStatus | null;
  readonly keStatus: TicketStatus;
  readonly aktor: string | null;
  readonly catatan: string | null;
  readonly ts: string;
}

export interface TicketDetailDto extends TicketDto {
  readonly riwayat: readonly TicketEventDto[];
}

export interface VerifyTicketInput {
  readonly status: "DIVERIFIKASI" | "DITOLAK_MODERASI";
  readonly catatan?: string;
}

export interface RespondTicketInput {
  readonly jawaban: string;
}

export interface CloseTicketInput {
  readonly catatan?: string;
}

export interface PublicSppgDto {
  readonly nama: string;
  readonly alamat: string | null;
}

export interface PublicTicketCreatedDto {
  readonly id: string;
  readonly jenis: TicketKind;
  readonly status: TicketStatus;
  readonly createdAt: string;
}

export interface CreatePublicTicketInput {
  readonly sppgPublicId: string;
  readonly jenis: TicketKind;
  readonly deskripsi: string;
  readonly clientEventId: string;
  readonly fotoHash?: string;
  readonly lat?: number;
  readonly lng?: number;
}

export interface PhotoLinkDto {
  readonly sha256: string;
  readonly url: string;
}