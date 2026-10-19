import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatDay, formatNaira, formatTime } from "@/lib/format";
import { getProvider, getService, type Transaction } from "@/lib/mock";
import { ServiceBadge, StatusPill } from "@/components/ui";

export function TxRow({ tx }: { tx: Transaction }) {
  const service = getService(tx.service);
  const provider = getProvider(tx.providerId);
  return (
    <Link
      href={`/receipt/${tx.ref}`}
      className="group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-4 transition-colors hover:bg-surface-2 md:px-5 lg:grid-cols-[minmax(0,2.4fr)_1fr_1.3fr_1fr_20px] lg:gap-6"
    >
      <div className="flex min-w-0 items-center gap-3">
        <ServiceBadge service={tx.service} />
        <div className="min-w-0">
          <p className="truncate font-semibold">{provider?.name ?? tx.providerId}</p>
          <p className="truncate text-sm text-muted">
            {service?.shortName} · {tx.title}
          </p>
        </div>
      </div>

      <p className="text-right font-semibold tabular-nums lg:text-left lg:font-medium">
        {formatNaira(tx.amount)}
      </p>

      <p className="hidden whitespace-nowrap text-sm text-muted lg:block">
        {formatDay(tx.createdAt)}, {formatTime(tx.createdAt)}
      </p>

      <div className="hidden lg:block">
        <StatusPill status={tx.status} />
      </div>

      <div className="col-start-2 row-start-2 flex items-center justify-end gap-3 text-sm text-muted lg:col-auto lg:row-auto">
        <span className="lg:hidden">
          <StatusPill status={tx.status} />
        </span>
        <ChevronRight
          size={18}
          aria-hidden="true"
          className="transition-transform group-hover:translate-x-0.5"
        />
      </div>
      <span className="sr-only">View receipt {tx.ref}</span>
    </Link>
  );
}
