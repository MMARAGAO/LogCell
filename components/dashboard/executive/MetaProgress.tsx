"use client";

import { FlagIcon } from "@heroicons/react/24/outline";

import { formatarMoeda } from "@/lib/formatters";

interface MetaProgressProps {
  /** Valor realizado no mês (faturamento). */
  realizado: number;
  /** Meta mensal consolidada. */
  meta: number;
  /** Fração do mês já decorrida (0..1) para indicar ritmo. */
  fracaoMesDecorrida?: number;
  loading?: boolean;
}

/**
 * Card de progresso da meta do mês com indicador de ritmo
 * (compara o % realizado com o % do mês já decorrido).
 */
export function MetaProgress({
  realizado,
  meta,
  fracaoMesDecorrida = 0,
  loading = false,
}: MetaProgressProps) {
  const progresso = meta > 0 ? (realizado / meta) * 100 : 0;
  const progressoClamped = Math.min(100, Math.max(0, progresso));
  const faltante = Math.max(0, meta - realizado);
  const esperado = fracaoMesDecorrida * 100;

  // Previsão de fechamento: projeção linear pelo ritmo realizado até agora
  const previsao =
    fracaoMesDecorrida > 0 ? realizado / fracaoMesDecorrida : realizado;
  const previsaoPct = meta > 0 ? (previsao / meta) * 100 : 0;

  // Semáforo: acima / dentro / abaixo da meta (baseado na previsão de fechamento)
  type Status = "sem_meta" | "batida" | "acima" | "dentro" | "abaixo";
  const status: Status =
    meta <= 0
      ? "sem_meta"
      : progresso >= 100
        ? "batida"
        : previsaoPct >= 100
          ? "acima"
          : previsaoPct >= 90
            ? "dentro"
            : "abaixo";

  const STATUS_META: Record<
    Status,
    { label: string; chip: string; bar: string }
  > = {
    sem_meta: {
      label: "Sem meta",
      chip: "text-default-400 bg-default-100",
      bar: "bg-default-300",
    },
    batida: {
      label: "Meta batida 🎉",
      chip: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10",
      bar: "bg-emerald-500",
    },
    acima: {
      label: "Acima da meta",
      chip: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10",
      bar: "bg-emerald-500",
    },
    dentro: {
      label: "Dentro da meta",
      chip: "text-primary bg-primary/10",
      bar: "bg-primary",
    },
    abaixo: {
      label: "Abaixo da meta",
      chip: "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10",
      bar: "bg-rose-500",
    },
  };

  const statusMeta = STATUS_META[status];
  const ritmoTone = statusMeta.chip;
  const ritmoLabel = statusMeta.label;
  const barTone = statusMeta.bar;

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-default-200/70 bg-content1 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-default-100 text-default-500">
            <FlagIcon className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-default-500">
                Meta do mês
              </p>
              <span className="rounded-md bg-default-100 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-default-400">
                mês corrente
              </span>
            </div>
            <p className="text-sm text-default-400">Faturamento vs. meta</p>
          </div>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ritmoTone}`}
        >
          {ritmoLabel}
        </span>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="h-8 w-40 animate-pulse rounded-md bg-default-100" />
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground tabular-nums">
              {formatarMoeda(realizado)}
            </span>
            <span className="text-sm text-default-400">
              / {meta > 0 ? formatarMoeda(meta) : "—"}
            </span>
          </div>
        )}

        {/* Barra */}
        <div className="relative mt-3 h-2.5 w-full overflow-hidden rounded-full bg-default-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barTone}`}
            style={{ width: `${progressoClamped}%` }}
          />
          {/* Marcador de ritmo esperado */}
          {meta > 0 && esperado > 0 && esperado < 100 && (
            <div
              className="absolute top-1/2 h-3.5 w-0.5 -translate-y-1/2 bg-default-400"
              style={{ left: `${Math.min(100, esperado)}%` }}
              title="Ritmo esperado para hoje"
            />
          )}
        </div>

        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="font-semibold text-default-600 tabular-nums">
            {meta > 0 ? `${progresso.toFixed(0)}%` : "—"}
          </span>
          <span className="text-default-400">
            {meta > 0 ? `Faltam ${formatarMoeda(faltante)}` : "Configure metas"}
          </span>
        </div>

        {/* Previsão de fechamento do mês */}
        {meta > 0 && (
          <div className="mt-3 flex items-center justify-between rounded-lg bg-default-50 px-3 py-2 dark:bg-default-100/40">
            <span className="text-xs text-default-500">
              Previsão de fechamento
            </span>
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {loading ? "…" : formatarMoeda(previsao)}
              <span className="ml-1 text-xs font-normal text-default-400">
                ({previsaoPct.toFixed(0)}%)
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
