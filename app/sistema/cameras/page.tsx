"use client";

import { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { PlayIcon } from "@heroicons/react/24/solid";

const BANCADAS = [
  { key: "bancada-1", label: "Bancada 1" },
  { key: "bancada-2", label: "Bancada 2" },
  { key: "bancada-3", label: "Bancada 3" },
  { key: "bancada-4", label: "Bancada 4" },
  { key: "bancada-5", label: "Bancada 5" },
];

type OsResumo = {
  numero_os: number;
  equipamento_marca: string | null;
  equipamento_modelo: string | null;
  status: string;
};

function CameraCard({
  bancada,
  ordens,
  ativa,
  onAtivar,
}: {
  bancada: { key: string; label: string };
  ordens: OsResumo[];
  ativa: boolean;
  onAtivar: () => void;
}) {
  const ocupada = ordens.length > 0;
  const baseUrl = process.env.NEXT_PUBLIC_GO2RTC_URL || "/go2rtc";

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-video bg-black">
        {ativa ? (
          <iframe
            allow="autoplay; camera; microphone; display-capture"
            className="absolute inset-0 w-full h-full"
            src={`${baseUrl}/stream.html?src=${bancada.key}&mode=mse`}
            style={{ border: "none" }}
            title={bancada.label}
          />
        ) : (
          <button
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-900 hover:bg-zinc-800 transition-colors cursor-pointer"
            type="button"
            onClick={onAtivar}
          >
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
              <PlayIcon className="w-6 h-6 text-white/70" />
            </div>
            <span className="text-white/50 text-sm font-medium">
              Clique para carregar
            </span>
          </button>
        )}
        {!ocupada && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/50 text-white/60 text-[10px] font-medium">
            Bancada vazia
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {bancada.label}
          </h2>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium ${
              ocupada
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                ocupada ? "bg-emerald-500" : "bg-gray-400 dark:bg-gray-600"
              }`}
            />
            {ocupada ? "Ocupada" : "Livre"}
          </span>
        </div>

        {ordens.map((os) => (
          <div
            key={os.numero_os}
            className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800 rounded-lg p-2"
          >
            <span className="font-medium text-gray-700 dark:text-gray-300">
              OS #{os.numero_os}
            </span>
            {os.equipamento_marca && os.equipamento_modelo && (
              <span>
                {" — "}
                {os.equipamento_marca} {os.equipamento_modelo}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CamerasPage() {
  const [ordensPorBancada, setOrdensPorBancada] = useState<
    Record<string, OsResumo[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [ativas, setAtivas] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function carregarOrdens() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      const { data } = await supabase
        .from("ordem_servico")
        .select(
          "bancada, numero_os, equipamento_marca, equipamento_modelo, status",
        )
        .not("bancada", "is", null)
        .order("bancada");

      const map: Record<string, OsResumo[]> = {};

      for (const os of data || []) {
        if (!map[os.bancada]) map[os.bancada] = [];
        map[os.bancada].push(os);
      }

      setOrdensPorBancada(map);
      setLoading(false);
    }

    carregarOrdens();
  }, []);

  const ativar = useCallback((key: string) => {
    setAtivas((prev) => ({ ...prev, [key]: true }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Câmeras
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Clique em uma bancada para carregar a transmissão ao vivo
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {BANCADAS.map((b) => (
              <div
                key={b.key}
                className="rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-gray-200 dark:bg-zinc-700" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-zinc-700 rounded" />
                  <div className="h-3 w-40 bg-gray-200 dark:bg-zinc-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {BANCADAS.map((bancada) => (
              <CameraCard
                key={bancada.key}
                ativa={!!ativas[bancada.key]}
                bancada={bancada}
                ordens={ordensPorBancada[bancada.key] || []}
                onAtivar={() => ativar(bancada.key)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
