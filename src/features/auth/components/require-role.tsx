import { Navigate, Outlet } from "react-router";
import { ForbiddenPage } from "@/features/auth/pages/forbidden-page";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { UserRole } from "@/shared/constants/roles.constant";

export interface RequireRoleProps {
  readonly roles: readonly UserRole[];
}

export function RequireRole({ roles }: RequireRoleProps) {
  const role = useAuthStore((state) => state.role);

  if (role === null) return <Navigate to="/login" replace />;
  if (!roles.includes(role)) return <ForbiddenPage />;

  return <Outlet />;
}