"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  MoreHorizontal,
  Plus,
  Receipt,
  Search,
  Smartphone,
  Sparkles,
  Tv,
  Wifi,
} from "lucide-react";
import { useFluxStore } from "@/lib/store";
import { formatNaira } from "@/lib/format";
import {
  MONTHLY_SPEND,
  SERVICES,
  SPEND_SPLIT,
  getProvider,
  getService,
  type ServiceSlug,
} from "@/lib/mock";
import { SpendBars, SpendDonut } from "@/components/charts";
import { ServiceBadge, SectionTitle } from "@/components/ui";
import { TxRow } from "@/components/tx-row";

const FUND_AMOUNT = 50000;

const TILE_IMAGE: Record<ServiceSlug, string> = {
  electricity: "/brand/bulb.webp",
  data: "/brand/mobile-data.webp",
  cable: "/brand/tv.webp",
  airtime: "/brand/airtime.webp",
};

const QUICK_ACTIONS = [
  { label: "Pay a bill", href: "/pay", icon: Receipt },
  { label: "Buy airtime", href: "/pay/airtime", icon: Smartphone },
  { label: "Buy data", href: "/pay/data", icon: Wifi },
  { label: "Cable TV", href: "/pay/cable", icon: Tv },
  { label: "More", href: "/billers", icon: MoreHorizontal },
];

const PERIODS = [
  { id: "6M", label: "6 Months", months: 6 },
  { id: "3M", label: "3 Months", months: 3 },
  { id: "1M", label: "This Month", months: 1 },
] as const;

