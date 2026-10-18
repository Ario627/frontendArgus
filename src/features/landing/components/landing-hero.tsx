import { LandingDemoStrip } from "@/features/landing/components/landing-demo-strip";
import { LANDING_FACTS } from "@/features/landing/landing-content";
import { ButtonLink } from "@/shared/components/ui/button";

export function LandingHero() {
  return (
    <section className="border-b border-garis">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 py-14 md:px-8 md:py-20">
        <div className="flex max-w-2xl flex-col gap-4">
          <p className="label-cap text-ink-lemah">Lapisan keputusan &amp; bukti — limbah dapur MBG</p>
          <h1 className="text-2xl text-ink md:text-display">
            Setiap kilogram sisa dapur punya paspor.
          </h1>
          <p className="text-md text-ink-lemah">
            ARGUS mencatat timbangan di dapur, memutuskan ke mana limpahan pergi, dan menyegel
            setiap perjalanannya dalam rantai bukti yang bisa diaudit.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <ButtonLink to="/login" size="lg">
              Masuk ke aplikasi
            </ButtonLink>
            <a
              href="#cara-kerja"
              className="text-sm text-biru-tinta underline underline-offset-2"
            >
              Lihat cara kerjanya
            </a>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-garis pt-6 md:grid-cols-4">
          {LANDING_FACTS.map((fact) => (
            <div key={fact.label} className="flex flex-col gap-0.5">
              <dt className="text-xs text-ink-lemah">{fact.label}</dt>
              <dd className="font-mono text-lg tabular-nums text-ink">{fact.value}</dd>
            </div>
          ))}
        </dl>

        <LandingDemoStrip />
      </div>
    </section>
  );
}