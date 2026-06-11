"use client";

import type { ReactNode } from "react";

import { TrendDelta } from "./TrendDelta";

interface ComparativoCardProps {
  label: string;
  icon?: ReactNode;
  /** Selo indicando que o KPI usa janela fixa (não segue o filtro de período). */
  badge?: string;
  /** Período atual (destaque). */
  atualLabel: string;
  atualValue: string;
  /** Período de referência. */
  refLabel: string;
  refValue: string;
  deltaPercent: number | null;
  loading?: boolean;
}

/**
 * Card comparativo entre dois períodos (ex: Hoje × Ontem, Mês × Mês anterior).
 * Mostra o valor atual em destaque, o de referência abaixo e o delta.
 */
export function ComparativoCard({
  label,
  icon,
  badge,
  atualLabel,
  atualValue,
  refLabel,
  refValue,
  deltaPercent,
  loading = false,
}: ComparativoCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-default-200/70 bg-content1 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-default-500">
            {label}
          </span>
          {badge ? (
            <span className="rounded-md bg-default-100 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-default-400">
              {badge}
            </span>
          ) : null}
        </div>
        {icon ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-default-100 text-default-500 text-sm">
            {icon}
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[0.7rem] font-medium uppercase tracking-wide text-default-400">
            {atualLabel}
          </p>
          {loading ? (
            <div className="mt-1 h-7 w-24 animate-pulse rounded-md bg-default-100" />
          ) : (
            <p className="text-2xl font-bold leading-none tracking-tight text-foreground tabular-nums">
              {atualValue}
            </p>
          )}
        </div>
        {!loading && <TrendDelta percent={deltaPercent} size="md" />}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-default-100 pt-2 text-xs">
        <span className="text-default-400">{refLabel}</span>
        <span className="font-semibold text-default-500 tabular-nums">
          {loading ? "…" : refValue}
        </span>
      </div>
    </div>
  );
}
