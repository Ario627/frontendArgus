export const USER_ROLES = Object.freeze([
  "admin",
  "sppg_staff",
  "driver",
  "facility",
  "dlh_auditor"
] as const);

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Readonly<Record<UserRole, string>> = Object.freeze({
  admin: "Admin",
  sppg_staff: "Staf SPPG",
  driver: "Pengemudi",
  facility: "Operator Fasilitas",
  dlh_auditor: "Auditor DLH"
});

export const CONSOLE_ROLES: readonly UserRole[] = Object.freeze([
  "admin",
  "dlh_auditor",
  "sppg_staff"
] as const);

export const FIELD_ROLES: readonly UserRole[] = Object.freeze([
  "sppg_staff",
  "driver",
  "facility"
] as const);

export const CAPTURE_ROLES: readonly UserRole[] = Object.freeze(["sppg_staff"] as const);

const USER_ROLE_SET: ReadonlySet<string> = new Set(USER_ROLES);

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLE_SET.has(value);
}