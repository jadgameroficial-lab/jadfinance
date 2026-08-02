"use client";
import { Repeat } from "lucide-react";
import { ComingSoon } from "@/components/dashboard/ComingSoon";
export default function SubscriptionsPage() {
  return <ComingSoon title="Assinaturas" description="Controle suas assinaturas recorrentes." icon={<Repeat size={24} strokeWidth={1.8} />} />;
}
