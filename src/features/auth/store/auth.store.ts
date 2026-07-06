import { create } from "zustand";
import type { AuthenticatedUser } from "../../../shared/types/common.types";

interface AuthState {
  readonly accessToken: string | null;
  readonly user: AuthenticatedUser | null;
  readonly isAuthenticated: boolean;
  setSession: (token: string, user: AuthenticatedUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  setSession: (accessToken, user) =>
    set({ accessToken, user, isAuthenticated: true }),
  logout: () => set({ accessToken: null, user: null, isAuthenticated: false }),
}));