"use client";

import {
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
} from "@heroicons/react/24/solid";

interface TrendDeltaProps {
  /** Variação percentual já calculada (ex: 12.5 = +12,5%). */
  percent: number | null;
  /** Quando true, queda é boa (ex: contas não pagas, quebras). */
  invert?: boolean;
  size?: "sm" | "md";
  /** Rótulo de contexto, ex: "vs. período anterior". */
  hint?: string;
}

/**
 * Badge de tendência com seta e cor semântica.
 * Verde = bom, vermelho = ruim, neutro = estável/sem base de comparação.
 */
export function TrendDelta({
  percent,
  invert = false,
  size = "sm",
  hint,
}: TrendDeltaProps) {
  const hasValue = percent !== null && Number.isFinite(percent);
  const isFlat = !hasValue || Math.abs(percent as number) < 0.05;
  const isUp = hasValue && (percent as number) > 0;

  // Define se a direção representa algo positivo para o negócio
  const isGood = isFlat ? null : invert ? !isUp : isUp;

  const tone = isFlat
    ? "text-default-400 bg-default-100"
    : isGood
      ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10"
      : "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10";

  const Icon = isFlat ? MinusIcon : isUp ? ArrowUpIcon : ArrowDownIcon;

  const textSize = size === "md" ? "text-sm" : "text-xs";

  const label = isFlat
    ? "0%"
    : `${isUp ? "+" : ""}${(percent as number).toFixed(1).replace(".", ",")}%`;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${textSize} ${tone}`}
      title={hint}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
