import { LANDING_DECISIONS } from "@/features/landing/landing-content";

export function LandingDecisions() {
  return (
    <section id="cara-kerja" className="border-b border-garis">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-14 md:px-8 md:py-16">
        <h2 className="label-cap text-ink-lemah">Empat pertanyaan yang dijawab ARGUS</h2>
        <ol className="flex flex-col">
          {LANDING_DECISIONS.map((decision) => (
            <li
              key={decision.code}
              className="flex gap-5 border-b border-garis py-5 last:border-b-0 md:gap-8"
            >
              <span className="w-8 shrink-0 pt-0.5 font-mono text-sm tabular-nums text-ink-lemah">
                {decision.code}
              </span>
              <div className="flex min-w-0 flex-col gap-1.5">
                <p className="text-md font-medium text-ink md:text-lg">{decision.question}</p>
                <p className="max-w-prose text-sm text-ink-lemah">{decision.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}