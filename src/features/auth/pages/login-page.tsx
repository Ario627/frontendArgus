import { Link } from "react-router-dom";
import {
  Leaf,
  MapPin,
  Route,
  ShieldCheck,
} from "lucide-react";
import { LoginForm } from "../components/login-form";

interface ValueItem {
  icon: typeof ShieldCheck;
  title: string;
  description: string;
}

const valueItems: readonly ValueItem[] = [
  {
    icon: MapPin,
    title: "Monitoring Real-Time",
    description: "Posisi armada terbaru dengan polling otomatis dan indikator status perangkat.",
  },
  {
    icon: Route,
    title: "Optimasi Rute",
    description: "Rute harian dioptimalkan via OR-Tools untuk efisiensi jarak dan kapasitas.",
  },
  {
    icon: ShieldCheck,
    title: "Akses Aman",
    description: "JWT dengan RBAC berlapis untuk admin, supervisor, dan driver.",
  },
];

export function LoginPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <section
        className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-brand p-10 text-brand-foreground lg:flex xl:p-9"
        aria-label="Informasi produk ARGUS"
      >
        <div
          aria-hidden
        />
        <div
          style={{ animationDelay: "7s" }}
          aria-hidden
        />

        <div className="relative flex items-center gap-2.5 animate-fade-in">
        
          <div className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight">ARGUS</span>
            
          </div>
        </div>

        <div className="relative space-y-8">
          <div
            className="animate-fade-in-up inline-flex items-center gap-2 inline-flex border border-brand-foreground/20 bg-brand-foreground/10 px-3 py-1 text-xs font-medium"
            style={{ animationDelay: "0.1s" }}
          >
            <Leaf className="h-3.5 w-3.5" />
            Pengelolaan armada sampah berkelanjutan
          </div>

          <h2
            className="animate-fade-in-up max-w-md text-4xl font-semibold leading-tight xl:text-5xl"
            style={{ animationDelay: "0.2s" }}
          >
            Pantau, optimalkan, dan tangani armada dalam satu layar.
          </h2>

          <p
            className="animate-fade-in-up max-w-md text-base opacity-80"
            style={{ animationDelay: "0.3s" }}
          >
            ARGUS menghubungkan data telemetry, optimasi rute, dan recovery
            armada sehingga operasional pengangkutan sampah berjalan lebih
            efisien dan transparan.
          </p>

          <div className="space-y-4 pt-2">
            {valueItems.map((item, index) => (
              <div
                key={item.title}
                className="animate-fade-in-up flex items-start gap-4"
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center  bg-brand-foreground/10 transition-transform duration-300 ">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs opacity-70">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p
          className="animate-fade-in relative text-xs opacity-60"
          style={{ animationDelay: "0.7s" }}
        >
          AI Open Innovation Challenge 2026
        </p>
      </section>

      <section className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div
          className=""
          aria-hidden
        />

        <div className="mx-auto w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold tracking-tight text-foreground">
                  ARGUS
                </span>
              </div>
            </div>
          </div>

          <div className="mb-8 space-y-2">
            <h1 className="animate-fade-in-up text-3xl font-semibold tracking-tight text-foreground">
              Selamat datang kembali
            </h1>
            <p
              className="animate-fade-in-up text-sm text-muted-foreground"
              style={{ animationDelay: "0.1s" }}
            >
              Masukkan kredensial Anda untuk mengakses command center.
            </p>
          </div>

          <div
            className="animate-fade-in-up  border border-border bg-card p-6  sm:p-8"
            style={{ animationDelay: "0.2s" }}
          >
            <LoginForm />
          </div>

          <p
            className="animate-fade-in-up mt-6 text-center text-xs text-muted-foreground"
            style={{ animationDelay: "0.3s" }}
          >
            Butuh bantuan?{" "}
            <Link
              to="/"
              className="font-medium text-brand underline-offset-2 transition-colors hover:underline"
            >
              Hubungi administrator
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
