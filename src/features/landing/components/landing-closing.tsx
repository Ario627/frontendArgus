import { ButtonLink } from "@/shared/components/ui/button";
import { RulerTicks } from "@/shared/components/data/ruler-ticks";

export function LandingClosing() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="bg-ruled pointer-events-none absolute inset-0 opacity-70" />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-8 right-0 hidden font-mono text-[140px] leading-none font-medium tracking-tight text-ink/[0.04] select-none lg:block"
      >
        ARGUS
      </div>
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 py-14 md:px-8 md:py-20">
        <div className="flex max-w-2xl flex-col gap-4">
          <RulerTicks className="w-40 opacity-70" />
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
