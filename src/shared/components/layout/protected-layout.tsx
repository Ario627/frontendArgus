import { type ReactNode, type FunctionComponent, type ComponentType } from "react";
import { Navigate, useLocation, Link, Outlet } from "react-router-dom";
import type { UserRole, AuthenticatedUser } from "../../types/common.types";
import { USER_ROLE_SET } from "../../constants/roles.constant";
import { isTokenExpired } from "../../lib/jwt";
import { useAuthStore } from "../../../features/auth/store/auth.store";
import { useMediaQuery } from "../../hooks/use-media-query";
import { AppShell } from "./app-shell";
import { MobileShell } from "./mobile-shell";

interface ProtectedLayoutProps {
  readonly children?: ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const location = useLocation();
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

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

  const shellProps = {
    userRole: user?.role ?? "",
    userName: user?.username ?? "",
    onLogout: logout,
    children: children ?? <Outlet />,
  };

  return isDesktop ? <AppShell {...shellProps} /> : <MobileShell />;
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
