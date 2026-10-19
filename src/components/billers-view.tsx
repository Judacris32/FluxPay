"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Trash2 } from "lucide-react";
import { useFluxStore } from "@/lib/store";
import { digitsOnly } from "@/lib/format";
import {
  SERVICES,
  getProvider,
  getService,
  providersFor,
  type ServiceSlug,
} from "@/lib/mock";
import { ServiceBadge } from "@/components/ui";

export function BillersView() {
  const billers = useFluxStore((s) => s.billers);
  const addBiller = useFluxStore((s) => s.addBiller);
  const removeBiller = useFluxStore((s) => s.removeBiller);

  const [nickname, setNickname] = useState("");
  const [service, setService] = useState<ServiceSlug>("electricity");
  const [providerId, setProviderId] = useState(providersFor("electricity")[0].id);
  const [account, setAccount] = useState("");

  const info = getService(service)!;
  const providers = providersFor(service);
  const valid = nickname.trim().length > 0 && providerId && account.length === info.accountLength;

  const changeService = (next: ServiceSlug) => {
    setService(next);
    setProviderId(providersFor(next)[0].id);
    setAccount("");
  };

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-8 px-5 pt-6 md:px-8 lg:px-10 lg:pt-10">
      <div>
        <h1 className="font-display text-4xl font-semibold tracking-tight">Saved billers</h1>
        <p className="mt-2 text-muted">Keep your meters, lines and smart cards ready to pay.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <ul className="flex flex-col gap-3">
          {billers.length === 0 && <li className="card-2 p-6 text-muted">No saved billers yet.</li>}
          {billers.map((b) => {
            const provider = getProvider(b.providerId);
            return (
              <li key={b.id} className="card-2 flex items-center gap-4 p-4">
                <ServiceBadge service={b.service} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{b.nickname}</p>
                  <p className="truncate text-sm text-muted tabular-nums">
                    {b.account} · {provider?.name}
                  </p>
                </div>
                <Link
                  href={`/pay/${b.service}?provider=${b.providerId}&account=${b.account.replace(/\s/g, "")}`}
                  className="btn-ghost h-10 px-4"
                >
                  Pay <ArrowRight size={15} aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={() => removeBiller(b.id)}
                  aria-label={`Remove ${b.nickname}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:text-danger"
                >
                  <Trash2 size={17} />
                </button>
              </li>
            );
          })}
        </ul>

        <form
          className="card flex flex-col gap-5 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            addBiller({ nickname: nickname.trim(), service, providerId, account });
            setNickname("");
            setAccount("");
          }}
        >
          <h2 className="font-display text-xl font-semibold">Add a biller</h2>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-muted">Nickname</span>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Mum's flat"
              maxLength={24}
              className="field"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-muted">Service</span>
            <select
              value={service}
              onChange={(e) => changeService(e.target.value as ServiceSlug)}
              className="field appearance-none"
            >
              {SERVICES.map((s) => (
                <option key={s.slug} value={s.slug}>{s.name}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-muted">Provider</span>
            <select value={providerId} onChange={(e) => setProviderId(e.target.value)} className="field appearance-none">
              {providers.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-muted">{info.accountLabel}</span>
            <input
              value={account}
              onChange={(e) => setAccount(digitsOnly(e.target.value).slice(0, info.accountLength))}
              inputMode="numeric"
              placeholder={"0".repeat(info.accountLength)}
              className="field tabular-nums"
            />
          </label>

          <button type="submit" disabled={!valid} className="btn-primary w-full">
            Save biller
          </button>
        </form>
      </div>
    </div>
  );
}
