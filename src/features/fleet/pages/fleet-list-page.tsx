import { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { FleetTable } from "../components/fleet-table";
import { FleetFilterBar } from "../components/fleet-filter-bar";
import { FleetForm } from "../components/fleet-form";
import { RevokeDeviceDialog } from "../components/revoke-device-dialog";
import { DeleteConfirmDialog } from "../../../shared/components/feedback/confirm-dialog";
import { Button } from "../../../shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../shared/components/ui/dialog";
import { useFleetList } from "../hooks/use-fleet-list";
import { useFleetFilters, useFilteredFleet } from "../hooks/use-fleet-filters";
import { useCreateFleet } from "../hooks/use-create-fleet";
import { useUpdateFleet } from "../hooks/use-update-fleet";
import { useDeleteFleet } from "../hooks/use-delete-fleet";
import { useRevokeDevice } from "../hooks/use-revoke-device";
import { useAuthStore } from "../../auth/store/auth.store";
import type { Fleet } from "../../../shared/types/fleet.types";
import type { CreateFleetFormValues } from "../schemas/create-fleet.schema";
import type { UpdateFleetFormValues } from "../schemas/update-fleet.schema";

type DialogMode = "create" | "edit" | null;

export function FleetListPage() {
  const user = useAuthStore((s) => s.user);
  const canModify = user?.role === "admin";

  const { filters, debouncedFilters, setSearch, setStatus, resetFilters } = useFleetFilters();
  const { data, isLoading, isError, refetch } = useFleetList();
  const filteredData = useFilteredFleet(data?.data, debouncedFilters);

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedFleet, setSelectedFleet] = useState<Fleet | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);

  const createMutation = useCreateFleet();
  const updateMutation = useUpdateFleet({ id: selectedFleet?.id ?? "" });
  const deleteMutation = useDeleteFleet();
  const revokeMutation = useRevokeDevice({ id: selectedFleet?.id ?? "" });

  const handleEdit = useCallback((fleet: Fleet) => {
    setSelectedFleet(fleet);
    setDialogMode("edit");
  }, []);

  const handleDelete = useCallback((fleet: Fleet) => {
    setSelectedFleet(fleet);
    setDeleteDialogOpen(true);
  }, []);

  const handleRevoke = useCallback((fleet: Fleet) => {
    setSelectedFleet(fleet);
    setRevokeDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogMode(null);
    setSelectedFleet(null);
  }, []);

  const handleCreateSubmit = (values: CreateFleetFormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => handleCloseDialog(),
    });
  };

  const handleEditSubmit = (values: UpdateFleetFormValues) => {
    if (!selectedFleet) return;
    updateMutation.mutate(values, {
      onSuccess: () => handleCloseDialog(),
    });
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFleet) return;
    await deleteMutation.mutateAsync(selectedFleet.id);
    setDeleteDialogOpen(false);
    setSelectedFleet(null);
  };

  const handleRevokeConfirm = async () => {
    if (!selectedFleet) return;
    await revokeMutation.mutateAsync();
    setRevokeDialogOpen(false);
    setSelectedFleet(null);
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Manajemen Armada</h1>
        {canModify && (
          <Button onClick={() => setDialogMode("create")}>
            <Plus className="h-4 w-4" />
            Tambah Armada
          </Button>
        )}
      </div>

      <FleetFilterBar
        filters={filters}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onReset={resetFilters}
      />

      <FleetTable
        data={filteredData}
        loading={isLoading}
        error={isError}
        onRetry={refetch}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRevokeDevice={handleRevoke}
      />

      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Tambah Armada Baru" : "Edit Armada"}
            </DialogTitle>
          </DialogHeader>
          {dialogMode === "create" && (
            <FleetForm
              mode="create"
              onSubmit={handleCreateSubmit}
              onCancel={handleCloseDialog}
              isSubmitting={createMutation.isPending}
            />
          )}
          {dialogMode === "edit" && selectedFleet && (
            <FleetForm
              mode="edit"
              defaultValues={{
                driverName: selectedFleet.driverName ?? "",
                driverContact: selectedFleet.driverContact ?? "",
                capacityKg: selectedFleet.capacityKg,
              }}
              fleet={selectedFleet}
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
        itemName={selectedFleet?.plateNumber ?? "armada"}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />

      <RevokeDeviceDialog
        open={revokeDialogOpen}
        fleet={selectedFleet}
        onConfirm={handleRevokeConfirm}
        onCancel={() => setRevokeDialogOpen(false)}
        isRevoking={revokeMutation.isPending}
      />
    </div>
  );
}