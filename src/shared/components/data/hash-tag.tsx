import { useToastStore } from "@/shared/components/ui/toast-store";
import { cn } from "@/shared/lib/cn";

export type HashTone = "light" | "dark";

export interface HashTagProps {
  readonly hash: string;
  readonly chars?: number;
  readonly tone?: HashTone;
  readonly className?: string;
}

export function HashTag({ hash, chars = 8, tone = "light", className }: HashTagProps) {
  const showToast = useToastStore((state) => state.show);
  const short = hash.slice(0, chars);

  const copy = () => {
    void navigator.clipboard
      .writeText(hash)
      .then(() => showToast({ message: "Hash disalin" }))
      .catch(() => showToast({ message: "Tidak bisa menyalin hash", tone: "bata" }));
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Salin hash lengkap ${short}`}
      className={cn(
        "inline-flex max-w-full items-center gap-0.5 rounded-kontrol px-1 py-0.5 font-mono text-2xs transition-colors",
        tone === "dark"
          ? "text-kertas/70 hover:bg-kertas/10 hover:text-kertas"
          : "text-ink-lemah hover:bg-ink/5 hover:text-ink",
        className
      )}
    >
      <span className="truncate">{short}</span>
      <span aria-hidden>…</span>
    </button>
  );
}