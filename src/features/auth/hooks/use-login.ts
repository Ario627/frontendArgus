import { useMutation } from "@tanstack/react-query";
import { login } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { LoginPayload } from "@/features/auth/schemas/login.schema";

export function useLogin() {
  const startSession = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (result) => {
      startSession(result.accessToken, result.user);
    }
  });
}