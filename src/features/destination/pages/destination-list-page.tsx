import { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Search, X } from "lucide-react";
import { DestinationTable } from "../components/destination-table";
import { DestinationForm } from "../components/destination-form";
import { DeleteConfirmDialog } from "../../../shared/components/feedback/confirm-dialog";
import { Button } from "../../../shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../shared/components/ui/dialog";
import { useDebounce } from "../../../shared/hooks/use-debounce";
import { useDestinationList } from "../hooks/use-destination-list";
import { useCreateDestination } from "../hooks/use-create-destination";
import { useUpdateDestination } from "../hooks/use-update-destination";
import { useDeleteDestination } from "../hooks/use-delete-destination";
import { useAuthStore } from "../../auth/store/auth.store";
import { cn } from "../../../lib/cn";
import type { Destination } from "../../../shared/types/destination.types";
import type { CreateDestinationFormValues } from "../schemas/create-destination.schema";
import type { UpdateDestinationFormValues } from "../schemas/update-destination.schema";

type DialogMode = "create" | "edit" | null;
type TypeFilter = "all" | "TPA" | "RDF" | "TPS_3R";

const TYPE_OPTIONS: readonly { value: TypeFilter; label: string }[] = [
  { value: "all", label: "Semua Tipe" },
  { value: "TPA", label: "TPA" },
  { value: "RDF", label: "RDF" },
  { value: "TPS_3R", label: "TPS 3R" },
] as const;

const VALID_TYPES: readonly TypeFilter[] = ["all", "TPA", "RDF", "TPS_3R"];

function parseTypeParam(value: string | null): TypeFilter {
  if (value === null || value === "all") return "all";
  return VALID_TYPES.includes(value as TypeFilter) ? (value as TypeFilter) : "all";
}

export function DestinationListPage() {
  const user = useAuthStore((s) => s.user);
  const canModify = user?.role === "admin";

  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const typeFilter = parseTypeParam(searchParams.get("type"));

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, refetch } = useDestinationList();

  const filteredData = useMemo(() => {
    if (!data?.data) return [];
    const query = debouncedSearch.toLowerCase();
    return data.data.filter((d) => {
      const matchSearch = query === "" || d.name.toLowerCase().includes(query);
      const matchType = typeFilter === "all" || d.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [data?.data, debouncedSearch, typeFilter]);

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const createMutation = useCreateDestination();
  const updateMutation = useUpdateDestination({ id: selectedDestination?.id ?? "" });
  const deleteMutation = useDeleteDestination();

  const handleSearchChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value) params.set("search", value);
      else params.delete("search");
      if (typeFilter !== "all") params.set("type", typeFilter);
      setSearchParams(params, { replace: true });
    },
    [searchParams, typeFilter, setSearchParams],
  );

  const handleTypeChange = useCallback(
    (value: TypeFilter) => {
      const params = new URLSearchParams(searchParams);
      if (search) params.set("search", search);
      if (value !== "all") params.set("type", value);
      else params.delete("type");
      setSearchParams(params, { replace: false });
    },
    [searchParams, search, setSearchParams],
  );

  const handleReset = useCallback(() => {
    setSearchParams({}, { replace: false });
  }, [setSearchParams]);

  const handleEdit = useCallback((dest: Destination) => {
    setSelectedDestination(dest);
    setDialogMode("edit");
  }, []);

  const handleDelete = useCallback((dest: Destination) => {
    setSelectedDestination(dest);
    setDeleteDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogMode(null);
    setSelectedDestination(null);
  }, []);

  const handleCreateSubmit = (values: CreateDestinationFormValues) => {
    createMutation.mutate(values, { onSuccess: () => handleCloseDialog() });
  };

  const handleEditSubmit = (values: UpdateDestinationFormValues) => {
    if (!selectedDestination) return;
    updateMutation.mutate(values, { onSuccess: () => handleCloseDialog() });
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDestination) return;
    await deleteMutation.mutateAsync(selectedDestination.id);
    setDeleteDialogOpen(false);
    setSelectedDestination(null);
  };

  const hasActiveFilters = search !== "" || typeFilter !== "all";

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Manajemen Destinasi</h1>
        {canModify && (
          <Button onClick={() => setDialogMode("create")}>
            <Plus className="h-4 w-4" />
            Tambah Destinasi
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background p-3">
        <div className="relative flex-1 min-w-50">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Cari nama destinasi..."
            className={cn(
              "h-10 w-full rounded-md border border-border bg-transparent pl-9 pr-3 text-sm",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
            aria-label="Cari destinasi"
          />
        </div>

        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => handleTypeChange(e.target.value as TypeFilter)}
            className={cn(
              "h-10 appearance-none rounded-md border border-border bg-transparent pl-3 pr-8 text-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
            aria-label="Filter tipe"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          >
            ▾
          </span>
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <X className="h-4 w-4" />
            Reset
          </Button>
        )}
      </div>

      <DestinationTable
        data={filteredData}
        loading={isLoading}
        error={isError}
        onRetry={refetch}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Dialog
        open={dialogMode !== null}
        onOpenChange={(open) => !open && handleCloseDialog()}
      >
        <DialogContent className="sm:max-w-137.5">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Tambah Destinasi Baru" : "Edit Destinasi"}
            </DialogTitle>
          </DialogHeader>
          {dialogMode === "create" && (
            <DestinationForm
              mode="create"
              onSubmit={handleCreateSubmit}
              onCancel={handleCloseDialog}
              isSubmitting={createMutation.isPending}
            />
          )}
          {dialogMode === "edit" && selectedDestination && (
            <DestinationForm
              mode="edit"
              defaultValues={{
                name: selectedDestination.name,
                type: selectedDestination.type,
                latitude: selectedDestination.latitude,
                longitude: selectedDestination.longitude,
                capacityKg: selectedDestination.capacityKg,
                priority: selectedDestination.priority,
              }}
              destination={selectedDestination}
              onSubmit={handleEditSubmit}
              onCancel={handleCloseDialog}
              isSubmitting={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={selectedDestination?.name ?? "destinasi"}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}