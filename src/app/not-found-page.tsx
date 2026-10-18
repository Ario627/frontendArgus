import { useNavigate } from "react-router";
import { Button } from "@/shared/components/ui/button";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-3 px-4 py-10">
      <h1 className="text-xl font-semibold text-ink">Halaman tidak ditemukan</h1>
      <p className="text-sm text-ink-lemah">
        Tautan mungkin salah ketik atau sudah dipindahkan.
      </p>
      <div>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Kembali
        </Button>
      </div>
    </main>
  );
}