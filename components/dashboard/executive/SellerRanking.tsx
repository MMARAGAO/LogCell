"use client";

import { TrophyIcon } from "@heroicons/react/24/outline";

import { formatarMoeda } from "@/lib/formatters";

interface Seller {
  vendedor_id: string;
  vendedor_nome: string;
  total_vendas: number;
  total_os: number;
  receita_vendas: number;
  receita_aparelhos: number;
  receita_os: number;
  receita_total: number;
  lucro_vendas: number;
  lucro_aparelhos: number;
  lucro_os: number;
  lucro_total: number;
}

interface SellerRankingProps {
  vendedores: Seller[];
  loading?: boolean;
}

const MEDAL_TONE = [
  "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  "bg-default-200 text-default-600",
  "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
];

// Receita = hue da categoria (base translúcida) · Lucro = emerald (consistente
// com o restante da Visão Executiva).
const CATEGORIA_STYLE: Record<
  string,
  { label: string; cor: string; corClara: string; corLucro: string }
> = {
  vendas: {
    label: "Vendas",
    cor: "bg-blue-500",
    corClara: "bg-blue-500/40",
    corLucro: "bg-emerald-500",
  },
  aparelhos: {
    label: "Aparelhos",
    cor: "bg-violet-500",
    corClara: "bg-violet-500/40",
    corLucro: "bg-emerald-500",
  },
  os: {
    label: "OS",
    cor: "bg-amber-500",
    corClara: "bg-amber-500/40",
    corLucro: "bg-emerald-500",
  },
};

export function SellerRanking({
  vendedores,
  loading = false,
}: SellerRankingProps) {
  const top = [...vendedores].sort((a, b) => b.receita_total - a.receita_total);

  const maxReceita = top[0]?.receita_total || 1;

  return (
    <div className="flex h-full flex-col rounded-xl border border-default-200/70 bg-content1 p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-default-100 text-default-500">
          <TrophyIcon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-default-500">
            Ranking de vendedores
          </p>
          <p className="text-sm text-default-400">Vendas e OS por vendedor</p>
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 w-full animate-pulse rounded-lg bg-default-100"
            />
          ))
        ) : top.length === 0 ? (
          <p className="text-sm text-default-400">
            Sem vendas no período selecionado.
          </p>
        ) : (
          top.map((v, i) => {
            const categorias = [
              {
                key: "vendas",
                receita: v.receita_vendas,
                lucro: v.lucro_vendas,
              },
              {
                key: "aparelhos",
                receita: v.receita_aparelhos,
                lucro: v.lucro_aparelhos,
              },
              { key: "os", receita: v.receita_os, lucro: v.lucro_os },
            ];

            const atLeastOne = categorias.some((c) => c.receita > 0);

            return (
              <div key={v.vendedor_id}>
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                      MEDAL_TONE[i] || "bg-default-100 text-default-500"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-foreground">
                        {v.vendedor_nome}
                      </span>
                      <span className="flex-shrink-0 text-xs text-default-500 tabular-nums">
                        {v.total_vendas > 0 && `${v.total_vendas}V`}
                        {v.total_vendas > 0 && v.total_os > 0 && " · "}
                        {v.total_os > 0 && `${v.total_os}OS`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-default-400">Total</span>
                      <div className="flex gap-3 text-xs tabular-nums">
                        <span className="text-foreground font-medium">
                          {formatarMoeda(v.receita_total)}
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {formatarMoeda(v.lucro_total)}
                        </span>
                      </div>
                    </div>
                    <div className="relative mt-1 h-1.5 w-full overflow-hidden rounded-full bg-default-100">
                      <div
                        className="absolute left-0 top-0 h-full rounded-full bg-primary/30"
                        style={{
                          width: `${Math.max(3, (v.receita_total / maxReceita) * 100)}%`,
                        }}
                      />
                      <div
                        className="absolute left-0 top-0 h-full rounded-full bg-emerald-500"
                        style={{
                          width: `${Math.max(1, (v.receita_total / maxReceita) * 100 * (v.lucro_total / (v.receita_total || 1)))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {atLeastOne && (
                  <div className="ml-9 mt-2 space-y-1.5">
                    {categorias
                      .filter((c) => c.receita > 0)
                      .map((c) => {
                        const style = CATEGORIA_STYLE[c.key];
                        const pct =
                          v.receita_total > 0
                            ? (c.receita / v.receita_total) * 100
                            : 0;
                        const pctLucro =
                          c.receita > 0 ? (c.lucro / c.receita) * 100 : 0;

                        return (
                          <div key={c.key} className="flex items-center gap-2">
                            <span
                              className={`hidden h-2 w-2 flex-shrink-0 rounded-full sm:block ${style.cor}`}
                            />
                            <span className="w-16 flex-shrink-0 text-xs text-default-500">
                              {style.label}
                            </span>
                            <div className="flex-1">
                              <div className="relative h-2 w-full overflow-hidden rounded-full bg-default-100">
                                <div
                                  className={`absolute left-0 top-0 h-full rounded-full transition-all ${style.corClara}`}
                                  style={{ width: `${Math.max(2, pct)}%` }}
                                />
                                <div
                                  className={`absolute left-0 top-0 h-full rounded-full transition-all ${style.corLucro}`}
                                  style={{
                                    width: `${Math.max(1, pct * (pctLucro / 100))}%`,
                                  }}
                                />
                              </div>
                            </div>
                            <span className="w-20 text-right text-xs tabular-nums text-default-600">
                              {formatarMoeda(c.receita)}
                            </span>
                            <span className="w-20 text-right text-xs tabular-nums text-emerald-600 dark:text-emerald-400">
                              {formatarMoeda(c.lucro)}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
