"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { BANKS, getBankById } from "@/lib/banks";
import { BankLogo } from "@/components/dashboard/BankLogo";

/**
 * Select de banco com logotipo.
 *
 * Um <select> nativo não consegue exibir imagens dentro das opções em
 * nenhum navegador, então usamos um listbox customizado que segue
 * exatamente o visual dos outros campos do formulário (`dash-d-field`),
 * mas mostra [logo] + nome tanto no valor selecionado quanto em cada
 * opção da lista, como pedido.
 */
export function BankSelect({
  value,
  onChange,
  placeholder = "Selecione um banco (opcional)",
}: {
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = getBankById(value);

  useEffect(() => {
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
  }, []);

  function pick(id: string) {
    onChange(id);
    setOpen(false);
  }

  return (
    <div className="bank-select" ref={rootRef}>
      <button
        type="button"
        className={`bank-select-trigger${open ? " open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <BankLogo bankId={value} size={30} />
        <span className={`bank-select-value${selected ? "" : " placeholder"}`}>
          {selected ? selected.name : placeholder}
        </span>
        <ChevronDown size={15} strokeWidth={2} className="bank-select-chevron" />
      </button>

      {open && (
        <ul className="bank-select-menu" role="listbox">
          <li>
            <button
              type="button"
              className={`bank-select-option${!value ? " active" : ""}`}
              onClick={() => pick("")}
            >
              <span className="bank-select-option-empty" />
              <span>Nenhum</span>
            </button>
          </li>
          {BANKS.map((b) => (
            <li key={b.id}>
              <button
                type="button"
                className={`bank-select-option${value === b.id ? " active" : ""}`}
                onClick={() => pick(b.id)}
                role="option"
                aria-selected={value === b.id}
              >
                <BankLogo bankId={b.id} size={26} />
                <span>{b.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
