import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SERVICES } from "@/lib/mock";
import { ServiceBadge } from "@/components/ui";

export const metadata: Metadata = { title: "Pay a bill" };

export default function PayPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-8 px-5 pt-6 md:px-8 lg:px-10 lg:pt-10">
      <div>
        <h1 className="font-display text-4xl font-semibold tracking-tight">Pay a bill</h1>
        <p className="mt-2 text-muted">Choose what you want to pay for.</p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {SERVICES.map((s) => (
          <li key={s.slug}>
            <Link
              href={`/pay/${s.slug}`}
              className="card group flex h-full items-center gap-5 p-6 transition-colors hover:border-accent/40"
            >
              <ServiceBadge service={s.slug} size="lg" />
              <span className="flex-1">
                <span className="block text-lg font-semibold">{s.name}</span>
                <span className="block text-sm text-muted">{s.blurb}</span>
              </span>
              <ArrowRight size={20} aria-hidden="true" className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
