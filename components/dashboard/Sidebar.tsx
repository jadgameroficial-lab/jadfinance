"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutGrid, ArrowLeftRight, Landmark, CreditCard, Tag,
  Target, ShieldCheck, LineChart, Repeat, Building2,
  BarChart3, LayoutDashboard, Activity, TrendingUp, TrendingDown,
  FileDown, Download, Settings, ChevronLeft, ChevronDown, Wallet,
} from "lucide-react";
import { transactionsService } from "@/services/transactions.service";
import { useToast } from "@/lib/toast";

/**
 * Estrutura de navegação da sidebar.
 * - "link": item simples que navega para uma rota.
 * - "action": item que dispara uma função (ex: exportar CSV/PDF) em vez de navegar.
 * Grupos ("group") são expansíveis; itens fora de grupo (Dashboard, Patrimônio)
 * permanecem sempre simples, conforme solicitado.
 */
type NavLink = { kind: "link"; label: string; icon: React.ReactNode; href: string };
type NavAction = { kind: "action"; label: string; icon: React.ReactNode; onClick: () => void };
type GroupChild = NavLink | NavAction;

type NavGroup = {
  kind: "group";
  id: string;
  label: string;
  icon: React.ReactNode;
  children: GroupChild[];
};

function isActive(pathname: string, currentSearch: string, href: string) {
  const [hrefPath, hrefQuery = ""] = href.split("?");

  if (hrefPath !== pathname) {
    if (hrefPath === "/dashboard") return false;
    return pathname.startsWith(hrefPath + "/");
  }

  // Mesma rota: itens que compartilham o mesmo pathname só se diferenciam
  // pelo parâmetro "type" da URL.
  const hrefType = new URLSearchParams(hrefQuery).get("type");
  const currentType = new URLSearchParams(currentSearch).get("type");
  return hrefType === currentType;
}

