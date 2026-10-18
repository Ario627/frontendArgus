import { Link } from "react-router";
import { LandingClosing } from "@/features/landing/components/landing-closing";
import { LandingDecisions } from "@/features/landing/components/landing-decisions";
import { LandingHero } from "@/features/landing/components/landing-hero";
import { LandingInstruments } from "@/features/landing/components/landing-instruments";
import { LandingSurfaces } from "@/features/landing/components/landing-surfaces";

export function LandingPage() {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-garis bg-kertas">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-5 md:px-8">
          <span className="font-mono text-sm font-medium tracking-label text-ink">ARGUS</span>
          <Link
            to="/login"
            className="text-sm text-ink transition-colors duration-150 ease-out hover:text-biru-tinta"
          >
            Masuk
          </Link>
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