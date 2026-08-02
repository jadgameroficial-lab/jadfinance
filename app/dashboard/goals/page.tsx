"use client";
import { Target } from "lucide-react";
import { ComingSoon } from "@/components/dashboard/ComingSoon";
export default function GoalsPage() {
  return <ComingSoon title="Metas" description="Defina e acompanhe suas metas financeiras." icon={<Target size={24} strokeWidth={1.8} />} />;
}
