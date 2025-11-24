"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Tabs, Tab } from "@heroui/tabs";
import { Divider } from "@heroui/divider";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  CubeIcon,
  WrenchScrewdriverIcon,
  DocumentCheckIcon,
  FireIcon,
  ExclamationCircleIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { createBrowserClient } from "@supabase/ssr";
import type { OrdemServico, OrdemServicoPeca } from "@/types/ordemServico";
import { useToast } from "@/components/Toast";

export default function OrdemServicoTecnicoPage() {
  const { usuario } = useAuthContext();
  const toast = useToast();
  const [minhasOS, setMinhasOS] = useState<OrdemServico[]>([]);
  const [osConcluidas, setOsConcluidas] = useState<OrdemServico[]>([]);
  const [osDisponiveis, setOsDisponiveis] = useState<OrdemServico[]>([]);
  const [osPecas, setOsPecas] = useState<Record<string, OrdemServicoPeca[]>>(
    {}
  );
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("disponiveis");

  useEffect(() => {
    if (usuario) {
      carregarOrdens();
    }
  }, [usuario]);

  const carregarOrdens = async () => {
    if (!usuario) return;

    setLoading(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      // Buscar ordens do técnico (em andamento)
      const { data: minhas, error: erroMinhas } = await supabase
        .from("ordem_servico")
        .select("*")
        .eq("tecnico_responsavel", usuario.id)
        .neq("status", "concluido")
        .order("criado_em", { ascending: false });

      if (erroMinhas) throw erroMinhas;
      setMinhasOS(minhas || []);

      // Buscar ordens concluídas do técnico
      const { data: concluidas, error: erroConcluidas } = await supabase
        .from("ordem_servico")
        .select("*")
        .eq("tecnico_responsavel", usuario.id)
        .eq("status", "concluido")
        .order("data_conclusao", { ascending: false })
        .limit(20); // Últimas 20 concluídas

      if (erroConcluidas) throw erroConcluidas;
      setOsConcluidas(concluidas || []);

      // Buscar ordens disponíveis (sem técnico)
      const { data: disponiveis, error: erroDisponiveis } = await supabase
        .from("ordem_servico")
        .select("*")
        .is("tecnico_responsavel", null)
        .in("status", ["aguardando", "em_diagnostico"])
        .order("criado_em", { ascending: true });

      if (erroDisponiveis) throw erroDisponiveis;
      setOsDisponiveis(disponiveis || []);

      // Buscar peças para as ordens do técnico
      if (minhas && minhas.length > 0) {
        const idsOrdens = minhas.map((os) => os.id);
        const { data: pecas, error: erroPecas } = await supabase
          .from("ordem_servico_pecas")
          .select(
            `
            *,
            produto:produtos(
              id,
              descricao,
              codigo_barras
            )
          `
          )
          .in("id_ordem_servico", idsOrdens)
          .eq("estoque_reservado", true);

        if (!erroPecas && pecas) {
          // Agrupar peças por ordem de serviço
          const pecasPorOS: Record<string, OrdemServicoPeca[]> = {};
          pecas.forEach((peca) => {
            if (!pecasPorOS[peca.id_ordem_servico]) {
              pecasPorOS[peca.id_ordem_servico] = [];
            }
            pecasPorOS[peca.id_ordem_servico].push(peca);
          });
          setOsPecas(pecasPorOS);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar ordens:", error);
      toast.error("Erro ao carregar ordens de serviço");
    } finally {
      setLoading(false);
    }
  };

  const pegarOrdem = async (ordemId: string) => {
    if (!usuario) return;

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      const { data, error } = await supabase
        .from("ordem_servico")
        .update({
          tecnico_responsavel: usuario.id,
          status: "em_andamento",
          atualizado_em: new Date().toISOString(),
          atualizado_por: usuario.id,
        })
        .eq("id", ordemId)
        .select();

      if (error) throw error;

      toast.success("Ordem de serviço atribuída com sucesso!");
      carregarOrdens();
    } catch (error) {
      console.error("❌ Erro ao pegar ordem:", error);
      toast.error("Erro ao atribuir ordem de serviço");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aguardando":
        return "default";
      case "em_diagnostico":
        return "primary";
      case "em_andamento":
        return "warning";
      case "aguardando_pecas":
        return "danger";
      case "concluido":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "aguardando":
        return "Aguardando";
      case "em_diagnostico":
        return "Em Diagnóstico";
      case "em_andamento":
        return "Em Andamento";
      case "aguardando_pecas":
        return "Aguardando Peças";
      case "concluido":
        return "Concluído";
      default:
        return status;
    }
  };

  const filtrarOrdens = (ordens: OrdemServico[]) => {
    if (!busca) return ordens;

    return ordens.filter(
      (os) =>
        os.numero_os?.toString().includes(busca) ||
        os.cliente_nome?.toLowerCase().includes(busca.toLowerCase()) ||
        os.equipamento_tipo?.toLowerCase().includes(busca.toLowerCase()) ||
        os.defeito_reclamado?.toLowerCase().includes(busca.toLowerCase())
    );
  };

  const OrdemCard = ({
    ordem,
    isDisponivel,
    pecas,
  }: {
    ordem: OrdemServico;
    isDisponivel: boolean;
    pecas?: OrdemServicoPeca[];
  }) => {
    const isConcluida = ordem.status === "concluido";
    const dataExibir =
      isConcluida && ordem.data_conclusao
        ? ordem.data_conclusao
        : ordem.criado_em;
    const labelData = isConcluida ? "Concluída em" : "Criada em";

    // Função para obter cor da prioridade
    const getPrioridadeColor = (prioridade: string) => {
      switch (prioridade) {
        case "urgente":
          return "danger";
        case "alta":
          return "warning";
        case "normal":
          return "primary";
        case "baixa":
          return "default";
        default:
          return "default";
      }
    };

    const getPrioridadeLabel = (prioridade: string) => {
      switch (prioridade) {
        case "urgente":
          return (
            <span className="flex items-center gap-1">
              <FireIcon className="w-3 h-3" /> Urgente
            </span>
          );
        case "alta":
          return (
            <span className="flex items-center gap-1">
              <ExclamationCircleIcon className="w-3 h-3" /> Alta
            </span>
          );
        case "normal":
          return "Normal";
        case "baixa":
          return "Baixa";
        default:
          return prioridade;
      }
    };

    // Calcular totais das peças
    const totalCusto =
      pecas?.reduce((acc, p) => acc + p.valor_custo * p.quantidade, 0) || 0;
    const totalVenda =
      pecas?.reduce((acc, p) => acc + p.valor_venda * p.quantidade, 0) || 0;

    return (
      <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
        <CardBody className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3 className="font-bold text-lg">OS #{ordem.numero_os}</h3>
                <Chip
                  size="sm"
                  variant="flat"
                  color={getStatusColor(ordem.status)}
                >
                  {getStatusLabel(ordem.status)}
                </Chip>
                {ordem.prioridade && ordem.prioridade !== "normal" && (
                  <Chip
                    size="sm"
                    variant="dot"
                    color={getPrioridadeColor(ordem.prioridade)}
                  >
                    {getPrioridadeLabel(ordem.prioridade)}
                  </Chip>
                )}
              </div>
              <p className="text-sm text-default-500">
                {labelData}{" "}
                {new Date(dataExibir).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            {isDisponivel && (
              <Button
                color="primary"
                size="sm"
                onPress={() => pegarOrdem(ordem.id)}
              >
                Pegar OS
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-sm font-semibold text-default-700 min-w-[80px]">
                Cliente:
              </span>
              <span className="text-sm text-default-600">
                {ordem.cliente_nome}
              </span>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-sm font-semibold text-default-700 min-w-[80px]">
                Equipamento:
              </span>
              <span className="text-sm text-default-600">
                {ordem.equipamento_tipo}
                {ordem.equipamento_marca && ` - ${ordem.equipamento_marca}`}
                {ordem.equipamento_modelo && ` ${ordem.equipamento_modelo}`}
              </span>
            </div>

            {/* Senha do Dispositivo */}
            {ordem.equipamento_senha && (
              <div className="flex items-center gap-2 bg-warning-50 dark:bg-warning-900/20 p-2 rounded-lg">
                <LockClosedIcon className="w-4 h-4 text-warning-700 dark:text-warning-400" />
                <span className="text-sm font-semibold text-warning-700 dark:text-warning-400 min-w-[60px]">
                  Senha:
                </span>
                <span className="text-sm font-mono font-semibold text-warning-700 dark:text-warning-400">
                  {ordem.equipamento_senha}
                </span>
              </div>
            )}

            <div className="flex items-start gap-2">
              <span className="text-sm font-semibold text-default-700 min-w-[80px]">
                Defeito:
              </span>
              <span className="text-sm text-default-600 line-clamp-2">
                {ordem.defeito_reclamado}
              </span>
            </div>

            {ordem.observacoes_tecnicas && (
              <div className="flex items-start gap-2">
                <span className="text-sm font-semibold text-default-700 min-w-[80px]">
                  Obs:
                </span>
                <span className="text-sm text-default-500 italic line-clamp-2">
                  {ordem.observacoes_tecnicas}
                </span>
              </div>
            )}
          </div>

          {/* Peças Recebidas */}
          {pecas && pecas.length > 0 && (
            <div className="mt-4">
              <Divider className="my-2" />
              <div className="flex items-center gap-2 mb-2">
                <CubeIcon className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-default-700">
                  Peças Recebidas
                </span>
              </div>
              <div className="space-y-1 bg-default-50 dark:bg-default-900/20 p-3 rounded-lg">
                {pecas.map((peca) => (
                  <div
                    key={peca.id}
                    className="flex justify-between items-start text-xs"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-default-700">
                        {peca.tipo_produto === "estoque" && peca.produto
                          ? peca.produto.descricao
                          : peca.descricao_peca}
                      </p>
                      <p className="text-default-500">
                        Qtd: {peca.quantidade} | Custo: R${" "}
                        {peca.valor_custo.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-default-700">
                        R$ {(peca.valor_custo * peca.quantidade).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                <Divider className="my-2" />
                <div className="flex justify-between items-center font-semibold">
                  <span className="text-sm text-primary">Total Custo:</span>
                  <span className="text-sm text-primary">
                    R$ {totalCusto.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-default-500">
                  <span>Valor Venda:</span>
                  <span>R$ {totalVenda.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {!isDisponivel && !isConcluida && (
            <div className="mt-4 pt-4 border-t border-divider">
              <Button
                color="primary"
                variant="flat"
                size="sm"
                fullWidth
                as="a"
                href={`/sistema/ordem-servico/tecnico/${ordem.id}`}
              >
                Dar Andamento
              </Button>
            </div>
          )}

          {isConcluida && (
            <div className="mt-4 pt-4 border-t border-divider">
              <Chip
                color="success"
                variant="flat"
                size="sm"
                className="w-full justify-center"
                startContent={<CheckCircleIcon className="w-4 h-4" />}
              >
                Serviço Concluído
              </Chip>
            </div>
          )}
        </CardBody>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-default-500">Carregando ordens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Ordens de Serviço</h1>
        <p className="text-default-500 mt-1">
          Gerencie suas ordens e pegue novas disponíveis
        </p>
      </div>

      {/* Busca */}
      <Input
        placeholder="Buscar por número, cliente, equipamento..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        startContent={
          <MagnifyingGlassIcon className="w-5 h-5 text-default-400" />
        }
        classNames={{
          input: "text-sm",
        }}
      />

      {/* Tabs */}
      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
        color="primary"
        variant="underlined"
        classNames={{
          tabList: "gap-6",
          cursor: "w-full",
        }}
      >
        {/* Tab 1: OSs Disponíveis */}
        <Tab
          key="disponiveis"
          title={
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5" />
              <span>Disponíveis</span>
              <Chip size="sm" variant="flat">
                {osDisponiveis.length}
              </Chip>
            </div>
          }
        >
          {filtrarOrdens(osDisponiveis).length === 0 ? (
            <Card className="border-none shadow-md">
              <CardBody className="p-12">
                <div className="text-center">
                  <ClockIcon className="w-16 h-16 mx-auto text-default-300 mb-4" />
                  <p className="text-default-500">
                    {busca
                      ? "Nenhuma ordem disponível encontrada com essa busca"
                      : "Não há ordens disponíveis no momento"}
                  </p>
                </div>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtrarOrdens(osDisponiveis).map((ordem) => (
                <OrdemCard key={ordem.id} ordem={ordem} isDisponivel={true} />
              ))}
            </div>
          )}
        </Tab>

        {/* Tab 2: Em Andamento */}
        <Tab
          key="minhas"
          title={
            <div className="flex items-center gap-2">
              <WrenchScrewdriverIcon className="w-5 h-5" />
              <span>Em Andamento</span>
              <Chip size="sm" variant="flat" color="primary">
                {minhasOS.length}
              </Chip>
            </div>
          }
        >
          {filtrarOrdens(minhasOS).length === 0 ? (
            <Card className="border-none shadow-md">
              <CardBody className="p-12">
                <div className="text-center">
                  <WrenchScrewdriverIcon className="w-16 h-16 mx-auto text-default-300 mb-4" />
                  <p className="text-default-500">
                    {busca
                      ? "Nenhuma ordem sua encontrada com essa busca"
                      : "Você não tem ordens em andamento"}
                  </p>
                  <p className="text-sm text-default-400 mt-2">
                    Pegue uma ordem disponível para começar!
                  </p>
                </div>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtrarOrdens(minhasOS).map((ordem) => (
                <OrdemCard
                  key={ordem.id}
                  ordem={ordem}
                  isDisponivel={false}
                  pecas={osPecas[ordem.id]}
                />
              ))}
            </div>
          )}
        </Tab>

        {/* Tab 3: Concluídas */}
        <Tab
          key="concluidas"
          title={
            <div className="flex items-center gap-2">
              <DocumentCheckIcon className="w-5 h-5" />
              <span>Finalizadas</span>
              <Chip size="sm" variant="flat" color="success">
                {osConcluidas.length}
              </Chip>
            </div>
          }
        >
          {filtrarOrdens(osConcluidas).length === 0 ? (
            <Card className="border-none shadow-md">
              <CardBody className="p-12">
                <div className="text-center">
                  <DocumentCheckIcon className="w-16 h-16 mx-auto text-success-300 mb-4" />
                  <p className="text-default-500">
                    {busca
                      ? "Nenhuma ordem concluída encontrada com essa busca"
                      : "Você ainda não concluiu nenhuma ordem"}
                  </p>
                </div>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtrarOrdens(osConcluidas).map((ordem) => (
                <OrdemCard key={ordem.id} ordem={ordem} isDisponivel={false} />
              ))}
            </div>
          )}
        </Tab>
      </Tabs>

      {/* Card de Ajuda */}
      {osDisponiveis.length > 0 && selectedTab === "disponiveis" && (
        <Card className="border-none shadow-md bg-gradient-to-br from-primary/10 to-primary/5">
          <CardBody className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/20 rounded-xl shrink-0">
                <ClockIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold mb-1">💡 Como funciona?</h3>
                <p className="text-sm text-default-600">
                  Clique em "Pegar OS" para atribuir a ordem a você. Ela
                  automaticamente mudará para "Em Andamento" e aparecerá na aba
                  "Minhas OS".
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
