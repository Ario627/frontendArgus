import type { LoginResult, UserProfile } from "@/shared/types/auth.types";
import type { OutboxItem } from "@/shared/types/outbox.types";

export const ADMIN_ID = "0192f0a0-0000-7000-8000-000000000001";
export const SPPG_ID = "0192f0a0-0000-7000-8000-000000000010";

export const adminUser: UserProfile = {
  id: ADMIN_ID,
  username: "admin",
  nama: "Admin Argus",
  role: "admin",
  sppgId: null,
  facilityId: null,
  fleetId: null
};

export const staffUser: UserProfile = {
  id: "0192f0a0-0000-7000-8000-000000000002",
  username: "dapur-satu",
  nama: "Dapur Satu",
  role: "sppg_staff",
  sppgId: SPPG_ID,
  facilityId: null,
  fleetId: null
};

export const loginResult: LoginResult = {
  accessToken: "token-uji",
  user: adminUser
};

let outboxCounter = 0;

export function makeOutboxItem(overrides: Partial<OutboxItem> = {}): OutboxItem {
  outboxCounter += 1;
  const id = overrides.id ?? `outbox-${outboxCounter}`;
  return {
    id,
    tipe: "batch",
    payload: { clientEventId: id },
    createdAt: 1_000,
    attempts: 0,
    status: "menunggu",
    ...overrides
  };
}