import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "@/features/auth/store/auth.store";

export function RequireAuth() {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();

  if (token === null) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}