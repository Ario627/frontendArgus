import { createBrowserRouter, Navigate } from "react-router";
import { RouteError } from "@/app/error-boundary";
import { NotFoundPage } from "@/app/not-found-page";
import { RequireAuth } from "@/features/auth/components/require-auth";
import { RequireRole } from "@/features/auth/components/require-role";
import { LoginPage } from "@/features/auth/pages/login-page";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { ConsoleLayout } from "@/shared/components/layout/console-layout";
import { FieldLayout } from "@/shared/components/layout/field-layout";
import { homePathForRole } from "@/shared/constants/nav.constant";
import { CAPTURE_ROLES, CONSOLE_ROLES } from "@/shared/constants/roles.constant";

function HomeRedirect() {
  const role = useAuthStore((state) => state.role);
  if (role === null) return <Navigate to="/login" replace />;
  return <Navigate to={homePathForRole(role)} replace />;
}

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage />, errorElement: <RouteError /> },
  {
    element: <RequireAuth />,
    errorElement: <RouteError />,
    children: [
      { path: "/", element: <HomeRedirect /> },
      {
        element: <RequireRole roles={CAPTURE_ROLES} />,
        errorElement: <RouteError />,
        children: [
          {
            element: <FieldLayout />,
            errorElement: <RouteError />,
            children: [
              {
                path: "/catat",
                lazy: async () => ({
                  Component: (await import("@/features/field-capture/pages/capture-page")).CapturePage
                })
              }
            ]
          }
        ]
      },
      {
        element: <RequireRole roles={CONSOLE_ROLES} />,
        errorElement: <RouteError />,
        children: [
          {
            element: <ConsoleLayout />,
            errorElement: <RouteError />,
            children: [
              {
                path: "/dashboard",
                lazy: async () => ({
                  Component: (await import("@/features/dashboard/pages/dashboard-page")).DashboardPage
                })
              }
            ]
          }
        ]
      }
    ]
  },
  { path: "*", element: <NotFoundPage />, errorElement: <RouteError /> }
]);