import type { UserRole } from "../types/common.types";

export const USER_ROLES = Object.freeze([
  "admin",
  "supervisor",
  "driver",
] as const);

export const USER_ROLE_SET: ReadonlySet<UserRole> = new Set(USER_ROLES);

export const ROLE_LABELS: Readonly<Record<UserRole, string>> = Object.freeze({
  admin: "Administrator",
  supervisor: "Supervisor",
  driver: "Driver",
});

export const ROLE_HIERARCHY: Readonly<Record<UserRole, number>> = Object.freeze(
  {
    admin: 3,
    supervisor: 2,
    driver: 1,
  },
);

export function isValidRole(role: string): role is UserRole {
  return USER_ROLE_SET.has(role as UserRole);
}