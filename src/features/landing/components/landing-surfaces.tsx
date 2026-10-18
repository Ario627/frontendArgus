import { LANDING_SURFACES } from "@/features/landing/landing-content";

export function LandingSurfaces() {
  return (
    <section className="border-b border-garis">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-14 md:px-8 md:py-16">
        <h2 className="label-cap text-ink-lemah">Tiga permukaan, satu buku besar</h2>
        <div className="grid gap-8 md:grid-cols-3 md:gap-6">
          {LANDING_SURFACES.map((surface) => (
            <div key={surface.name} className="flex flex-col gap-2 border-t-2 border-ink pt-3">
              <p className="text-md font-medium text-ink">{surface.name}</p>
              <p className="text-sm text-ink-lemah">{surface.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}