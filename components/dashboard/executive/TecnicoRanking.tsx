"use client";

import type { DesempenhoTecnico } from "@/types/dashboard";

import { WrenchIcon } from "@heroicons/react/24/outline";

import { formatarMoeda } from "@/lib/formatters";

interface TecnicoRankingProps {
  tecnicos: DesempenhoTecnico[];
  loading?: boolean;
}

export function TecnicoRanking({
  tecnicos,
  loading = false,
}: TecnicoRankingProps) {
  const top = [...tecnicos].sort((a, b) => b.os_concluidas - a.os_concluidas);

  const maxOS = top[0]?.os_concluidas || 1;

  return (
    <div className="flex h-full flex-col rounded-xl border border-default-200/70 bg-content1 p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-default-100 text-default-500">
          <WrenchIcon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-default-500">
            Desempenho de Técnicos
          </p>
          <p className="text-sm text-default-400">
            OS concluídas, em andamento e faturadas no período
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-16 w-full animate-pulse rounded-lg bg-default-100"
            />
          ))
        ) : top.length === 0 ? (
          <p className="text-sm text-default-400">
            Nenhuma OS atribuída a técnicos no período.
          </p>
        ) : (
          top.map((t, i) => {
            const pctConcluidas =
              t.total_os > 0 ? (t.os_concluidas / t.total_os) * 100 : 0;

            return (
              <div key={t.usuario_id}>
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-xs font-bold bg-default-100 text-default-500">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-foreground">
                        {t.usuario_nome}
                      </span>
                      <span className="flex-shrink-0 text-xs text-default-500 tabular-nums">
                        {t.os_concluidas > 0 && `${t.os_concluidas} concluídas`}
                        {t.os_concluidas > 0 && t.os_andamento > 0 && " · "}
                        {t.os_andamento > 0 && `${t.os_andamento} em andamento`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-default-400">
                        {t.total_os} OS ·{" "}
                        {t.os_aguardando > 0 && `${t.os_aguardando} aguardando`}
                      </span>
                      <span className="text-xs font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                        {formatarMoeda(t.valor_pago)}
                      </span>
                    </div>
                    <div className="relative mt-1.5 h-2 w-full overflow-hidden rounded-full bg-default-100">
                      <div
                        className="absolute left-0 top-0 h-full rounded-full bg-primary/20"
                        style={{
                          width: `${Math.max(2, (t.total_os / maxOS) * 100)}%`,
                        }}
                      />
                      <div
                        className="absolute left-0 top-0 h-full rounded-full bg-emerald-500"
                        style={{
                          width: `${Math.max(1, pctConcluidas)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
