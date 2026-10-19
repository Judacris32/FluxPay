import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PayFlow } from "@/components/pay-flow";
import { SERVICES, getService } from "@/lib/mock";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ service: s.slug }));
}

export function generateMetadata({ params }: { params: { service: string } }): Metadata {
  const service = getService(params.service);
  return { title: service ? `Pay for ${service.name}` : "Pay" };
}

export default function PayServicePage({ params }: { params: { service: string } }) {
  const service = getService(params.service);
  if (!service) notFound();
  return (
    <Suspense fallback={null}>
      <PayFlow service={service.slug} />
    </Suspense>
  );
}
