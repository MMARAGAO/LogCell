"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Target,
  Calendar,
  Clock,
  Award,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Info,
  Filter,
  AlertTriangle,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

import { useAuthContext } from "@/contexts/AuthContext";
import { usePermissoes } from "@/hooks/usePermissoes";
import { MetasService } from "@/services/metasService";

const TIMEZONE_DASHBOARD = "America/Sao_Paulo";

type PeriodoFiltro = "hoje" | "mes" | "personalizado";
type DetalheSelecionado =
  | "recebido_hoje"
  | "ticket"
  | "recebido_periodo"
  | "meta"
  | null;

const getDateKeyInTimezone = (value: string | Date) => {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE_DASHBOARD,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
};

const getDayBounds = (date: Date) => {
  const inicio = new Date(date);

  inicio.setHours(0, 0, 0, 0);

  const fim = new Date(date);

  fim.setHours(23, 59, 59, 999);

  return {
    inicio,
    fim,
  };
};

const getPreviousMonthSameDay = (date: Date) => {
  const ano = date.getFullYear();
  const mes = date.getMonth();
  const dia = date.getDate();
  const ultimoDiaMesAnterior = new Date(ano, mes, 0).getDate();
  const diaAjustado = Math.min(dia, ultimoDiaMesAnterior);

  return new Date(ano, mes - 1, diaAjustado);
};

const calcularMediana = (valores: number[]) => {
  if (valores.length === 0) return 0;
  const ordenado = [...valores].sort((a, b) => a - b);
  const meio = Math.floor(ordenado.length / 2);

  if (ordenado.length % 2 === 0) {
    return (ordenado[meio - 1] + ordenado[meio]) / 2;
  }

  return ordenado[meio];
};

const calcularVariacaoPercentual = (atual: number, base: number) => {
  if (base <= 0 && atual <= 0) return 0;
  if (base <= 0) return 100;

  return ((atual - base) / base) * 100;
};

