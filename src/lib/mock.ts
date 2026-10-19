// All data in FluxPay is mock data. Providers are fictional so the demo
// does not imply any real utility, network or broadcaster.

export type ServiceSlug = "electricity" | "data" | "cable" | "airtime";
export type TxStatus = "successful" | "pending" | "failed";

export interface ServiceInfo {
  slug: ServiceSlug;
  name: string;
  shortName: string;
  blurb: string;
  accountLabel: string;
  accountHint: string;
  accountLength: number;
  fee: number;
}

export const SERVICES: ServiceInfo[] = [
  {
    slug: "electricity",
    name: "Electricity",
    shortName: "Electricity",
    blurb: "Pay your power bill and get your token straight away.",
    accountLabel: "Meter number",
    accountHint: "The 11-digit number printed on your meter.",
    accountLength: 11,
    fee: 50,
  },
  {
    slug: "data",
    name: "Mobile data",
    shortName: "Data",
    blurb: "Buy data bundles for any network.",
    accountLabel: "Phone number",
    accountHint: "The line that will receive the bundle.",
    accountLength: 11,
    fee: 0,
  },
  {
    slug: "cable",
    name: "Cable TV",
    shortName: "Cable TV",
    blurb: "Renew or upgrade your TV subscription.",
    accountLabel: "Smart card number",
    accountHint: "The 10-digit smart card or IUC number.",
    accountLength: 10,
    fee: 50,
  },
  {
    slug: "airtime",
    name: "Airtime",
    shortName: "Airtime",
    blurb: "Top up any line, on any network.",
    accountLabel: "Phone number",
    accountHint: "The line that will receive the airtime.",
    accountLength: 11,
    fee: 0,
  },
];

export const getService = (slug: string) =>
  SERVICES.find((s) => s.slug === slug);

export interface Provider {
  id: string;
  name: string;
  services: ServiceSlug[];
}

export const PROVIDERS: Provider[] = [
  { id: "metro", name: "Metro Power Lagos", services: ["electricity"] },
  { id: "harbor", name: "Harbor Power Abuja", services: ["electricity"] },
  { id: "delta", name: "Delta Grid", services: ["electricity"] },
  { id: "netlink", name: "NetLink", services: ["data", "airtime"] },
  { id: "swiftcell", name: "Swiftcell", services: ["data", "airtime"] },
  { id: "orbit", name: "Orbit Mobile", services: ["data", "airtime"] },
  { id: "starview", name: "StarView Cable", services: ["cable"] },
  { id: "clearline", name: "Clearline TV", services: ["cable"] },
];

export const providersFor = (service: ServiceSlug) =>
  PROVIDERS.filter((p) => p.services.includes(service));

export const getProvider = (id: string) => PROVIDERS.find((p) => p.id === id);

export interface Plan {
  id: string;
  name: string;
  amount: number;
  detail: string;
}

// Data bundles are shared across the mobile networks.
export const DATA_PLANS: Plan[] = [
  { id: "d1", name: "1 GB", detail: "7 days", amount: 500 },
  { id: "d2", name: "5 GB", detail: "30 days", amount: 2000 },
  { id: "d3", name: "10 GB", detail: "30 days", amount: 3500 },
  { id: "d4", name: "20 GB", detail: "30 days", amount: 5000 },
];

export const CABLE_PLANS: Record<string, Plan[]> = {
  starview: [
    { id: "sv-basic", name: "Basic", amount: 4500, detail: "Monthly" },
    { id: "sv-plus", name: "Plus", amount: 12000, detail: "Monthly" },
    { id: "sv-premium", name: "Premium", amount: 24000, detail: "Monthly" },
  ],
  clearline: [
    { id: "cl-lite", name: "Lite", amount: 3000, detail: "Monthly" },
    { id: "cl-max", name: "Max", amount: 9500, detail: "Monthly" },
  ],
};

