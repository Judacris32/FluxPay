import type { Metadata } from "next";
import { BillersView } from "@/components/billers-view";

export const metadata: Metadata = { title: "Saved billers" };

export default function BillersPage() {
  return <BillersView />;
}
