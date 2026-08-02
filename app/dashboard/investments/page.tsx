"use client";
import { LineChart } from "lucide-react";
import { ComingSoon } from "@/components/dashboard/ComingSoon";
export default function InvestmentsPage() {
  return <ComingSoon title="Investimentos" description="Acompanhe sua carteira de investimentos." icon={<LineChart size={24} strokeWidth={1.8} />} />;
}
