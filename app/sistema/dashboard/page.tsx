"use client";

import type { DadosDashboard, DesempenhoTecnico } from "@/types/dashboard";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ExclamationTriangleIcon,
  PrinterIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import { supabase } from "@/lib/supabaseClient";
import { DashboardService } from "@/services/dashboardService";
import { usePermissoes } from "@/hooks/usePermissoes";
import { ExecutiveOverview } from "@/components/dashboard/executive/ExecutiveOverview";
import { PeriodSelector } from "@/components/dashboard/executive/PeriodSelector";

export default function DashboardPage() {
  const router = useRouter();
  const hojeISO = useMemo(() => new Date().toISOString().split("T")[0], []);

  const primeiroDiaDoMes = useMemo(() => {
    const hoje = new Date();

    return new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      .toISOString()
      .split("T")[0];
  }, []);

  const [dados, setDados] = useState<DadosDashboard | null>(null);
  const [dadosAnterior, setDadosAnterior] = useState<DadosDashboard | null>(
    null,
  );
  const [filtroVersion, setFiltroVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { temPermissao, loading: permissoesLoading } = usePermissoes();

  const [dataInicio, setDataInicio] = useState<string>(primeiroDiaDoMes);
  const [dataFim, setDataFim] = useState<string>(hojeISO);
  const [lojaId, setLojaId] = useState<string>("");
  const [lojas, setLojas] = useState<Array<{ id: number; nome: string }>>([]);

  const [evolucaoVendas, setEvolucaoVendas] = useState<any[]>([]);
  const [top10Produtos, setTop10Produtos] = useState<any[]>([]);
  const [bottom10Produtos, setBottom10Produtos] = useState<any[]>([]);
  const [top10Clientes, setTop10Clientes] = useState<any[]>([]);
  const [top10Vendedores, setTop10Vendedores] = useState<any[]>([]);
  const [rankingLojas, setRankingLojas] = useState<any[]>([]);
  const [desempenhoTecnicos, setDesempenhoTecnicos] = useState<
    DesempenhoTecnico[]
  >([]);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null);
  const [agora, setAgora] = useState<number>(() => Date.now());

  const carregar = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DashboardService.buscarDadosDashboard({
        data_inicio: dataInicio || "2000-01-01",
        data_fim: dataFim || hojeISO,
        loja_id: lojaId ? Number(lojaId) : undefined,
      });

      setDados(data);

      try {
        const msDia = 86400000;
        const ini = new Date(`${dataInicio || hojeISO}T00:00:00`);
        const fim = new Date(`${dataFim || hojeISO}T00:00:00`);
        const dias = Math.max(
          1,
          Math.round((fim.getTime() - ini.getTime()) / msDia) + 1,
        );
        const prevFim = new Date(ini.getTime() - msDia);
        const prevIni = new Date(prevFim.getTime() - (dias - 1) * msDia);
        const fmt = (d: Date) => d.toISOString().split("T")[0];

        const dataAnterior = await DashboardService.buscarDadosDashboard({
          data_inicio: fmt(prevIni),
          data_fim: fmt(prevFim),
          loja_id: lojaId ? Number(lojaId) : undefined,
        });

        setDadosAnterior(dataAnterior);
      } catch {
        setDadosAnterior(null);
      }

      await carregarGraficos();
      setUltimaAtualizacao(new Date());
    } catch (err: any) {
      console.error(err);
      setError("Não foi possível carregar o dashboard.");
    } finally {
      setLoading(false);
    }
  };

  // Mantém o "atualizado há X" vivo sem recarregar dados
  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), 30000);

    return () => clearInterval(id);
  }, []);

  const textoAtualizacao = useMemo(() => {
    if (!ultimaAtualizacao) return "";
    const seg = Math.max(
      0,
      Math.floor((agora - ultimaAtualizacao.getTime()) / 1000),
    );

    if (seg < 60) return "agora mesmo";
    const min = Math.floor(seg / 60);

    if (min < 60) return `há ${min} min`;
    const h = Math.floor(min / 60);

    if (h < 24) return `há ${h} h`;

    return ultimaAtualizacao.toLocaleDateString("pt-BR");
  }, [agora, ultimaAtualizacao]);

  const carregarGraficos = async () => {
    try {
      const filtro = {
        data_inicio: dataInicio || "2000-01-01",
        data_fim: dataFim || hojeISO,
        loja_id: lojaId ? Number(lojaId) : undefined,
      };

      const [
        evolucao,
        produtos,
        bottomProdutos,
        clientes,
        vendedores,
        lojas,
        tecnicos,
      ] = await Promise.all([
        DashboardService.buscarEvolucaoVendas(filtro),
        DashboardService.buscarTop10Produtos(filtro),
        DashboardService.buscarBottom10Produtos(filtro),
        DashboardService.buscarTop10Clientes(filtro),
        DashboardService.buscarVendedoresRanking(filtro),
        DashboardService.buscarMetricasLojasRPC(filtro),
        DashboardService.buscarDesempenhoTecnicos(filtro),
      ]);

      setEvolucaoVendas(evolucao);
      setTop10Produtos(produtos);
      setBottom10Produtos(bottomProdutos);
      setTop10Clientes(clientes);
      setTop10Vendedores(vendedores);
      setRankingLojas(lojas);
      setDesempenhoTecnicos(tecnicos);
    } catch (err) {
      console.error("Erro ao carregar gráficos:", err);
    }
  };

  useEffect(() => {
    if (!permissoesLoading && temPermissao("dashboard.visualizar")) {
      carregar();
    }
  }, [permissoesLoading]);

  useEffect(() => {
    if (
      filtroVersion > 0 &&
      !permissoesLoading &&
      temPermissao("dashboard.visualizar")
    ) {
      carregar();
    }
  }, [filtroVersion]);

  useEffect(() => {
    supabase
      .from("lojas")
      .select("id, nome")
      .order("nome")
      .then(({ data, error }) => {
        if (error) {
          console.error("Erro ao buscar lojas:", error);

          return;
        }
        setLojas(data || []);
      });
  }, []);

  return (
    <div className="mx-auto max-w-[1600px] p-6 space-y-6">
      {permissoesLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-default-500">Carregando...</p>
          </div>
        </div>
      ) : !temPermissao("dashboard.visualizar") ? (
        <div className="rounded-xl border border-danger/30 bg-danger/5 text-danger px-6 py-4 flex items-center gap-3">
          <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold">Acesso Negado</h3>
            <p className="text-sm">
              Você não tem permissão para acessar o dashboard. Contacte um
              administrador para solicitar acesso.
            </p>
          </div>
        </div>
      ) : (
        <>
          <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Visão Geral
              </h1>
              <p className="text-sm text-default-500">
                Acompanhe os resultados da operação em tempo real
              </p>
            </div>
            <div className="flex items-center gap-3 print:hidden">
              {textoAtualizacao && (
                <span className="hidden items-center gap-1.5 text-xs text-default-400 sm:flex">
                  <ClockIcon className="h-3.5 w-3.5" />
                  Atualizado {textoAtualizacao}
                </span>
              )}
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-default-200 px-3 py-1.5 text-sm font-medium text-default-700 transition-colors hover:bg-default-100"
                type="button"
                onClick={() => window.print()}
              >
                <PrinterIcon className="h-4 w-4" />
                Imprimir
              </button>
            </div>
          </header>

          <div className="print:hidden">
            <PeriodSelector
              dataFim={dataFim}
              dataInicio={dataInicio}
              loading={loading}
              lojaId={lojaId}
              lojas={lojas}
              onLojaChange={(value) => {
                setLojaId(value);
                setFiltroVersion((v) => v + 1);
              }}
              onPeriodChange={(inicio, fim) => {
                setDataInicio(inicio);
                setDataFim(fim);
                setFiltroVersion((v) => v + 1);
              }}
              onRefresh={() => setFiltroVersion((v) => v + 1)}
            />
          </div>

          {error && (
            <div className="rounded-md border border-danger/30 bg-danger/5 text-danger px-4 py-3">
              {error}
            </div>
          )}

          <ExecutiveOverview
            bottom10Produtos={bottom10Produtos}
            dados={dados}
            dadosAnterior={dadosAnterior}
            dataFim={dataFim}
            dataInicio={dataInicio}
            desempenhoTecnicos={desempenhoTecnicos}
            evolucao={evolucaoVendas}
            evolucaoReceita={evolucaoVendas.map((e: any) =>
              Number(e?.receita || 0),
            )}
            loading={loading}
            lojaId={lojaId}
            rankingLojas={rankingLojas}
            refreshKey={filtroVersion}
            top10Clientes={top10Clientes}
            top10Produtos={top10Produtos}
            vendedores={top10Vendedores}
          />
        </>
      )}
    </div>
  );
}
