"use client";

import Link from "next/link";
import Image from "next/image";
import {
  LayoutGrid, ArrowLeftRight, TrendingUp, TrendingDown, Tag,
  Landmark, CreditCard, Target, LineChart, CalendarDays, Repeat,
  FileText, FileDown, Download, Settings, ChevronLeft,
} from "lucide-react";
import { transactionsService } from "@/services/transactions.service";
import { useToast } from "@/lib/toast";

type NavItem = {
  label: string;
  icon: React.ReactNode;
  href: string;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const SECTIONS: NavSection[] = [
  {
    label: "Visão geral",
    items: [{ label: "Dashboard", icon: <LayoutGrid size={18} strokeWidth={1.8} />, href: "/dashboard" }],
  },
  {
    label: "Financeiro",
    items: [
      { label: "Transações", icon: <ArrowLeftRight size={18} strokeWidth={1.8} />, href: "/dashboard/transactions" },
      { label: "Receitas", icon: <TrendingUp size={18} strokeWidth={1.8} />, href: "/dashboard/transactions?type=income" },
      { label: "Despesas", icon: <TrendingDown size={18} strokeWidth={1.8} />, href: "/dashboard/transactions?type=expense" },
      { label: "Categorias", icon: <Tag size={18} strokeWidth={1.8} />, href: "/dashboard/categories" },
    ],
  },
  {
    label: "Contas",
    items: [
      { label: "Contas", icon: <Landmark size={18} strokeWidth={1.8} />, href: "/dashboard/accounts" },
      { label: "Cartões", icon: <CreditCard size={18} strokeWidth={1.8} />, href: "/dashboard/cards" },
    ],
  },
  {
    label: "Planejamento",
    items: [
      { label: "Metas", icon: <Target size={18} strokeWidth={1.8} />, href: "/dashboard/goals" },
      { label: "Investimentos", icon: <LineChart size={18} strokeWidth={1.8} />, href: "/dashboard/investments" },
      { label: "Calendário", icon: <CalendarDays size={18} strokeWidth={1.8} />, href: "/dashboard/calendar" },
      { label: "Assinaturas", icon: <Repeat size={18} strokeWidth={1.8} />, href: "/dashboard/subscriptions" },
    ],
  },
  {
    label: "Outros",
    items: [
      { label: "Relatórios", icon: <FileText size={18} strokeWidth={1.8} />, href: "/dashboard/reports" },
    ],
  },
];

function isActive(pathname: string, currentSearch: string, href: string) {
  const [hrefPath, hrefQuery = ""] = href.split("?");

  if (hrefPath !== pathname) {
    if (hrefPath === "/dashboard") return false;
    return pathname.startsWith(hrefPath + "/");
  }

  // Mesma rota: itens como Transações/Receitas/Despesas compartilham o
  // mesmo pathname e só se diferenciam pelo parâmetro "type" da URL.
  const hrefType = new URLSearchParams(hrefQuery).get("type");
  const currentType = new URLSearchParams(currentSearch).get("type");
  return hrefType === currentType;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  userName,
  userInitials,
  mobileOpen,
  currentPath,
  currentSearch,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  userName: string;
  userInitials: string;
  mobileOpen: boolean;
  currentPath: string;
  currentSearch: string;
}) {
  const toast = useToast();

  async function handleExport() {
    try {
      toast.info("Preparando exportação...");
      const rows = await transactionsService.list();
      const header = ["Descrição", "Tipo", "Valor", "Data"];
      const csvLines = [
        header.join(";"),
        ...rows.map((r) =>
          [r.title, r.type, String(r.amount).replace(".", ","), r.transaction_date].join(";")
        ),
      ];
      const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jad-finance-transacoes-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${rows.length} transação(ões) exportada(s).`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao exportar transações.");
    }
  }

  async function handleExportPdf() {
    try {
      toast.info("Gerando PDF...");
      const rows = await transactionsService.list();

      const [{ default: jsPDF }, autoTableModule] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      const autoTable = autoTableModule.default;

      const INCOME = new Set(["income", "receita", "entrada"]);
      const isIncomeRow = (t: string) => INCOME.has(t.trim().toLowerCase());
      const totalIncome = rows.filter((r) => isIncomeRow(r.type)).reduce((s, r) => s + Number(r.amount), 0);
      const totalExpense = rows.filter((r) => !isIncomeRow(r.type)).reduce((s, r) => s + Number(r.amount), 0);
      const balance = totalIncome - totalExpense;
      const money = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      const doc = new jsPDF();

      try {
        const logoRes = await fetch("/logo.png");
        const blob = await logoRes.blob();
        const logoDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        doc.addImage(logoDataUrl, "PNG", 14, 12, 12, 9);
      } catch {
        // segue sem o logo caso a imagem não possa ser carregada
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(20, 20, 20);
      doc.text("JAD FINANCE", 30, 18);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(110, 110, 110);
      doc.text("Relatório de movimentações financeiras", 30, 23);

      doc.setDrawColor(225, 225, 225);
      doc.line(14, 28, 196, 28);

      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      doc.text(`Usuário: ${userName}`, 14, 36);
      doc.text(`Data da exportação: ${new Date().toLocaleDateString("pt-BR")}`, 14, 42);

      autoTable(doc, {
        startY: 50,
        head: [["Descrição", "Tipo", "Valor", "Data"]],
        body: rows.map((r) => [
          r.title,
          isIncomeRow(r.type) ? "Receita" : "Despesa",
          money(Number(r.amount)),
          new Date(`${r.transaction_date}T00:00:00`).toLocaleDateString("pt-BR"),
        ]),
        styles: { fontSize: 8, textColor: [40, 40, 40] },
        headStyles: { fillColor: [232, 196, 106], textColor: [25, 20, 5] },
        alternateRowStyles: { fillColor: [248, 248, 248] },
      });

      const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 140, 90);
      doc.text(`Total de receitas: ${money(totalIncome)}`, 14, finalY);
      doc.setTextColor(190, 60, 60);
      doc.text(`Total de despesas: ${money(totalExpense)}`, 14, finalY + 6);
      doc.setTextColor(20, 20, 20);
      doc.text(`Saldo final: ${money(balance)}`, 14, finalY + 14);

      doc.save(`jad-finance-relatorio-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("PDF gerado com sucesso.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao exportar PDF.");
    }
  }

  return (
    <aside className="dash-sidebar" style={{ position: "relative" }}>
      <button className="dash-collapse-btn" onClick={onToggleCollapse} aria-label="Recolher menu">
        <ChevronLeft size={13} strokeWidth={2.5} />
      </button>

      <div className="dash-brand">
        <div className="dash-logo">
          <Image src="/logo.png" alt="JAD Finance" width={22} height={16} style={{ position: "relative", zIndex: 1 }} />
        </div>
        <div className="dash-brand-text">
          <b>JAD FINANCE</b>
          <span>CONTROLE FINANCEIRO</span>
        </div>
      </div>

      <nav className="dash-nav">
        {SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="dash-section-label">{section.label}</div>
            {section.items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`dash-item ${isActive(currentPath, currentSearch, item.href) ? "active" : ""}`}
              >
                {item.icon}
                <span className="label">{item.label}</span>
              </Link>
            ))}
          </div>
        ))}
        <div>
          <div className="dash-section-label">Exportar</div>
          <button type="button" className="dash-item" style={{ width: "100%", cursor: "pointer" }} onClick={handleExport}>
            <Download size={18} strokeWidth={1.8} />
            <span className="label">Exportar CSV</span>
          </button>
          <button type="button" className="dash-item" style={{ width: "100%", cursor: "pointer" }} onClick={handleExportPdf}>
            <FileDown size={18} strokeWidth={1.8} />
            <span className="label">Exportar PDF</span>
          </button>
        </div>
      </nav>

      <div className="dash-sb-footer">
        <Link href="/dashboard/settings" className="dash-item" style={{ marginBottom: 8 }}>
          <Settings size={18} strokeWidth={1.8} />
          <span className="label">Configurações</span>
        </Link>
        <Link href="/dashboard/settings" className="dash-sb-user">
          <div className="dash-avatar">{userInitials}</div>
          <div className="dash-sb-user-info">
            <div className="name">{userName}</div>
            <div className="plan">Plano Pro</div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
