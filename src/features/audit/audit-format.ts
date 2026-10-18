import { ROLE_LABELS, isUserRole } from "@/shared/constants/roles.constant";
import { formatInt } from "@/shared/lib/format";
import type { AuditLogDto } from "@/shared/types/audit.types";

const RESOURCE_LABELS: Readonly<Record<string, string>> = Object.freeze({
  batches: "batch",
  ledger: "ledger",
  devices: "perangkat",
  fleet: "armada",
  facilities: "fasilitas",
  sppg: "dapur",
  tickets: "tiket",
  menu: "menu",
  parameters: "parameter",
  routes: "rute",
  chain: "rantai",
  retention: "retensi",
  dispositions: "disposisi",
  photos: "foto",
  anomalies: "anomali",
  sync: "sinkronisasi",
  export: "ekspor",
  audit: "audit"
});

const SEGMENT_LABELS: Readonly<Record<string, string>> = Object.freeze({
  gate: "nilai ulang gerbang",
  revoke: "cabut",
  "rotate-secret": "putar kredensial",
  verify: "verifikasi",
  confirm: "konfirmasi",
  plan: "rencana",
  replan: "rencana ulang",
  close: "tutup",
  respond: "jawab",
  link: "tautkan",
  positions: "posisi",
  "struk-link": "tautan struk",
  transfers: "transfer",
  observations: "observasi",
  servings: "penyajian",
  items: "item"
});

const METHOD_LABELS: Readonly<Record<string, string>> = Object.freeze({
  POST: "Kirim",
  PUT: "Simpan",
  PATCH: "Ubah",
  DELETE: "Hapus"
});

const SPECIAL_ACTIONS: Readonly<Record<string, string>> = Object.freeze({
  "export.batches": "Ekspor batch"
});

export function describeAuditAction(aksi: string): string {
  const special = SPECIAL_ACTIONS[aksi];
  if (special !== undefined) return special;
  const spaceIndex = aksi.indexOf(" ");
  if (spaceIndex === -1) return aksi;
  const method = aksi.slice(0, spaceIndex).toUpperCase();
  const path = aksi.slice(spaceIndex + 1);
  const segments = path
    .split("/")
    .filter((segment) => segment !== "" && !segment.startsWith(":") && !/^[0-9a-f-]{20,}$/.test(segment));
  const resource = segments[0];
  const resourceLabel = resource === undefined ? path : (RESOURCE_LABELS[resource] ?? resource);
  const verbs = segments
    .slice(1)
    .map((segment) => SEGMENT_LABELS[segment] ?? segment)
    .filter((segment) => segment !== "id");
  const methodLabel = METHOD_LABELS[method] ?? method;
  const head = resourceLabel.charAt(0).toUpperCase() + resourceLabel.slice(1);
  if (verbs.length === 0) return `${head} — ${methodLabel.toLowerCase()}`;
  return `${head} — ${verbs.join(" ")}`;
}

export function describeAuditActor(log: AuditLogDto): string {
  const role = log.aktorPeran !== null && isUserRole(log.aktorPeran) ? ROLE_LABELS[log.aktorPeran] : null;
  const id = log.aktor === null ? "anonim" : log.aktor.slice(0, 8);
  return role === null ? id : `${role} · ${id}`;
}

export function describeAuditOutcome(log: AuditLogDto): string | null {
  const outcome = log.detail["outcome"];
  const status = log.detail["status"];
  const code = log.detail["code"];
  const parts: string[] = [];
  if (typeof outcome === "string") parts.push(outcome === "OK" ? "berhasil" : "gagal");
  if (typeof status === "number" && Number.isFinite(status)) parts.push(String(status));
  if (typeof code === "string" && code.length > 0) parts.push(code);
  if (parts.length === 0) return null;
  return parts.join(" · ");
}

export function describeAuditDetail(log: AuditLogDto): string | null {
  const query = log.detail["query"];
  if (typeof query !== "object" || query === null || Array.isArray(query)) return null;
  const entries = Object.entries(query as Record<string, unknown>).filter(
    (entry) => entry[1] !== null && entry[1] !== undefined && entry[1] !== ""
  );
  if (entries.length === 0) return null;
  const parts = entries
    .slice(0, 4)
    .map(([key, value]) =>
      value === null || value === undefined
        ? `${key} —`
        : `${key} ${typeof value === "number" ? formatInt(value) : String(value)}`
    );
  return parts.join(" · ");
}
