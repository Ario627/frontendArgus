import { Navigate } from "react-router";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { LandingPage } from "@/features/landing/pages/landing-page";
import { homePathForRole } from "@/shared/constants/nav.constant";

export function RootPage() {
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);

  if (token !== null && role !== null) {
    return <Navigate to={homePathForRole(role)} replace />;
  }

  return <LandingPage />;
}