const greeting = () => {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", hour: "numeric", hour12: false }).format(new Date()),
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const todayLabel = () =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

export function Dashboard() {
  const balance = useFluxStore((s) => s.balance);
  const transactions = useFluxStore((s) => s.transactions);
  const billers = useFluxStore((s) => s.billers);
  const fund = useFluxStore((s) => s.fund);

  const [hideBalance, setHideBalance] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | ServiceSlug>("all");
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["id"]>("6M");

  const spend = useMemo(() => {
    const months = PERIODS.find((p) => p.id === period)!.months;
    return MONTHLY_SPEND.slice(-months);
  }, [period]);

  const recent = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions
      .filter((tx) => filter === "all" || tx.service === filter)
      .filter((tx) => {
        if (!q) return true;
        const provider = getProvider(tx.providerId)?.name.toLowerCase() ?? "";
        return (
          provider.includes(q) ||
          tx.account.replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
          tx.title.toLowerCase().includes(q) ||
          tx.ref.toLowerCase().includes(q)
        );
      });
  }, [transactions, query, filter]);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-5 pt-4 md:px-8 lg:px-10 lg:pt-8">
      {/* Desktop top bar: search and account */}
      <div className="hidden items-center justify-between gap-6 lg:flex">
        <label className="relative block w-full max-w-xl">
          <span className="sr-only">Search payments</span>
          <Search size={17} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a biller, transaction or reference"
            className="field h-12 pl-11 text-sm"
          />
        </label>
        <div className="card-2 flex items-center gap-3 py-2 pl-2 pr-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-ink" aria-hidden="true">
            MT
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Maya Thompson</p>
            <p className="text-xs text-muted">Personal account</p>
          </div>
          <ChevronDown size={16} aria-hidden="true" className="text-muted" />
        </div>
      </div>

      {/* Greeting and wallet */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end"
      >
        <div>
          <p className="text-sm text-muted">{todayLabel()}</p>
          <h1 className="mt-1 font-display text-[2.1rem] font-semibold leading-[1.05] tracking-tight md:text-5xl">
            {greeting()}, <span className="text-accent">Maya.</span>
          </h1>
          <p className="mt-3 hidden max-w-md text-muted lg:block">
            Stay on top of your bills, airtime and data. Fast, secure and reliable.
          </p>
        </div>

        <div className="relative overflow-hidden card p-6 md:p-7">
          <img
            src="/brand/aurora.webp"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-50"
          />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="eyebrow">Wallet balance</span>
              <button
                type="button"
                onClick={() => setHideBalance((v) => !v)}
                aria-label={hideBalance ? "Show balance" : "Hide balance"}
                aria-pressed={hideBalance}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:text-fg"
              >
                {hideBalance ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <p className="font-display text-4xl font-semibold tabular-nums md:text-5xl" aria-live="polite">
                {hideBalance ? "₦ ••••••" : formatNaira(balance)}
              </p>
              <button
                type="button"
                onClick={() => fund(FUND_AMOUNT)}
                className="btn-ghost h-12 border-transparent bg-[rgba(4,16,12,0.6)] px-5"
              >
                <Plus size={17} aria-hidden="true" /> Add {formatNaira(FUND_AMOUNT)}
              </button>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-accent">
              <Sparkles size={15} aria-hidden="true" />
              Demo wallet. Adding money tops up mock funds.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Quick actions (tablet and desktop) */}
      <nav aria-label="Quick actions" className="hidden grid-cols-5 gap-3 md:grid">
        {QUICK_ACTIONS.map((a, i) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.label}
              href={a.href}
              className={`flex flex-col items-center gap-3 rounded-[20px] border px-3 py-5 text-sm font-semibold transition-colors ${
                i === 0 ? "border-accent/60 bg-accent/[0.06]" : "card-2 hover:border-line-strong"
              }`}
            >
              <Icon size={22} className="text-accent" aria-hidden="true" />
              {a.label}
            </Link>
          );
        })}
      </nav>

      {/* Quick pay */}
      <section aria-labelledby="quick-pay" className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 id="quick-pay" className="eyebrow">Quick pay</h2>
          <Link href="/pay" className="text-sm font-semibold text-accent hover:underline underline-offset-4">
            See all services →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <Link
              key={s.slug}
              href={`/pay/${s.slug}`}
              className="card-2 group relative isolate flex min-h-[8.5rem] overflow-hidden transition-colors hover:border-accent/40 lg:min-h-[12rem]"
            >
              <img
                src={TILE_IMAGE[s.slug]}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover opacity-70 transition-all duration-700 group-hover:scale-105 group-hover:opacity-90"
              />
              <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-[#04100c] via-[#04100c]/55 to-transparent" />
              <div className="relative flex flex-1 flex-col justify-between gap-4 p-4 md:p-5 lg:p-6">
                <ServiceBadge service={s.slug} size="lg" />
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    <p className="mt-1 hidden text-sm text-muted lg:block">{s.blurb}</p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(4,16,12,0.6)] ring-1 ring-line-strong transition-colors group-hover:bg-accent group-hover:text-accent-ink lg:flex"
                  >
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        {/* Left column: recent payments and spending */}
        <div className="order-2 flex min-w-0 flex-col gap-6 lg:order-none">
          <section aria-labelledby="recent-heading" className="flex min-w-0 flex-col gap-4">
            <div id="recent-heading">
              <SectionTitle action={{ href: "/history", label: "View all" }}>Recent payments</SectionTitle>
            </div>
            <div className="card overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-line p-4 md:p-5">
                <label className="relative block lg:hidden">
                  <span className="sr-only">Search payments</span>
                  <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search biller, number or ref"
                    className="field h-11 pl-10 text-sm"
                  />
                </label>
                <div role="group" aria-label="Filter by service" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
                  {[{ slug: "all", name: "All" }, ...SERVICES.map((s) => ({ slug: s.slug, name: s.shortName }))].map((f) => (
                    <button
                      key={f.slug}
                      type="button"
                      aria-pressed={filter === f.slug}
                      onClick={() => setFilter(f.slug as "all" | ServiceSlug)}
                      className={`h-9 flex-shrink-0 rounded-full px-4 text-sm font-semibold transition-colors ${
                        filter === f.slug ? "bg-accent text-accent-ink" : "bg-surface-2 text-muted hover:text-fg"
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="hidden grid-cols-[minmax(0,2.4fr)_1fr_1.3fr_1fr_20px] gap-6 border-b border-line px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted lg:grid">
                <span>Biller</span>
                <span>Amount</span>
                <span>Date &amp; time</span>
                <span>Status</span>
                <span className="w-5" />
              </div>

              <div className="divide-y divide-line">
                {recent.length === 0 && <p className="p-6 text-center text-sm text-muted">No payments match your search.</p>}
                {recent.slice(0, 6).map((tx) => (
                  <TxRow key={tx.ref} tx={tx} />
                ))}
              </div>
            </div>
          </section>

          <section aria-labelledby="spend-heading" className="hidden min-w-0 flex-col gap-5 card p-6 lg:flex">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 id="spend-heading" className="font-display text-xl font-semibold">Spending overview</h2>
                <p className="text-sm text-muted">Your bill payments over the selected period</p>
              </div>
              <div role="group" aria-label="Spending period" className="flex rounded-full bg-surface-2 p-1">
                {PERIODS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={period === p.id}
                    onClick={() => setPeriod(p.id)}
                    className={`h-9 rounded-full px-4 text-sm font-semibold transition-colors ${
                      period === p.id ? "bg-accent text-accent-ink" : "text-muted hover:text-fg"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <SpendBars data={spend} />

            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-8 border-t border-line pt-6">
              <SpendDonut total={formatNaira(102400)} />
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">Top categories</p>
                <ul className="space-y-3 text-sm">
                  {SPEND_SPLIT.map((s) => (
                    <li key={s.label} className="flex items-center justify-between gap-6">
                      <span className="flex items-center gap-2.5 text-muted">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} aria-hidden="true" />
                        {s.label}
                      </span>
                      <span className="font-semibold tabular-nums">{s.share}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
        {/* Right column: saved billers and automation (first on mobile) */}
        <div className="order-1 flex min-w-0 flex-col gap-6 lg:order-none">
          <section aria-labelledby="billers-heading" className="flex min-w-0 flex-col gap-4">
            <div id="billers-heading">
              <SectionTitle action={{ href: "/billers", label: "Manage" }}>Saved billers</SectionTitle>
            </div>
            <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
              {billers.length === 0 && (
                <p className="card-2 p-5 text-sm text-muted">No saved billers yet. Pay a bill and save it here.</p>
              )}
              {billers.map((b) => {
                const service = getService(b.service);
                const provider = getProvider(b.providerId);
                const digits = b.account.replace(/\s/g, "");
                return (
                  <Link
                    key={b.id}
                    href={`/pay/${b.service}?provider=${b.providerId}&account=${digits}`}
                    className="card-2 group flex min-w-[240px] items-center gap-4 p-4 transition-colors hover:border-accent/40 lg:min-w-0"
                  >
                    <ServiceBadge service={b.service} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted">{b.nickname}</p>
                      <p className="truncate font-semibold tabular-nums">{b.account}</p>
                      <p className="truncate text-xs text-muted">
                        {provider?.name} · {service?.shortName}
                      </p>
                    </div>
                    <ChevronRight size={18} aria-hidden="true" className="flex-shrink-0 text-muted" />
                    <span className="sr-only">Pay {b.nickname}</span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="automate-heading" className="relative hidden overflow-hidden card p-6 lg:block">
            <img
              src="/brand/autopay.webp"
              alt=""
              aria-hidden="true"
              className="-mx-6 -mt-6 mb-5 h-36 w-[calc(100%+3rem)] max-w-none object-cover"
            />
            <div className="flex items-center justify-between">
              <h2 id="automate-heading" className="font-display text-xl font-semibold">Automate your bills</h2>
              <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-bold text-accent">New</span>
            </div>
            <p className="mt-3 text-sm text-muted">Schedule recurring payments so your power and TV never lapse.</p>
            <ul className="mt-5 space-y-2.5 text-sm">
              {["Convenient and worry free", "Instant notifications", "Full control, any time"].map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <Check size={16} className="text-accent" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
            <button type="button" disabled className="btn-primary mt-6 h-11 w-full text-sm" aria-describedby="automate-note">
              <CalendarClock size={16} aria-hidden="true" /> Set up auto pay
            </button>
            <p id="automate-note" className="mt-2 text-center text-xs text-muted">
              Coming soon. Not part of this demo.
            </p>
          </section>
        </div>

      </div>

      <p className="pb-4 text-center text-xs text-muted">
        {SERVICES.length} services · {billers.length} saved billers · Demo data only
      </p>
    </div>
  );
}
