"use client";

import { useEffect, useState } from "react";
import { Landmark } from "lucide-react";
import { getBankById } from "@/lib/banks";

/**
 * Logo de banco com fallback automático.
 *
 * - Resolve o banco por id (`bank`/`bankId`, salvo em accounts.icon).
 * - Renderiza o SVG em /public/banks/<id>.svg dentro de um tile com o
 *   tom da marca (mesmo espírito visual do antigo BankBadge, agora com
 *   imagem em vez de iniciais).
 * - Se o banco for desconhecido ou o arquivo não carregar, cai para o
 *   ícone padrão `Landmark` (lucide-react), sem quebrar o layout.
 */
export function BankLogo({
  bank,
  bankId,
  size = 38,
  className,
}: {
  /** Id do banco (aceita também `bank`, para bater com o pedido original). */
  bank?: string | null;
  bankId?: string | null;
  size?: number;
  className?: string;
}) {
  const id = bankId ?? bank;
  const config = getBankById(id);
  const [failed, setFailed] = useState(false);

  // Reseta o estado de erro sempre que o banco selecionado mudar
  // (ex: usuário troca de banco no select antes de salvar).
  useEffect(() => {
    setFailed(false);
  }, [config?.id]);

  const tint = config?.color ?? "#5C5C66";

  return (
    <div
      className={`bank-logo${className ? ` ${className}` : ""}`}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        background: config && !failed ? `${tint}1f` : "var(--surface-3)",
        border: `1px solid ${config && !failed ? `${tint}33` : "var(--border)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "hidden",
        boxShadow: "0 1px 0 rgba(255,255,255,0.08) inset, 0 4px 12px rgba(0,0,0,0.25)",
      }}
    >
      {config && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={config.svg}
          alt={config.name}
          width={size * 0.62}
          height={size * 0.62}
          style={{ objectFit: "contain", borderRadius: size * 0.14 }}
          onError={() => setFailed(true)}
        />
      ) : (
        <Landmark size={size * 0.5} strokeWidth={1.8} color="var(--text-ter)" />
      )}
    </div>
  );
}
