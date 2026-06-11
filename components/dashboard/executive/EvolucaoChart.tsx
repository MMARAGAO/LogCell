"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { PresentationChartLineIcon } from "@heroicons/react/24/outline";

import { formatarMoeda } from "@/lib/formatters";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
);

interface EvolucaoItem {
  data: string;
  vendas: number;
  receita: number;
}

interface EvolucaoChartProps {
  evolucao: EvolucaoItem[];
  loading?: boolean;
}

// Paleta alinhada à marca (azul = receita, esmeralda = nº de vendas)
const COR_RECEITA = "#2563eb";
const COR_VENDAS = "#10b981";

export function EvolucaoChart({
  evolucao,
  loading = false,
}: EvolucaoChartProps) {
  const labels = evolucao.map((item) => {
    const [, mes, dia] = (item.data || "").split("-");

    return dia && mes ? `${dia}/${mes}` : item.data;
  });

  const temDados = evolucao.length > 0;

  return (
    <div className="rounded-xl border border-default-200/70 bg-content1 p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-default-100 text-default-500">
          <PresentationChartLineIcon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-default-500">
            Evolução
          </p>
          <p className="text-sm text-default-400">
            Vendas e receita por dia no período
          </p>
        </div>
      </div>

      <div className="mt-4 h-[320px]">
        {loading ? (
          <div className="h-full w-full animate-pulse rounded-xl bg-default-100" />
        ) : !temDados ? (
          <div className="flex h-full items-center justify-center text-sm text-default-400">
            Sem dados no período selecionado.
          </div>
        ) : (
          <Line
            data={{
              labels,
              datasets: [
                {
                  label: "Receita",
                  data: evolucao.map((i) => i.receita),
                  borderColor: COR_RECEITA,
                  backgroundColor: "rgba(37, 99, 235, 0.08)",
                  borderWidth: 2,
                  tension: 0.4,
                  fill: true,
                  pointRadius: 0,
                  pointHoverRadius: 4,
                  yAxisID: "y",
                },
                {
                  label: "Vendas",
                  data: evolucao.map((i) => i.vendas),
                  borderColor: COR_VENDAS,
                  backgroundColor: "rgba(16, 185, 129, 0.06)",
                  borderWidth: 2,
                  tension: 0.4,
                  fill: false,
                  pointRadius: 0,
                  pointHoverRadius: 4,
                  yAxisID: "y1",
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: { mode: "index", intersect: false },
              plugins: {
                legend: {
                  position: "top",
                  align: "end",
                  labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    padding: 16,
                    font: { size: 12 },
                  },
                },
                tooltip: {
                  callbacks: {
                    label: (ctx) =>
                      ctx.dataset.label === "Receita"
                        ? ` Receita: ${formatarMoeda(Number(ctx.raw))}`
                        : ` Vendas: ${ctx.raw}`,
                  },
                },
              },
              scales: {
                x: { grid: { display: false } },
                y: {
                  position: "left",
                  ticks: {
                    callback: (v) => formatarMoeda(Number(v)),
                    font: { size: 11 },
                  },
                  grid: { color: "rgba(120,120,120,0.08)" },
                },
                y1: {
                  position: "right",
                  ticks: { precision: 0, font: { size: 11 } },
                  grid: { display: false },
                },
              },
            }}
          />
        )}
      </div>
    </div>
  );
}
