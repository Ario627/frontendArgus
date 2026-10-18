import { useState } from "react";
import { isApiError } from "@/api/api-error";
import { useCreateMenuItem } from "@/features/menu/hooks/use-create-menu-item";
import { Button } from "@/shared/components/ui/button";
import { Field } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { Sheet } from "@/shared/components/ui/sheet";
import { useToastStore } from "@/shared/components/ui/toast-store";
import {
  MENU_COMPONENTS,
  MENU_COMPONENT_LABELS,
  type MenuComponent
} from "@/shared/constants/menu.constant";
import { formatRupiah } from "@/shared/lib/format";

const BIAYA_MAX_RP = 99_999_999;

function parseRupiah(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  if (!/^\d{1,8}$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return value <= BIAYA_MAX_RP ? value : null;
}

export interface MenuItemSheetProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function MenuItemSheet({ open, onOpenChange }: MenuItemSheetProps) {
  const createItem = useCreateMenuItem();
  const showToast = useToastStore((state) => state.show);
  const [nama, setNama] = useState("");
  const [komponen, setKomponen] = useState<MenuComponent>("karbohidrat");
  const [biayaText, setBiayaText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setNama("");
      setKomponen("karbohidrat");
      setBiayaText("");
      setError(null);
    }
  }

  const biaya = parseRupiah(biayaText);

  const submit = () => {
    setError(null);
    const trimmed = nama.trim();
    if (trimmed.length < 2 || trimmed.length > 120) {
      setError("Nama item 2–120 karakter.");
      return;
    }
    if (biayaText.trim() !== "" && biaya === null) {
      setError("Biaya harus angka rupiah utuh (maksimal 99.999.999).");
      return;
    }
    createItem.mutate(
      {
        nama: trimmed,
        komponen,
        ...(biaya === null ? {} : { biayaRp: biaya })
      },
      {
        onSuccess: () => {
          showToast({ message: "Item menu ditambahkan" });
          onOpenChange(false);
        },
        onError: (cause) => {
          setError(isApiError(cause) ? cause.message : "Tidak dapat menyimpan item saat ini.");
        }
      }
    );
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Tambah item menu"
      description="Item dipakai saat mencatat penyajian dan observasi sisa."
      footer={
        <Button size="lg" fullWidth loading={createItem.isPending} onClick={submit}>
          Simpan item
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <Field label="Nama item" required>
          {(control) => (
            <Input
              id={control.id}
              aria-describedby={control.describedBy}
              autoComplete="off"
              maxLength={120}
              placeholder="Contoh: Tumis kangkung"
              value={nama}
              onChange={(event) => setNama(event.target.value)}
            />
          )}
        </Field>

        <Field label="Komponen" required>
          {(control) => (
            <Select
              id={control.id}
              aria-describedby={control.describedBy}
              value={komponen}
              onChange={(event) => setKomponen(event.target.value as MenuComponent)}
            >
              {MENU_COMPONENTS.map((component) => (
                <option key={component} value={component}>
                  {MENU_COMPONENT_LABELS[component]}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field
          label="Biaya per porsi"
          hint="Opsional. Tanpa biaya, estimasi nilai terbuang tidak bisa dihitung."
        >
          {(control) => (
            <Input
              id={control.id}
              aria-describedby={control.describedBy}
              inputMode="numeric"
              autoComplete="off"
              placeholder="Contoh: 5000"
              suffix="Rp"
              value={biayaText}
              onChange={(event) => setBiayaText(event.target.value)}
            />
          )}
        </Field>

        {biaya === null || biayaText.trim() === "" ? null : (
          <p className="text-xs text-ink-lemah">Terbaca: {formatRupiah(biaya)} per porsi.</p>
        )}

        {error === null ? null : (
          <p role="alert" className="text-sm text-bata">
            {error}
          </p>
        )}
      </div>
    </Sheet>
  );
}