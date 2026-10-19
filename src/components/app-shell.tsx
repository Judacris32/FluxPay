"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Clock, Home, Receipt } from "lucide-react";
import { Logo } from "@/components/logo";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/pay", label: "Pay a bill", icon: Receipt },
  { href: "/history", label: "History", icon: Clock },
  { href: "/billers", label: "Saved billers", icon: Bookmark },
];

// Pay and receipt screens are focused flows, so they run without the app chrome.
const isFlow = (path: string) => /^\/(pay\/[^/]+|receipt\/[^/]+)/.test(path);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";

  if (isFlow(pathname)) {
    return <div className="min-h-dvh">{children}</div>;
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="min-h-dvh lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 flex-col gap-10 border-r border-line p-6 lg:sticky lg:top-0 lg:flex lg:h-dvh">
        <Logo />
        <nav aria-label="Main" className="flex flex-col gap-1.5">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-[0.95rem] font-semibold transition-colors ${
                isActive(href)
                  ? "bg-surface-2 text-fg ring-1 ring-accent/40"
                  : "text-muted hover:text-fg"
              }`}
            >
              <Icon size={19} strokeWidth={2} aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
        <div
          className="mt-auto rounded-[22px] border border-line p-5"
          style={{ background: "linear-gradient(160deg, rgba(61,235,160,0.14), var(--surface) 60%)" }}
        >
          <p className="font-display text-lg font-semibold">
            FluxPay <span className="text-amber">Plus</span>
          </p>
          <p className="mt-1 text-sm text-muted">Higher limits and early access to new features.</p>
          <button
            type="button"
            disabled
            className="btn-ghost mt-4 h-10 w-full text-sm disabled:opacity-50"
          >
            Coming soon
          </button>
        </div>
        <p className="text-xs leading-relaxed text-muted">
          Demo app. All balances, billers and transactions are mock data, and
          no real payment is made.
        </p>
      </aside>

      <div className="min-w-0 flex-1 pb-28 lg:pb-0">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between px-5 pt-6 lg:hidden">
          <Logo />
          <span
            aria-label="Ada Okafor"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-ink"
          >
            AO
          </span>
        </header>

        {children}

        {/* Mobile bottom nav */}
        <nav
          aria-label="Main"
          className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-bg/95 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden"
        >
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={`flex flex-col items-center gap-1 text-[0.7rem] font-semibold ${
                isActive(href) ? "text-accent" : "text-muted"
              }`}
            >
              <Icon size={20} strokeWidth={2} aria-hidden="true" />
              {label === "Saved billers" ? "Billers" : label === "Pay a bill" ? "Pay" : label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