const formatarHoraAtualizacao = (iso?: string | null) => {
  if (!iso) return "-";

  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface LojaOpcao {
  id: number;
  nome: string;
}

interface PagamentoDetalhe {
  id: string;
  venda_id: string;
  numero_venda: number;
  cliente_nome: string;
  loja_id?: number;
  tipo_pagamento: string;
  valor: number;
  data_pagamento: string;
  criado_em: string;
}

interface VendaAgregada {
  venda_id: string;
  numero_venda: number;
  cliente_nome: string;
  total_recebido: number;
}

interface PagamentoOSDetalhe {
  id: string;
  id_ordem_servico: string;
  numero_os: string;
  cliente_nome: string;
  valor: number;
  data_pagamento: string;
}

interface MetricasPessoais {
  vendasHoje: {
    total: number;
    quantidade: number;
    ticket_medio: number;
  };
  vendasMes: {
    total: number;
    quantidade: number;
    ticket_medio: number;
  };
  metaMensal: {
    valor: number;
    progresso: number;
    faltando: number;
  };
  metaDiaria: {
    valor: number;
    progresso: number;
    faltando: number;
  };
  metaProporcional: {
    esperadoAteHoje: number;
    progressoEsperado: number;
    desvio: number;
  };
  ordensServico: {
    aguardando: number;
    em_andamento: number;
    concluidas_mes: number;
  };
  ultimasVendas: Array<{
    id: string;
    numero_venda: number;
    valor_total: number;
    criado_em: string;
  }>;
  vendasPendentesRecebimentoTotal: number;
  vendasPendentesRecebimento: Array<{
    id: string;
    numero_venda: number;
    saldo_devedor: number;
    data_prevista_pagamento?: string;
    criado_em: string;
    cliente_nome?: string;
    status?: string;
  }>;
  vendasPendentesRecebimentoQuantidade: number;
  carteira: {
    aReceberMes: number;
    atrasado: number;
  };
  ticketQualidade: {
    mediana: number;
    top3: VendaAgregada[];
  };
  comparativos: {
    mesmoDiaSemanaPassada: number;
    mesmoDiaMesPassado: number;
    variacaoSemana: number;
    variacaoMes: number;
  };
  pagamentosHoje: PagamentoDetalhe[];
  pagamentosPeriodo: PagamentoDetalhe[];
  periodoEscopo: {
    tipo: PeriodoFiltro;
    dataInicio: string;
    dataFim: string;
    descricao: string;
    lojaDescricao: string;
  };
  exclusoesAplicadas: {
    semDataPagamento: number;
    creditoCliente: number;
    vendasCanceladas: number;
  };
  ganhosOS: {
    criterio: string;
    totalPeriodo: number;
    quantidadePagamentos: number;
    quantidadeOS: number;
    ticketMedioOS: number;
    ultimosPagamentos: PagamentoOSDetalhe[];
  };
  ultimaAtualizacao: string;
}

export default function DashboardPessoal() {
  const ITENS_POR_PAGINA_PENDENTES = 10;
  const ITENS_POR_PAGINA_DRILLDOWN = 10;
  const ITENS_POR_PAGINA_GANHOS_OS = 5;
  const { usuario } = useAuthContext();
  const { lojaId, perfil } = usePermissoes();
  const [metricas, setMetricas] = useState<MetricasPessoais | null>(null);
  const [loading, setLoading] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [metaMensal, setMetaMensal] = useState(10000);
  const [diasUteis, setDiasUteis] = useState(26);
  const [paginaPendentes, setPaginaPendentes] = useState(1);
  const [paginaDrilldown, setPaginaDrilldown] = useState(1);
  const [paginaGanhosOS, setPaginaGanhosOS] = useState(1);
  const [periodoFiltro, setPeriodoFiltro] = useState<PeriodoFiltro>("mes");
  const [dataInicioPersonalizada, setDataInicioPersonalizada] = useState(
    getDateKeyInTimezone(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    ),
  );
  const [dataFimPersonalizada, setDataFimPersonalizada] = useState(
    getDateKeyInTimezone(new Date()),
  );
  const [lojas, setLojas] = useState<LojaOpcao[]>([]);
  const [filtroLojaId, setFiltroLojaId] = useState<string>(
    lojaId ? String(lojaId) : "todas",
  );
  const [detalheSelecionado, setDetalheSelecionado] =
    useState<DetalheSelecionado>(null);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);
  const [erroDetalhe, setErroDetalhe] = useState<string | null>(null);

  useEffect(() => {
    if (!usuario) {
      console.warn("⚠️ Usuário não encontrado, aguardando...");

      return;
    }

    carregarLojas();
  }, [usuario, lojaId]);

  useEffect(() => {
    if (!usuario) return;
    carregarMetricas();
  }, [
    usuario,
    lojaId,
    periodoFiltro,
    dataInicioPersonalizada,
    dataFimPersonalizada,
    filtroLojaId,
  ]);

  useEffect(() => {
    setPaginaDrilldown(1);
  }, [detalheSelecionado]);

  const carregarLojas = async () => {
    if (!usuario || lojaId) return;

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
      const { data, error } = await supabase
        .from("lojas")
        .select("id, nome")
        .order("nome", { ascending: true });

      if (error) throw error;

      setLojas(
        (data || []).map((loja: any) => ({
          id: Number(loja.id),
          nome: String(loja.nome || `Loja ${loja.id}`),
        })),
      );
    } catch (error) {
      console.error("Erro ao carregar lojas:", error);
    }
  };

  const resolverIntervaloEscopo = (hoje: Date) => {
    if (periodoFiltro === "hoje") {
      const { inicio, fim } = getDayBounds(hoje);

      return {
        inicio,
        fim,
        descricao: "Hoje",
      };
    }

    if (periodoFiltro === "personalizado") {
      const inicio = new Date(`${dataInicioPersonalizada}T00:00:00`);
      const fim = new Date(`${dataFimPersonalizada}T23:59:59`);

      return {
        inicio,
        fim,
        descricao: `${new Date(`${dataInicioPersonalizada}T00:00:00`).toLocaleDateString("pt-BR")} a ${new Date(`${dataFimPersonalizada}T00:00:00`).toLocaleDateString("pt-BR")}`,
      };
    }

    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fim = new Date(
      hoje.getFullYear(),
      hoje.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    return {
      inicio,
      fim,
      descricao: "Mês atual",
    };
  };

  const buscarPagamentosRecebidos = async (
    supabase: any,
    usuarioId: string,
    inicioISO: string,
    fimISO: string,
    lojaEscopoId?: number,
  ) => {
    const tamanhoPagina = 1000;
    let pagina = 0;
    const pagamentos: any[] = [];

    while (true) {
      const inicio = pagina * tamanhoPagina;
      const fim = inicio + tamanhoPagina - 1;

      let queryPagamentos = supabase
        .from("pagamentos_venda")
        .select(
          `
            id,
            venda_id,
            valor,
            tipo_pagamento,
            data_pagamento,
            criado_em,
            venda:vendas!inner(
              id,
              numero_venda,
              vendedor_id,
              loja_id,
              status,
              cliente:clientes(nome)
            )
          `,
        )
        .eq("venda.vendedor_id", usuarioId)
        .not("data_pagamento", "is", null)
        .neq("tipo_pagamento", "credito_cliente")
        .gte("data_pagamento", inicioISO)
        .lte("data_pagamento", fimISO)
        .order("criado_em", { ascending: false })
        .range(inicio, fim);

      if (lojaEscopoId) {
        queryPagamentos = queryPagamentos.eq("venda.loja_id", lojaEscopoId);
      }

      const { data, error } = await queryPagamentos;

      if (error) throw error;

      const lote = data || [];

      pagamentos.push(...lote);

      if (lote.length < tamanhoPagina) break;

      pagina += 1;
    }

    return pagamentos;
  };

  const buscarPagamentosOS = async (
    supabase: any,
    usuarioId: string,
    perfilAtual: string,
    inicioISO: string,
    fimISO: string,
    lojaEscopoId?: number,
  ) => {
    const tamanhoPagina = 1000;
    let pagina = 0;
    const pagamentosOS: any[] = [];

    while (true) {
      const inicio = pagina * tamanhoPagina;
      const fim = inicio + tamanhoPagina - 1;

      let queryPagamentosOS = supabase
        .from("ordem_servico_pagamentos")
        .select(
          `
            id,
            id_ordem_servico,
            valor,
            data_pagamento,
            os:ordem_servico!inner(
              id,
              numero_os,
              cliente_nome,
              tecnico_responsavel,
              id_loja,
              status
            )
          `,
        )
        .gte("data_pagamento", inicioISO)
        .lte("data_pagamento", fimISO)
        .order("data_pagamento", { ascending: false })
        .range(inicio, fim);

      if (perfilAtual === "tecnico") {
        queryPagamentosOS = queryPagamentosOS.eq(
          "os.tecnico_responsavel",
          usuarioId,
        );
      } else {
        queryPagamentosOS = queryPagamentosOS.eq("os.criado_por", usuarioId);
      }

      if (lojaEscopoId) {
        queryPagamentosOS = queryPagamentosOS.eq("os.id_loja", lojaEscopoId);
      }

      const { data, error } = await queryPagamentosOS;

      if (error) throw error;

      const lote = data || [];

      pagamentosOS.push(...lote);

      if (lote.length < tamanhoPagina) break;

      pagina += 1;
    }

    return pagamentosOS;
  };

  const mapearPagamentos = (pagamentos: any[]): PagamentoDetalhe[] => {
    return pagamentos
      .filter((pagamento) => pagamento?.venda?.status !== "cancelada")
      .map((pagamento) => ({
        id: String(pagamento.id),
        venda_id: String(pagamento.venda_id),
        numero_venda: Number(pagamento.venda?.numero_venda || 0),
        cliente_nome: pagamento.venda?.cliente?.nome || "Cliente não informado",
        loja_id: pagamento.venda?.loja_id
          ? Number(pagamento.venda?.loja_id)
          : undefined,
        tipo_pagamento: String(pagamento.tipo_pagamento || "-"),
        valor: Number(pagamento.valor || 0),
        data_pagamento: String(pagamento.data_pagamento || pagamento.criado_em),
        criado_em: String(pagamento.criado_em || pagamento.data_pagamento),
      }));
  };

  const carregarMetricas = async (forcarRefresh?: boolean) => {
    if (!usuario) return;

    if (forcarRefresh) {
      setAtualizando(true);
    } else {
      setLoading(true);
    }

    setErroCarregamento(null);
    setErroDetalhe(null);
    setPaginaPendentes(1);
    setPaginaDrilldown(1);
    setPaginaGanhosOS(1);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    try {
      // Carregar metas do usuário
      const metaUsuario = await MetasService.buscarMetaUsuario(
        usuario.id,
        lojaId || undefined,
      );

      let metaMensalAtual = 10000;
      let diasUteisAtual = 26;

      if (metaUsuario) {
        metaMensalAtual = metaUsuario.meta_mensal_vendas;
        diasUteisAtual = metaUsuario.dias_uteis_mes;
        setMetaMensal(metaUsuario.meta_mensal_vendas);
        setDiasUteis(metaUsuario.dias_uteis_mes);
      } else {
        setMetaMensal(10000);
        setDiasUteis(26);
      }
      const hoje = new Date();
      const chaveHoje = getDateKeyInTimezone(hoje);

      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fimMes = new Date(
        hoje.getFullYear(),
        hoje.getMonth() + 1,
        0,
        23,
        59,
        59,
      );
      const inicioMesISO = inicioMes.toISOString();
      const fimMesISO = fimMes.toISOString();

      const escopo = resolverIntervaloEscopo(hoje);
      const inicioEscopoISO = escopo.inicio.toISOString();
      const fimEscopoISO = escopo.fim.toISOString();

      if (periodoFiltro === "personalizado" && escopo.inicio > escopo.fim) {
        throw new Error(
          "Período personalizado inválido: a data inicial é maior que a final.",
        );
      }

      const lojaEscopoId =
        lojaId || (filtroLojaId !== "todas" ? Number(filtroLojaId) : undefined);

      const pagamentosMesRaw = await buscarPagamentosRecebidos(
        supabase,
        usuario.id,
        inicioMesISO,
        fimMesISO,
        lojaEscopoId,
      );
      const pagamentosEscopoRaw = await buscarPagamentosRecebidos(
        supabase,
        usuario.id,
        inicioEscopoISO,
        fimEscopoISO,
        lojaEscopoId,
      );

      let queryExcluidos = supabase
        .from("pagamentos_venda")
        .select(
          `
          id,
          tipo_pagamento,
          data_pagamento,
          venda:vendas!inner(vendedor_id, loja_id, status)
        `,
        )
        .eq("venda.vendedor_id", usuario.id)
        .gte("criado_em", inicioMesISO)
        .lte("criado_em", fimMesISO);

      if (lojaEscopoId) {
        queryExcluidos = queryExcluidos.eq("venda.loja_id", lojaEscopoId);
      }

      const { data: pagamentosExcluidosRaw } = await queryExcluidos;

      const exclusoesAplicadas = (pagamentosExcluidosRaw || []).reduce(
        (acumulado: any, pagamento: any) => {
          if (!pagamento.data_pagamento) {
            acumulado.semDataPagamento += 1;
          }
          if (pagamento.tipo_pagamento === "credito_cliente") {
            acumulado.creditoCliente += 1;
          }
          if (pagamento.venda?.status === "cancelada") {
            acumulado.vendasCanceladas += 1;
          }

          return acumulado;
        },
        {
          semDataPagamento: 0,
          creditoCliente: 0,
          vendasCanceladas: 0,
        },
      );

      const pagamentosMes = mapearPagamentos(pagamentosMesRaw);
      const pagamentosPeriodo = mapearPagamentos(pagamentosEscopoRaw);

      const chaveMesAtual = chaveHoje.slice(0, 7);
      let totalRecebidoHoje = 0;
      let totalRecebidoMes = 0;
      const vendasMesSet = new Set<string>();
      const vendasPeriodoSet = new Set<string>();
      const vendasHojeMap = new Map<
        string,
        {
          id: string;
          numero_venda: number;
          valor_total: number;
          criado_em: string;
        }
      >();

      pagamentosMes.forEach((pagamento) => {
        const dataReferencia = pagamento.data_pagamento;
        const dataHoraPagamento = pagamento.criado_em || dataReferencia;

        if (!dataReferencia || !pagamento.venda_id) return;

        const chaveData = getDateKeyInTimezone(dataReferencia);
        const valorPagamento = Number(pagamento.valor || 0);
        const vendaId = String(pagamento.venda_id);

        if (chaveData.startsWith(chaveMesAtual)) {
          totalRecebidoMes += valorPagamento;
          vendasMesSet.add(vendaId);
        }

        if (chaveData === chaveHoje) {
          totalRecebidoHoje += valorPagamento;
          const existente = vendasHojeMap.get(vendaId);
          const numeroVenda = Number(pagamento.numero_venda || 0);

          if (!existente) {
            vendasHojeMap.set(vendaId, {
              id: vendaId,
              numero_venda: numeroVenda,
              valor_total: valorPagamento,
              criado_em: dataHoraPagamento,
            });
          } else {
            const dataExistente = new Date(existente.criado_em).getTime();
            const dataAtual = new Date(dataHoraPagamento).getTime();

            existente.valor_total += valorPagamento;
            if (dataAtual > dataExistente) {
              existente.criado_em = dataHoraPagamento;
            }
          }
        }
      });

      let totalRecebidoPeriodo = 0;

      pagamentosPeriodo.forEach((pagamento) => {
        const valorPagamento = Number(pagamento.valor || 0);

        totalRecebidoPeriodo += valorPagamento;
        vendasPeriodoSet.add(String(pagamento.venda_id));
      });

      const quantidadeHoje = vendasHojeMap.size;
      const quantidadeMes = vendasMesSet.size;
      const quantidadePeriodo = vendasPeriodoSet.size;
      const ticketMedio =
        quantidadeHoje > 0 ? totalRecebidoHoje / quantidadeHoje : 0;
      const ticketMedioMes =
        quantidadeMes > 0 ? totalRecebidoMes / quantidadeMes : 0;
      const ticketMedioPeriodo =
        quantidadePeriodo > 0 ? totalRecebidoPeriodo / quantidadePeriodo : 0;

      const vendasAgregadasMap = new Map<string, VendaAgregada>();

      pagamentosPeriodo.forEach((pagamento) => {
        const vendaId = String(pagamento.venda_id);
        const atual = vendasAgregadasMap.get(vendaId);

        if (!atual) {
          vendasAgregadasMap.set(vendaId, {
            venda_id: vendaId,
            numero_venda: pagamento.numero_venda,
            cliente_nome: pagamento.cliente_nome,
            total_recebido: pagamento.valor,
          });

          return;
        }

        atual.total_recebido += pagamento.valor;
      });

      const vendasAgregadas = Array.from(vendasAgregadasMap.values());
      const medianaTicket = calcularMediana(
        vendasAgregadas.map((venda) => venda.total_recebido),
      );
      const vendasAgregadasMesMap = new Map<string, VendaAgregada>();

      pagamentosMes.forEach((pagamento) => {
        const vendaId = String(pagamento.venda_id);
        const atual = vendasAgregadasMesMap.get(vendaId);

        if (!atual) {
          vendasAgregadasMesMap.set(vendaId, {
            venda_id: vendaId,
            numero_venda: pagamento.numero_venda,
            cliente_nome: pagamento.cliente_nome,
            total_recebido: pagamento.valor,
          });

          return;
        }

        atual.total_recebido += pagamento.valor;
      });

      const top3Vendas = Array.from(vendasAgregadasMesMap.values())
        .sort((a, b) => b.total_recebido - a.total_recebido)
        .slice(0, 3);

      // Calcular meta diária usando os dias úteis configurados
      const metaDiariaValor =
        diasUteisAtual > 0 ? metaMensalAtual / diasUteisAtual : 0;

      // Progresso das metas
      const progressoMensal =
        metaMensalAtual > 0 ? (totalRecebidoMes / metaMensalAtual) * 100 : 0;
      const faltandoMensal = Math.max(0, metaMensalAtual - totalRecebidoMes);
      const progressoDiario =
        metaDiariaValor > 0 ? (totalRecebidoHoje / metaDiariaValor) * 100 : 0;
      const faltandoDiario = Math.max(0, metaDiariaValor - totalRecebidoHoje);

      const diaDoMesAtual = hoje.getDate();
      const totalDiasMesAtual = new Date(
        hoje.getFullYear(),
        hoje.getMonth() + 1,
        0,
      ).getDate();
      const fracaoMes =
        totalDiasMesAtual > 0 ? diaDoMesAtual / totalDiasMesAtual : 0;
      const metaEsperadaAteHoje = metaMensalAtual * fracaoMes;
      const desvioMetaProporcional = totalRecebidoMes - metaEsperadaAteHoje;
      const progressoEsperado =
        metaMensalAtual > 0 ? (metaEsperadaAteHoje / metaMensalAtual) * 100 : 0;

      const seteDiasAtras = new Date(hoje);

      seteDiasAtras.setDate(hoje.getDate() - 7);
      const diaMesPassado = getPreviousMonthSameDay(hoje);

      const { inicio: semanaPassadaInicio, fim: semanaPassadaFim } =
        getDayBounds(seteDiasAtras);
      const { inicio: mesPassadoInicio, fim: mesPassadoFim } =
        getDayBounds(diaMesPassado);

      const pagamentosSemanaPassada = mapearPagamentos(
        await buscarPagamentosRecebidos(
          supabase,
          usuario.id,
          semanaPassadaInicio.toISOString(),
          semanaPassadaFim.toISOString(),
          lojaEscopoId,
        ),
      );
      const pagamentosMesPassado = mapearPagamentos(
        await buscarPagamentosRecebidos(
          supabase,
          usuario.id,
          mesPassadoInicio.toISOString(),
          mesPassadoFim.toISOString(),
          lojaEscopoId,
        ),
      );

      const totalSemanaPassada = pagamentosSemanaPassada.reduce(
        (acumulado, pagamento) => acumulado + pagamento.valor,
        0,
      );
      const totalMesPassado = pagamentosMesPassado.reduce(
        (acumulado, pagamento) => acumulado + pagamento.valor,
        0,
      );

      const pagamentosOSRaw = await buscarPagamentosOS(
        supabase,
        usuario.id,
        perfil || "",
        inicioEscopoISO,
        fimEscopoISO,
        lojaEscopoId,
      );
      const pagamentosOSDetalhes: PagamentoOSDetalhe[] = (pagamentosOSRaw || [])
        .filter((pagamento: any) => pagamento?.os?.status !== "cancelado")
        .map((pagamento: any) => ({
          id: String(pagamento.id),
          id_ordem_servico: String(pagamento.id_ordem_servico),
          numero_os: String(pagamento.os?.numero_os || "-"),
          cliente_nome: String(
            pagamento.os?.cliente_nome || "Cliente não informado",
          ),
          valor: Number(pagamento.valor || 0),
          data_pagamento: String(pagamento.data_pagamento),
        }));

      const totalGanhosOSPeriodo = pagamentosOSDetalhes.reduce(
        (acumulado, pagamento) => acumulado + pagamento.valor,
        0,
      );
      const osUnicas = new Set(
        pagamentosOSDetalhes.map((pagamento) => pagamento.id_ordem_servico),
      );
      const ticketMedioOS =
        osUnicas.size > 0 ? totalGanhosOSPeriodo / osUnicas.size : 0;

      // Ordens de serviço (se for técnico)
      let ordensServico = {
        aguardando: 0,
        em_andamento: 0,
        concluidas_mes: 0,
      };

      if (perfil === "tecnico") {
        const { count: osAguardandoCount } = await supabase
          .from("ordem_servico")
          .select("id", { count: "exact", head: true })
          .eq("tecnico_responsavel", usuario.id)
          .eq("status", "aguardando");

        const { count: osAndamentoCount } = await supabase
          .from("ordem_servico")
          .select("id", { count: "exact", head: true })
          .eq("tecnico_responsavel", usuario.id)
          .in("status", ["em_andamento", "em_diagnostico"]);

        const { count: osConcluidasCount } = await supabase
          .from("ordem_servico")
          .select("id", { count: "exact", head: true })
          .eq("tecnico_responsavel", usuario.id)
          .eq("status", "concluida")
          .gte("data_conclusao", inicioMes.toISOString())
          .lte("data_conclusao", fimMes.toISOString());

        ordensServico = {
          aguardando: osAguardandoCount || 0,
          em_andamento: osAndamentoCount || 0,
          concluidas_mes: osConcluidasCount || 0,
        };
      }

      // Últimas 5 vendas (por data)
      let queryVendasPendentes = supabase
        .from("vendas")
        .select(
          "id, numero_venda, valor_total, valor_pago, data_prevista_pagamento, criado_em, status, cliente:clientes(nome)",
        )
        .eq("vendedor_id", usuario.id)
        .neq("status", "cancelada")
        .order("data_prevista_pagamento", { ascending: true })
        .order("criado_em", { ascending: false });

      if (lojaEscopoId) {
        queryVendasPendentes = queryVendasPendentes.eq("loja_id", lojaEscopoId);
      }

      const { data: vendasPendentes, error: erroVendasPendentes } =
        await queryVendasPendentes;

      if (erroVendasPendentes) {
        throw erroVendasPendentes;
      }

      const listaPendentes = (vendasPendentes || [])
        .map((venda: any) => {
          const valorTotal = Number(venda.valor_total || 0);
          const valorPago = Number(venda.valor_pago || 0);
          const saldoDevedor = Math.max(0, valorTotal - valorPago);

          return {
            id: String(venda.id),
            numero_venda: Number(venda.numero_venda || 0),
            saldo_devedor: saldoDevedor,
            data_prevista_pagamento: venda.data_prevista_pagamento || undefined,
            criado_em: venda.criado_em,
            cliente_nome: venda.cliente?.nome || undefined,
            status: venda.status || undefined,
          };
        })
        .filter((venda) => venda.saldo_devedor > 0);

      const totalPendenteReceber = listaPendentes.reduce(
        (acumulado, venda) => acumulado + venda.saldo_devedor,
        0,
      );

      const inicioMesKey = getDateKeyInTimezone(inicioMes);
      const fimMesKey = getDateKeyInTimezone(fimMes);

      const aReceberMes = listaPendentes.reduce((acumulado, venda) => {
        if (!venda.data_prevista_pagamento) return acumulado;

        const chaveVencimento = getDateKeyInTimezone(
          venda.data_prevista_pagamento,
        );

        if (chaveVencimento >= inicioMesKey && chaveVencimento <= fimMesKey) {
          return acumulado + venda.saldo_devedor;
        }

        return acumulado;
      }, 0);

      const atrasado = listaPendentes.reduce((acumulado, venda) => {
        if (!venda.data_prevista_pagamento) return acumulado;

        const chaveVencimento = getDateKeyInTimezone(
          venda.data_prevista_pagamento,
        );

        if (chaveVencimento < chaveHoje) {
          return acumulado + venda.saldo_devedor;
        }

        return acumulado;
      }, 0);

      const ultimasVendasArray = Array.from(vendasHojeMap.values())
        .sort((a, b) => {
          const dataA = new Date(a.criado_em).getTime();
          const dataB = new Date(b.criado_em).getTime();

          return dataB - dataA;
        })
        .slice(0, 5);

      setMetricas({
        vendasHoje: {
          total: totalRecebidoHoje,
          quantidade: quantidadeHoje,
          ticket_medio: ticketMedio,
        },
        vendasMes: {
          total: totalRecebidoPeriodo,
          quantidade: quantidadePeriodo,
          ticket_medio: ticketMedioPeriodo,
        },
        metaMensal: {
          valor: metaMensalAtual,
          progresso: progressoMensal,
          faltando: faltandoMensal,
        },
        metaDiaria: {
          valor: metaDiariaValor,
          progresso: progressoDiario,
          faltando: faltandoDiario,
        },
        metaProporcional: {
          esperadoAteHoje: metaEsperadaAteHoje,
          progressoEsperado,
          desvio: desvioMetaProporcional,
        },
        ordensServico,
        ultimasVendas: ultimasVendasArray,
        vendasPendentesRecebimentoTotal: totalPendenteReceber,
        vendasPendentesRecebimento: listaPendentes,
        vendasPendentesRecebimentoQuantidade: listaPendentes.length,
        carteira: {
          aReceberMes,
          atrasado,
        },
        ticketQualidade: {
          mediana: medianaTicket,
          top3: top3Vendas,
        },
        comparativos: {
          mesmoDiaSemanaPassada: totalSemanaPassada,
          mesmoDiaMesPassado: totalMesPassado,
          variacaoSemana: calcularVariacaoPercentual(
            totalRecebidoHoje,
            totalSemanaPassada,
          ),
          variacaoMes: calcularVariacaoPercentual(
            totalRecebidoHoje,
            totalMesPassado,
          ),
        },
        pagamentosHoje: pagamentosPeriodo.filter(
          (pagamento) =>
            getDateKeyInTimezone(pagamento.data_pagamento) === chaveHoje,
        ),
        pagamentosPeriodo,
        periodoEscopo: {
          tipo: periodoFiltro,
          dataInicio: getDateKeyInTimezone(escopo.inicio),
          dataFim: getDateKeyInTimezone(escopo.fim),
          descricao: escopo.descricao,
          lojaDescricao: lojaEscopoId
            ? lojas.find((loja) => loja.id === lojaEscopoId)?.nome ||
              `Loja ${lojaEscopoId}`
            : "Todas as lojas",
        },
        exclusoesAplicadas,
        ganhosOS: {
          criterio:
            perfil === "tecnico"
              ? "OS em que você é técnico responsável"
              : "OS criadas por você",
          totalPeriodo: totalGanhosOSPeriodo,
          quantidadePagamentos: pagamentosOSDetalhes.length,
          quantidadeOS: osUnicas.size,
          ticketMedioOS,
          ultimosPagamentos: pagamentosOSDetalhes,
        },
        ultimaAtualizacao: new Date().toISOString(),
      });

      if (ticketMedioMes !== ticketMedioPeriodo && periodoFiltro !== "mes") {
        setErroDetalhe(
          "O card de meta usa sempre o mês atual, enquanto ticket e recebido seguem o período selecionado.",
        );
      }
    } catch (error) {
      console.error("Erro ao carregar métricas:", error);
      setErroCarregamento(
        error instanceof Error
          ? error.message
          : "Falha ao carregar o dashboard pessoal.",
      );
    } finally {
      setLoading(false);
      setAtualizando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner label="Carregando seu dashboard..." size="lg" />
      </div>
    );
  }

  if (!metricas) {
    return (
      <Card>
        <CardBody>
          <p className="text-center text-default-500">
            Não foi possível carregar as métricas
          </p>
        </CardBody>
      </Card>
    );
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const totalPaginasPendentes = Math.max(
    1,
    Math.ceil(
      metricas.vendasPendentesRecebimentoQuantidade /
        ITENS_POR_PAGINA_PENDENTES,
    ),
  );
  const paginaPendentesAtual = Math.min(
    Math.max(paginaPendentes, 1),
    totalPaginasPendentes,
  );
  const inicioPendentes =
    (paginaPendentesAtual - 1) * ITENS_POR_PAGINA_PENDENTES;
  const fimPendentes = inicioPendentes + ITENS_POR_PAGINA_PENDENTES;
  const vendasPendentesPaginadas = metricas.vendasPendentesRecebimento.slice(
    inicioPendentes,
    fimPendentes,
  );

  const registrosDrilldown = (() => {
    if (!metricas) return [];

    if (detalheSelecionado === "recebido_hoje") {
      return metricas.pagamentosHoje;
    }

    if (
      detalheSelecionado === "ticket" ||
      detalheSelecionado === "recebido_periodo" ||
      detalheSelecionado === "meta"
    ) {
      return metricas.pagamentosPeriodo;
    }

    return [];
  })();

  const tituloDrilldown = (() => {
    if (detalheSelecionado === "recebido_hoje")
      return "Detalhes de Recebido Hoje";
    if (detalheSelecionado === "ticket") return "Detalhes do Ticket no Período";
    if (detalheSelecionado === "recebido_periodo")
      return "Detalhes de Recebido no Período";
    if (detalheSelecionado === "meta") return "Pagamentos que compõem a Meta";

    return "";
  })();

  const totalPaginasDrilldown = Math.max(
    1,
    Math.ceil(registrosDrilldown.length / ITENS_POR_PAGINA_DRILLDOWN),
  );
  const paginaDrilldownAtual = Math.min(
    Math.max(paginaDrilldown, 1),
    totalPaginasDrilldown,
  );
  const inicioDrilldown =
    (paginaDrilldownAtual - 1) * ITENS_POR_PAGINA_DRILLDOWN;
  const fimDrilldown = inicioDrilldown + ITENS_POR_PAGINA_DRILLDOWN;
  const registrosDrilldownPaginados = registrosDrilldown.slice(
    inicioDrilldown,
    fimDrilldown,
  );

  const totalPaginasGanhosOS = Math.max(
    1,
    Math.ceil(
      metricas.ganhosOS.ultimosPagamentos.length / ITENS_POR_PAGINA_GANHOS_OS,
    ),
  );
  const paginaGanhosOSAtual = Math.min(
    Math.max(paginaGanhosOS, 1),
    totalPaginasGanhosOS,
  );
  const inicioGanhosOS = (paginaGanhosOSAtual - 1) * ITENS_POR_PAGINA_GANHOS_OS;
  const fimGanhosOS = inicioGanhosOS + ITENS_POR_PAGINA_GANHOS_OS;
  const pagamentosOSPaginados = metricas.ganhosOS.ultimosPagamentos.slice(
    inicioGanhosOS,
    fimGanhosOS,
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {erroCarregamento ? (
        <Card
          className="border border-danger-200 bg-danger-50 dark:bg-danger-900/20"
          id="detalhes-calculo"
        >
          <CardBody className="flex items-start gap-3 py-5">
            <div className="flex items-center gap-2 text-danger-600">
              <AlertTriangle className="w-5 h-5" />
              <p className="font-semibold">
                Não foi possível atualizar os dados do dashboard.
              </p>
            </div>
            <p className="text-sm text-danger-700 dark:text-danger-200">
              {erroCarregamento}
            </p>
            <div className="flex items-center gap-2">
              <Button
                color="danger"
                size="sm"
                variant="flat"
                onPress={() => carregarMetricas(true)}
              >
                Tentar novamente
              </Button>
              <Button
                as="a"
                color="danger"
                href="#detalhes-calculo"
                size="sm"
                variant="light"
              >
                Ver detalhes do cálculo
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : null}

      <Card className="border-none shadow-md">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary-500" />
            <div>
              <p className="font-bold text-default-900">Escopo do Dashboard</p>
              <p className="text-sm text-default-500">
                Loja: {metricas?.periodoEscopo.lojaDescricao || "-"} | Período:{" "}
                {metricas?.periodoEscopo.descricao || "-"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs text-default-500">
              Atualizado às{" "}
              {formatarHoraAtualizacao(metricas?.ultimaAtualizacao)}
            </p>
            <Button
              color="primary"
              isLoading={atualizando}
              size="sm"
              startContent={<RefreshCw className="w-4 h-4" />}
              variant="flat"
              onPress={() => carregarMetricas(true)}
            >
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="text-sm text-default-700">
            <span className="block mb-1 font-semibold">Período</span>
            <select
              className="w-full rounded-lg border border-default-200 bg-default-50 px-3 py-2"
              value={periodoFiltro}
              onChange={(event) =>
                setPeriodoFiltro(event.target.value as PeriodoFiltro)
              }
            >
              <option value="hoje">Hoje</option>
              <option value="mes">Mês atual</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </label>
          <label className="text-sm text-default-700">
            <span className="block mb-1 font-semibold">Loja</span>
            <select
              className="w-full rounded-lg border border-default-200 bg-default-50 px-3 py-2"
              disabled={Boolean(lojaId)}
              value={lojaId ? String(lojaId) : filtroLojaId}
              onChange={(event) => setFiltroLojaId(event.target.value)}
            >
              {!lojaId ? <option value="todas">Todas as lojas</option> : null}
              {lojas.map((loja) => (
                <option key={loja.id} value={String(loja.id)}>
                  {loja.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-default-700">
            <span className="block mb-1 font-semibold">Data inicial</span>
            <input
              className="w-full rounded-lg border border-default-200 bg-default-50 px-3 py-2"
              disabled={periodoFiltro !== "personalizado"}
              type="date"
              value={dataInicioPersonalizada}
              onChange={(event) =>
                setDataInicioPersonalizada(event.target.value)
              }
            />
          </label>
          <label className="text-sm text-default-700">
            <span className="block mb-1 font-semibold">Data final</span>
            <input
              className="w-full rounded-lg border border-default-200 bg-default-50 px-3 py-2"
              disabled={periodoFiltro !== "personalizado"}
              type="date"
              value={dataFimPersonalizada}
              onChange={(event) => setDataFimPersonalizada(event.target.value)}
            />
          </label>
        </CardBody>
      </Card>

      {/* Cabeçalho */}
      <div className="relative overflow-hidden rounded-2xl bg-primary-600 p-10 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl font-bold tracking-tight">
              Olá, {usuario?.nome?.split(" ")[0]}! 👋
            </h1>
          </div>
          <p className="text-white/90 text-lg">
            Aqui está o resumo do seu desempenho hoje
          </p>
          <div className="mt-4">
            <div className="inline-block px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-sm">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </div>
          </div>
        </div>
      </div>

      <Card
        className="border border-primary-100 bg-primary-50/70 dark:bg-primary-900/10"
        id="detalhes-calculo"
      >
        <CardBody className="py-4 space-y-2">
          <p className="text-sm font-semibold text-primary-700 dark:text-primary-300">
            Critério do cálculo de recebimento
          </p>
          <p className="text-sm text-default-600">
            Considera apenas pagamentos com data de pagamento preenchida, exclui
            crédito de cliente e vendas canceladas.
          </p>
          <div className="flex flex-wrap gap-2">
            <Chip size="sm" variant="flat">
              Sem data: {metricas.exclusoesAplicadas.semDataPagamento}
            </Chip>
            <Chip size="sm" variant="flat">
              Crédito cliente: {metricas.exclusoesAplicadas.creditoCliente}
            </Chip>
            <Chip size="sm" variant="flat">
              Venda cancelada: {metricas.exclusoesAplicadas.vendasCanceladas}
            </Chip>
          </div>
          {erroDetalhe ? (
            <p className="text-xs text-warning-700">{erroDetalhe}</p>
          ) : null}
        </CardBody>
      </Card>

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Vendas de Hoje */}
        <div className="animate-in slide-in-from-bottom-4 duration-500 delay-100">
          <Card className="border-none shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 duration-300">
            <CardBody className="gap-3 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30">
                  <ShoppingCart className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <span className="text-sm font-semibold text-default-600 uppercase tracking-wide flex items-center gap-1">
                  Recebido Hoje
                  <Info className="w-3.5 h-3.5 text-default-400" />
                </span>
              </div>
              <div>
                <p className="text-3xl font-bold text-default-900">
                  {formatarMoeda(metricas.vendasHoje.total)}
                </p>
                <p className="text-sm text-default-500 mt-1">
                  {metricas.vendasHoje.quantidade} vendas
                </p>
                <Button
                  className="mt-3"
                  size="sm"
                  variant="flat"
                  onPress={() => setDetalheSelecionado("recebido_hoje")}
                >
                  Ver registros
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Ticket Médio */}
        <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
          <Card className="border-none shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 duration-300">
            <CardBody className="gap-3 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-success-100 dark:bg-success-900/30">
                  <DollarSign className="w-5 h-5 text-success-600 dark:text-success-400" />
                </div>
                <span className="text-sm font-semibold text-default-600 uppercase tracking-wide flex items-center gap-1">
                  Ticket Médio
                  <Info className="w-3.5 h-3.5 text-default-400" />
                </span>
              </div>
              <div>
                <p className="text-3xl font-bold text-default-900">
                  {formatarMoeda(metricas.vendasMes.ticket_medio)}
                </p>
                <p className="text-sm text-default-500 mt-1">
                  por venda recebida no período
                </p>
                <Button
                  className="mt-3"
                  size="sm"
                  variant="flat"
                  onPress={() => setDetalheSelecionado("ticket")}
                >
                  Ver registros
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Vendas do Mês */}
        <div className="animate-in slide-in-from-bottom-4 duration-500 delay-300">
          <Card className="border-none shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 duration-300">
            <CardBody className="gap-3 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-warning-100 dark:bg-warning-900/30">
                  <TrendingUp className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                </div>
                <span className="text-sm font-semibold text-default-600 uppercase tracking-wide flex items-center gap-1">
                  Recebido no Período
                  <Info className="w-3.5 h-3.5 text-default-400" />
                </span>
              </div>
              <div>
                <p className="text-3xl font-bold text-default-900">
                  {formatarMoeda(metricas.vendasMes.total)}
                </p>
                <p className="text-sm text-default-500 mt-1">
                  {metricas.vendasMes.quantidade} vendas
                </p>
                <Button
                  className="mt-3"
                  size="sm"
                  variant="flat"
                  onPress={() => setDetalheSelecionado("recebido_periodo")}
                >
                  Ver registros
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Meta do Mês */}
        <div className="animate-in slide-in-from-bottom-4 duration-500 delay-400">
          <Card className="border-none shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 duration-300">
            <CardBody className="gap-3 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-secondary-100 dark:bg-secondary-900/30">
                  <Target className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                </div>
                <span className="text-sm font-semibold text-default-600 uppercase tracking-wide">
                  Meta de Recebimento
                </span>
              </div>
              <div>
                <p className="text-3xl font-bold text-default-900">
                  {metricas.metaMensal.progresso.toFixed(0)}%
                </p>
                <p className="text-sm text-default-500 mt-1">
                  Falta {formatarMoeda(metricas.metaMensal.faltando)}
                </p>
                <Button
                  className="mt-3"
                  size="sm"
                  variant="flat"
                  onPress={() => setDetalheSelecionado("meta")}
                >
                  Ver registros
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500 delay-450">
        <Card className="border-none shadow-md">
          <CardBody className="gap-2 p-6">
            <p className="text-sm font-semibold text-default-600 uppercase tracking-wide">
              A Receber no Mês
            </p>
            <p className="text-2xl font-bold text-warning-600">
              {formatarMoeda(metricas.carteira.aReceberMes)}
            </p>
            <p className="text-xs text-default-500">
              Somente saldos de vendas com vencimento no mês atual
            </p>
          </CardBody>
        </Card>
        <Card className="border-none shadow-md">
          <CardBody className="gap-2 p-6">
            <p className="text-sm font-semibold text-default-600 uppercase tracking-wide">
              Atrasado
            </p>
            <p className="text-2xl font-bold text-danger-600">
              {formatarMoeda(metricas.carteira.atrasado)}
            </p>
            <p className="text-xs text-default-500">
              Saldos com vencimento anterior a hoje
            </p>
          </CardBody>
        </Card>
        <Card className="border-none shadow-md">
          <CardBody className="gap-2 p-6">
            <p className="text-sm font-semibold text-default-600 uppercase tracking-wide">
              Mediana do Ticket
            </p>
            <p className="text-2xl font-bold text-success-600">
              {formatarMoeda(metricas.ticketQualidade.mediana)}
            </p>
            <p className="text-xs text-default-500">Top 3 vendas do mês</p>
            <div className="space-y-1 pt-1">
              {metricas.ticketQualidade.top3.map((venda) => (
                <p key={venda.venda_id} className="text-xs text-default-600">
                  #{String(venda.numero_venda).padStart(6, "0")} -{" "}
                  {formatarMoeda(venda.total_recebido)}
                </p>
              ))}
              {metricas.ticketQualidade.top3.length === 0 ? (
                <p className="text-xs text-default-400">
                  Sem vendas recebidas no mês.
                </p>
              ) : null}
            </div>
          </CardBody>
        </Card>
        <Card className="border-none shadow-md">
          <CardBody className="gap-2 p-6">
            <p className="text-sm font-semibold text-default-600 uppercase tracking-wide">
              Variação do Hoje
            </p>
            <p className="text-sm text-default-600">
              Semana passada:{" "}
              {formatarMoeda(metricas.comparativos.mesmoDiaSemanaPassada)}
            </p>
            <p className="text-sm text-default-600">
              Mês passado:{" "}
              {formatarMoeda(metricas.comparativos.mesmoDiaMesPassado)}
            </p>
            <p className="text-xs text-default-500">
              Δ semana: {metricas.comparativos.variacaoSemana.toFixed(1)}% | Δ
              mês: {metricas.comparativos.variacaoMes.toFixed(1)}%
            </p>
          </CardBody>
        </Card>
      </div>

      <Card className="border-none shadow-md animate-in slide-in-from-bottom-4 duration-500 delay-480">
        <CardHeader className="pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Ganhos com Ordem de Serviço</h3>
            <p className="text-sm text-default-500">
              Recebimentos de OS no período selecionado
            </p>
            <p className="text-xs text-default-400">
              {metricas.ganhosOS.criterio}
            </p>
          </div>
          <Chip color="primary" variant="flat">
            {metricas.ganhosOS.quantidadeOS} OS
          </Chip>
        </CardHeader>
        <Divider />
        <CardBody className="pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20">
              <p className="text-xs font-semibold text-default-500 uppercase">
                Total OS
              </p>
              <p className="text-xl font-bold text-primary-600">
                {formatarMoeda(metricas.ganhosOS.totalPeriodo)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-success-50 dark:bg-success-900/20">
              <p className="text-xs font-semibold text-default-500 uppercase">
                Ticket médio por OS
              </p>
              <p className="text-xl font-bold text-success-600">
                {formatarMoeda(metricas.ganhosOS.ticketMedioOS)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-default-100 dark:bg-default-900/20">
              <p className="text-xs font-semibold text-default-500 uppercase">
                Pagamentos lançados
              </p>
              <p className="text-xl font-bold text-default-700">
                {metricas.ganhosOS.quantidadePagamentos}
              </p>
            </div>
          </div>

          {metricas.ganhosOS.ultimosPagamentos.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-default-600">
                Últimos recebimentos de OS
              </p>
              {metricas.ganhosOS.ultimosPagamentos.length >
              ITENS_POR_PAGINA_GANHOS_OS ? (
                <p className="text-xs text-default-500">
                  Mostrando {inicioGanhosOS + 1} a{" "}
                  {Math.min(
                    fimGanhosOS,
                    metricas.ganhosOS.ultimosPagamentos.length,
                  )}{" "}
                  de {metricas.ganhosOS.ultimosPagamentos.length} pagamentos.
                </p>
              ) : null}
              {pagamentosOSPaginados.map((pagamento) => (
                <div
                  key={pagamento.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-default-50 dark:bg-default-900/10"
                >
                  <div>
                    <p className="font-semibold text-default-900">
                      OS #{pagamento.numero_os}
                    </p>
                    <p className="text-xs text-default-500">
                      {pagamento.cliente_nome} -{" "}
                      {new Date(pagamento.data_pagamento).toLocaleDateString(
                        "pt-BR",
                      )}
                    </p>
                  </div>
                  <p className="font-bold text-success-600">
                    {formatarMoeda(pagamento.valor)}
                  </p>
                </div>
              ))}
              {totalPaginasGanhosOS > 1 ? (
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    isDisabled={paginaGanhosOSAtual <= 1}
                    size="sm"
                    variant="flat"
                    onPress={() =>
                      setPaginaGanhosOS((prev) => Math.max(1, prev - 1))
                    }
                  >
                    Anterior
                  </Button>
                  <p className="text-xs text-default-500 min-w-[92px] text-center">
                    Página {paginaGanhosOSAtual} de {totalPaginasGanhosOS}
                  </p>
                  <Button
                    isDisabled={paginaGanhosOSAtual >= totalPaginasGanhosOS}
                    size="sm"
                    variant="flat"
                    onPress={() =>
                      setPaginaGanhosOS((prev) =>
                        Math.min(totalPaginasGanhosOS, prev + 1),
                      )
                    }
                  >
                    Próxima
                  </Button>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-default-500">
              Nenhum recebimento de OS no período selecionado.
            </p>
          )}
        </CardBody>
      </Card>

      {/* Progresso das Metas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500 delay-500">
        {/* Meta Diária */}
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex gap-3 pb-3">
            <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30">
              <Calendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-bold">Meta Diária</p>
              <p className="text-sm text-default-500">
                {formatarMoeda(metricas.metaDiaria.valor)} de recebimento por
                dia
              </p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="gap-4 pt-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-default-500 font-semibold uppercase mb-1">
                    Realizado
                  </p>
                  <p className="text-xl font-bold text-default-900">
                    {formatarMoeda(metricas.vendasHoje.total)}
                  </p>
                </div>
                <Chip
                  className="font-bold"
                  color={
                    metricas.metaDiaria.progresso >= 100
                      ? "success"
                      : metricas.metaDiaria.progresso >= 50
                        ? "warning"
                        : "danger"
                  }
                  size="md"
                  variant="flat"
                >
                  {metricas.metaDiaria.progresso.toFixed(1)}%
                </Chip>
              </div>
              <Progress
                aria-label="Progresso da meta diária"
                className="h-2"
                color={
                  metricas.metaDiaria.progresso >= 100
                    ? "success"
                    : metricas.metaDiaria.progresso >= 50
                      ? "warning"
                      : "danger"
                }
                size="md"
                value={Math.min(metricas.metaDiaria.progresso, 100)}
              />
              {metricas.metaDiaria.faltando > 0 ? (
                <p className="text-sm text-default-500">
                  💪 Faltam {formatarMoeda(metricas.metaDiaria.faltando)} para
                  atingir a meta
                </p>
              ) : null}
              {metricas.metaDiaria.progresso >= 100 && (
                <div className="flex items-center gap-2 p-3 bg-success-50 dark:bg-success-900/20 rounded-xl">
                  <Award className="w-5 h-5 text-success-600" />
                  <span className="text-sm font-bold text-success-600">
                    🎉 Meta diária atingida!
                  </span>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Meta Mensal */}
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex gap-3 pb-3">
            <div className="p-3 rounded-xl bg-secondary-100 dark:bg-secondary-900/30">
              <Target className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-bold">Meta Mensal</p>
              <p className="text-sm text-default-500">
                {formatarMoeda(metricas.metaMensal.valor)} de recebimento no mês
              </p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="gap-4 pt-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-default-500 font-semibold uppercase mb-1">
                    Realizado
                  </p>
                  <p className="text-xl font-bold text-default-900">
                    {formatarMoeda(metricas.vendasMes.total)}
                  </p>
                </div>
                <Chip
                  className="font-bold"
                  color={
                    metricas.metaMensal.progresso >= 100
                      ? "success"
                      : metricas.metaMensal.progresso >= 70
                        ? "warning"
                        : "danger"
                  }
                  size="md"
                  variant="flat"
                >
                  {metricas.metaMensal.progresso.toFixed(1)}%
                </Chip>
              </div>
              <Progress
                aria-label="Progresso da meta mensal"
                className="h-2"
                color={
                  metricas.metaMensal.progresso >= 100
                    ? "success"
                    : metricas.metaMensal.progresso >= 70
                      ? "warning"
                      : "danger"
                }
                size="md"
                value={Math.min(metricas.metaMensal.progresso, 100)}
              />
              {metricas.metaMensal.faltando > 0 ? (
                <p className="text-sm text-default-500">
                  🎯 Faltam {formatarMoeda(metricas.metaMensal.faltando)} para
                  atingir a meta
                </p>
              ) : null}
              <div className="rounded-lg bg-default-50 dark:bg-default-900/20 p-3 text-sm">
                <p className="text-default-600">
                  Esperado até hoje:{" "}
                  {formatarMoeda(metricas.metaProporcional.esperadoAteHoje)} (
                  {metricas.metaProporcional.progressoEsperado.toFixed(1)}%)
                </p>
                <p
                  className={`font-semibold ${
                    metricas.metaProporcional.desvio >= 0
                      ? "text-success-600"
                      : "text-danger-600"
                  }`}
                >
                  Desvio: {formatarMoeda(metricas.metaProporcional.desvio)}
                </p>
              </div>
              {metricas.metaMensal.progresso >= 100 && (
                <div className="flex items-center gap-2 p-3 bg-success-50 dark:bg-success-900/20 rounded-xl">
                  <Award className="w-5 h-5 text-success-600" />
                  <span className="text-sm font-bold text-success-600">
                    🎉 Meta mensal atingida!
                  </span>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {detalheSelecionado ? (
        <Card
          className="border-none shadow-md animate-in slide-in-from-bottom-4 duration-500"
          id="detalhes-registros"
        >
          <CardHeader className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold">{tituloDrilldown}</h3>
              <p className="text-sm text-default-500">
                {registrosDrilldown.length} registro(s) no escopo atual.
              </p>
            </div>
            <Button
              size="sm"
              variant="light"
              onPress={() => setDetalheSelecionado(null)}
            >
              Fechar
            </Button>
          </CardHeader>
          <Divider />
          <CardBody className="pt-4 overflow-x-auto">
            {registrosDrilldown.length > 0 ? (
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="text-left text-default-500 border-b border-default-200">
                    <th className="py-2 pr-3">Venda</th>
                    <th className="py-2 pr-3">Cliente</th>
                    <th className="py-2 pr-3">Forma</th>
                    <th className="py-2 pr-3">Data</th>
                    <th className="py-2 pr-3">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {registrosDrilldownPaginados.map((registro) => (
                    <tr
                      key={registro.id}
                      className="border-b border-default-100"
                    >
                      <td className="py-2 pr-3 font-semibold">
                        #{String(registro.numero_venda).padStart(6, "0")}
                      </td>
                      <td className="py-2 pr-3">{registro.cliente_nome}</td>
                      <td className="py-2 pr-3">
                        {registro.tipo_pagamento.replace("_", " ")}
                      </td>
                      <td className="py-2 pr-3">
                        {new Date(registro.data_pagamento).toLocaleDateString(
                          "pt-BR",
                        )}
                      </td>
                      <td className="py-2 pr-3 font-bold text-success-600">
                        {formatarMoeda(registro.valor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-default-500">
                Nenhum registro encontrado para este card no escopo selecionado.
              </p>
            )}
            {totalPaginasDrilldown > 1 ? (
              <div className="flex items-center justify-end gap-2 pt-3">
                <Button
                  isDisabled={paginaDrilldownAtual <= 1}
                  size="sm"
                  variant="flat"
                  onPress={() =>
                    setPaginaDrilldown((prev) => Math.max(1, prev - 1))
                  }
                >
                  Anterior
                </Button>
                <p className="text-xs text-default-500 min-w-[92px] text-center">
                  Página {paginaDrilldownAtual} de {totalPaginasDrilldown}
                </p>
                <Button
                  isDisabled={paginaDrilldownAtual >= totalPaginasDrilldown}
                  size="sm"
                  variant="flat"
                  onPress={() =>
                    setPaginaDrilldown((prev) =>
                      Math.min(totalPaginasDrilldown, prev + 1),
                    )
                  }
                >
                  Próxima
                </Button>
              </div>
            ) : null}
          </CardBody>
        </Card>
      ) : null}

      <Card className="border-none shadow-sm">
        <CardHeader className="flex items-center gap-2 pb-2">
          <Info className="w-4 h-4 text-default-500" />
          <p className="font-semibold text-default-700">Glossário rápido</p>
        </CardHeader>
        <CardBody className="pt-0 text-sm text-default-600 space-y-1">
          <p>
            Recebido: soma dos pagamentos efetivamente registrados com data de
            pagamento.
          </p>
          <p>
            Ticket médio: total recebido dividido pela quantidade de vendas
            recebidas no período.
          </p>
          <p>
            Meta esperada até hoje: fração da meta mensal proporcional ao dia
            corrente do mês.
          </p>
          <p>A receber e atrasado: saldos devedor de vendas não canceladas.</p>
        </CardBody>
      </Card>

      {/* Ordens de Serviço (se for técnico) */}
      {perfil === "tecnico" && (
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-3">
            <h3 className="text-xl font-bold">📋 Minhas Ordens de Serviço</h3>
          </CardHeader>
          <Divider />
          <CardBody className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="p-3 rounded-xl bg-gradient-to-br from-warning-500 to-warning-600 shadow-md">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-warning-600">
                    {metricas.ordensServico.aguardando}
                  </p>
                  <p className="text-sm font-medium text-default-600">
                    Aguardando
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-md">
                  <AlertCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary-600">
                    {metricas.ordensServico.em_andamento}
                  </p>
                  <p className="text-sm font-medium text-default-600">
                    Em Andamento
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="p-3 rounded-xl bg-gradient-to-br from-success-500 to-success-600 shadow-md">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-success-600">
                    {metricas.ordensServico.concluidas_mes}
                  </p>
                  <p className="text-sm font-medium text-default-600">
                    Concluídas este mês
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Últimas Vendas */}
      <div className="animate-in slide-in-from-bottom-4 duration-500 delay-650">
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Vendas que Faltam Receber</h3>
              <p className="text-sm text-default-500">
                Apenas vendas feitas por voce
              </p>
            </div>
            <Chip color="warning" variant="flat">
              {metricas.vendasPendentesRecebimentoQuantidade} pendente(s)
            </Chip>
          </CardHeader>
          <Divider />
          <CardBody className="pt-4 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-warning-50 dark:bg-warning-900/20">
              <p className="text-sm font-semibold text-default-600">
                Total pendente de recebimento
              </p>
              <p className="text-xl font-bold text-warning-600">
                {formatarMoeda(metricas.vendasPendentesRecebimentoTotal)}
              </p>
            </div>
            {metricas.vendasPendentesRecebimento.length > 0 ? (
              <div className="space-y-2">
                {metricas.vendasPendentesRecebimentoQuantidade >
                ITENS_POR_PAGINA_PENDENTES ? (
                  <p className="text-xs text-default-500">
                    Mostrando {inicioPendentes + 1} a{" "}
                    {Math.min(
                      fimPendentes,
                      metricas.vendasPendentesRecebimentoQuantidade,
                    )}{" "}
                    de {metricas.vendasPendentesRecebimentoQuantidade}{" "}
                    pendencias.
                  </p>
                ) : null}
                {vendasPendentesPaginadas.map((venda) => (
                  <div
                    key={venda.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-default-50 dark:bg-default-900/10"
                  >
                    <div>
                      <p className="font-semibold text-default-900">
                        Venda #{String(venda.numero_venda).padStart(6, "0")}
                      </p>
                      <p className="text-xs text-default-500">
                        {venda.cliente_nome || "Cliente nao informado"}
                        {venda.data_prevista_pagamento
                          ? ` - Vencimento: ${new Date(venda.data_prevista_pagamento).toLocaleDateString("pt-BR")}`
                          : ""}
                      </p>
                    </div>
                    <p className="font-bold text-warning-600">
                      {formatarMoeda(venda.saldo_devedor)}
                    </p>
                  </div>
                ))}
                {totalPaginasPendentes > 1 ? (
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      isDisabled={paginaPendentesAtual <= 1}
                      size="sm"
                      variant="flat"
                      onPress={() =>
                        setPaginaPendentes((prev) => Math.max(1, prev - 1))
                      }
                    >
                      Anterior
                    </Button>
                    <p className="text-xs text-default-500 min-w-[92px] text-center">
                      Pagina {paginaPendentesAtual} de {totalPaginasPendentes}
                    </p>
                    <Button
                      isDisabled={paginaPendentesAtual >= totalPaginasPendentes}
                      size="sm"
                      variant="flat"
                      onPress={() =>
                        setPaginaPendentes((prev) =>
                          Math.min(totalPaginasPendentes, prev + 1),
                        )
                      }
                    >
                      Proxima
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-default-500">
                Voce nao possui vendas pendentes de recebimento.
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      {metricas.ultimasVendas.length > 0 && (
        <div className="animate-in slide-in-from-bottom-4 duration-500 delay-700">
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-3 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30">
                <ShoppingCart className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-bold">
                Últimas Vendas de Hoje (Recebido)
              </h3>
            </CardHeader>
            <Divider />
            <CardBody className="pt-4">
              <div className="space-y-3">
                {metricas.ultimasVendas.map((venda, index) => (
                  <div
                    key={venda.id}
                    className="flex items-center justify-between p-4 bg-default-50 dark:bg-default-900/10 rounded-xl hover:bg-default-100 dark:hover:bg-default-800/20 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                        <ShoppingCart className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="font-bold text-default-900">
                          Venda #{String(venda.numero_venda).padStart(6, "0")}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-default-400" />
                          <p className="text-xs text-default-500">
                            {new Date(venda.criado_em).toLocaleTimeString(
                              "pt-BR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-success-600">
                        {formatarMoeda(Number(venda.valor_total))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
