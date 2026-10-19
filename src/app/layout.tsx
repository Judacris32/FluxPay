import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/manrope";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { StoreHydrator } from "@/components/store-hydrator";

export const metadata: Metadata = {
  title: {
    default: "FluxPay — Bills and airtime, one tap",
    template: "%s · FluxPay",
  },
  description:
    "Pay electricity, buy data, renew cable TV and top up airtime in a few taps. A portfolio demo built with Next.js, with mock data only.",
};

export const viewport: Viewport = {
  themeColor: "#04100c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="font-sans">
      <body>
        <StoreHydrator />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
