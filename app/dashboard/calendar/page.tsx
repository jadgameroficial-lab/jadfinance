"use client";
import { CalendarDays } from "lucide-react";
import { ComingSoon } from "@/components/dashboard/ComingSoon";
export default function CalendarPage() {
  return <ComingSoon title="Calendário" description="Visualize seus compromissos financeiros no tempo." icon={<CalendarDays size={24} strokeWidth={1.8} />} />;
}
