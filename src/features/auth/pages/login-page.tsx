import { Fragment, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router";
import { LoginForm } from "@/features/auth/components/login-form";
import { clearLogoutReason, peekLogoutReason, useAuthStore } from "@/features/auth/store/auth.store";
import { RulerTicks } from "@/shared/components/data/ruler-ticks";
import { homePathForRole } from "@/shared/constants/nav.constant";

const REASON_MESSAGES: Readonly<Record<string, string>> = Object.freeze({
  "sesi-berakhir": "Sesi Anda berakhir. Masuk kembali untuk melanjutkan.",
  keluar: "Anda sudah keluar dari aplikasi."
});

interface LoginFact {
  readonly value: string;
  readonly label: string;
}

const LOGIN_FACTS: readonly LoginFact[] = Object.freeze([
  { value: "T0–T4", label: "tingkat keputusan limpahan per batch" },
  { value: "SHA-256", label: "segel tiap peristiwa buku besar" },
  { value: "Offline-first", label: "catatan lapangan aman di perangkat" }
]);

interface LoginSeal {
  readonly time: string;
  readonly hash: string;
}

const LOGIN_SEALS: readonly LoginSeal[] = Object.freeze([
  { time: "09:14", hash: "3F9C2B41" },
  { time: "11:40", hash: "8A1D0E93" },
  { time: "16:05", hash: "C52F7D18" }
]);

interface LocationState {
  readonly from?: { readonly pathname?: string };
}

function SealStrip() {
  return (
    <div className="flex flex-col gap-2">
      <span className="label-cap text-ink-lemah">Contoh segel rantai</span>
      <div className="flex items-center gap-1.5">
        {LOGIN_SEALS.map((seal, index) => (
          <Fragment key={seal.hash}>
            {index > 0 ? (
              <span aria-hidden className="h-px w-3 shrink-0 bg-ink-lemah/50" />
            ) : null}
            <span className="flex flex-col gap-0.5 rounded-kontrol bg-ink px-2 py-1.5 text-kertas">
              <span className="font-mono text-2xs tabular-nums text-kertas/70">{seal.time}</span>
              <span className="font-mono text-2xs">{seal.hash}</span>
            </span>
          </Fragment>
        ))}
      </div>
      <p className="text-xs text-ink-lemah">Tiap peristiwa ditutup segel SHA-256 — data contoh.</p>
    </div>
  );
}

export function LoginPage() {
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [notice] = useState(() => {
    const reason = peekLogoutReason();
    return reason === null ? null : (REASON_MESSAGES[reason] ?? null);
  });

  useEffect(() => {
    clearLogoutReason();
  }, []);

  if (token !== null) return <Navigate to="/" replace />;

  const paramReason = searchParams.get("alasan");
  const message = notice ?? (paramReason === null ? null : REASON_MESSAGES[paramReason] ?? null);
  const state = location.state as LocationState | null;
  const from = typeof state?.from?.pathname === "string" ? state.from.pathname : null;

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <aside className="relative hidden overflow-hidden border-r border-garis lg:flex lg:flex-col lg:justify-between lg:px-10 lg:py-10">
        <div
          aria-hidden
          className="bg-grid-teknis mask-fade-down pointer-events-none absolute inset-0 opacity-70"
        />
        <div className="relative flex flex-col gap-8">
          <p className="font-mono text-sm font-medium tracking-label text-ink">ARGUS</p>
          <div className="flex flex-col gap-3">
            <h1 className="max-w-md text-xl text-ink md:text-2xl">
              Setiap kilogram sisa dapur punya paspor.
            </h1>
            <p className="max-w-md text-sm text-ink-lemah">
              Masuk untuk mencatat timbangan, memutuskan ke mana limpahan pergi, dan menutup bukti
              perjalanannya.
            </p>
          </div>
          <div className="max-w-md pt-2">
            <SealStrip />
          </div>
        </div>
        <div className="relative flex max-w-md flex-col gap-4">
          <RulerTicks className="opacity-70" />
          <dl className="flex flex-col">
            {LOGIN_FACTS.map((fact) => (
              <div
                key={fact.label}
                className="flex items-baseline justify-between gap-4 border-b border-garis py-2.5 last:border-b-0"
              >
                <dt className="text-xs text-ink-lemah">{fact.label}</dt>
                <dd className="shrink-0 font-mono text-xs tabular-nums text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </aside>

      <main className="flex flex-col px-5 py-8 md:px-10">
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6">
          <header className="flex flex-col gap-1.5">
            <p className="font-mono text-sm font-medium tracking-label text-ink lg:hidden">ARGUS</p>
            <h1 className="text-lg font-semibold text-ink">Masuk</h1>
            <p className="text-sm text-ink-lemah">
              Gunakan akun yang diberikan admin dapur atau dinas.
            </p>
          </header>
          <div className="lg:hidden">
            <SealStrip />
          </div>
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
          <p className="text-xs text-ink-lemah">
            Sesi berakhir otomatis saat tab ditutup. Hubungi admin bila akun terkunci.
          </p>
        </div>
      </main>
    </div>
  );
}
