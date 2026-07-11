import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Gauge,
  Leaf,
  MapPin,
  Recycle,
  Route,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { Button } from "../../../shared/components/ui/button";

interface FeatureItem {
  icon: typeof MapPin;
  title: string;
  description: string;
  delay: string;
}

const features: readonly FeatureItem[] = [
  {
    icon: MapPin,
    title: "Monitoring Real-Time",
    description:
      "Lacak posisi armada di peta interaktif dengan polling otomatis, deteksi status perangkat, dan indikator stale/offline yang akurat.",
    delay: "0s",
  },
  {
    icon: Route,
    title: "Optimasi Rute VRP",
    description:
      "Perencanaan rute harian via OR-Tools solver untuk meminimasi jarak tempuh, memaksimalkan kapasitas armada, dan melewatkan destinasi tak terjangkau.",
    delay: "0.1s",
  },
  {
    icon: ShieldAlert,
    title: "Sistem Recovery",
    description:
      "Penanganan armada rusak dengan redistribusi otomatis. Greedy fallback siap menggantikan jika tidak ada penerima cocok.",
    delay: "0.2s",
  },
  {
    icon: BarChart3,
    title: "Ringkasan AI",
    description:
      "Narasi operasional dari LLM untuk supervisor. Data mentah tetap tampil penuh meski narasi sedang tidak tersedia.",
    delay: "0.3s",
  },
];

const steps: readonly { number: string; title: string; description: string }[] =
  [
    {
      number: "01",
      title: "Autentikasi",
      description:
        "Login dengan JWT dan RBAC berlapis. Admin, supervisor, maupun driver mengakses fitur sesuai peran masing-masing.",
    },
    {
      number: "02",
      title: "Dashboard Operasional",
      description:
        "Pantau peta live armada, metrik ringkasan, dan narasi AI dalam satu layar command center yang ringkas.",
    },
    {
      number: "03",
      title: "Optimasi & Recovery",
      description:
        "Trigger rute harian otomatis. Jika armada rusak, sistem recovery segera mencari kandidat penerima terbaik.",
    },
  ];

const metrics: readonly { value: string; label: string }[] = [
  { value: "30-90s", label: "Interval Polling" },
  { value: "3", label: "Level Akses RBAC" },
  { value: "OR-Tools", label: "Engine Optimisasi" },
  { value: "Leaflet", label: "Peta Interaktif" },
];

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      
      <div className="flex flex-col leading-none">
        <span className="text-base font-bold tracking-tight text-foreground">
          ARGUS
        </span>
    
      </div>
    </div>
  );
}

