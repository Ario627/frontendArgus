import type { UserRole } from "@/shared/constants/roles.constant";

export interface UserProfile {
  readonly id: string;
  readonly username: string;
  readonly nama: string;
  readonly role: UserRole;
  readonly sppgId: string | null;
  readonly facilityId: string | null;
  readonly fleetId: string | null;
}

export interface LoginInput {
  readonly username: string;
  readonly password: string;
}

export interface LoginResult {
  readonly accessToken: string;
  readonly user: UserProfile;
}

export type LogoutReason = "sesi-berakhir" | "keluar";