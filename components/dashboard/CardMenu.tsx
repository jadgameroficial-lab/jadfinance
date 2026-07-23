"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { MoreVertical } from "lucide-react";

export interface CardMenuAction {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  danger?: boolean;
}

/**
 * Menu de ações "⋮" para cards (conta, cartão, etc).
 *
 * Sempre visível (sem depender de hover), para funcionar também em telas
 * touch — diferente do padrão antigo de tabela, que só aparecia com mouse
 * sobre a linha.
 */
export function CardMenu({ actions }: { actions: CardMenuAction[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="card-menu" ref={rootRef}>
      <button
        type="button"
        className="card-menu-trigger"
        aria-label="Mais ações"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <MoreVertical size={16} strokeWidth={2} />
      </button>

      {open && (
        <ul className="card-menu-list" role="menu">
          {actions.map((action) => (
            <li key={action.label}>
              <button
                type="button"
                role="menuitem"
                className={`card-menu-item${action.danger ? " danger" : ""}`}
                onClick={() => {
                  setOpen(false);
                  action.onClick();
                }}
              >
                {action.icon}
                {action.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
