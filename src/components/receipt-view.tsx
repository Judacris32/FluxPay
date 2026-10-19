"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Clock, Copy, Share2, X } from "lucide-react";
import { useFluxStore } from "@/lib/store";
import { formatFullDate, formatNaira, groupDigits } from "@/lib/format";
import { getProvider, getService } from "@/lib/mock";
import { StatusPill } from "@/components/ui";

export function ReceiptView({ reference }: { reference: string }) {
  const ready = useFluxStore((s) => s.ready);
  const tx = useFluxStore((s) => s.transactions.find((t) => t.ref === reference));
  const [copied, setCopied] = useState<"token" | "receipt" | null>(null);

  if (!ready) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 py-10">
        <div className="skeleton h-16 w-16 rounded-full" />
        <div className="skeleton h-10 w-3/4" />
        <div className="skeleton h-40 w-full" />
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-5 px-5 text-center">
        <h1 className="font-display text-3xl font-semibold">Receipt not found</h1>
        <p className="text-muted">This receipt isn&apos;t in your history on this device.</p>
        <Link href="/" className="btn-primary px-8">Back to home</Link>
      </div>
    );
  }

  const provider = getProvider(tx.providerId);
  const service = getService(tx.service);
  const total = tx.amount + tx.fee;
  const headline =
    tx.status === "successful" ? "Payment successful" : tx.status === "pending" ? "Payment pending" : "Payment failed";

  const copy = async (text: string, which: "token" | "receipt") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      setCopied(null);
    }
  };

  const summary = `FluxPay receipt ${tx.ref}\n${provider?.name ?? ""} · ${tx.title}\nAccount ${tx.account}\nTotal ${formatNaira(total)}\nStatus ${tx.status}`;

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: `FluxPay receipt ${tx.ref}`, text: summary });
        return;
      }
    } catch {
      return; // user cancelled the share sheet
    }
    copy(summary, "receipt");
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 pb-8 pt-10 md:py-12">
      <header className="flex flex-col items-center gap-4 text-center">
        <motion.span
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className={`flex h-16 w-16 items-center justify-center rounded-full ${
            tx.status === "successful" ? "bg-accent text-accent-ink" : tx.status === "pending" ? "bg-amber text-accent-ink" : "bg-danger text-accent-ink"
          }`}
          aria-hidden="true"
        >
          {tx.status === "successful" ? <Check size={30} strokeWidth={3} /> : tx.status === "pending" ? <Clock size={28} strokeWidth={2.6} /> : <X size={28} strokeWidth={3} />}
        </motion.span>
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">{headline}</h1>
          <p className="mt-2 text-muted">
            <span className="font-semibold text-fg tabular-nums">{formatNaira(total)}</span> to {provider?.name}
          </p>
        </div>
      </header>

      {tx.token && (
        <section aria-labelledby="token-heading" className="card flex flex-col gap-3 overflow-hidden p-6">
          <img src="/brand/bulb.webp" alt="" aria-hidden="true" className="-mx-6 -mt-6 mb-2 h-28 w-[calc(100%+3rem)] max-w-none object-cover opacity-80" />
          <div className="flex items-center justify-between">
            <h2 id="token-heading" className="eyebrow">Your electricity token</h2>
            <button
              type="button"
              onClick={() => copy(tx.token!, "token")}
              aria-label="Copy token"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-accent"
            >
              {copied === "token" ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <p className="font-display text-[1.7rem] font-semibold tabular-nums tracking-wide">
            {groupDigits(tx.token)}
          </p>
          <p className="text-sm text-muted">
            Enter this on your meter keypad.{tx.units ? ` Units: ${tx.units}.` : ""}
          </p>
          <button
            type="button"
            onClick={() => copy(tx.token!, "token")}
            className="btn-ghost mt-1 w-full"
          >
            {copied === "token" ? "Copied" : "Copy token"}
          </button>
        </section>
      )}

      <section aria-label="Payment details" className="card px-5">
        <Detail label="Reference" value={tx.ref} />
        <Detail label={service?.accountLabel ?? "Account"} value={tx.account} />
        <Detail label="Item" value={tx.title} />
        <Detail label="Date" value={formatFullDate(tx.createdAt)} />
        <Detail label="Amount" value={formatNaira(tx.amount)} />
        <Detail label="Fee" value={tx.fee ? formatNaira(tx.fee) : "Free"} />
        <div className="flex items-center justify-between py-4">
          <span className="text-muted">Status</span>
          <StatusPill status={tx.status} />
        </div>
      </section>

      <div className="mt-auto flex flex-col gap-3 pt-2">
        <button type="button" onClick={share} className="btn-primary w-full">
          <Share2 size={18} aria-hidden="true" />
          {copied === "receipt" ? "Receipt copied" : "Share receipt"}
        </button>
        <Link href="/" className="btn-ghost w-full">
          Done
        </Link>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-4 text-[0.95rem] last:border-0">
      <span className="text-muted">{label}</span>
      <span className="text-right font-semibold tabular-nums">{value}</span>
    </div>
  );
}
