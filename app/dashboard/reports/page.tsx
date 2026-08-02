"use client";
import { FileText } from "lucide-react";
import { ComingSoon } from "@/components/dashboard/ComingSoon";
export default function ReportsPage() {
  return <ComingSoon title="Relatórios" description="Relatórios detalhados sobre suas finanças." icon={<FileText size={24} strokeWidth={1.8} />} />;
}
