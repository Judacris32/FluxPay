import Link from "next/link";
import {
  Activity,
  Cable,
  Check,
  Clock,
  Smartphone,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { ServiceSlug, TxStatus } from "@/lib/mock";

export const SERVICE_ICON: Record<ServiceSlug, LucideIcon> = {
  electricity: Zap,
  data: Wifi,
  cable: Cable,
  airtime: Smartphone,
};

export const SERVICE_TONE: Record<ServiceSlug, string> = {
  electricity: "#FFB020",
  data: "#3DEBA0",
  cable: "#5B8CFF",
  airtime: "#A78BFA",
};

export function ServiceBadge({
  service,
  size = "md",
}: {
  service: ServiceSlug;
  size?: "sm" | "md" | "lg";
}) {
  const Icon = SERVICE_ICON[service];
  const box = size === "lg" ? "h-12 w-12 rounded-2xl" : size === "md" ? "h-10 w-10 rounded-xl" : "h-9 w-9 rounded-xl";
  const icon = size === "lg" ? 22 : 18;
  return (
    <span
      className={`${box} inline-flex flex-shrink-0 items-center justify-center`}
      style={{
        background: `color-mix(in srgb, ${SERVICE_TONE[service]} 16%, transparent)`,
        color: SERVICE_TONE[service],
      }}
      aria-hidden="true"
    >
      <Icon size={icon} strokeWidth={2.2} />
    </span>
  );
}

const STATUS: Record<TxStatus, { label: string; cls: string; icon: LucideIcon }> = {
  successful: { label: "Successful", cls: "text-accent bg-accent/10", icon: Check },
  pending: { label: "Pending", cls: "text-amber bg-amber/10", icon: Clock },
  failed: { label: "Failed", cls: "text-danger bg-danger/10", icon: Activity },
};

export function StatusPill({ status }: { status: TxStatus }) {
  const s = STATUS[status];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}>
      <Icon size={13} strokeWidth={2.6} aria-hidden="true" />
      {s.label}
    </span>
  );
}

export function SectionTitle({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="eyebrow">{children}</h2>
      {action && (
        <Link
          href={action.href}
          className="text-sm font-semibold text-accent hover:underline underline-offset-4"
        >
          {action.label} →
        </Link>
      )}
    </div>
  );
}
