import { useMutation } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../store/auth.store";
import { tokenToUser } from "../../../shared/lib/jwt";
import { ApiError } from "../../../api/api-error";

interface LocationState {
  readonly from?: { readonly pathname: string };
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();
  const location = useLocation();

  const from =
    (location.state as LocationState | null)?.from?.pathname ?? "/app/dashboard";

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      const user = tokenToUser(data.accessToken);
      setSession(data.accessToken, user);
      toast.success("Login berhasil");
      navigate(from, { replace: true });
    },
    onError: (error: ApiError) => {
      if (error.status === 401) {
        toast.error("Username atau password salah", { id: "login-error" });
      } else {
        toast.error(error.message ?? "Gagal login", { id: "login-error" });
      }
    },
  });
}