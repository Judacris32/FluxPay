"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  NAIRA_PER_KWH,
  SEED_BILLERS,
  SEED_TRANSACTIONS,
  STARTING_BALANCE,
  getService,
  type SavedBiller,
  type ServiceSlug,
  type Transaction,
} from "@/lib/mock";

export interface PayInput {
  service: ServiceSlug;
  providerId: string;
  providerName: string;
  account: string;
  amount: number;
  title: string;
}

interface FluxState {
  ready: boolean;
  balance: number;
  transactions: Transaction[];
  billers: SavedBiller[];
  pay: (input: PayInput) => { ok: true; tx: Transaction } | { ok: false; error: string };
  fund: (amount: number) => void;
  addBiller: (biller: Omit<SavedBiller, "id">) => void;
  removeBiller: (id: string) => void;
}

const randomDigits = (length: number) =>
  Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");

const makeRef = () => {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `FLX-${yy}${mm}${dd}-${randomDigits(4)}`;
};

// Mock token: 16 digits. Units are derived from the amount paid, net of the fee.
const makeToken = () => randomDigits(16);

export const useFluxStore = create<FluxState>()(
  persist(
    (set, get) => ({
      ready: false,
      balance: STARTING_BALANCE,
      transactions: SEED_TRANSACTIONS,
      billers: SEED_BILLERS,

      pay: (input) => {
        const service = getService(input.service);
        const fee = service?.fee ?? 0;
        const total = input.amount + fee;
        const { balance, transactions } = get();

        if (total > balance) {
          return {
            ok: false,
            error: "Your wallet balance is too low for this payment. Fund your wallet and try again.",
          };
        }

        const isElectricity = input.service === "electricity";
        const tx: Transaction = {
          ref: makeRef(),
          service: input.service,
          providerId: input.providerId,
          account: input.account,
          title: input.title,
          amount: input.amount,
          fee,
          status: "successful",
          createdAt: new Date().toISOString(),
          ...(isElectricity
            ? {
                token: makeToken(),
                units: `${((input.amount - fee) / NAIRA_PER_KWH).toFixed(1)} kWh`,
              }
            : {}),
        };

        set({
          balance: balance - total,
          transactions: [tx, ...transactions],
        });
        return { ok: true, tx };
      },

      fund: (amount) => set((s) => ({ balance: s.balance + amount })),

      addBiller: (biller) =>
        set((s) => ({
          billers: [{ ...biller, id: `b-${Date.now()}` }, ...s.billers],
        })),

      removeBiller: (id) =>
        set((s) => ({ billers: s.billers.filter((b) => b.id !== id) })),
    }),
    {
      name: "fluxpay-state",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        balance: s.balance,
        transactions: s.transactions,
        billers: s.billers,
      }),
      onRehydrateStorage: () => () => {
        useFluxStore.setState({ ready: true });
      },
    },
  ),
);
