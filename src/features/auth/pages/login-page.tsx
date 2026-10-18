import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router";
import { LoginForm } from "@/features/auth/components/login-form";
import { consumeLogoutReason, useAuthStore } from "@/features/auth/store/auth.store";
import { homePathForRole } from "@/shared/constants/nav.constant";

const REASON_MESSAGES: Readonly<Record<string, string>> = Object.freeze({
  "sesi-berakhir": "Sesi Anda berakhir. Masuk kembali untuk melanjutkan.",
  keluar: "Anda sudah keluar dari aplikasi."
});

interface LocationState {
  readonly from?: { readonly pathname?: string };
}

export function LoginPage() {
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const reason = consumeLogoutReason();
    if (reason !== null) setNotice(REASON_MESSAGES[reason] ?? null);
  }, []);

  if (token !== null) return <Navigate to="/" replace />;

  const paramReason = searchParams.get("alasan");
  const message = notice ?? (paramReason === null ? null : REASON_MESSAGES[paramReason] ?? null);
  const state = location.state as LocationState | null;
  const from = typeof state?.from?.pathname === "string" ? state.from.pathname : null;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-6 px-4 py-10">
      <header className="flex flex-col gap-1">
        <p className="text-2xl font-semibold tracking-tight text-ink">ARGUS</p>
        <p className="text-sm text-ink-lemah">Catat limbah dapur, buktikan sampai akhir.</p>
      </header>
      {message === null ? null : (
        <p className="rounded-kontainer border border-garis bg-ink/5 px-3 py-2 text-sm text-ink-lemah">
          {message}
        </p>
      )}
      <LoginForm
        onSuccess={() => {
          const role = useAuthStore.getState().role;
          navigate(from ?? (role === null ? "/" : homePathForRole(role)), { replace: true });
        }}
      />
    </main>
  );
}