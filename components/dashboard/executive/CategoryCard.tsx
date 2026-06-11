"use client";

import type { ReactNode } from "react";

import { formatarMoeda } from "@/lib/formatters";

import { TrendDelta } from "./TrendDelta";

interface CategoryCardProps {
  nome: string;
  icon: ReactNode;
  receita: number;
  lucro: number;
  /** Delta da receita vs. período anterior. */
  deltaReceita: number | null;
  loading?: boolean;
  /** Abre o detalhamento (drill-down) da categoria. */
  onClick?: () => void;
}

/**
 * Card de uma linha de negócio (Produtos, Acessórios, Aparelhos, OS) na
 * seção "Composição da Operação". Mostra Receita (com delta) e Lucro.
 */
export function CategoryCard({
  nome,
  icon,
  receita,
  lucro,
  deltaReceita,
  loading = false,
  onClick,
}: CategoryCardProps) {
  const interactive = typeof onClick === "function";

  return (
    <div
      className={[
        "rounded-xl border border-default-200/70 bg-content1 p-5 shadow-sm",
        interactive
          ? "cursor-pointer transition-all hover:border-default-300 hover:shadow-md"
          : "",
      ].join(" ")}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-default-100 text-default-500 text-sm">
          {icon}
        </span>
        <span className="text-sm font-semibold text-foreground">{nome}</span>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs uppercase tracking-wide text-default-400">
              Receita
            </span>
            {!loading && <TrendDelta percent={deltaReceita} />}
          </div>
          {loading ? (
            <div className="mt-1 h-6 w-24 animate-pulse rounded-md bg-default-100" />
          ) : (
            <p className="text-xl font-bold leading-tight text-foreground tabular-nums">
              {formatarMoeda(receita)}
            </p>
          )}
        </div>

        <div className="border-t border-default-100 pt-3">
          <span className="text-xs uppercase tracking-wide text-default-400">
            Lucro
          </span>
          {loading ? (
            <div className="mt-1 h-5 w-20 animate-pulse rounded-md bg-default-100" />
          ) : (
            <p className="text-lg font-semibold leading-tight text-foreground tabular-nums">
              {formatarMoeda(lucro)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
