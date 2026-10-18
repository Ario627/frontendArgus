import { ButtonLink } from "@/shared/components/ui/button";

export function LandingClosing() {
  return (
    <section>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 py-14 md:px-8 md:py-20">
        <div className="flex max-w-2xl flex-col gap-4">
          <h2 className="text-xl text-ink md:text-2xl">
            Dibangun untuk dapur yang sibuk, sinyal yang buruk, dan audit yang teliti.
          </h2>
          <p className="text-sm text-ink-lemah">
            Catatan lapangan aman di perangkat saat internet putus, tersinkron otomatis saat
            jaringan kembali, dan setiap angkanya berasal dari timbangan — bukan tebakan.
          </p>
          <div className="pt-1">
            <ButtonLink to="/login" size="lg">
              Masuk ke aplikasi
            </ButtonLink>
          </div>
        </div>
        <footer className="flex flex-col gap-2 border-t border-garis pt-6">
          <p className="font-mono text-xs text-ink-lemah">
            ARGUS — alat ukur dan buku besar untuk limbah dapur MBG
          </p>
          <p className="text-xs text-ink-lemah">
            Warga melapor tanpa akun · identitas pelapor tidak pernah ditampilkan · tanpa klaim
            lingkungan yang tidak terukur.
          </p>
        </footer>
      </div>
    </section>
  );
}