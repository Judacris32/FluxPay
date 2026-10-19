"use client";

import { useState } from "react";
import { useFluxStore } from "@/lib/store";
import { formatNaira } from "@/lib/format";
import type { TxStatus } from "@/lib/mock";
import { TxRow } from "@/components/tx-row";

const FILTERS: { value: "all" | TxStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "successful", label: "Successful" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

export function HistoryView() {
  const transactions = useFluxStore((s) => s.transactions);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["value"]>("all");

  const list = transactions.filter((t) => filter === "all" || t.status === filter);
  const spent = transactions
    .filter((t) => t.status === "successful")
    .reduce((sum, t) => sum + t.amount + t.fee, 0);

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-8 px-5 pt-6 md:px-8 lg:px-10 lg:pt-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">History</h1>
          <p className="mt-2 text-muted">Every payment you have made, with its receipt.</p>
        </div>
        <div className="card-2 px-5 py-3">
          <p className="text-xs text-muted">Total paid, successful</p>
          <p className="font-display text-2xl font-semibold tabular-nums">{formatNaira(spent)}</p>
        </div>
      </div>

      <div role="group" aria-label="Filter by status" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={`h-10 flex-shrink-0 rounded-full px-5 text-sm font-semibold transition-colors ${
              filter === f.value ? "bg-accent text-accent-ink" : "bg-surface-2 text-muted hover:text-fg"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="card divide-y divide-line overflow-hidden">
        {list.length === 0 && <p className="p-8 text-center text-muted">No payments here yet.</p>}
        {list.map((tx) => (
          <TxRow key={tx.ref} tx={tx} />
        ))}
      </div>
    </div>
  );
}
