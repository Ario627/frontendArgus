import { apiGet, apiPost } from "@/api/axios-client";
import { endpoints } from "@/api/endpoints";
import { toSearchParams } from "@/shared/lib/search-params";
import type { PaginatedItems } from "@/shared/types/api.types";
import type {
  CreateMenuItemInput,
  MenuInsightReport,
  MenuItemDto
} from "@/shared/types/menu.types";
import type { SppgDetailDto } from "@/shared/types/sppg.types";

export interface MenuItemsQuery {
  readonly aktif?: boolean;
  readonly page?: number;
  readonly limit?: number;
}

export interface MenuInsightsQuery {
  readonly sppgId?: string;
  readonly from?: string;
  readonly to?: string;
}

export function fetchMenuItems(query: MenuItemsQuery = {}): Promise<PaginatedItems<MenuItemDto>> {
  return apiGet<PaginatedItems<MenuItemDto>>(
    `${endpoints.menu.items}${toSearchParams({ ...query })}`
  );
}

export function fetchMenuInsights(query: MenuInsightsQuery = {}): Promise<MenuInsightReport> {
  return apiGet<MenuInsightReport>(`${endpoints.menu.insights}${toSearchParams({ ...query })}`);
}

export function createMenuItem(input: CreateMenuItemInput): Promise<MenuItemDto> {
  return apiPost<MenuItemDto>(endpoints.menu.createItem, input);
}

export function fetchSppgPoints(sppgId: string): Promise<SppgDetailDto> {
  return apiGet<SppgDetailDto>(endpoints.sppg.detail(sppgId));
}