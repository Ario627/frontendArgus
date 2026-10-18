import { Link } from "react-router";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { homePathForRole } from "@/shared/constants/nav.constant";

export function ForbiddenPage() {
  const role = useAuthStore((state) => state.role);
  const home = role === null ? "/login" : homePathForRole(role);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-3 px-4 py-10">
      <h1 className="text-xl font-semibold text-ink">Akun ini tidak punya akses ke halaman tersebut</h1>
      <p className="text-sm text-ink-lemah">
        Hubungi admin bila akses ini memang dibutuhkan untuk pekerjaan Anda.
      </p>
      <Link to={home} className="text-sm text-biru-tinta underline underline-offset-2">
        Kembali ke beranda
      </Link>
    </main>
  );
}