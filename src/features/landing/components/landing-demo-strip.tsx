import { PitaPaspor } from "@/shared/components/data/pita-paspor";
import { DEMO_LEDGER_EVENTS, DEMO_TRANSFER } from "@/features/landing/landing-content";

export function LandingDemoStrip() {
  return (
    <figure className="flex flex-col gap-3 rounded-kontainer border border-garis p-4 md:p-5">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-ink">
          Contoh perjalanan satu batch — 12,4 kg organik
        </span>
        <span className="font-mono text-2xs text-ink-lemah">dapur → hub → selesai · 6 peristiwa</span>
      </figcaption>
      <PitaPaspor events={DEMO_LEDGER_EVENTS} transfer={DEMO_TRANSFER} />
      <p className="text-xs text-ink-lemah">
        Segmen gelap adalah peristiwa tersegel. Penanda saksi lengkap berarti dua pihak berbeda
        mengonfirmasi berat masing-masing. Data contoh — bukan operasional.
      </p>
    </figure>
  );
}