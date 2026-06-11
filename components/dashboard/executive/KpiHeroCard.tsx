"use client";

import type { ReactNode } from "react";

import { Tooltip } from "@heroui/react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

import { Sparkline } from "./Sparkline";
import { TrendDelta } from "./TrendDelta";

interface KpiHeroCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  loading?: boolean;
  /** Variação percentual vs. período anterior. */
  deltaPercent?: number | null;
  /** Quando true, queda é positiva. */
  invertDelta?: boolean;
  /** Série para o sparkline (opcional). */
  trend?: number[];
  /** Linha secundária (ex: "42 concluídas"). */
  secondary?: ReactNode;
  /** Texto explicativo no tooltip do ícone de info. */
  hint?: string;
  onClick?: () => void;
}

/**
 * Card de KPI principal do dashboard executivo.
 * Visual neutro premium: superfície clara, borda sutil, número em destaque,
 * delta semântico e sparkline. A cor só aparece no delta (status).
 */
export function KpiHeroCard({
  label,
  value,
  icon,
  loading = false,
  deltaPercent = null,
  invertDelta = false,
  trend,
  secondary,
  hint,
  onClick,
}: KpiHeroCardProps) {
  const interactive = typeof onClick === "function";

  return (
    <div
      className={[
        "group relative flex flex-col justify-between rounded-xl border border-default-200/70",
        "bg-content1 p-5 shadow-sm transition-all duration-200",
        "hover:shadow-md hover:border-default-300",
        interactive ? "cursor-pointer" : "",
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
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-default-500">
            {label}
          </span>
          {hint ? (
            <Tooltip content={hint} delay={200} size="sm">
              <span className="text-default-400">
                <InformationCircleIcon className="h-3.5 w-3.5" />
              </span>
            </Tooltip>
          ) : null}
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-default-100 text-default-500 text-base">
          {icon}
        </span>
      </div>

      <div className="mt-3">
        {loading ? (
          <div className="h-9 w-28 animate-pulse rounded-md bg-default-100" />
        ) : (
          <p className="text-3xl font-bold leading-none tracking-tight text-foreground tabular-nums sm:text-4xl">
            {value}
          </p>
        )}
        {secondary ? (
          <div className="mt-1.5 text-sm text-default-500">{secondary}</div>
        ) : null}
      </div>

      <div className="mt-4 flex items-end justify-between gap-2">
        {loading ? (
          <div className="h-5 w-16 animate-pulse rounded-full bg-default-100" />
        ) : (
          <TrendDelta
            hint="vs. período anterior"
            invert={invertDelta}
            percent={deltaPercent}
          />
        )}
        {trend && trend.length > 1 ? (
          <Sparkline
            className="text-default-400 group-hover:text-primary transition-colors"
            data={trend}
          />
        ) : null}
      </div>
    </div>
  );
}
