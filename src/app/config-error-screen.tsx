import { Button } from "@/shared/components/ui/button";

export interface ConfigErrorScreenProps {
  readonly issues: readonly string[];
}

export function ConfigErrorScreen({ issues }: ConfigErrorScreenProps) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center gap-4 px-4 py-10">
      <h1 className="text-xl font-semibold text-ink">Konfigurasi aplikasi belum benar</h1>
      <p className="text-sm text-ink-lemah">
        Perbaiki variabel berikut pada berkas <code className="font-mono">.env</code>, lalu muat ulang.
      </p>
      <ul className="flex flex-col gap-1.5 rounded-kontainer border border-garis p-3">
        {issues.map((issue) => (
          <li key={issue} className="font-mono text-xs text-bata">
            {issue}
          </li>
        ))}
      </ul>
      <div>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Muat ulang
        </Button>
      </div>
    </main>
  );
}