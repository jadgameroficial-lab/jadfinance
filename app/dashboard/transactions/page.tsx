"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TransactionsTable } from "@/components/dashboard/TransactionsTable";

function TransactionsPageInner() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const typeFilter = typeParam === "income" || typeParam === "expense" ? typeParam : undefined;

  const title = typeFilter === "income" ? "Receitas" : typeFilter === "expense" ? "Despesas" : "Transações";

  const searchParam = searchParams.get("search") ?? undefined;

  return (
    <>
      <div className="dash-page-head dash-reveal">
        <div>
          <h1>{title}</h1>
          <p>Todas as suas transações, direto do banco de dados.</p>
        </div>
      </div>

      <TransactionsTable title={title} typeFilter={typeFilter} initialSearch={searchParam} />
    </>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={null}>
      <TransactionsPageInner />
    </Suspense>
  );
}
