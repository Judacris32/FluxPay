const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export const formatNaira = (value: number) => naira.format(value);

const LAGOS = "Africa/Lagos";

const dayKey = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: LAGOS }).format(date);

// "Today", "Yesterday", or "9 Oct"
export function formatDay(iso: string, now: Date = new Date()) {
  const date = new Date(iso);
  const key = dayKey(date);
  if (key === dayKey(now)) return "Today";
  const yesterday = new Date(now.getTime() - 86_400_000);
  if (key === dayKey(yesterday)) return "Yesterday";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: LAGOS,
    day: "numeric",
    month: "short",
  }).format(date);
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: LAGOS,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export function formatFullDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: LAGOS,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

// Groups digits in blocks of four: 4421880329176650 -> "4421 8803 2917 6650"
export const groupDigits = (value: string) =>
  value.replace(/\s+/g, "").replace(/(.{4})(?=.)/g, "$1 ");

export const digitsOnly = (value: string) => value.replace(/\D/g, "");
