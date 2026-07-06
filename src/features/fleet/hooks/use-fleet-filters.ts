import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "../../../shared/hooks/use-debounce";
import type { Fleet, FleetFilters } from "../../../shared/types/fleet.types";
import type { OperationalStatus } from "../../../shared/types/common.types";

type StatusFilter = OperationalStatus | "all";

const VALID_STATUSES: readonly StatusFilter[] = [
  "all",
  "ONLINE_NORMAL",
  "ONLINE_BROKEN",
  "STALE",
  "OFFLINE",
];

function parseStatusParam(value: string | null): StatusFilter {
  if (value === null || value === "all") return "all";
  return VALID_STATUSES.includes(value as StatusFilter)
    ? (value as StatusFilter)
    : "all";
}

export function useFleetFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const status = parseStatusParam(searchParams.get("status"));

  const debouncedSearch = useDebounce(search, 300);

  const filters: FleetFilters = useMemo(
    () => ({ search: debouncedSearch, status }),
    [debouncedSearch, status],
  );

  const rawFilters: FleetFilters = useMemo(
    () => ({ search, status }),
    [search, status],
  );

  const setSearch = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set("search", value);
    else params.delete("search");
    if (status !== "all") params.set("status", status);
    setSearchParams(params, { replace: true });
  };

  const setStatus = (value: StatusFilter) => {
    const params = new URLSearchParams(searchParams);
    if (search) params.set("search", search);
    if (value !== "all") params.set("status", value);
    else params.delete("status");
    setSearchParams(params, { replace: false });
  };

  const resetFilters = () => {
    setSearchParams({}, { replace: false });
  };

  return {
    filters: rawFilters,
    debouncedFilters: filters,
    setSearch,
    setStatus,
    resetFilters,
  };
}

export function useFilteredFleet(
  fleetList: readonly Fleet[] | undefined,
  filters: FleetFilters,
): readonly Fleet[] {
  return useMemo(() => {
    if (!fleetList) return [];
    const query = filters.search.toLowerCase();
    return fleetList.filter((f) => {
      const matchSearch =
        query === "" ||
        f.plateNumber.toLowerCase().includes(query) ||
        (f.driverName ?? "").toLowerCase().includes(query);
      const matchStatus =
        filters.status === "all" || f.operationalStatus === filters.status;
      return matchSearch && matchStatus;
    });
  }, [fleetList, filters]);
}