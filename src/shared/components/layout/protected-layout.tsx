import { type ReactNode, type FunctionComponent, type ComponentType } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import type { UserRole, AuthenticatedUser } from "../../types/common.types";
import { USER_ROLE_SET } from "../../constants/roles.constant";
import { isTokenExpired } from "../../lib/jwt";
import { useAuthStore } from "../../../features/auth/store/auth.store";

interface ProtectedLayoutProps {
  readonly children?: ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const location = useLocation();
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const tokenValid = accessToken !== null && !isTokenExpired(accessToken);
  const isAuthed = isAuthenticated && tokenValid;

  if (!isAuthed) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return <>{children}</>;
}

interface RoleGateProps {
  readonly roles: readonly UserRole[];
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
}

export function RoleGate({ roles, children, fallback }: RoleGateProps) {
  const user = useAuthStore((s) => s.user);

  if (!user || !USER_ROLE_SET.has(user.role)) {
    return <Navigate to="/403" replace />;
  }

  if (!roles.includes(user.role)) {
    if (fallback !== undefined) return <>{fallback}</>;
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}

export function withRoleGate<T extends Record<string, unknown>>(
  WrappedComponent: ComponentType<T>,
  allowedRoles: readonly UserRole[],
): FunctionComponent<T> {
  return function RoleGatedComponent(props: T) {
    const user = useAuthStore((s) => s.user);
    if (!user || !allowedRoles.includes(user.role)) {
      return null;
    }
    return <WrappedComponent {...props} />;
  };
}

export function useCurrentUser(): AuthenticatedUser | null {
  return useAuthStore((s) => s.user);
}

export function useIsAuthenticated(): boolean {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated && !isTokenExpired(accessToken);
}

export { Link };
