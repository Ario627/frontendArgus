import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Link, useRouteError, isRouteErrorResponse } from "react-router-dom";
import { ProtectedLayout, RoleGate } from "../shared/components/layout/protected-layout";
import { ErrorBoundary } from "./error-boundary";
import { Skeleton } from "../shared/components/ui/skeleton";

function PageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col gap-4 p-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-96 w-full rounded-lg" />
    </div>
  );
}

function LazyRouteError() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 500;
  const message = isRouteErrorResponse(error)
    ? error.statusText || "Halaman tidak dapat dimuat"
    : "Modul halaman belum tersedia";

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md rounded-lg border border-border bg-muted p-8 text-center">
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          {status} — {message}
        </h2>
        <p className="text-sm text-muted-foreground">
          Pastikan modul halaman sudah diimplementasikan.
        </p>
      </div>
    </div>
  );
}

const LoginPage = lazy(() =>
  import("../features/auth/pages/login-page").then((m) => ({ default: m.LoginPage })),
);
const FleetListPage = lazy(() =>
  import("../features/fleet/pages/fleet-list-page").then((m) => ({ default: m.FleetListPage })),
);
const FleetDetailPage = lazy(() =>
  import("../features/fleet/pages/fleet-detail-page").then((m) => ({ default: m.FleetDetailPage })),
);
const DestinationListPage = lazy(() =>
  import("../features/destination/pages/destination-list-page").then((m) => ({ default: m.DestinationListPage })),
);

function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="max-w-md rounded-lg border border-border bg-muted p-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-foreground">403</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Anda tidak memiliki akses ke halaman ini.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="max-w-md rounded-lg border border-border bg-muted p-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-foreground">404</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Halaman yang Anda cari tidak ditemukan.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <Suspense fallback={<PageSkeleton />}>
        <LoginPage />
      </Suspense>
    ),
    errorElement: <LazyRouteError />,
  },
  {
    path: "/",
    element: <ProtectedLayout />,
    errorElement: (
      <ErrorBoundary>
        <LazyRouteError />
      </ErrorBoundary>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: "fleet",
        element: (
          <RoleGate roles={["admin", "supervisor"]}>
            <Suspense fallback={<PageSkeleton />}>
              <FleetListPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: "fleet/:id",
        element: (
          <RoleGate roles={["admin", "supervisor", "driver"]}>
            <Suspense fallback={<PageSkeleton />}>
              <FleetDetailPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: "destination",
        element: (
          <RoleGate roles={["admin", "supervisor"]}>
            <Suspense fallback={<PageSkeleton />}>
              <DestinationListPage />
            </Suspense>
          </RoleGate>
        ),
      },
      { path: "403", element: <ForbiddenPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);