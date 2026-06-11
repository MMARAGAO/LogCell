"use client";

import { Select, SelectItem, Button } from "@heroui/react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export type PeriodPreset = "hoje" | "7d" | "30d" | "mes" | "custom";

interface PeriodSelectorProps {
  dataInicio: string;
  dataFim: string;
  lojaId: string;
  lojas: Array<{ id: number; nome: string }>;
  loading?: boolean;
  onPeriodChange: (inicio: string, fim: string) => void;
  onLojaChange: (lojaId: string) => void;
  onRefresh: () => void;
}

const toISO = (d: Date) => d.toISOString().split("T")[0];

function presetRange(
  preset: Exclude<PeriodPreset, "custom">,
): [string, string] {
  const hoje = new Date();
  const fim = toISO(hoje);

  if (preset === "hoje") return [fim, fim];
  if (preset === "7d") {
    const ini = new Date(hoje);

    ini.setDate(ini.getDate() - 6);

    return [toISO(ini), fim];
  }
  if (preset === "30d") {
    const ini = new Date(hoje);

    ini.setDate(ini.getDate() - 29);

    return [toISO(ini), fim];
  }
  // mês corrente
  const ini = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  return [toISO(ini), fim];
}

function activePreset(inicio: string, fim: string): PeriodPreset {
  const presets: Exclude<PeriodPreset, "custom">[] = [
    "hoje",
    "7d",
    "30d",
    "mes",
  ];

  for (const p of presets) {
    const [i, f] = presetRange(p);

    if (i === inicio && f === fim) return p;
  }

  return "custom";
}

const PRESET_LABELS: Record<Exclude<PeriodPreset, "custom">, string> = {
  hoje: "Hoje",
  "7d": "7 dias",
  "30d": "30 dias",
  mes: "Mês",
};

export function PeriodSelector({
  dataInicio,
  dataFim,
  lojaId,
  lojas,
  loading = false,
  onPeriodChange,
  onLojaChange,
  onRefresh,
}: PeriodSelectorProps) {
  const active = activePreset(dataInicio, dataFim);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-default-200/70 bg-content1 p-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Chips de período */}
      <div className="flex flex-wrap items-center gap-1.5">
        {(Object.keys(PRESET_LABELS) as Array<keyof typeof PRESET_LABELS>).map(
          (p) => {
            const isActive = active === p;

            return (
              <button
                key={p}
                className={[
                  "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-default-600 hover:bg-default-100",
                ].join(" ")}
                type="button"
                onClick={() => {
                  const [i, f] = presetRange(p);

                  onPeriodChange(i, f);
                }}
              >
                {PRESET_LABELS[p]}
              </button>
            );
          },
        )}
        {active === "custom" && (
          <span className="rounded-lg bg-default-100 px-3 py-1.5 text-sm font-semibold text-default-600">
            Personalizado
          </span>
        )}
      </div>

      {/* Datas + loja + refresh */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          aria-label="Data início"
          className="rounded-lg border border-default-200 bg-transparent px-3 py-1.5 text-sm"
          type="date"
          value={dataInicio}
          onChange={(e) => {
            if (e.target.value <= dataFim) onPeriodChange(e.target.value, dataFim);
          }}
        />
        <span className="text-sm text-default-500">até</span>
        <input
          aria-label="Data fim"
          className="rounded-lg border border-default-200 bg-transparent px-3 py-1.5 text-sm"
          type="date"
          value={dataFim}
          onChange={(e) => {
            if (e.target.value >= dataInicio) onPeriodChange(dataInicio, e.target.value);
          }}
        />
        <Select
          disallowEmptySelection
          aria-label="Loja"
          className="w-44"
          items={[
            { id: "todas", nome: "Todas as lojas" },
            ...lojas.map((l) => ({ id: l.id.toString(), nome: l.nome })),
          ]}
          renderValue={(items) => items[0]?.data?.nome || "Todas as lojas"}
          selectedKeys={[lojaId || "todas"]}
          size="sm"
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as string;

            onLojaChange(value === "todas" ? "" : value);
          }}
        >
          {(item) => <SelectItem key={item.id}>{item.nome}</SelectItem>}
        </Select>
        <Button
          isIconOnly
          aria-label="Atualizar"
          isLoading={loading}
          size="sm"
          variant="flat"
          onPress={onRefresh}
        >
          {!loading && <ArrowPathIcon className="h-4 w-4 text-default-600" />}
        </Button>
      </div>
    </div>
  );
}