export const AIRTIME_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];
export const ELECTRICITY_AMOUNTS = [2000, 5000, 10000, 20000];

export const LIMITS = {
  electricity: { min: 500, max: 100000 },
  airtime: { min: 50, max: 50000 },
} as const;

export const NAIRA_PER_KWH = 182.5;
export const STARTING_BALANCE = 84500;

export interface Transaction {
  ref: string;
  service: ServiceSlug;
  providerId: string;
  account: string;
  title: string;
  amount: number;
  fee: number;
  status: TxStatus;
  createdAt: string;
  token?: string;
  units?: string;
}

export interface SavedBiller {
  id: string;
  nickname: string;
  service: ServiceSlug;
  providerId: string;
  account: string;
}

export const SEED_TRANSACTIONS: Transaction[] = [
  {
    ref: "FLX-241013-4471",
    service: "electricity",
    providerId: "metro",
    account: "0123 4567 8901",
    title: "Prepaid electricity",
    amount: 5000,
    fee: 50,
    status: "successful",
    createdAt: "2026-10-13T11:42:00+01:00",
    token: "4421880329176650",
    units: "27.4 kWh",
  },
  {
    ref: "FLX-241009-1188",
    service: "cable",
    providerId: "starview",
    account: "0012 3456 7890",
    title: "StarView Plus, monthly",
    amount: 12000,
    fee: 50,
    status: "successful",
    createdAt: "2026-10-09T15:20:00+01:00",
  },
  {
    ref: "FLX-241007-0930",
    service: "airtime",
    providerId: "netlink",
    account: "0803 555 0142",
    title: "Airtime top-up",
    amount: 2000,
    fee: 0,
    status: "pending",
    createdAt: "2026-10-07T09:18:00+01:00",
  },
  {
    ref: "FLX-241005-7712",
    service: "data",
    providerId: "swiftcell",
    account: "0803 555 0142",
    title: "5 GB, 30 days",
    amount: 2000,
    fee: 0,
    status: "successful",
    createdAt: "2026-10-05T18:50:00+01:00",
  },
  {
    ref: "FLX-241002-3309",
    service: "electricity",
    providerId: "harbor",
    account: "1029 3847 560",
    title: "Prepaid electricity",
    amount: 8200,
    fee: 50,
    status: "successful",
    createdAt: "2026-10-02T13:15:00+01:00",
    token: "1190 4422 7805 3361",
    units: "44.7 kWh",
  },
  {
    ref: "FLX-240928-2054",
    service: "airtime",
    providerId: "orbit",
    account: "0803 555 0142",
    title: "Airtime top-up",
    amount: 1000,
    fee: 0,
    status: "failed",
    createdAt: "2026-09-28T08:05:00+01:00",
  },
];

export const SEED_BILLERS: SavedBiller[] = [
  {
    id: "b1",
    nickname: "Home meter",
    service: "electricity",
    providerId: "metro",
    account: "0123 4567 8901",
  },
  {
    id: "b2",
    nickname: "Office line",
    service: "airtime",
    providerId: "netlink",
    account: "0803 555 0142",
  },
  {
    id: "b3",
    nickname: "Living room TV",
    service: "cable",
    providerId: "starview",
    account: "0012 3456 7890",
  },
];

// Spending overview for the dashboard chart (₦, last six months).
export const MONTHLY_SPEND = [
  { month: "May", amount: 61200 },
  { month: "Jun", amount: 73500 },
  { month: "Jul", amount: 58900 },
  { month: "Aug", amount: 66300 },
  { month: "Sep", amount: 71800 },
  { month: "Oct", amount: 102400 },
];

export const SPEND_SPLIT: { label: string; share: number; color: string }[] = [
  { label: "Electricity", share: 38, color: "#3DEBA0" },
  { label: "Cable TV", share: 26, color: "#5B8CFF" },
  { label: "Data", share: 22, color: "#A78BFA" },
  { label: "Airtime", share: 14, color: "#FFB020" },
];
