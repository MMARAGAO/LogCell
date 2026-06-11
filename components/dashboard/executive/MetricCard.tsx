"use client";

import type { ReactNode } from "react";

import { Tooltip } from "@heroui/react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export type MetricTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger";

const TONE_ICON: Record<MetricTone, string> = {
  neutral: "bg-default-100 text-default-500",
  primary: "bg-primary/10 text-primary",
  success:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  warning:
    "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  danger: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
};

const TONE_ACCENT: Record<MetricTone, string> = {
  neutral: "before:bg-default-300",
  primary: "before:bg-primary",
  success: "before:bg-emerald-500",
  warning: "before:bg-amber-500",
  danger: "before:bg-rose-500",
};

interface MetricCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: MetricTone;
  /** Realça o card com uma faixa de acento à esquerda (use para alertas). */
  emphasis?: boolean;
  footnote?: ReactNode;
  hint?: string;
  loading?: boolean;
  onClick?: () => void;
}

/**
 * Card de métrica neutro premium (sem gradiente, alto contraste).
 * A cor aparece apenas no ícone e, opcionalmente, numa faixa de acento.
 */
export function MetricCard({
  label,
  value,
  icon,
  tone = "neutral",
  emphasis = false,
  footnote,
  hint,
  loading = false,
  onClick,
}: MetricCardProps) {
  const interactive = typeof onClick === "function";

  return (
    <div
      className={[
        "relative flex flex-col justify-between overflow-hidden rounded-xl border border-default-200/70",
        "bg-content1 p-5 shadow-sm transition-all duration-200",
        interactive
          ? "cursor-pointer hover:border-default-300 hover:shadow-md"
          : "",
        emphasis
          ? `before:absolute before:left-0 before:top-0 before:h-full before:w-1 ${TONE_ACCENT[tone]}`
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
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-default-500">
            {label}
          </span>
          {hint ? (
            <Tooltip content={hint} delay={200} size="sm">
              <span className="text-default-400">
                <InformationCircleIcon className="h-4 w-4" />
              </span>
            </Tooltip>
          ) : null}
        </div>
        {icon ? (
          <span
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
              emphasis ? TONE_ICON[tone] : TONE_ICON.neutral
            }`}
          >
            {icon}
          </span>
        ) : null}
      </div>

      <div className="mt-3">
        {loading ? (
          <div className="h-8 w-24 animate-pulse rounded-md bg-default-100" />
        ) : (
          <p className="text-2xl font-bold leading-none tracking-tight text-foreground tabular-nums">
            {value}
          </p>
        )}
        {footnote ? (
          <div className="mt-1.5 text-xs text-default-400">{footnote}</div>
        ) : null}
      </div>
    </div>
  );
}
