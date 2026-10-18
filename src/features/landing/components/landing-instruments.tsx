import { Fragment, type ReactNode } from "react";
import { PlateGlyph } from "@/shared/components/data/plate-scale";
import { Stamp } from "@/shared/components/ui/stamp";
import { GATE_SPECIMENS, LANDING_CHAIN_SEALS } from "@/features/landing/landing-content";

function Specimen({ title, children }: { readonly title: string; readonly children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-kontainer border border-garis p-4">
      <p className="label-cap text-ink-lemah">{title}</p>
      {children}
    </div>
  );
}

export function LandingInstruments() {
  return (
    <section className="border-b border-garis">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-14 md:px-8 md:py-16">
        <h2 className="label-cap text-ink-lemah">Perangkat yang dipakai di lapangan</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Specimen title="Stempel gerbang">
            <ul className="flex flex-col gap-2.5">
              {GATE_SPECIMENS.map((specimen) => (
                <li key={specimen.verdict} className="flex items-center gap-2.5">
                  <Stamp verdict={specimen.verdict} />
                  <span className="min-w-0 text-xs text-ink-lemah">{specimen.meaning}</span>
                </li>
              ))}
            </ul>
          </Specimen>

          <Specimen title="Skala sisa 0–4">
            <div className="flex flex-col gap-3">
              <div className="flex items-end justify-between gap-2">
                {[0, 1, 2, 3, 4].map((level) => (
                  <span key={level} className="flex flex-col items-center gap-1 text-ink">
                    <PlateGlyph level={level as 0 | 1 | 2 | 3 | 4} size={26} />
                    <span className="font-mono text-2xs tabular-nums text-ink-lemah">{level}</span>
                  </span>
                ))}
              </div>
              <p className="text-xs text-ink-lemah">
                Petugas menilai sisa di piring nyata — dari habis sampai hampir penuh.
              </p>
            </div>
          </Specimen>

          <Specimen title="Segel rantai">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1.5">
                {LANDING_CHAIN_SEALS.map((seal, index) => (
                  <Fragment key={seal.hash}>
                    {index > 0 ? (
                      <span aria-hidden className="h-px w-3 shrink-0 bg-ink-lemah/50" />
                    ) : null}
                    <span className="flex flex-col gap-0.5 rounded-kontrol bg-ink px-2 py-1.5 text-kertas">
                      <span className="font-mono text-2xs tabular-nums text-kertas/70">
                        {seal.time}
                      </span>
                      <span className="font-mono text-2xs">{seal.hash.slice(0, 8)}</span>
                    </span>
                  </Fragment>
                ))}
              </div>
              <p className="font-mono text-2xs text-daun">RANTAI UTUH · 6 PERISTIWA</p>
            </div>
          </Specimen>
        </div>
      </div>
    </section>
  );
}