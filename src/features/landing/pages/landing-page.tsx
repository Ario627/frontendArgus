import { Link } from "react-router";
import { LandingClosing } from "@/features/landing/components/landing-closing";
import { LandingDecisions } from "@/features/landing/components/landing-decisions";
import { LandingHero } from "@/features/landing/components/landing-hero";
import { LandingInstruments } from "@/features/landing/components/landing-instruments";
import { LandingSurfaces } from "@/features/landing/components/landing-surfaces";
import { ButtonLink } from "@/shared/components/ui/button";

export function LandingPage() {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-garis bg-kertas">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-5 md:px-8">
          <Link to="/" className="flex min-w-0 items-baseline gap-2.5">
            <span className="font-mono text-sm font-medium tracking-label text-ink">ARGUS</span>
            <span className="hidden truncate font-mono text-2xs text-ink-lemah md:inline">
              buku besar limbah dapur
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href="#cara-kerja"
              className="hidden text-sm text-ink-lemah transition-colors duration-150 ease-out hover:text-ink sm:inline"
            >
              Cara kerja
            </a>
            <span aria-hidden className="hidden h-4 w-px bg-garis sm:block" />
            <ButtonLink to="/login" variant="secondary" size="sm">
              Masuk
            </ButtonLink>
          </div>
        </div>
      </header>
      <main>
        <LandingHero />
        <LandingDecisions />
        <LandingSurfaces />
        <LandingInstruments />
        <LandingClosing />
      </main>
    </div>
  );
}
