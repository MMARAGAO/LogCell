"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

type StreamData = {
  bancada: string;
  numero_os: number;
  cliente_nome: string;
  cliente_telefone?: string;
  equipamento_tipo: string;
  equipamento_marca?: string;
  equipamento_modelo?: string;
  equipamento_numero_serie?: string;
  status: string;
  prioridade: string;
  defeito_reclamado?: string;
  data_entrada: string;
  previsao_entrega?: string;
  garantia_dias?: number;
  valor_orcamento?: number;
  tecnico_nome?: string;
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> =
  {
    aguardando: {
      label: "Aguardando",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    aprovado: { label: "Aprovado", color: "text-blue-600", bg: "bg-blue-50" },
    em_diagnostico: {
      label: "Em Diagnóstico",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    em_andamento: {
      label: "Em Andamento",
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    aguardando_peca: {
      label: "Aguardando Peça",
      color: "text-red-600",
      bg: "bg-red-50",
    },
    concluido: {
      label: "Concluído",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    entregue: {
      label: "Entregue",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  };

export default function VerStreamPage() {
  const params = useParams();
  const [data, setData] = useState<StreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [iframeReady, setIframeReady] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showUI, setShowUI] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/stream/${params.id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setData(json);
      })
      .catch(() => setError("Erro ao carregar dados"))
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    if (!data) return;
    const t = setTimeout(() => setShowUI(false), 4000);
    const b = setTimeout(() => setIframeReady(true), 2500);

    return () => {
      clearTimeout(t);
      clearTimeout(b);
    };
  }, [data]);

  const baseUrl = process.env.NEXT_PUBLIC_GO2RTC_URL || "/go2rtc";
  const bancadaNumero = data?.bancada?.replace("bancada-", "") || "";
  const statusInfo = STATUS_MAP[data?.status || ""] || {
    label: data?.status || "",
    color: "text-gray-600",
    bg: "bg-gray-50",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-gray-50 p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
              />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-gray-800 mb-2">
            Transmissão Indisponível
          </h1>
          <p className="text-gray-500 text-sm">
            {error || "Esta OS não possui transmissão ativa"}
          </p>
        </div>
      </div>
    );
  }

  const renderFullscreen = () => (
    <div className="relative min-h-dvh bg-black overflow-hidden select-none">
      {!iframeReady && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white/50 text-xs">Preparando transmissão...</p>
          </div>
        </div>
      )}
      {/* Overlay transparente captura todos os cliques */}
      <div
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={() => setShowUI((v) => !v)}
      />
      <iframe
        allow="autoplay; camera; microphone; display-capture"
        className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${iframeReady ? "opacity-100" : "opacity-0"}`}
        src={`${baseUrl}/stream.html?src=${data.bancada}&mode=mse`}
        style={{ border: "none" }}
        title="Stream"
      />
      <div
        className={`absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 transition-opacity duration-500 pointer-events-none ${showUI ? "opacity-100" : "opacity-0"}`}
      />
      <div
        className={`absolute top-0 left-0 right-0 z-20 transition-all duration-500 ${showUI ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}
      >
        <div className="px-4 pt-4 pb-8 flex items-center gap-3 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
          <div className="pointer-events-auto w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 backdrop-blur-sm">
            <Image
              alt="LogCell"
              className="rounded-full"
              height={24}
              src="/icon-192.png"
              width={24}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/70 truncate drop-shadow-lg">
              OS #{data.numero_os}
            </p>
            <p className="text-sm font-semibold text-white truncate drop-shadow-lg">
              {data.cliente_nome}
            </p>
          </div>
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              className="text-[11px] px-3 py-1.5 rounded-full bg-white/15 text-white/80 border border-white/20 backdrop-blur-sm hover:bg-white/25 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setFullscreen(false);
              }}
            >
              Sair
            </button>
          </div>
        </div>
      </div>
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-500 pointer-events-none ${showUI ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
      >
        <div className="px-4 pt-8 pb-4 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent">
          <span className="text-[11px] text-white/40">AO VIVO</span>
          <span className="text-[11px] text-white/30">
            Bancada {bancadaNumero}
          </span>
        </div>
      </div>
    </div>
  );

  const renderNormal = () => (
    <div className="min-h-dvh bg-gradient-to-b from-gray-50 to-white">
      {/* Video Section */}
      <div
        className="relative bg-black"
        style={{ height: "55vh", maxHeight: "480px" }}
      >
        {!iframeReady && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/80">
            <div className="text-center">
              <div className="w-9 h-9 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3" />
              <p className="text-white/50 text-xs">Preparando transmissão...</p>
            </div>
          </div>
        )}
        {/* Overlay transparente captura cliques no vídeo */}
        <div
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={() => setFullscreen(true)}
        />
        <iframe
          allow="autoplay; camera; microphone; display-capture"
          className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${iframeReady ? "opacity-100" : "opacity-0"}`}
          src={`${baseUrl}/stream.html?src=${data.bancada}&mode=mse`}
          style={{ border: "none" }}
          title="Stream"
        />
        {/* Gradient overlay bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        {/* Fullscreen button */}
        <button
          className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 text-white/80 text-[11px] border border-white/20 backdrop-blur-sm hover:bg-white/25 transition-colors"
          onClick={() => setFullscreen(true)}
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          Tela Cheia
        </button>
        {/* Bancada badge */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-green-500/30 text-green-300 border border-green-400/30 backdrop-blur-sm animate-pulse">
            AO VIVO
          </span>
          <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-white/60 border border-white/10 backdrop-blur-sm">
            Bancada {bancadaNumero}
          </span>
        </div>
      </div>

      {/* Info Section */}
      <div className="px-5 -mt-6 relative z-10">
        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-5 border border-gray-100/50">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Ordem de Serviço
                </span>
                <span className="text-xs text-gray-300">
                  # {data.numero_os}
                </span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                {data.cliente_nome}
              </h1>
            </div>
            <span
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusInfo.bg} ${statusInfo.color}`}
            >
              {statusInfo.label}
            </span>
          </div>

          {/* Equipment line */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-5 pb-4 border-b border-gray-100">
            <svg
              className="w-4 h-4 text-gray-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
              />
              <path
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
              />
            </svg>
            <span className="font-medium">{data.equipamento_tipo}</span>
            {data.equipamento_marca && (
              <span className="text-gray-400">• {data.equipamento_marca}</span>
            )}
            {data.equipamento_modelo && (
              <span className="text-gray-400">{data.equipamento_modelo}</span>
            )}
          </div>

          {/* Grid de Info */}
          <div className="grid grid-cols-2 gap-4">
            <InfoItem
              icon={
                <path
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                />
              }
              label="Técnico"
              value={data.tecnico_nome || "—"}
            />
            <InfoItem
              icon={
                <path
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                />
              }
              label="Previsão"
              value={
                data.previsao_entrega
                  ? new Date(data.previsao_entrega).toLocaleDateString("pt-BR")
                  : "—"
              }
            />
            <InfoItem
              icon={
                <path
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                />
              }
              label="Entrada"
              value={new Date(data.data_entrada).toLocaleDateString("pt-BR")}
            />
          </div>

          {/* Defeito */}
          {data.defeito_reclamado && (
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Defeito Reportado
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {data.defeito_reclamado}
              </p>
            </div>
          )}

          {/* Valor */}
          {data.valor_orcamento && data.valor_orcamento > 0 && (
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-500">Valor do Serviço</span>
              <span className="text-lg font-bold text-gray-900">
                {data.valor_orcamento.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between py-5 text-[11px] text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
              <Image alt="LogCell" height={14} src="/icon-192.png" width={14} />
            </div>
            <span>LogCell</span>
          </div>
          <span>Stream criptografado • v2.0</span>
        </div>
      </div>
    </div>
  );

  return fullscreen ? renderFullscreen() : renderNormal();
}

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {icon}
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}
