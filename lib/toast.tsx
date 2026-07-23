"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastKind = "success" | "error" | "info";
type ToastItem = { id: number; kind: ToastKind; message: string };

interface ToastContextValue {
  show: (kind: ToastKind, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let idCounter = 0;

const KIND_ICON: Record<ToastKind, ReactNode> = {
  success: <CheckCircle2 size={16} strokeWidth={2} />,
  error: <AlertCircle size={16} strokeWidth={2} />,
  info: <Info size={16} strokeWidth={2} />,
};

const KIND_COLOR: Record<ToastKind, string> = {
  success: "#3ecf8e",
  error: "#f16565",
  info: "#e8c46a",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (kind: ToastKind, message: string) => {
      const id = ++idCounter;
      setItems((prev) => [...prev, { id, kind, message }]);
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  const value: ToastContextValue = {
    show,
    success: (message) => show("success", message),
    error: (message) => show("error", message),
    info: (message) => show("info", message),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 10000,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          maxWidth: 340,
        }}
      >
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "13px 14px",
              borderRadius: 12,
              fontSize: 13,
              lineHeight: 1.4,
              color: "#f4f2ee",
              background: "#17171c",
              border: `1px solid ${KIND_COLOR[t.kind]}55`,
              boxShadow: "0 14px 34px rgba(0,0,0,0.45)",
              animation: "dashToastIn .3s ease",
            }}
          >
            <span style={{ color: KIND_COLOR[t.kind], flexShrink: 0, marginTop: 1 }}>{KIND_ICON[t.kind]}</span>
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Fechar"
              style={{
                background: "none",
                border: "none",
                color: "#8a8a92",
                cursor: "pointer",
                padding: 2,
                flexShrink: 0,
              }}
            >
              <X size={13} strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes dashToastIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast precisa ser usado dentro de um ToastProvider.");
  return ctx;
}
