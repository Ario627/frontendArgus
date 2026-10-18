import { FractionBar } from "@/shared/components/data/fraction-bar";
import { RulerTicks } from "@/shared/components/data/ruler-ticks";
import { Stamp } from "@/shared/components/ui/stamp";
import { DEMO_BATCH_CODE, DEMO_FRACTIONS } from "@/features/landing/landing-content";
import { formatNumber } from "@/shared/lib/format";

const CORNER_MARKS: readonly string[] = Object.freeze([
  "-top-px -left-px border-t border-l",
  "-top-px -right-px border-t border-r",
  "-bottom-px -left-px border-b border-l",
  "-bottom-px -right-px border-b border-r"
]);

function SpecimenRow({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-garis py-2 last:border-b-0">
      <dt className="text-xs text-ink-lemah">{label}</dt>
      <dd className="font-mono text-xs tabular-nums text-ink">{value}</dd>
    </div>
  );
}

export function LandingSpecimenCard() {
  return (
    <figure className="relative rounded-kontainer border border-garis bg-kertas">
      {CORNER_MARKS.map((mark) => (
        <span
          key={mark}
          aria-hidden
          className={`pointer-events-none absolute size-2.5 border-ink/35 ${mark}`}
        />
      ))}

      <header className="flex items-center justify-between gap-3 border-b border-garis px-4 py-2.5">
        <span className="label-cap text-ink-lemah">Spesimen batch</span>
        <span className="font-mono text-2xs text-ink-lemah">{DEMO_BATCH_CODE}</span>
      </header>

      <div className="flex flex-col gap-4 px-4 py-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <p className="flex items-baseline gap-1 font-mono text-field tabular-nums leading-none text-ink">
            {formatNumber(12.4, 1)}
            <span className="text-lg text-ink-lemah">kg</span>
          </p>
          <Stamp verdict="LOLOS" />
        </div>

        <dl className="flex flex-col">
          <SpecimenRow label="Aliran" value="Organik" />
          <SpecimenRow label="Kadar air" value="Sedang" />
          <SpecimenRow label="Umur saat dicatat" value="0,5 jam" />
        </dl>

        <div className="flex flex-col gap-2">
          <span className="label-cap text-ink-lemah">Komposisi</span>
          <FractionBar values={DEMO_FRACTIONS} />
        </div>
      </div>

      <RulerTicks className="mx-4 opacity-60" />

      <footer className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-garis px-4 py-2.5">
        <span className="font-mono text-2xs text-daun">RANTAI UTUH · 6 PERISTIWA</span>
        <span className="font-mono text-2xs text-ink-lemah">SEGEL SHA-256</span>
      </footer>
    </figure>
  );
}
