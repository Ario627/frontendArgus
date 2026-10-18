import type { GateStatus } from "@/shared/constants/gate.constant";
import type { LedgerEventDto, TransferEvaluation } from "@/shared/types/ledger.types";

export interface LandingFact {
  readonly value: string;
  readonly label: string;
}

export const LANDING_FACTS: readonly LandingFact[] = Object.freeze([
  { value: "0,1–500 kg", label: "rentang berat per batch" },
  { value: "T0–T4", label: "tingkat keputusan limpahan" },
  { value: "SHA-256", label: "segel tiap peristiwa" },
  { value: "A–E", label: "fraksi komposisi sisa" }
]);

export interface LandingDecision {
  readonly code: string;
  readonly question: string;
  readonly description: string;
}

export const LANDING_DECISIONS: readonly LandingDecision[] = Object.freeze([
  {
    code: "01",
    question: "Ke mana limpahan ini harus pergi?",
    description:
      "Kompas disposisi menilai kandidat fasilitas dengan skor biaya, nilai, dan risiko — lalu menyimpan alasannya untuk ditelusuri."
  },
  {
    code: "02",
    question: "Apakah limbah ini layak diterima?",
    description:
      "Gerbang penerimaan menilai kadar air, kontaminan, dan umur terhadap profil fasilitas, dengan instruksi perbaikan yang jelas saat belum lolos."
  },
  {
    code: "03",
    question: "Bisakah perjalanannya dibuktikan?",
    description:
      "Setiap peristiwa tersegel dalam rantai SHA-256. Serah terima dengan saksi ganda dan neraca massa memeriksa selisih berat."
  },
  {
    code: "04",
    question: "Menu apa yang paling banyak tersisa?",
    description:
      "Cermin menu merekap sisa per titik distribusi dan menghitung estimasi nilai terbuang sebagai dasar perbaikan menu berikutnya."
  }
]);

export interface LandingSurface {
  readonly name: string;
  readonly description: string;
}

export const LANDING_SURFACES: readonly LandingSurface[] = Object.freeze([
  {
    name: "Lapangan",
    description:
      "PWA untuk staf dapur, pengemudi, dan operator fasilitas. Bekerja tanpa sinyal: catatan aman di perangkat dan terkirim saat jaringan kembali."
  },
  {
    name: "Konsol DLH",
    description:
      "Ruang kerja auditor: verifikasi rantai, pantau antrean putusan, moderasi laporan warga, dan ekspor audit per periode."
  },
  {
    name: "Publik",
    description:
      "Warga melapor lewat tautan di pagar dapur tanpa akun. Setiap batch bisa menerbitkan struk yang bisa diperiksa siapa pun."
  }
]);

export interface GateSpecimen {
  readonly verdict: GateStatus;
  readonly meaning: string;
}

export const GATE_SPECIMENS: readonly GateSpecimen[] = Object.freeze([
  { verdict: "LOLOS", meaning: "Lanjut menunggu angkut" },
  { verdict: "PERBAIKI", meaning: "Tiriskan atau pisahkan, lalu nilai ulang" },
  { verdict: "ALIHKAN", meaning: "Diarahkan ke fasilitas yang lebih cocok" },
  { verdict: "TOLAK", meaning: "Tercatat tersangkut, butuh penanganan manual" }
]);

function demoHash(seed: number): string {
  const base = "0123456789abcdef";
  let state = Math.imul(seed, 2654435761) >>> 0;
  let value = "";
  for (let index = 0; index < 64; index += 1) {
    state = (Math.imul(state, 1103515245) + 12345) >>> 0;
    value += base.charAt(state & 15);
  }
  return value;
}

const DEMO_HASHES = [7, 13, 29, 41, 53, 61].map(demoHash);
const DEMO_BATCH_ID = "0192f0c8-1111-7000-8000-000000000001";

interface DemoEventInput {
  readonly id: number;
  readonly type: LedgerEventDto["type"];
  readonly occurredAt: string;
  readonly weightKg: number | null;
  readonly payload?: Record<string, unknown>;
}

function demoEvent(input: DemoEventInput): LedgerEventDto {
  return {
    id: input.id,
    batchId: DEMO_BATCH_ID,
    type: input.type,
    actorId: null,
    deviceId: null,
    weightKg: input.weightKg,
    lat: null,
    lng: null,
    photoHash: null,
    occurredAt: input.occurredAt,
    receivedAt: input.occurredAt,
    payload: input.payload ?? {},
    prevHash: input.id === 1 ? null : (DEMO_HASHES[input.id - 2] ?? null),
    hash: DEMO_HASHES[input.id - 1] ?? "",
    clientEventId: null,
    isDemo: true
  };
}

export const DEMO_LEDGER_EVENTS: readonly LedgerEventDto[] = Object.freeze([
  demoEvent({ id: 1, type: "DIKELUARKAN", occurredAt: "2026-10-16T02:12:00.000Z", weightKg: 12.4 }),
  demoEvent({ id: 2, type: "DITIMBANG", occurredAt: "2026-10-16T02:14:00.000Z", weightKg: 12.4 }),
  demoEvent({
    id: 3,
    type: "SERAH_TERIMA",
    occurredAt: "2026-10-16T04:02:00.000Z",
    weightKg: 12.4,
    payload: { data: { sisi: "KIRIM" } }
  }),
  demoEvent({
    id: 4,
    type: "DITERIMA",
    occurredAt: "2026-10-16T04:40:00.000Z",
    weightKg: 11.9,
    payload: { data: { sisi: "TERIMA" } }
  }),
  demoEvent({ id: 5, type: "DIOLAH", occurredAt: "2026-10-16T06:20:00.000Z", weightKg: 11.9 }),
  demoEvent({ id: 6, type: "KELUARAN", occurredAt: "2026-10-16T09:05:00.000Z", weightKg: 10.2 })
]);

export const DEMO_TRANSFER: TransferEvaluation = Object.freeze({
  status: "SAH",
  senderKg: 12.4,
  receiverKg: 11.9,
  handedOverKg: 12.15,
  diffKg: 0.5,
  withinTolerance: true,
  notes: Object.freeze([])
});

export interface LandingChainSeal {
  readonly time: string;
  readonly hash: string;
}

export const LANDING_CHAIN_SEALS: readonly LandingChainSeal[] = Object.freeze([
  { time: "09:14", hash: DEMO_HASHES[1] ?? "" },
  { time: "11:40", hash: DEMO_HASHES[3] ?? "" },
  { time: "16:05", hash: DEMO_HASHES[5] ?? "" }
]);