function groupContainsActive(group: NavGroup, pathname: string, currentSearch: string) {
  return group.children.some((c) => c.kind === "link" && isActive(pathname, currentSearch, c.href));
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
        const logoRes = await fetch("/favicon.png");
        const blob = await logoRes.blob();
        const logoDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        doc.addImage(logoDataUrl, "PNG", 14, 10, 12, 12);
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

  const GROUPS: NavGroup[] = [
    {
      kind: "group",
      id: "financeiro",
      label: "Financeiro",
      icon: <Wallet size={18} strokeWidth={1.8} />,
      children: [
        { kind: "link", label: "Transações", icon: <ArrowLeftRight size={16} strokeWidth={1.8} />, href: "/dashboard/transactions" },
        { kind: "link", label: "Contas", icon: <Landmark size={16} strokeWidth={1.8} />, href: "/dashboard/accounts" },
        { kind: "link", label: "Cartões", icon: <CreditCard size={16} strokeWidth={1.8} />, href: "/dashboard/cards" },
        { kind: "link", label: "Categorias", icon: <Tag size={16} strokeWidth={1.8} />, href: "/dashboard/categories" },
      ],
    },
    {
      kind: "group",
      id: "planejamento",
      label: "Planejamento",
      icon: <Target size={18} strokeWidth={1.8} />,
      children: [
        { kind: "link", label: "Metas", icon: <Target size={16} strokeWidth={1.8} />, href: "/dashboard/goals" },
        { kind: "link", label: "Reserva de Emergência", icon: <ShieldCheck size={16} strokeWidth={1.8} />, href: "/dashboard/goals" },
        { kind: "link", label: "Investimentos", icon: <LineChart size={16} strokeWidth={1.8} />, href: "/dashboard/investments" },
        { kind: "link", label: "Assinaturas", icon: <Repeat size={16} strokeWidth={1.8} />, href: "/dashboard/subscriptions" },
      ],
    },
    {
      kind: "group",
      id: "relatorios",
      label: "Relatórios",
      icon: <BarChart3 size={18} strokeWidth={1.8} />,
      children: [
        { kind: "link", label: "Dashboard Financeiro", icon: <LayoutDashboard size={16} strokeWidth={1.8} />, href: "/dashboard/reports" },
        { kind: "link", label: "Fluxo de Caixa", icon: <Activity size={16} strokeWidth={1.8} />, href: "/dashboard/reports" },
        { kind: "link", label: "Receitas", icon: <TrendingUp size={16} strokeWidth={1.8} />, href: "/dashboard/reports" },
        { kind: "link", label: "Despesas", icon: <TrendingDown size={16} strokeWidth={1.8} />, href: "/dashboard/reports" },
        { kind: "link", label: "Categorias", icon: <Tag size={16} strokeWidth={1.8} />, href: "/dashboard/reports" },
        { kind: "action", label: "Exportar CSV", icon: <Download size={16} strokeWidth={1.8} />, onClick: handleExport },
        { kind: "action", label: "Exportar PDF", icon: <FileDown size={16} strokeWidth={1.8} />, onClick: handleExportPdf },
      ],
    },
  ];

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const g of GROUPS) {
      initial[g.id] = groupContainsActive(g, currentPath, currentSearch);
    }
    return initial;
  });

  // Ao navegar para uma rota dentro de um grupo, garante que ele apareça
  // expandido — sem forçar o fechamento de grupos abertos manualmente.
  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const g of GROUPS) {
        if (groupContainsActive(g, currentPath, currentSearch) && !next[g.id]) {
          next[g.id] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath, currentSearch]);

  function toggleGroup(id: string) {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <aside className="dash-sidebar" style={{ position: "relative" }}>
      <button className="dash-collapse-btn" onClick={onToggleCollapse} aria-label="Recolher menu">
        <ChevronLeft size={13} strokeWidth={2.5} />
      </button>

      <div className="dash-brand">
        <div className="dash-logo">
          <Image src="/logo.png" alt="JAD Finance" width={26} height={26} />
        </div>
        <div className="dash-brand-text">
          <b>JAD FINANCE</b>
          <span>CONTROLE FINANCEIRO</span>
        </div>
      </div>

      <nav className="dash-nav">
        {/* Dashboard — permanece simples, sem expandir */}
        <div className="dash-section-label">Dashboard</div>
        <Link
          href="/dashboard"
          className={`dash-item ${isActive(currentPath, currentSearch, "/dashboard") ? "active" : ""}`}
        >
          <LayoutGrid size={18} strokeWidth={1.8} />
          <span className="label">Visão Geral</span>
        </Link>
        <div className="dash-divider" />

        {/* Grupos expansíveis */}
        {GROUPS.map((group) => {
          const open = !!openGroups[group.id];
          const hasActive = groupContainsActive(group, currentPath, currentSearch);
          return (
            <div key={group.id} className={`dash-group ${open ? "open" : ""}`}>
              <button
                type="button"
                className={`dash-item dash-group-header ${hasActive ? "active" : ""}`}
                onClick={() => toggleGroup(group.id)}
                aria-expanded={open}
              >
                {group.icon}
                <span className="label">{group.label}</span>
                <ChevronDown size={15} strokeWidth={2} className="dash-group-chevron" />
              </button>
              <div className="dash-group-items">
                <div className="dash-group-items-inner">
                  {group.children.map((child) =>
                    child.kind === "link" ? (
                      <Link
                        key={child.label}
                        href={child.href}
                        className={`dash-item dash-subitem ${isActive(currentPath, currentSearch, child.href) ? "active" : ""}`}
                      >
                        {child.icon}
                        <span className="label">{child.label}</span>
                      </Link>
                    ) : (
                      <button
                        key={child.label}
                        type="button"
                        className="dash-item dash-subitem"
                        style={{ cursor: "pointer" }}
                        onClick={child.onClick}
                      >
                        {child.icon}
                        <span className="label">{child.label}</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div className="dash-divider" />

        {/* Patrimônio — simples, preparado para submenus futuros */}
        <Link
          href="/dashboard/accounts"
          className={`dash-item ${currentPath.startsWith("/dashboard/accounts") ? "active" : ""}`}
        >
          <Building2 size={18} strokeWidth={1.8} />
          <span className="label">Patrimônio</span>
        </Link>
        <div className="dash-divider" />
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
