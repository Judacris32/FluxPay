"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2, ShieldCheck } from "lucide-react";
import { useFluxStore } from "@/lib/store";
import { formatNaira, digitsOnly } from "@/lib/format";
import {
  AIRTIME_AMOUNTS,
  CABLE_PLANS,
  DATA_PLANS,
  ELECTRICITY_AMOUNTS,
  LIMITS,
  getProvider,
  getService,
  providersFor,
  type Plan,
  type ServiceSlug,
} from "@/lib/mock";
import { ServiceBadge } from "@/components/ui";

const STEPS = ["Details", "Amount", "Review"] as const;

interface PayFlowProps {
  service: ServiceSlug;
}

export function PayFlow({ service: slug }: PayFlowProps) {
  const router = useRouter();
  const params = useSearchParams();
  const service = getService(slug)!;
  const providers = providersFor(slug);
  const balance = useFluxStore((s) => s.balance);
  const billers = useFluxStore((s) => s.billers);
  const pay = useFluxStore((s) => s.pay);
  const addBiller = useFluxStore((s) => s.addBiller);

  // Prefill from a saved biller link: /pay/electricity?provider=metro&account=...
  const prefillProvider = params.get("provider");
  const prefillAccount = digitsOnly(params.get("account") ?? "");

  const [step, setStep] = useState(0);
  const [providerId, setProviderId] = useState(
    providers.some((p) => p.id === prefillProvider) ? prefillProvider! : providers[0]?.id ?? "",
  );
  const [account, setAccount] = useState(prefillAccount.slice(0, service.accountLength));
  const [amountStr, setAmountStr] = useState("");
  const [planId, setPlanId] = useState<string | null>(null);
  const [saveBiller, setSaveBiller] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const provider = getProvider(providerId);
  const plans: Plan[] =
    slug === "data" ? DATA_PLANS : slug === "cable" ? CABLE_PLANS[providerId] ?? [] : [];
  const plan = plans.find((p) => p.id === planId) ?? null;

  const { amount, title, amountValid } = useMemo(() => {
    if (plan) {
      const name = slug === "data" ? `${plan.name} · ${plan.detail}` : `${plan.name} package · monthly`;
      return { amount: plan.amount, title: name, amountValid: true };
    }
    const value = Number(amountStr);
    const limits = slug === "electricity" || slug === "airtime" ? LIMITS[slug] : null;
    const valid = !!limits && Number.isFinite(value) && value >= limits.min && value <= limits.max;
    return {
      amount: valid ? value : 0,
      title: slug === "electricity" ? "Prepaid electricity" : "Airtime top-up",
      amountValid: valid,
    };
  }, [plan, amountStr, slug]);

  const fee = service.fee;
  const total = amount + fee;
  const detailsValid = !!provider && account.length === service.accountLength;
  const insufficient = total > balance;
  const alreadySaved = billers.some(
    (b) => b.service === slug && b.account.replace(/\s/g, "") === account && b.providerId === providerId,
  );

  const canContinue = step === 0 ? detailsValid : step === 1 ? amountValid : true;

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => (step === 0 ? router.back() : setStep((s) => s - 1));

  const submit = async () => {
    if (!provider || submitting) return;
    setError(null);
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1400));
    const result = pay({
      service: slug,
      providerId: provider.id,
      providerName: provider.name,
      account,
      amount,
      title,
    });
    if (!result.ok) {
      setSubmitting(false);
      setError(result.error);
      return;
    }
    if (saveBiller && !alreadySaved) {
      addBiller({
        nickname: `${provider.name.split(" ")[0]} ${account.slice(-4)}`,
        service: slug,
        providerId: provider.id,
        account,
      });
    }
    router.replace(`/receipt/${result.tx.ref}`);
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 pb-8 pt-6 md:py-10">
      <header className="flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          aria-label="Go back"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-fg ring-1 ring-line transition-colors hover:ring-accent/50"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-muted" aria-live="polite">
          Step {step + 1} of {STEPS.length}
        </span>
      </header>

      {/* Progress */}
      <div className="flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1} aria-label="Payment progress">
        {STEPS.map((label, i) => (
          <span
            key={label}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= step ? "bg-accent" : "bg-surface-2"}`}
          />
        ))}
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-1 flex-col gap-6"
      >
        <div className="flex items-center gap-3">
          <ServiceBadge service={slug} size="lg" />
          <div>
            <p className="text-sm text-muted">{service.name}</p>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              {step === 0 && "Who are you paying?"}
              {step === 1 && (slug === "data" || slug === "cable" ? "Choose a plan" : "How much?")}
              {step === 2 && "Review payment"}
            </h1>
          </div>
        </div>

        {step === 0 && (
          <>
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-3 text-sm font-semibold text-muted">Provider</legend>
              {providers.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={providerId === p.id}
                  onClick={() => {
                    setProviderId(p.id);
                    setPlanId(null);
                  }}
                  className={`card-2 flex items-center justify-between p-4 text-left transition-colors ${
                    providerId === p.id ? "border-accent/60 bg-accent/[0.06]" : "hover:border-line-strong"
                  }`}
                >
                  <span className="font-semibold">{p.name}</span>
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                      providerId === p.id ? "border-accent bg-accent text-accent-ink" : "border-line-strong"
                    }`}
                    aria-hidden="true"
                  >
                    {providerId === p.id && <Check size={14} strokeWidth={3} />}
                  </span>
                </button>
              ))}
            </fieldset>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-muted">{service.accountLabel}</span>
              <input
                value={account}
                onChange={(e) => setAccount(digitsOnly(e.target.value).slice(0, service.accountLength))}
                inputMode="numeric"
                autoComplete="off"
                placeholder={"0".repeat(service.accountLength)}
                aria-describedby="account-hint"
                className="field font-semibold tabular-nums tracking-wide"
              />
              <span id="account-hint" className="text-xs text-muted">
                {service.accountHint} {account.length}/{service.accountLength}
              </span>
            </label>
          </>
        )}

        {step === 1 && (
          <>
            {(slug === "electricity" || slug === "airtime") && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {(slug === "electricity" ? ELECTRICITY_AMOUNTS : AIRTIME_AMOUNTS).map((a) => (
                    <button
                      key={a}
                      type="button"
                      aria-pressed={amountStr === String(a)}
                      onClick={() => setAmountStr(String(a))}
                      className={`card-2 h-14 font-semibold tabular-nums transition-colors ${
                        amountStr === String(a) ? "border-accent/60 bg-accent/[0.08] text-accent" : "hover:border-line-strong"
                      }`}
                    >
                      {formatNaira(a)}
                    </button>
                  ))}
                </div>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-muted">Or enter an amount</span>
                  <span className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-muted" aria-hidden="true">₦</span>
                    <input
                      value={amountStr}
                      onChange={(e) => setAmountStr(digitsOnly(e.target.value))}
                      inputMode="numeric"
                      placeholder="0"
                      aria-describedby="amount-hint"
                      className="field pl-9 font-semibold tabular-nums"
                    />
                  </span>
                  <span id="amount-hint" className="text-xs text-muted">
                    Between {formatNaira(LIMITS[slug].min)} and {formatNaira(LIMITS[slug].max)}.
                  </span>
                </label>
              </>
            )}

            {(slug === "data" || slug === "cable") && (
              <fieldset className="flex flex-col gap-3">
                <legend className="sr-only">Plans</legend>
                {plans.length === 0 && (
                  <p className="text-sm text-muted">No plans for this provider yet.</p>
                )}
                {plans.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={planId === p.id}
                    onClick={() => setPlanId(p.id)}
                    className={`card-2 flex items-center justify-between gap-4 p-4 text-left transition-colors ${
                      planId === p.id ? "border-accent/60 bg-accent/[0.06]" : "hover:border-line-strong"
                    }`}
                  >
                    <span>
                      <span className="block font-semibold">{p.name}</span>
                      <span className="text-sm text-muted">{p.detail}</span>
                    </span>
                    <span className="font-semibold tabular-nums">{formatNaira(p.amount)}</span>
                  </button>
                ))}
              </fieldset>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <div className="card flex flex-col gap-4 p-6">
              <Row label="Provider" value={provider?.name ?? ""} />
              <Row label={service.accountLabel} value={account} />
              <Row label="Item" value={title} />
              <Row label="Amount" value={formatNaira(amount)} />
              <Row label="Service fee" value={fee ? formatNaira(fee) : "Free"} />
              <div className="h-px bg-line" />
              <div className="flex items-baseline justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-display text-3xl font-semibold tabular-nums">{formatNaira(total)}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-amber/40 bg-amber/10 p-4 text-sm leading-relaxed">
              <span className="font-semibold text-amber">Demo payment.</span>{" "}
              <span>
                {slug === "electricity"
                  ? "Your token appears on the receipt straight after payment."
                  : "Nothing is sent to a real network. Your mock wallet is debited."}
              </span>
            </div>

            <label className="flex items-center justify-between gap-4 card-2 p-4">
              <span>
                <span className="block font-semibold">Save this biller</span>
                <span className="text-sm text-muted">
                  {alreadySaved ? "Already in your saved billers" : "Pay faster next time"}
                </span>
              </span>
              <input
                type="checkbox"
                checked={saveBiller && !alreadySaved}
                disabled={alreadySaved}
                onChange={(e) => setSaveBiller(e.target.checked)}
                className="h-5 w-5 accent-[var(--accent)]"
              />
            </label>

            <div className="flex items-center justify-between text-sm text-muted">
              <span className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-accent" aria-hidden="true" /> Paying from wallet
              </span>
              <span className="font-semibold text-fg tabular-nums">{formatNaira(balance)}</span>
            </div>

            {(insufficient || error) && (
              <p role="alert" className="text-sm text-danger">
                {error ?? "Your wallet balance is too low for this payment. Add money and try again."}
              </p>
            )}
          </>
        )}
      </motion.div>

      <footer className="sticky bottom-0 -mx-5 bg-[rgba(4,16,12,0.94)] px-5 pb-2 pt-4 md:static md:mx-0 md:bg-transparent md:p-0">
        {step < 2 ? (
          <button type="button" onClick={next} disabled={!canContinue} className="btn-primary w-full">
            Continue <ArrowRight size={18} aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={submitting || insufficient || !amountValid}
            className="btn-primary w-full"
            aria-live="polite"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden="true" /> Processing…
              </>
            ) : (
              <>Pay {formatNaira(total)} <ArrowRight size={18} aria-hidden="true" /></>
            )}
          </button>
        )}
      </footer>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-[0.95rem]">
      <span className="text-muted">{label}</span>
      <span className="text-right font-semibold tabular-nums">{value}</span>
    </div>
  );
}
