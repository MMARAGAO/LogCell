"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { useState } from "react";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  ButtonGroup,
  Pagination,
} from "@heroui/react";
import {
  Plus,
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle,
  Package,
  AlertCircle,
  LayoutGrid,
  Table as TableIcon,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/Toast";
import { useConfirm } from "@/hooks/useConfirm";
import { usePermissoes } from "@/hooks/usePermissoes";
import { useLojaFilter } from "@/hooks/useLojaFilter";
import { Permissao } from "@/components/Permissao";
import { formatarMoeda } from "@/lib/formatters";
import { supabase } from "@/lib/supabaseClient";
import {
  OrdemServicoFormModal,
  OrdemServicoWizard,
  OrdemServicoCard,
  OrdemServicoDetalhesModal,
  AdicionarPecaModal,
  HistoricoOSModal,
  GerenciarFotosOSModal,
  PagamentoOSModal,
  DevolverOSModal,
} from "@/components/ordem-servico";
import {
  buscarOrdensServico,
  criarOrdemServico,
  atualizarOrdemServico,
  deletarOrdemServico,
  cancelarOrdemServico,
  devolverOrdemServico,
} from "@/services/ordemServicoService";
import type {
  OrdemServico,
  StatusOS,
  OrdemServicoFormData,
} from "@/types/ordemServico";

interface FiltrosOrdemServico {
  idLoja?: number;
  status?: StatusOS;
  clienteNome?: string;
  numeroOS?: number;
  dataInicio?: string;
  dataFim?: string;
}

export default function OrdemServicoPage() {
  const { usuario } = useAuth();
  const { usuario: usuarioContext } = useAuthContext();
  const searchParams = useSearchParams();
  const buscaParam = searchParams.get("busca");
  const router = useRouter();
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const { temPermissao, loading: loadingPermissoes } = usePermissoes();
  const { lojaId, podeVerTodasLojas } = useLojaFilter();

  // Estados (DEVEM vir antes de qualquer return condicional)
  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>([]);
  const [lojas, setLojas] = useState<Array<{ id: number; nome: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [osEditando, setOsEditando] = useState<OrdemServico | undefined>();

  // Modais auxiliares
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);
  const [modalPecasOpen, setModalPecasOpen] = useState(false);
  const [modalHistoricoOpen, setModalHistoricoOpen] = useState(false);
  const [modalFotosOpen, setModalFotosOpen] = useState(false);
  const [modalPagamentosOpen, setModalPagamentosOpen] = useState(false);
  const [modalDevolverOpen, setModalDevolverOpen] = useState(false);
  const [osSelecionada, setOsSelecionada] = useState<OrdemServico | null>(null);

  // Filtros
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<StatusOS | "">("");
  const [modoVisualizacao, setModoVisualizacao] = useState<"grid" | "table">(
    "grid",
  );
  const [filtroLoja, setFiltroLoja] = useState<string>("todas");
  const hoje = new Date().toISOString().split("T")[0];
  const [filtroDataInicio, setFiltroDataInicio] = useState<string>(hoje);
  const [filtroDataFim, setFiltroDataFim] = useState<string>(hoje);
  const [ordenacao, setOrdenacao] = useState<string>("mais_recentes");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Estados de paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(12);

  // Preencher busca vinda da URL
  useEffect(() => {
    if (buscaParam) {
      setBusca(buscaParam);
    }
  }, [buscaParam]);

  // Estatísticas
  const [stats, setStats] = useState({
    total: 0,
    aguardando: 0,
    em_andamento: 0,
    concluido: 0,
    entregue: 0,
  });

  // Funções auxiliares (devem vir antes dos useEffects)
  const carregarLojas = async () => {
    try {
      const { LojasService } = await import("@/services/lojasService");
      const data = await LojasService.getLojasAtivas();
      setLojas(data.map((loja) => ({ id: loja.id, nome: loja.nome })));
    } catch (error) {
      console.error("Erro ao carregar lojas:", error);
      setLojas([]);
    }
  };

  const carregarOrdensServico = async () => {
    setLoading(true);

    const filtros: FiltrosOrdemServico = {};

    if (statusFiltro) {
      filtros.status = statusFiltro;
    }

    if (filtroDataInicio) {
      filtros.dataInicio = filtroDataInicio;
    }

    if (filtroDataFim) {
      filtros.dataFim = filtroDataFim;
    }

    // Aplicar filtro de loja se usuário não tiver acesso a todas
    if (lojaId !== null && !podeVerTodasLojas) {
      filtros.idLoja = lojaId;
      console.log(`🏪 Filtrando Ordens de Serviço da loja ${lojaId}`);
    }

    const { data, error } = await buscarOrdensServico({
      status: filtros.status,
      id_loja: filtros.idLoja,
      data_inicio: filtros.dataInicio,
      data_fim: filtros.dataFim,
    });

    if (data) {
      setOrdensServico(data);
      calcularEstatisticas(data);
    } else if (error) {
      toast.error(error);
    }

    setLoading(false);
  };

  const calcularEstatisticas = (dados: OrdemServico[]) => {
    setStats({
      total: dados.length,
      aguardando: dados.filter((os) => os.status === "aguardando").length,
      em_andamento: dados.filter(
        (os) => os.status === "em_andamento" || os.status === "aprovado",
      ).length,
      concluido: dados.filter((os) => os.status === "concluido").length,
      entregue: dados.filter((os) => os.status === "entregue").length,
    });
  };

  // useEffects (devem vir após as funções mas antes dos returns condicionais)
  useEffect(() => {
    if (usuarioContext?.tipo_usuario === "tecnico") {
      router.push("/sistema/ordem-servico/tecnico");
    }
  }, [usuarioContext, router]);

  useEffect(() => {
    carregarLojas();
    carregarOrdensServico();
  }, [
    statusFiltro,
    lojaId,
    podeVerTodasLojas,
    filtroDataInicio,
    filtroDataFim,
  ]);

  // Returns condicionais (devem vir APÓS todos os hooks e funções)
  // Se for técnico, mostrar loading enquanto redireciona
  if (usuarioContext?.tipo_usuario === "tecnico") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-default-500">Redirecionando...</p>
        </div>
      </div>
    );
  }

  // Verificar permissão de visualizar ordens de serviço
  if (!loadingPermissoes && !temPermissao("os.visualizar")) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-danger mb-4">Acesso Negado</h1>
        <p className="text-default-500">
          Você não tem permissão para visualizar ordens de serviço.
        </p>
      </div>
    );
  }

  const handleNovaOS = () => {
    if (!temPermissao("os.criar")) {
      toast.error("Você não tem permissão para criar ordens de serviço");
      return;
    }
    setOsEditando(undefined);
    setModalOpen(true);
  };

  const handleVisualizarOS = (os: OrdemServico) => {
    setOsSelecionada(os);
    setModalDetalhesOpen(true);
  };

  const handleEditarOS = (os: OrdemServico) => {
    if (!temPermissao("os.editar")) {
      toast.error("Você não tem permissão para editar ordens de serviço");
      return;
    }
    setOsEditando(os);
    setModalOpen(true);
  };

  const handleDeletarOS = async (os: OrdemServico) => {
    console.log("🗑️ handleDeletarOS chamado para OS:", os.numero_os);

    if (!temPermissao("os.deletar")) {
      console.log("❌ Sem permissão para deletar");
      toast.error("Você não tem permissão para excluir ordens de serviço");
      return;
    }

    // Se estiver ENTREGUE, exigir permissão especial
    if (os.status === "entregue" && !temPermissao("os.deletar_entregue")) {
      toast.error("Você não tem permissão para excluir OSs entregues");
      return;
    }

    // Permitir exclusão mesmo se estiver entregue (além de cancelada)
    // Mantemos confirmação forte para evitar exclusões acidentais

    console.log("✅ Permissão OK, abrindo confirmação...");

    try {
      const confirmado = await confirm({
        title: "Excluir Ordem de Serviço",
        message:
          os.status === "entregue"
            ? `A OS #${os.numero_os} está ENTREGUE. Deseja realmente excluir? Isto removerá os registros relacionados.`
            : `Deseja realmente excluir a OS #${os.numero_os}? Esta ação não pode ser desfeita.`,
        confirmText: "Excluir",
        cancelText: "Cancelar",
        variant: "danger",
        confirmColor: "danger",
      });

      console.log("🔔 Confirmação retornou:", confirmado);

      if (!confirmado) {
        console.log("❌ Usuário cancelou");
        return;
      }

      console.log("🔄 Executando delete...");
      const { error } = await deletarOrdemServico(os.id);

      if (error) {
        console.error("❌ Erro ao deletar:", error);
        toast.error(error);
        return;
      }

      console.log("✅ OS deletada com sucesso!");
      toast.success("Ordem de serviço excluída com sucesso!");
      await carregarOrdensServico();
    } catch (err) {
      console.error("❌ Erro no handleDeletarOS:", err);
      toast.error("Erro ao excluir ordem de serviço");
    }
  };

  const handleCancelarOS = async (os: OrdemServico) => {
    if (!temPermissao("os.editar")) {
      toast.error("Você não tem permissão para cancelar ordens de serviço");
      return;
    }

    if (os.status === "cancelado") {
      toast.error("Esta OS já está cancelada");
      return;
    }

    // Permitir cancelamento mesmo após entregue

    try {
      const confirmado = await confirm({
        title: "Cancelar Ordem de Serviço",
        message:
          os.status === "entregue"
            ? `A OS #${os.numero_os} está ENTREGUE. Ao cancelar, o lançamento no caixa será cancelado e as peças podem ser devolvidas conforme regras de estoque.`
            : `Deseja realmente cancelar a OS #${os.numero_os}? O estoque das peças será devolvido.`,
        confirmText: "Cancelar OS",
        cancelText: "Voltar",
        variant: "warning",
        confirmColor: "warning",
      });

      if (!confirmado) return;

      const { error } = await cancelarOrdemServico(os.id, usuario!.id);

      if (error) {
        toast.error(error);
        return;
      }

      toast.success("Ordem de serviço cancelada com sucesso!");
      await carregarOrdensServico();
    } catch (err) {
      console.error("Erro ao cancelar OS:", err);
      toast.error("Erro ao cancelar ordem de serviço");
    }
  };

  const handleDevolverOS = async (os: OrdemServico) => {
    if (!temPermissao("os.editar")) {
      toast.error("Você não tem permissão para devolver ordens de serviço");
      return;
    }

    if (os.status === "cancelado" || os.status === "devolvida") {
      toast.error("Esta OS já está cancelada ou devolvida");
      return;
    }

    setOsSelecionada(os);
    setModalDevolverOpen(true);
  };

  const handleConfirmarDevolucao = async (tipo: "reembolso" | "credito") => {
    if (!osSelecionada || !usuario) return;

    try {
      const { data, error } = await devolverOrdemServico(
        osSelecionada.id,
        usuario.id,
        tipo,
      );

      if (error) {
        toast.error(error);
        return;
      }

      const total = data?.total_valor || 0;
      const mensagem =
        tipo === "credito"
          ? `OS devolvida. Crédito de ${formatarMoeda(total)} gerado para o cliente`
          : total > 0
            ? `OS devolvida. Reembolsar ${formatarMoeda(total)}`
            : "OS devolvida. Nenhum pagamento para reembolsar";

      toast.success(mensagem);
      await carregarOrdensServico();
    } catch (err) {
      console.error("Erro ao devolver OS:", err);
      toast.error("Erro ao devolver ordem de serviço");
    }
  };

  const handleGerenciarPecas = (os: OrdemServico) => {
    if (!temPermissao("os.gerenciar_pecas")) {
      toast.error("Você não tem permissão para gerenciar peças");
      return;
    }
    setOsSelecionada(os);
    setModalPecasOpen(true);
  };

  const handleVerHistorico = (os: OrdemServico) => {
    setOsSelecionada(os);
    setModalHistoricoOpen(true);
  };

  const handleGerenciarFotos = (os: OrdemServico) => {
    if (!temPermissao("os.gerenciar_fotos")) {
      toast.error("Você não tem permissão para gerenciar fotos");
      return;
    }
    setOsSelecionada(os);
    setModalFotosOpen(true);
  };

  const handleGerenciarPagamentos = (os: OrdemServico) => {
    if (!temPermissao("os.gerenciar_pagamentos")) {
      toast.error("Você não tem permissão para gerenciar pagamentos");
      return;
    }
    setOsSelecionada(os);
    setModalPagamentosOpen(true);
  };

  const handleSubmitOS = async (dados: OrdemServicoFormData) => {
    if (!usuario) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      if (osEditando) {
        // Editar OS existente
        const { error } = await atualizarOrdemServico(
          osEditando.id,
          dados,
          usuario.id,
        );
        if (error) {
          toast.error(error);
          return;
        }
        toast.success("Ordem de serviço atualizada com sucesso!");
      } else {
        // Criar nova OS
        const { error } = await criarOrdemServico(dados, usuario.id);
        if (error) {
          toast.error(error);
          return;
        }
        toast.success("Ordem de serviço criada com sucesso!");
      }

      setModalOpen(false);
      setOsEditando(undefined);
      await carregarOrdensServico();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar ordem de serviço");
    }
  };

  // Filtrar OS por busca (número, cliente, equipamento) e aplicar todos os filtros
  let ordensFiltradas = ordensServico.filter((os) => {
    // Filtro de busca
    if (busca) {
      const buscaLower = busca.toLowerCase();
      const matchBusca =
        os.numero_os?.toString().includes(buscaLower) ||
        os.cliente_nome?.toLowerCase().includes(buscaLower) ||
        os.cliente_telefone?.includes(busca) ||
        os.equipamento_tipo?.toLowerCase().includes(buscaLower) ||
        os.equipamento_marca?.toLowerCase().includes(buscaLower) ||
        os.equipamento_modelo?.toLowerCase().includes(buscaLower);

      if (!matchBusca) return false;
    }

    // Filtro de loja
    if (filtroLoja !== "todas") {
      if (os.id_loja?.toString() !== filtroLoja) return false;
    }

    // Filtro de data (usando data_entrada)
    if (filtroDataInicio || filtroDataFim) {
      const dataOS = os.data_entrada?.split("T")[0];
      if (!dataOS) return false;

      if (filtroDataInicio && dataOS < filtroDataInicio) return false;
      if (filtroDataFim && dataOS > filtroDataFim) return false;
    }

    return true;
  });

  // Aplicar ordenação
  ordensFiltradas = [...ordensFiltradas].sort((a, b) => {
    switch (ordenacao) {
      case "mais_recentes":
        return (
          new Date(b.data_entrada || "").getTime() -
          new Date(a.data_entrada || "").getTime()
        );
      case "mais_antigas":
        return (
          new Date(a.data_entrada || "").getTime() -
          new Date(b.data_entrada || "").getTime()
        );
      case "numero_crescente":
        return (a.numero_os || 0) - (b.numero_os || 0);
      case "numero_decrescente":
        return (b.numero_os || 0) - (a.numero_os || 0);
      case "valor_crescente":
        return (a.valor_total || 0) - (b.valor_total || 0);
      case "valor_decrescente":
        return (b.valor_total || 0) - (a.valor_total || 0);
      default:
        return 0;
    }
  });

  // Paginação
  const totalPaginas = Math.ceil(ordensFiltradas.length / itensPorPagina);
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const ordensPaginadas = ordensFiltradas.slice(indiceInicio, indiceFim);

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setPaginaAtual(1);
  }, [
    busca,
    statusFiltro,
    filtroLoja,
    filtroDataInicio,
    filtroDataFim,
    ordenacao,
  ]);

  // Calcular resumo de formas de pagamento das OS filtradas
  const resumoPagamentos = ordensFiltradas.reduce(
    (acc, os) => {
      os.pagamentos?.forEach((pag) => {
        const tipo = pag.forma_pagamento;
        acc[tipo] = (acc[tipo] || 0) + Number(pag.valor);
      });
      return acc;
    },
    {} as { [key: string]: number },
  );

  const getStatusColor = (
    status: StatusOS,
  ): "default" | "primary" | "secondary" | "success" | "warning" | "danger" => {
    const cores: Record<StatusOS, any> = {
      aguardando: "warning",
      aprovado: "primary",
      em_diagnostico: "secondary",
      em_andamento: "warning",
      aguardando_peca: "warning",
      concluido: "success",
      entregue: "success",
      devolvida: "danger",
      cancelado: "danger",
      garantia: "secondary",
    };
    return cores[status] || "default";
  };

  const handleAssumirOS = async (os: OrdemServico) => {
    if (!usuario) return;

    if (!temPermissao("os.assumir")) {
      toast.error("Você não tem permissão para assumir ordens de serviço");
      return;
    }

    try {
      // Buscar o técnico vinculado ao usuário atual
      const { data: tecnico, error: tecnicoError } = await supabase
        .from("tecnicos")
        .select("id")
        .eq("id", usuario.id)
        .single();

      if (tecnicoError || !tecnico) {
        toast.warning("Você não está cadastrado como técnico no sistema");
        return;
      }

      // Verificar se já tem técnico responsável diferente
      if (os.tecnico_responsavel && os.tecnico_responsavel !== tecnico.id) {
        toast.warning("Esta OS já está atribuída a outro técnico");
        return;
      }

      await atualizarOrdemServico(
        os.id,
        {
          tecnico_responsavel: tecnico.id,
          status: os.status === "aguardando" ? "em_andamento" : os.status,
        },
        usuario.id,
      );

      await carregarOrdensServico();
      toast.success(
        "Ordem de serviço assumida com sucesso! Status alterado para 'Em Andamento'",
      );
    } catch (error) {
      console.error("Erro ao assumir OS:", error);
      toast.error("Erro ao assumir ordem de serviço. Tente novamente.");
    }
  };

  const getStatusLabel = (status: StatusOS): string => {
    const labels: Record<StatusOS, string> = {
      aguardando: "Aguardando",
      aprovado: "Aprovado",
      em_diagnostico: "Em Diagnóstico",
      em_andamento: "Em Andamento",
      aguardando_peca: "Aguardando Peça",
      concluido: "Concluído",
      entregue: "Entregue",
      devolvida: "Devolvida",
      cancelado: "Cancelado",
      garantia: "Garantia",
    };
    return labels[status] || status;
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Função para gerar itens do menu baseado nas permissões
  const getMenuItems = (os: OrdemServico) => {
    const items = [];

    // Assumir OS (só se não tiver técnico atribuído)
    if (temPermissao("os.assumir") && !os.tecnico_responsavel) {
      items.push({
        key: "assumir",
        label: "Assumir OS",
        onPress: () => handleAssumirOS(os),
        color: "primary" as const,
        description: "Assumir responsabilidade desta OS",
      });
    }

    // Editar OS
    if (temPermissao("os.editar")) {
      items.push({
        key: "editar",
        label: "Editar OS",
        onPress: () => handleEditarOS(os),
      });
    }

    // Gerenciar Peças
    if (temPermissao("os.gerenciar_pecas")) {
      items.push({
        key: "pecas",
        label: "Gerenciar Peças",
        onPress: () => handleGerenciarPecas(os),
      });
    }

    // Gerenciar Fotos
    if (temPermissao("os.gerenciar_fotos")) {
      items.push({
        key: "fotos",
        label: "Gerenciar Fotos",
        onPress: () => handleGerenciarFotos(os),
      });
    }

    // Gerenciar Pagamentos
    if (temPermissao("os.gerenciar_pagamentos")) {
      items.push({
        key: "pagamentos",
        label: "Gerenciar Pagamentos",
        onPress: () => handleGerenciarPagamentos(os),
      });
    }

    // Devolver OS (serviço desfeito)
    if (
      temPermissao("os.editar") &&
      (os.status === "concluido" || os.status === "entregue")
    ) {
      items.push({
        key: "devolver",
        label: "Devolver OS",
        onPress: () => handleDevolverOS(os),
        color: "warning" as const,
      });
    }

    // Ver Histórico (sempre visível)
    items.push({
      key: "historico",
      label: "Ver Histórico",
      onPress: () => handleVerHistorico(os),
    });

    // Cancelar OS (permitido exceto se já estiver cancelada)
    if (temPermissao("os.editar") && os.status !== "cancelado") {
      items.push({
        key: "cancelar",
        label: "Cancelar OS",
        onPress: () => handleCancelarOS(os),
        color: "warning" as const,
      });
    }

    // Cancelar OS entregue (permitir se estiver entregue com permissão específica)
    if (temPermissao("os.cancelar_entregue") && os.status === "entregue") {
      items.push({
        key: "cancelar_entregue",
        label: "Cancelar OS",
        onPress: () => handleCancelarOS(os),
        color: "warning" as const,
      });
    }

    // Excluir OS (permitir se estiver cancelada ou entregue com permissão específica)
    const podeExcluirCancelada =
      temPermissao("os.deletar") && os.status === "cancelado";
    const podeExcluirEntregue =
      temPermissao("os.deletar_entregue") && os.status === "entregue";
    if (podeExcluirCancelada || podeExcluirEntregue) {
      items.push({
        key: "deletar",
        label: "Excluir OS",
        onPress: () => handleDeletarOS(os),
        color: "danger" as const,
      });
    }

    return items;
  };

  if (!usuario || loadingPermissoes) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Ordens de Serviço</h1>
          <p className="text-default-500 mt-1">
            Gerencie as ordens de serviço da sua loja
          </p>
        </div>
        <Permissao permissao="os.criar">
          <Button
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onPress={handleNovaOS}
            size="lg"
          >
            Nova OS
          </Button>
        </Permissao>
      </div>

      {/* Filtros */}
      <Card>
        <CardBody>
          <div className="flex flex-col gap-4">
            {/* Linha 1: Busca e botões principais */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Buscar por número, cliente, equipamento..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                startContent={<Search className="w-4 h-4 text-default-400" />}
                className="flex-1"
                isClearable
                onClear={() => setBusca("")}
              />

              <Button
                variant="flat"
                startContent={<Filter className="w-4 h-4" />}
                endContent={
                  mostrarFiltros ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )
                }
                onPress={() => setMostrarFiltros(!mostrarFiltros)}
                className="sm:w-auto"
              >
                {mostrarFiltros ? "Ocultar Filtros" : "Mostrar Filtros"}
              </Button>

              <ButtonGroup>
                <Button
                  isIconOnly
                  variant={modoVisualizacao === "grid" ? "solid" : "flat"}
                  color={modoVisualizacao === "grid" ? "primary" : "default"}
                  onPress={() => setModoVisualizacao("grid")}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  isIconOnly
                  variant={modoVisualizacao === "table" ? "solid" : "flat"}
                  color={modoVisualizacao === "table" ? "primary" : "default"}
                  onPress={() => setModoVisualizacao("table")}
                >
                  <TableIcon className="w-4 h-4" />
                </Button>
              </ButtonGroup>
            </div>

            {/* Filtros Avançados (Retrátil) */}
            {mostrarFiltros && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-default-200">
                <Select
                  label="Status"
                  placeholder="Todos os Status"
                  selectedKeys={statusFiltro ? [statusFiltro] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as StatusOS | "";
                    setStatusFiltro(selected);
                  }}
                  size="sm"
                >
                  <SelectItem key="">Todos</SelectItem>
                  <SelectItem key="aguardando">Aguardando</SelectItem>
                  <SelectItem key="aprovado">Aprovado</SelectItem>
                  <SelectItem key="em_andamento">Em Andamento</SelectItem>
                  <SelectItem key="aguardando_peca">Aguardando Peça</SelectItem>
                  <SelectItem key="concluido">Concluído</SelectItem>
                  <SelectItem key="entregue">Entregue</SelectItem>
                  <SelectItem key="cancelado">Cancelado</SelectItem>
                  <SelectItem key="garantia">Garantia</SelectItem>
                </Select>

                <Select
                  label="Loja"
                  placeholder="Todas as Lojas"
                  selectedKeys={[filtroLoja]}
                  onSelectionChange={(keys) =>
                    setFiltroLoja(Array.from(keys)[0] as string)
                  }
                  size="sm"
                  items={[{ id: 0, nome: "Todas" }, ...lojas]}
                >
                  {(loja) => (
                    <SelectItem
                      key={loja.id === 0 ? "todas" : loja.id.toString()}
                    >
                      {loja.nome}
                    </SelectItem>
                  )}
                </Select>

                <Input
                  type="date"
                  label="Data Início"
                  value={filtroDataInicio}
                  onChange={(e) => setFiltroDataInicio(e.target.value)}
                  size="sm"
                />

                <Input
                  type="date"
                  label="Data Fim"
                  value={filtroDataFim}
                  onChange={(e) => setFiltroDataFim(e.target.value)}
                  size="sm"
                />

                <Button
                  variant="flat"
                  color="default"
                  size="sm"
                  className="sm:col-span-2"
                  onPress={() => {
                    setFiltroDataInicio("");
                    setFiltroDataFim("");
                  }}
                >
                  Limpar Datas
                </Button>

                <Select
                  label="Ordenar por"
                  selectedKeys={[ordenacao]}
                  onSelectionChange={(keys) =>
                    setOrdenacao(Array.from(keys)[0] as string)
                  }
                  size="sm"
                  className="sm:col-span-2"
                >
                  <SelectItem key="mais_recentes">Mais Recentes</SelectItem>
                  <SelectItem key="mais_antigas">Mais Antigas</SelectItem>
                  <SelectItem key="numero_crescente">
                    Número (Crescente)
                  </SelectItem>
                  <SelectItem key="numero_decrescente">
                    Número (Decrescente)
                  </SelectItem>
                  <SelectItem key="valor_crescente">
                    Valor (Crescente)
                  </SelectItem>
                  <SelectItem key="valor_decrescente">
                    Valor (Decrescente)
                  </SelectItem>
                </Select>

                <div className="sm:col-span-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="flat"
                    onPress={() => {
                      setBusca("");
                      setStatusFiltro("");
                      setFiltroLoja("todas");
                      setFiltroDataInicio("");
                      setFiltroDataFim("");
                      setOrdenacao("mais_recentes");
                    }}
                    className="flex-1"
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            )}

            {/* Informações de resultado */}
            <div className="flex justify-between items-center text-sm text-default-500">
              <span>
                Mostrando {ordensPaginadas.length} de {ordensFiltradas.length}{" "}
                {ordensFiltradas.length === 1 ? "OS" : "OS's"}
              </span>
              <span>
                Página {paginaAtual} de {totalPaginas || 1}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Lista de OS */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      ) : ordensFiltradas.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-default-300" />
            <h3 className="text-xl font-semibold mb-2">
              {ordensServico.length === 0
                ? "Nenhuma ordem de serviço cadastrada"
                : "Nenhuma ordem de serviço encontrada"}
            </h3>
            <p className="text-default-500 mb-6">
              {ordensServico.length === 0
                ? "Crie sua primeira ordem de serviço clicando no botão acima"
                : "Tente ajustar os filtros de busca"}
            </p>
            {ordensServico.length === 0 && (
              <Button
                color="primary"
                startContent={<Plus className="w-4 h-4" />}
                onPress={handleNovaOS}
              >
                Nova OS
              </Button>
            )}
          </CardBody>
        </Card>
      ) : modoVisualizacao === "grid" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {ordensPaginadas.map((os) => (
            <OrdemServicoCard
              key={os.id}
              os={os}
              onVisualizar={handleVisualizarOS}
              onEditar={handleEditarOS}
              onDeletar={handleDeletarOS}
              onCancelar={handleCancelarOS}
              onGerenciarPecas={handleGerenciarPecas}
              onVerHistorico={handleVerHistorico}
              onGerenciarFotos={handleGerenciarFotos}
              onGerenciarPagamentos={handleGerenciarPagamentos}
              onAssumirOS={handleAssumirOS}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardBody className="p-0">
            <Table aria-label="Tabela de ordens de serviço">
              <TableHeader>
                <TableColumn>Nº OS</TableColumn>
                <TableColumn>CLIENTE</TableColumn>
                <TableColumn>EQUIPAMENTO</TableColumn>
                <TableColumn>TÉCNICO</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ENTRADA</TableColumn>
                <TableColumn align="center">AÇÕES</TableColumn>
              </TableHeader>
              <TableBody>
                {ordensPaginadas.map((os) => (
                  <TableRow key={os.id}>
                    <TableCell>
                      <span className="font-semibold text-primary">
                        #{os.numero_os}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{os.cliente_nome}</p>
                        <p className="text-xs text-default-400">
                          {os.cliente_telefone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {os.equipamento_tipo} {os.equipamento_marca}
                        </p>
                        <p className="text-xs text-default-400">
                          {os.equipamento_modelo}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {os.tecnico?.nome || (
                        <span className="text-default-400 italic">
                          Não atribuído
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Chip
                          color={getStatusColor(os.status)}
                          variant="flat"
                          size="sm"
                        >
                          {getStatusLabel(os.status)}
                        </Chip>
                        {os.caixa &&
                          os.caixa.some(
                            (c) => c.status_caixa === "cancelado",
                          ) && (
                            <Chip color="danger" variant="flat" size="sm">
                              Caixa cancelado
                            </Chip>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>{formatarData(os.data_entrada)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="primary"
                          onPress={() => handleVisualizarOS(os)}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light">
                              <Package className="w-4 h-4" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Ações da OS">
                            {getMenuItems(os).map((item) => (
                              <DropdownItem
                                key={item.key}
                                onPress={item.onPress}
                                color={item.color}
                                className={
                                  item.color ? `text-${item.color}` : undefined
                                }
                                description={item.description}
                              >
                                {item.label}
                              </DropdownItem>
                            ))}
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            total={totalPaginas}
            page={paginaAtual}
            onChange={setPaginaAtual}
            showControls
            color="primary"
            size="lg"
          />
        </div>
      )}

      {/* Modal de Criar/Editar OS */}
      <OrdemServicoWizard
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setOsEditando(undefined);
        }}
        onSubmit={handleSubmitOS}
        lojas={lojas}
        ordem={osEditando}
      />

      {/* Modal de Detalhes */}
      <OrdemServicoDetalhesModal
        isOpen={modalDetalhesOpen}
        onClose={() => {
          setModalDetalhesOpen(false);
          setOsSelecionada(null);
        }}
        os={osSelecionada}
        onOSAtualizada={carregarOrdensServico}
      />

      {/* Modal de Adicionar Peças */}
      {osSelecionada && (
        <AdicionarPecaModal
          isOpen={modalPecasOpen}
          onClose={() => {
            setModalPecasOpen(false);
            setOsSelecionada(null);
          }}
          idOrdemServico={osSelecionada.id}
          idLoja={osSelecionada.id_loja}
          onSuccess={() => {
            carregarOrdensServico();
          }}
        />
      )}

      {/* Modal de Histórico */}
      {osSelecionada && (
        <HistoricoOSModal
          isOpen={modalHistoricoOpen}
          onClose={() => {
            setModalHistoricoOpen(false);
            setOsSelecionada(null);
          }}
          idOrdemServico={osSelecionada.id}
        />
      )}

      {/* Modal de Gerenciar Fotos */}
      {osSelecionada && (
        <GerenciarFotosOSModal
          isOpen={modalFotosOpen}
          onClose={() => {
            setModalFotosOpen(false);
            setOsSelecionada(null);
          }}
          ordemServicoId={osSelecionada.id}
          numeroOS={osSelecionada.numero_os}
          onFotosAtualizadas={carregarOrdensServico}
        />
      )}

      {/* Modal de Pagamentos */}
      <PagamentoOSModal
        isOpen={modalPagamentosOpen}
        onClose={() => {
          setModalPagamentosOpen(false);
          setOsSelecionada(null);
        }}
        os={osSelecionada}
        onPagamentoRealizado={carregarOrdensServico}
      />

      {/* Modal de Devolução */}
      <DevolverOSModal
        isOpen={modalDevolverOpen}
        onClose={() => {
          setModalDevolverOpen(false);
          setOsSelecionada(null);
        }}
        os={osSelecionada}
        onConfirm={handleConfirmarDevolucao}
      />

      {/* Dialog de Confirmação */}
      <ConfirmDialog />
    </div>
  );
}
