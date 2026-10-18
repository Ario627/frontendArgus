import { LandingDemoStrip } from "@/features/landing/components/landing-demo-strip";
import { LandingSpecimenCard } from "@/features/landing/components/landing-specimen-card";
import { LANDING_FACTS } from "@/features/landing/landing-content";
import { RulerTicks } from "@/shared/components/data/ruler-ticks";
import { ButtonLink } from "@/shared/components/ui/button";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b border-garis">
      <div
        aria-hidden
        className="bg-grid-teknis mask-fade-down pointer-events-none absolute inset-0 opacity-70"
      />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-12 px-5 py-14 md:px-8 md:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 bg-ink" />
              <p className="label-cap text-ink-lemah">
                Lapisan keputusan &amp; bukti — limbah dapur MBG
              </p>
            </div>
            <h1 className="text-2xl text-ink md:text-display">
              Setiap kilogram sisa dapur punya paspor.
            </h1>
            <p className="max-w-prose text-md text-ink-lemah">
              ARGUS mencatat timbangan di dapur, memutuskan ke mana limpahan pergi, dan menyegel
              setiap perjalanannya dalam rantai bukti yang bisa diaudit.
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
              <ButtonLink to="/login" size="lg">
                Masuk ke aplikasi
              </ButtonLink>
              <a href="#cara-kerja" className="text-sm text-biru-tinta underline underline-offset-2">
                Lihat cara kerjanya
              </a>
            </div>
          </div>

          <LandingSpecimenCard />
        </div>

        <div className="flex flex-col gap-4">
          <RulerTicks className="opacity-70" />
          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-4">
            {LANDING_FACTS.map((fact) => (
              <div key={fact.label} className="flex flex-col gap-0.5">
                <dt className="text-xs text-ink-lemah">{fact.label}</dt>
                <dd className="font-mono text-lg tabular-nums text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <LandingDemoStrip />
      </div>
    </section>
  );
}
