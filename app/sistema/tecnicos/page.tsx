"use client";

import type { OrdemServico, OrdemServicoPeca } from "@/types/ordemServico";

import { useEffect, useMemo, useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button, ButtonGroup } from "@heroui/button";
import { Input } from "@heroui/input";
import { Tabs, Tab } from "@heroui/tabs";
import { Divider } from "@heroui/divider";
import { Pagination } from "@heroui/pagination";
import { Select, SelectItem } from "@heroui/select";
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
  FunnelIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  CurrencyDollarIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import { LayoutGrid, TableIcon } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/components/Toast";

const ITENS_POR_PAGINA = 12;

const STATUS_STYLE: Record<string, { label: string; classes: string }> = {
  aguardando: { label: "Aguardando", classes: "bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-700" },
  em_diagnostico: { label: "Em Diagnóstico", classes: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800" },
  em_andamento: { label: "Em Andamento", classes: "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 border-orange-200 dark:border-orange-800" },
  aguardando_peca: { label: "Aguardando Peça", classes: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 border-red-200 dark:border-red-800" },
  aguardando_pecas: { label: "Aguardando Peças", classes: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 border-red-200 dark:border-red-800" },
  concluido: { label: "Concluído", classes: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
};

export default function TecnicoWorkspacePage() {
  const { usuario } = useAuthContext();
  const toast = useToast();
  const [minhasOS, setMinhasOS] = useState<OrdemServico[]>([]);
  const [osConcluidas, setOsConcluidas] = useState<OrdemServico[]>([]);
  const [osDisponiveis, setOsDisponiveis] = useState<OrdemServico[]>([]);
  const [osPecas, setOsPecas] = useState<Record<string, OrdemServicoPeca[]>>({});
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("disponiveis");

  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<string>("");
  const [ordenacao, setOrdenacao] = useState<string>("mais_recentes");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [modoVisualizacao, setModoVisualizacao] = useState<"grid" | "table">("grid");

  useEffect(() => {
    if (usuario) carregarOrdens();
  }, [usuario]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, statusFiltro, ordenacao, selectedTab]);

  const carregarOrdens = async () => {
    if (!usuario) return;
    setLoading(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    try {
      const { data: minhas } = await supabase
        .from("ordem_servico").select("*")
        .eq("tecnico_responsavel", usuario.id)
        .neq("status", "concluido")
        .order("criado_em", { ascending: false });

      setMinhasOS(minhas || []);

      const { data: concluidas } = await supabase
        .from("ordem_servico").select("*")
        .eq("tecnico_responsavel", usuario.id)
        .eq("status", "concluido")
        .order("data_conclusao", { ascending: false })
        .limit(50);

      setOsConcluidas(concluidas || []);

      const { data: disponiveis } = await supabase
        .from("ordem_servico").select("*")
        .is("tecnico_responsavel", null)
        .in("status", ["aguardando", "em_diagnostico"])
        .order("criado_em", { ascending: true });

      setOsDisponiveis(disponiveis || []);

      if (minhas && minhas.length > 0) {
        const { data: pecas } = await supabase
          .from("ordem_servico_pecas")
          .select("*, produto:produtos(id, descricao, codigo_barras)")
          .in("id_ordem_servico", minhas.map((o) => o.id))
          .eq("estoque_reservado", true);

        if (pecas) {
          const map: Record<string, OrdemServicoPeca[]> = {};
          pecas.forEach((p) => { (map[p.id_ordem_servico] ??= []).push(p); });
          setOsPecas(map);
        }
      }
    } catch {
      toast.error("Erro ao carregar ordens");
    } finally {
      setLoading(false);
    }
  };

  const pegarOrdem = async (ordemId: string) => {
    if (!usuario) return;
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    try {
      await supabase.from("ordem_servico").update({
        tecnico_responsavel: usuario.id,
        status: "em_andamento",
        atualizado_em: new Date().toISOString(),
        atualizado_por: usuario.id,
      }).eq("id", ordemId);

      toast.success("Ordem atribuída com sucesso!");
      carregarOrdens();
    } catch {
      toast.error("Erro ao atribuir ordem");
    }
  };

  const ordensAtivas = useMemo(() => {
    switch (selectedTab) {
      case "disponiveis": return osDisponiveis;
      case "minhas": return minhasOS;
      case "concluidas": return osConcluidas;
      default: return [];
    }
  }, [selectedTab, osDisponiveis, minhasOS, osConcluidas]);

  const ordensFiltradas = useMemo(() => {
    let lista = [...ordensAtivas];

    if (busca) {
      const b = busca.toLowerCase();
      lista = lista.filter(
        (os) =>
          os.numero_os?.toString().includes(b) ||
          os.cliente_nome?.toLowerCase().includes(b) ||
          os.cliente_telefone?.includes(busca) ||
          os.equipamento_tipo?.toLowerCase().includes(b) ||
          os.equipamento_marca?.toLowerCase().includes(b),
      );
    }

    if (statusFiltro) lista = lista.filter((os) => os.status === statusFiltro);

    lista.sort((a, b) => {
      switch (ordenacao) {
        case "mais_antigas": return new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime();
        case "numero_crescente": return (a.numero_os || 0) - (b.numero_os || 0);
        case "numero_decrescente": return (b.numero_os || 0) - (a.numero_os || 0);
        default: return new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime();
      }
    });

    return lista;
  }, [ordensAtivas, busca, statusFiltro, ordenacao]);

  const totalPaginas = Math.ceil(ordensFiltradas.length / ITENS_POR_PAGINA);
  const indiceInicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const ordensPaginadas = ordensFiltradas.slice(indiceInicio, indiceInicio + ITENS_POR_PAGINA);

  const stats = useMemo(() => ({
    disponiveis: osDisponiveis.length,
    em_andamento: minhasOS.length,
    concluidas: osConcluidas.length,
    total: osDisponiveis.length + minhasOS.length + osConcluidas.length,
  }), [osDisponiveis, minhasOS, osConcluidas]);

  const formatPhone = (tel?: string) => {
    if (!tel) return "";
    const n = tel.replace(/\D/g, "");
    if (n.length === 11) return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
    if (n.length === 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
    return tel;
  };

  const OrdemCard = ({ ordem, isDisponivel, pecas }: { ordem: OrdemServico; isDisponivel: boolean; pecas?: OrdemServicoPeca[] }) => {
    const isConcluida = ordem.status === "concluido";
    const statusStyle = STATUS_STYLE[ordem.status] || STATUS_STYLE.aguardando;
    const totalCusto = pecas?.reduce((a, p) => a + p.valor_custo * p.quantidade, 0) || 0;

    return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-zinc-800 p-5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">OS</span>
              <span className="text-xs text-gray-300 dark:text-gray-600 font-mono">#{ordem.numero_os}</span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{ordem.cliente_nome}</h3>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusStyle.classes}`}>
              {statusStyle.label}
            </span>
            {ordem.prioridade === "urgente" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800">
                <FireIcon className="w-2.5 h-2.5" />
              </span>
            )}
            {ordem.prioridade === "alta" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                <ExclamationCircleIcon className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
        </div>

        {/* Info lines */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <WrenchScrewdriverIcon className="w-3.5 h-3.5 text-gray-400" />
            <span>
              {ordem.equipamento_tipo}
              {ordem.equipamento_marca && ` - ${ordem.equipamento_marca}`}
              {ordem.equipamento_modelo && ` ${ordem.equipamento_modelo}`}
            </span>
          </div>

          {ordem.equipamento_senha && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
              <LockClosedIcon className="w-3.5 h-3.5" />
              <span className="font-mono font-semibold">{ordem.equipamento_senha}</span>
            </div>
          )}

          {ordem.cliente_telefone && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500">
              <PhoneIcon className="w-3.5 h-3.5" />
              <span>{formatPhone(ordem.cliente_telefone)}</span>
            </div>
          )}

          <div className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Defeito: </span>
            {ordem.defeito_reclamado}
          </div>

          {ordem.valor_orcamento && ordem.valor_orcamento > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CurrencyDollarIcon className="w-3.5 h-3.5" />
              <span>R$ {ordem.valor_orcamento.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Pecas */}
        {pecas && pecas.length > 0 && (
          <>
            <Divider className="my-3" />
            <div className="flex items-center gap-1.5 mb-1">
              <CubeIcon className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Peças</span>
              <span className="text-xs text-gray-500">{pecas.reduce((a, p) => a + p.quantidade, 0)} itens</span>
              <span className="text-xs text-gray-400 ml-auto">R$ {totalCusto.toFixed(2)}</span>
            </div>
          </>
        )}

        {/* Action */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
          {isDisponivel ? (
            <Button fullWidth color="primary" size="sm" className="font-medium text-xs rounded-xl" onPress={() => pegarOrdem(ordem.id)}>
              Pegar OS
            </Button>
          ) : isConcluida ? (
            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircleIcon className="w-4 h-4" />
              Serviço Concluído
            </div>
          ) : (
            <Button fullWidth as="a" color="primary" href={`/sistema/ordem-servico/tecnico/${ordem.id}`} size="sm" variant="flat" className="font-medium text-xs rounded-xl">
              Dar Andamento →
            </Button>
          )}
        </div>
      </div>
    );
  };

  const TableRowOS = ({ ordem }: { ordem: OrdemServico }) => {
    const statusStyle = STATUS_STYLE[ordem.status] || STATUS_STYLE.aguardando;
    return (
      <tr className="border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
        <td className="py-3 px-4">
          <span className="text-xs text-gray-400 font-mono">#{ordem.numero_os}</span>
        </td>
        <td className="py-3 px-4">
          <p className="text-sm font-medium text-gray-800 dark:text-white">{ordem.cliente_nome}</p>
        </td>
        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
          {ordem.equipamento_tipo}{ordem.equipamento_marca && ` ${ordem.equipamento_marca}`}
        </td>
        <td className="py-3 px-4">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusStyle.classes}`}>
            {statusStyle.label}
          </span>
        </td>
        <td className="py-3 px-4 text-xs text-gray-400">
          {new Date(ordem.criado_em).toLocaleDateString("pt-BR")}
        </td>
        <td className="py-3 px-4">
          {selectedTab === "minhas" ? (
            <Button as="a" color="primary" href={`/sistema/ordem-servico/tecnico/${ordem.id}`} size="sm" variant="flat" className="text-xs rounded-xl">
              Abrir
            </Button>
          ) : selectedTab === "disponiveis" ? (
            <Button color="primary" size="sm" variant="flat" className="text-xs rounded-xl" onPress={() => pegarOrdem(ordem.id)}>
              Pegar
            </Button>
          ) : null}
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Carregando ordens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-zinc-800 p-5">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Minhas Ordens de Serviço</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Gerencie suas ordens e pegue novas disponíveis
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-zinc-800">
          <StatCard icon={<CubeIcon className="w-4 h-4" />} value={stats.total} label="Total" color="text-gray-600 dark:text-gray-300" bg="bg-gray-50 dark:bg-zinc-800" iconBg="bg-gray-100 dark:bg-zinc-700" />
          <StatCard icon={<ClockIcon className="w-4 h-4" />} value={stats.disponiveis} label="Disponíveis" color="text-orange-600 dark:text-orange-400" bg="bg-orange-50 dark:bg-orange-900/20" iconBg="bg-orange-100 dark:bg-orange-900/40" />
          <StatCard icon={<WrenchScrewdriverIcon className="w-4 h-4" />} value={stats.em_andamento} label="Em Andamento" color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-900/20" iconBg="bg-blue-100 dark:bg-blue-900/40" />
          <StatCard icon={<CheckCircleIcon className="w-4 h-4" />} value={stats.concluidas} label="Concluídas" color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-900/20" iconBg="bg-emerald-100 dark:bg-emerald-900/40" />
        </div>
      </div>

      {/* Busca + Filtros */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-zinc-800 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            isClearable
            className="flex-1"
            placeholder="Buscar por número, cliente, equipamento..."
            startContent={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />}
            value={busca}
            variant="bordered"
            classNames={{
              input: "text-sm",
              inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700",
            }}
            onChange={(e) => setBusca(e.target.value)}
            onClear={() => setBusca("")}
          />
          <Button
            endContent={mostrarFiltros ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
            startContent={<FunnelIcon className="w-4 h-4" />}
            variant="flat"
            className="rounded-xl"
            onPress={() => setMostrarFiltros(!mostrarFiltros)}
          >
            {mostrarFiltros ? "Ocultar" : "Filtros"}
          </Button>
          <ButtonGroup>
            <Button
              isIconOnly
              color={modoVisualizacao === "grid" ? "primary" : "default"}
              variant={modoVisualizacao === "grid" ? "solid" : "flat"}
              className="rounded-l-xl"
              onPress={() => setModoVisualizacao("grid")}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              isIconOnly
              color={modoVisualizacao === "table" ? "primary" : "default"}
              variant={modoVisualizacao === "table" ? "solid" : "flat"}
              className="rounded-r-xl"
              onPress={() => setModoVisualizacao("table")}
            >
              <TableIcon className="w-4 h-4" />
            </Button>
          </ButtonGroup>
        </div>

        {mostrarFiltros && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <Select
              label="Status"
              labelPlacement="outside"
              placeholder="Todos"
              selectedKeys={statusFiltro ? [statusFiltro] : []}
              size="sm"
              variant="bordered"
              classNames={{
                trigger: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700",
              }}
              onSelectionChange={(keys) => setStatusFiltro(Array.from(keys)[0] as string || "")}
            >
              <SelectItem key="">Todos</SelectItem>
              <SelectItem key="aguardando">Aguardando</SelectItem>
              <SelectItem key="em_diagnostico">Em Diagnóstico</SelectItem>
              <SelectItem key="em_andamento">Em Andamento</SelectItem>
              <SelectItem key="aguardando_peca">Aguardando Peça</SelectItem>
              <SelectItem key="concluido">Concluído</SelectItem>
            </Select>

            <Select
              label="Ordenar por"
              labelPlacement="outside"
              selectedKeys={[ordenacao]}
              size="sm"
              variant="bordered"
              classNames={{
                trigger: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700",
              }}
              onSelectionChange={(keys) => setOrdenacao(Array.from(keys)[0] as string)}
            >
              <SelectItem key="mais_recentes">Mais Recentes</SelectItem>
              <SelectItem key="mais_antigas">Mais Antigas</SelectItem>
              <SelectItem key="numero_crescente">Número (Crescente)</SelectItem>
              <SelectItem key="numero_decrescente">Número (Decrescente)</SelectItem>
            </Select>

            <Button
              className="self-end rounded-xl"
              color="default"
              size="sm"
              variant="flat"
              onPress={() => { setBusca(""); setStatusFiltro(""); setOrdenacao("mais_recentes"); }}
            >
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs
        classNames={{
          tabList: "gap-6 w-full relative rounded-none p-0 border-b border-gray-100 dark:border-zinc-800",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-0 h-10",
          tabContent: "group-data-[selected=true]:text-primary text-sm text-gray-500",
        }}
        color="primary"
        selectedKey={selectedTab}
        variant="underlined"
        onSelectionChange={(key) => setSelectedTab(key as string)}
      >
        <Tab
          key="disponiveis"
          title={
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              <span>Disponíveis</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400">
                {osDisponiveis.length}
              </span>
            </div>
          }
        >
          {renderList()}
        </Tab>
        <Tab
          key="minhas"
          title={
            <div className="flex items-center gap-2">
              <WrenchScrewdriverIcon className="w-4 h-4" />
              <span>Em Andamento</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                {minhasOS.length}
              </span>
            </div>
          }
        >
          {renderList()}
        </Tab>
        <Tab
          key="concluidas"
          title={
            <div className="flex items-center gap-2">
              <DocumentCheckIcon className="w-4 h-4" />
              <span>Finalizadas</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                {osConcluidas.length}
              </span>
            </div>
          }
        >
          {renderList()}
        </Tab>
      </Tabs>
    </div>
  );

  function renderList() {
    if (ordensFiltradas.length === 0) {
      return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-zinc-800 p-12">
          <div className="text-center">
            {selectedTab === "disponiveis" ? (
              <ClockIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            ) : selectedTab === "minhas" ? (
              <WrenchScrewdriverIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            ) : (
              <CheckCircleIcon className="w-12 h-12 mx-auto text-emerald-300 dark:text-emerald-700 mb-3" />
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {busca || statusFiltro
                ? "Nenhuma OS encontrada com esses filtros"
                : selectedTab === "disponiveis"
                  ? "Não há ordens disponíveis no momento"
                  : selectedTab === "minhas"
                    ? "Você não tem ordens em andamento"
                    : "Você ainda não concluiu nenhuma ordem"}
            </p>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="flex justify-between items-center text-xs text-gray-400 mb-4">
          <span>Mostrando {ordensPaginadas.length} de {ordensFiltradas.length} OS{ordensFiltradas.length !== 1 ? "'s" : ""}</span>
          <span>Página {paginaAtual} de {totalPaginas || 1}</span>
        </div>

        {modoVisualizacao === "grid" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {ordensPaginadas.map((ordem) => (
              <OrdemCard
                key={ordem.id}
                ordem={ordem}
                isDisponivel={selectedTab === "disponiveis"}
                pecas={selectedTab === "minhas" ? osPecas[ordem.id] : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
                    <th className="py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Nº OS</th>
                    <th className="py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Cliente</th>
                    <th className="py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Equipamento</th>
                    <th className="py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Data</th>
                    <th className="py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {ordensPaginadas.map((ordem) => (
                    <TableRowOS key={ordem.id} ordem={ordem} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {totalPaginas > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination
              showControls
              color="primary"
              page={paginaAtual}
              size="lg"
              total={totalPaginas}
              onChange={setPaginaAtual}
            />
          </div>
        )}
      </>
    );
  }
}

function StatCard({ icon, value, label, color, bg, iconBg }: { icon: React.ReactNode; value: number; label: string; color: string; bg: string; iconBg: string }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl ${bg}`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg} ${color}`}>
        {icon}
      </div>
      <div>
        <p className={`text-lg font-bold ${color}`}>{value}</p>
        <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}
