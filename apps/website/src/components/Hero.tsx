import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Star,
  Bell,
  Search,
} from "lucide-react";
import { Eyebrow } from "@/components/aurora/Eyebrow";
import { GlassPanel } from "@/components/aurora/GlassPanel";
import { GradientText } from "@/components/aurora/GradientText";
import { MagneticButton } from "@/components/aurora/MagneticButton";
import { Reveal, RevealItem } from "@/components/aurora/Reveal";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: ShoppingCart, label: "Orders" },
  { icon: Package, label: "Products" },
  { icon: Users, label: "Customers" },
  { icon: Star, label: "Reviews" },
];

const STATS = [
  { label: "Revenue", value: "$48.2k" },
  { label: "Orders", value: "1,204" },
  { label: "Customers", value: "12.4k" },
];

const ORDERS = [
  {
    name: "Alice Kim",
    items: "3 items",
    date: "Jun 12",
    amt: "$129",
    status: "Paid",
    color: "#22c55e",
  },
  {
    name: "Ben Moss",
    items: "1 item",
    date: "Jun 11",
    amt: "$89",
    status: "Paid",
    color: "#22c55e",
  },
  {
    name: "Clara Sol",
    items: "5 items",
    date: "Jun 10",
    amt: "$420",
    status: "Pending",
    color: "#f59e0b",
  },
  {
    name: "Dan Tran",
    items: "2 items",
    date: "Jun 8",
    amt: "$57",
    status: "Refunded",
    color: "#ef4444",
  },
];

// Hand-authored smooth polyline for a 30-day revenue sparkline
// viewBox: 0 0 320 80, values roughly undulating upward
const CHART_POINTS =
  "0,68 16,58 32,62 48,50 64,44 80,48 96,38 112,32 128,40 144,28 160,34 176,24 192,30 208,18 224,22 240,14 256,20 272,10 288,16 304,8 320,4";

function DashboardMockup() {
  return (
    <div className="rounded-3xl overflow-hidden bg-background/60 border border-border flex min-h-120">
      {/* Sidebar */}
      <aside className="hidden sm:flex flex-col gap-1 w-44 shrink-0 border-r border-border bg-background/40 px-2 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 pb-3 mb-1 border-b border-border">
          <span
            className="size-6 rounded-full bg-aurora shrink-0"
            aria-hidden="true"
          />
          <span className="text-xs font-semibold text-foreground truncate">
            Acme Inc.
          </span>
        </div>
        {/* Nav items */}
        {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
          <div
            key={label}
            className={[
              "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors",
              active
                ? "bg-foreground/5 text-foreground font-medium border-l-2 border-foreground/30"
                : "text-muted-foreground",
            ].join(" ")}
          >
            <Icon className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{label}</span>
          </div>
        ))}
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-background/40">
          <span className="text-xs font-semibold text-foreground flex-1">
            Dashboard
          </span>
          <div className="flex items-center gap-1.5">
            <span className="size-5 rounded-full bg-foreground/8 flex items-center justify-center">
              <Search
                className="size-2.5 text-muted-foreground"
                aria-hidden="true"
              />
            </span>
            <span className="size-5 rounded-full bg-foreground/8 flex items-center justify-center">
              <Bell
                className="size-2.5 text-muted-foreground"
                aria-hidden="true"
              />
            </span>
            <span
              className="size-5 rounded-full bg-aurora"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-3 flex flex-col gap-3 overflow-hidden">
          {/* Stat tiles */}
          <div className="grid grid-cols-3 gap-2">
            {STATS.map(({ label, value }) => (
              <div
                key={label}
                className="rounded-lg bg-foreground/5 border border-border px-2.5 py-2 flex flex-col gap-0.5"
              >
                <span className="text-[9px] text-muted-foreground uppercase tracking-wide leading-none">
                  {label}
                </span>
                <span className="text-aurora text-sm font-bold leading-tight">
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Chart card */}
          <div className="rounded-lg bg-foreground/5 border border-border px-2.5 py-2 flex flex-col gap-1.5 flex-1">
            <span className="text-[9px] text-muted-foreground uppercase tracking-wide">
              30-day revenue
            </span>
            <svg
              viewBox="0 0 320 80"
              className="w-full h-full"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7f77dd" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#7f77dd" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Gradient fill area */}
              <polygon
                points={`0,68 ${CHART_POINTS} 320,80 0,80`}
                fill="url(#chart-fill)"
              />
              {/* Line */}
              <polyline
                points={CHART_POINTS}
                fill="none"
                stroke="#7f77dd"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Recent orders */}
          <div className="rounded-lg bg-foreground/5 border border-border px-2.5 py-2 flex flex-col gap-2 flex-1">
            <span className="text-[9px] text-muted-foreground uppercase tracking-wide">
              Recent orders
            </span>
            <div className="flex flex-col gap-1">
              {/* Column headers */}
              <div className="grid grid-cols-[1.25rem_minmax(0,1fr)_4rem_3.5rem_3rem_5rem] items-center gap-3 px-1 text-[8px] uppercase tracking-wide text-muted-foreground">
                <span />
                <span>Customer</span>
                <span>Items</span>
                <span>Date</span>
                <span className="text-right">Total</span>
                <span>Status</span>
              </div>
              {ORDERS.map((o) => (
                <div
                  key={o.name}
                  className="grid grid-cols-[1.25rem_minmax(0,1fr)_4rem_3.5rem_3rem_5rem] items-center gap-3 text-[10px]"
                >
                  <span className="size-5 shrink-0 rounded-full bg-foreground/10 flex items-center justify-center text-[8px] font-medium text-foreground">
                    {o.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")}
                  </span>
                  <span className="truncate text-foreground">{o.name}</span>
                  <span className="text-muted-foreground">{o.items}</span>
                  <span className="text-muted-foreground">{o.date}</span>
                  <span className="text-right text-muted-foreground tabular-nums">
                    {o.amt}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="size-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: o.color }}
                      aria-hidden="true"
                    />
                    <span className="text-muted-foreground">{o.status}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function Hero() {
  return (
    <div className="relative py-24 md:py-32 text-center">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Copy block */}
        <Reveal
          stagger
          className="mx-auto max-w-3xl flex flex-col items-center gap-6"
        >
          <RevealItem>
            <Eyebrow>Open source · shadcn registry</Eyebrow>
          </RevealItem>

          <RevealItem>
            <h1 className="text-5xl md:text-7xl font-bold tracking-[-0.02em] leading-[1.05] text-foreground">
              Build admin panels that{" "}
              <GradientText>don&rsquo;t look like admin panels.</GradientText>
            </h1>
          </RevealItem>

          <RevealItem>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Production-ready shadcn blocks for internal tools, dashboards, B2B
              apps, and admin panels with React.
            </p>
          </RevealItem>

          <RevealItem>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <MagneticButton
                href="https://shadmin.turtlesocks.dev/docs/install"
                external
                variant="aurora"
              >
                Get started
              </MagneticButton>
              <MagneticButton
                href="https://shadmin.turtlesocks.dev/demo"
                external
                variant="ghost"
              >
                Live demo
              </MagneticButton>
            </div>
          </RevealItem>
        </Reveal>

        {/* Coded dashboard mockup */}
        <Reveal className="mt-16 sm:mt-24 mx-auto max-w-5xl">
          <GlassPanel bezel>
            <DashboardMockup />
          </GlassPanel>
        </Reveal>
      </div>
    </div>
  );
}
