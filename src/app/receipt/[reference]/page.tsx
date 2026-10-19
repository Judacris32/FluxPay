import type { Metadata } from "next";
import { ReceiptView } from "@/components/receipt-view";

export const metadata: Metadata = { title: "Receipt" };

export default function ReceiptPage({ params }: { params: { reference: string } }) {
  return <ReceiptView reference={decodeURIComponent(params.reference)} />;
}
