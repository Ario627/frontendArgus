import { Outlet } from "react-router";

export function PublicLayout() {
  return (
    <div className="min-h-dvh">
      <main className="mx-auto w-full max-w-lg px-4 py-6 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
    </div>
  );
}