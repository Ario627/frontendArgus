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
import { CAPTURE_ROLES, CONSOLE_ROLES, FIELD_ROLES } from "@/shared/constants/roles.constant";

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
        element: <RequireRole roles={FIELD_ROLES} />,
        errorElement: <RouteError />,
        children: [
          {
            element: <FieldLayout />,
            errorElement: <RouteError />,
            children: [
              {
                path: "/antrean",
                lazy: async () => ({
                  Component: (await import("@/features/outbox/pages/outbox-page")).OutboxPage
                })
              }
            ]
          }
        ]
      },
      {
        element: <RequireRole roles={["facility"]} />,
        errorElement: <RouteError />,
        children: [
          {
            element: <FieldLayout />,
            errorElement: <RouteError />,
            children: [
              {
                path: "/fasilitas-masuk",
                lazy: async () => ({
                  Component: (await import("@/features/facility/pages/incoming-page")).IncomingPage
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
                path: "/batches",
                lazy: async () => ({
                  Component: (await import("@/features/batch/pages/batches-page")).BatchesPage
                })
              },
              {
                path: "/batches/:batchId",
                lazy: async () => ({
                  Component: (await import("@/features/batch/pages/batch-detail-page")).BatchDetailPage
                })
              },
              {
                path: "/dispositions",
                lazy: async () => ({
                  Component: (await import("@/features/disposition/pages/dispositions-page")).DispositionsPage
                })
              },
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