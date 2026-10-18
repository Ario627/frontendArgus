import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { userProfileSchema } from "@/features/auth/schemas/user-profile.schema";
import type { UserRole } from "@/shared/constants/roles.constant";
import { isTokenExpired } from "@/shared/lib/jwt";
import type { LogoutReason, UserProfile } from "@/shared/types/auth.types";

export interface AuthState {
  readonly token: string | null;
  readonly user: UserProfile | null;
  readonly role: UserRole | null;
  readonly login: (token: string, user: UserProfile) => void;
  readonly logout: () => void;
  readonly forceLogout: (reason: LogoutReason) => void;
}

const AUTH_STORAGE_KEY = "argus.auth";
const LOGOUT_REASON_KEY = "argus.logoutReason";
const LOGIN_PATH = "/login";
const VALID_REASONS: readonly LogoutReason[] = Object.freeze(["sesi-berakhir", "keluar"]);

interface PersistedSession {
  readonly token: string;
  readonly user: UserProfile;
}

let sessionCleanup: () => void = () => {};

export function registerSessionCleanup(cleanup: () => void): void {
  sessionCleanup = cleanup;
}

export function writeLogoutReason(reason: LogoutReason): void {
  sessionStorage.setItem(LOGOUT_REASON_KEY, reason);
}

export function peekLogoutReason(): LogoutReason | null {
  const raw = sessionStorage.getItem(LOGOUT_REASON_KEY);
  return VALID_REASONS.find((reason) => reason === raw) ?? null;
}

export function clearLogoutReason(): void {
  sessionStorage.removeItem(LOGOUT_REASON_KEY);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readPersistedSession(persisted: unknown): PersistedSession | null {
  if (!isRecord(persisted)) return null;
  const token = persisted["token"];
  if (typeof token !== "string" || token.length === 0) return null;
  const user = userProfileSchema.safeParse(persisted["user"]);
  if (!user.success) return null;
  if (isTokenExpired(token)) return null;
  return { token, user: user.data };
}

function redirectToLogin(reason: LogoutReason): void {
  window.location.replace(`${LOGIN_PATH}?alasan=${encodeURIComponent(reason)}`);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      role: null,
      login: (token, user) => {
        set({ token, user, role: user.role });
      },
      logout: () => {
        if (get().token === null) return;
        set({ token: null, user: null, role: null });
        sessionCleanup();
        writeLogoutReason("keluar");
      },
      forceLogout: (reason) => {
        if (get().token === null) return;
        set({ token: null, user: null, role: null });
        sessionCleanup();
        writeLogoutReason(reason);
        redirectToLogin(reason);
      }
    }),
    {
      name: AUTH_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
      merge: (persisted, current) => {
        const session = readPersistedSession(persisted);
        if (session === null) return current;
        return { ...current, token: session.token, user: session.user, role: session.user.role };
      }
    }
  )
);