function RouteAnimation() {
  return (
    <svg
      viewBox="0 0 400 200"
      className="h-full w-full"
      role="img"
      aria-label="Ilustrasi optimasi rute armada"
    >
      <defs>
        <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--brand))" stopOpacity="0.8" />
          <stop offset="100%" stopColor="hsl(var(--brand))" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Route path */}
      <path
        d="M 40 140 Q 120 60 200 100 T 360 80"
        fill="none"
        stroke="url(#routeGrad)"
        strokeWidth="3"
        strokeDasharray="8 6"
        style={{ animation: "route-dash 1.5s linear infinite" }}
      />

      {/* Stops */}
      {[
        { x: 40, y: 140 },
        { x: 120, y: 70 },
        { x: 200, y: 100 },
        { x: 280, y: 85 },
        { x: 360, y: 80 },
      ].map((stop, i) => (
        <g key={stop.x}>
          <circle
            cx={stop.x}
            cy={stop.y}
            r="6"
            fill="hsl(var(--brand))"
            opacity="0.2"
            style={{
              transformOrigin: `${stop.x}px ${stop.y}px`,
              animation: `pulse-glow 3s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
          <circle
            cx={stop.x}
            cy={stop.y}
            r="3"
            fill="hsl(var(--brand))"
          />
        </g>
      ))}

      {/* Moving truck dot */}
      <circle r="5" fill="hsl(var(--brand-foreground))" stroke="hsl(var(--brand))" strokeWidth="2">
        <animateMotion
          dur="4s"
          repeatCount="indefinite"
          path="M 40 140 Q 120 60 200 100 T 360 80"
        />
      </circle>
    </svg>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 ">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <BrandMark />
          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
            <a
              href="#fitur"
              className="transition-colors hover:text-foreground"
            >
              Fitur
            </a>
            <a
              href="#cara-kerja"
              className="transition-colors hover:text-foreground"
            >
              Cara Kerja
            </a>
            <a
              href="#metrik"
              className="transition-colors hover:text-foreground"
            >
              Metrik
            </a>
            <a
              href="#teknologi"
              className="transition-colors hover:text-foreground"
            >
              Teknologi
            </a>
          </nav>
          <Button asChild size="sm">
            <Link to="/login">
              Masuk
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-b from-brand-soft via-background to-background" />

          {/* Animated decorative blobs */}
          <div
            className="absolute left-[10%] top-10 h-72 w-72 inline-flex border border-brand bg-brand/10  animate-drift"
            aria-hidden
          />
          <div
            style={{ animationDelay: "5s" }}
            aria-hidden
          />

          <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:py-32">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="text-center lg:text-left">
                <div className="mb-6 inline-flex animate-fade-in items-center gap-2 bg-card border border-border bg-background/70 px-4 py-1.5 text-xs font-medium text-muted-foreground  backdrop-blur">
                  <Leaf className="h-3.5 w-3.5 text-brand" aria-hidden />
                  Solusi pengelolaan armada sampah berbasis AI
                </div>

                <h1
                  className="animate-fade-in-up mb-6 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
                  style={{ animationDelay: "0.1s" }}
                >
                  Command Center
                  <br />
                  <span className="text-brand">Armada Sampah</span>
                </h1>

                <p
                  className="animate-fade-in-up mx-auto mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0"
                  style={{ animationDelay: "0.2s" }}
                >
                  Sistem operasional terintegrasi untuk monitoring armada,
                  optimasi rute, dan penanganan darurat — irancang untuk kota
                  yang lebih bersih dan berkelanjutan.
                </p>

                <div
                  className="animate-fade-in-up flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
                  style={{ animationDelay: "0.3s" }}
                >
                  <Button asChild size="lg">
                    <Link to="/login">
                      Masuk ke Sistem
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <a href="#fitur">Jelajahi Fitur</a>
                  </Button>
                </div>
              </div>

              {/* Route visualization card */}
              <div
                className="animate-slide-in-left relative hidden lg:block"
                style={{ animationDelay: "0.4s" }}
              >
                <div className="relative overflow-hidden  border border-border bg-card p-8 ">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center  bg-brand-soft text-brand">
                      <Route className="h-5 w-5" aria-hidden />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Optimasi Rute
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Visualisasi distribusi titik jemput
                      </p>
                    </div>
                  </div>
                  <div className="h-48">
                    <RouteAnimation />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className=" bg-muted p-3 text-center">
                      <p className="text-lg font-bold text-brand">5</p>
                      <p className="text-[10px] text-muted-foreground">
                        Titik Jemput
                      </p>
                    </div>
                    <div className=" bg-muted p-3 text-center">
                      <p className="text-lg font-bold text-brand">12.4km</p>
                      <p className="text-[10px] text-muted-foreground">
                        Total Rute
                      </p>
                    </div>
                    <div className=" bg-muted p-3 text-center">
                      <p className="text-lg font-bold text-brand">87%</p>
                      <p className="text-[10px] text-muted-foreground">
                        Efisiensi
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="fitur" className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Fitur Utama
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Empat pilar ARGUS yang bekerja terintegrasi untuk operasional
              armada yang efisien dan tangguh.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group animate-fade-in-up  border border-border bg-card p-7 transition-all duration-300  hover:"
                style={{ animationDelay: feature.delay }}
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center  bg-brand-soft text-brand transition-transform duration-300 group-">
                  <feature.icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mb-2.5 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section
          id="cara-kerja"
          className="border-y border-border bg-muted/30"
        >
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="mb-14 text-center">
              <h2 className="mb-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Cara Kerja
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Tiga alur utama dari login hingga operasional harian.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className="animate-fade-in-up relative"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {index < steps.length - 1 && (
                    <div
                      className="absolute left-6 top-6 hidden h-px w-full bg-linear-to-r from-border to-transparent md:block"
                      aria-hidden
                    />
                  )}
                  <div className="relative flex h-12 w-12 items-center justify-center bg-card border border-border bg-background text-sm font-semibold text-brand  transition-colors duration-300">
                    {step.number}
                  </div>
                  <h3 className="mb-2 mt-5 text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Metrics */}
        <section id="metrik" className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Metrik Operasional
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Konfigurasi yang dirancang untuk mendekati real-time tanpa
              membebani infrastruktur.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {metrics.map((metric, index) => (
              <div
                key={metric.label}
                className="animate-fade-in-up  border border-border bg-card p-6 text-center transition-all duration-300 hover:"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-3xl font-bold text-brand sm:text-4xl">
                  {metric.value}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tech stack */}
        <section
          id="teknologi"
          className="mx-auto max-w-7xl px-6 pb-20"
        >
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Stack Teknologi
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Dibangun dengan teknologi modern untuk performa, keamanan, dan
              kemudahan pengembangan.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { icon: Zap, label: "NestJS" },
              { icon: Recycle, label: "React" },
              { icon: MapPin, label: "Leaflet" },
              { icon: Gauge, label: "TanStack Query" },
              { icon: Route, label: "MQTT" },
              { icon: BarChart3, label: "OR-Tools" },
            ].map((tech, index) => (
              <div
                key={tech.label}
                className="animate-fade-in-up flex flex-col items-center gap-2  border border-border bg-card px-4 py-5 text-center transition-all duration-300  hover:"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <tech.icon
                  className="h-6 w-6 text-brand"
                  aria-hidden
                />
                <span className="text-sm font-medium text-foreground">
                  {tech.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="relative overflow-hidden  bg-brand px-8 py-14 text-center sm:px-16 sm:py-18">
            <div
              className="absolute left-0 top-0 h-full w-1/3 bg-linear-to-r from-white/5 to-transparent"
              aria-hidden
            />
            <div
              className="absolute right-0 top-0 h-full w-1/2 bg-linear-to-l from-white/10 to-transparent animate-pulse-glow"
              aria-hidden
            />
            <div className="relative">
              <h2 className="mb-4 text-3xl font-semibold tracking-tight text-brand-foreground sm:text-4xl">
                Siap Mengelola Armada?
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-base text-brand-foreground/80">
                Masuk ke command center untuk monitoring, optimasi rute, dan
                penanganan darurat dalam satu sistem terintegrasi.
              </p>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-brand-foreground/30 bg-brand-foreground text-brand transition-all duration-300 hover:bg-brand-foreground/90 hover:text-brand"
              >
                <Link to="/login">
                  Masuk ke ARGUS
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <BrandMark />
            <p className="text-xs text-muted-foreground">
              AI Open Innovation Challenge 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
