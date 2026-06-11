"use client";

import type { ReactNode } from "react";

import {
  LightBulbIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

export type InsightTone = "alert" | "warning" | "opportunity" | "info";

export interface Insight {
  id: string;
  tone: InsightTone;
  text: ReactNode;
  onClick?: () => void;
}

interface InsightBannerProps {
  insights: Insight[];
  loading?: boolean;
}

const TONE_STYLES: Record<InsightTone, { chip: string; icon: ReactNode }> = {
  alert: {
    chip: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300",
    icon: <ExclamationTriangleIcon className="h-3.5 w-3.5" />,
  },
  warning: {
    chip: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
    icon: <InformationCircleIcon className="h-3.5 w-3.5" />,
  },
  opportunity: {
    chip: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
    icon: <ArrowTrendingUpIcon className="h-3.5 w-3.5" />,
  },
  info: {
    chip: "border-default-200 bg-default-50 text-default-600 dark:bg-default-100/40",
    icon: <InformationCircleIcon className="h-3.5 w-3.5" />,
  },
};

export function InsightBanner({
  insights,
  loading = false,
}: InsightBannerProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-default-200/70 bg-content1 p-4">
        <div className="h-8 w-8 animate-pulse rounded-lg bg-default-100" />
        <div className="h-5 w-2/3 animate-pulse rounded bg-default-100" />
      </div>
    );
  }

  if (!insights.length) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-default-200/70 bg-content1 px-4 py-3 text-sm text-default-500">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          <LightBulbIcon className="h-4 w-4" />
        </span>
        Nenhum alerta no período. Operação dentro do esperado.
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border border-default-200/70 bg-content1 p-4">
      <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <LightBulbIcon className="h-4 w-4" />
      </span>
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {insights.map((it) => {
          const style = TONE_STYLES[it.tone];
          const interactive = typeof it.onClick === "function";

          return (
            <button
              key={it.id}
              className={[
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
                style.chip,
                interactive
                  ? "cursor-pointer hover:brightness-95"
                  : "cursor-default",
              ].join(" ")}
              disabled={!interactive}
              type="button"
              onClick={it.onClick}
            >
              <span className="text-[0.7rem]">{style.icon}</span>
              {it.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
