"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
} from "@heroui/react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import {
  PackageX,
  Search,
  Calendar,
  User,
  Store,
  History,
  ShoppingBag,
  TrendingUp,
  EllipsisVertical,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { VendaCompleta } from "@/types/vendas";
import { ModalDevolucao } from "@/components/devolucoes/ModalDevolucao";
import { HistoricoDevolucoes } from "@/components/devolucoes/HistoricoDevolucoes";
import { usePermissoes } from "@/hooks/usePermissoes";
import { useLojaFilter } from "@/hooks/useLojaFilter";
import { aplicarEscopoLoja } from "@/lib/lojaScope";

export default function DevolucoesPage() {
  const { usuario } = useAuth();
  const { temPermissao, loading: loadingPermissoes } = usePermissoes();
  const { lojaIds, podeVerTodasLojas } = useLojaFilter();

  const [vendas, setVendas] = useState<VendaCompleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [debouncedBusca, setDebouncedBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  const [totalVendas, setTotalVendas] = useState(0);
  const [vendaSelecionada, setVendaSelecionada] =
    useState<VendaCompleta | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [vendaHistorico, setVendaHistorico] = useState<string | null>(null);

  const selectVendas = `
    *,
    cliente:clientes(id, nome, doc, telefone),
    loja:lojas(id, nome),
    vendedor:usuarios!vendas_vendedor_id_fkey(id, nome),
    itens:itens_venda(
      id,
      venda_id,
      produto_id,
      produto_nome,
      produto_codigo,
      quantidade,
      preco_unitario,
      subtotal,
      desconto_tipo,
      desconto_valor,
      valor_desconto,
      devolvido,
      produto:produtos(descricao, codigo_fabricante)
    ),
    devolucoes:devolucoes_venda(
      *,
      itens:itens_devolucao(*)
    )
  `;

  // Debounce da busca - só dispara após parar de digitar
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBusca(busca);
    }, 400);

    return () => clearTimeout(timer);
  }, [busca]);

  const handleMudarPagina = (novaPagina: number) => {
    setPaginaAtual(novaPagina);
    carregarVendas(novaPagina, debouncedBusca);
  };

  useEffect(() => {
    if (!loadingPermissoes) {
      carregarVendas(paginaAtual, debouncedBusca);
    }
  }, [loadingPermissoes, lojaIds, podeVerTodasLojas, debouncedBusca]);

  const carregarVendas = async (pagina: number, termoBusca: string) => {
    try {
      const offset = (pagina - 1) * itensPorPagina;

      // Busca total separadamente para evitar conflitos com joins complexos
      let countQuery = supabase
        .from("vendas")
        .select("id", { count: "exact" })
        .in("status", ["concluida", "devolvida"])
        .gt("valor_pago", 0);

      let dataQuery = supabase
        .from("vendas")
        .select(selectVendas)
        .in("status", ["concluida", "devolvida"])
        .gt("valor_pago", 0)
        .order("criado_em", { ascending: false })
        .range(offset, offset + itensPorPagina - 1);

      if (lojaIds.length > 0 && !podeVerTodasLojas) {
        countQuery = aplicarEscopoLoja(countQuery, "loja_id", lojaIds);
        dataQuery = aplicarEscopoLoja(dataQuery, "loja_id", lojaIds);
      }

      if (termoBusca) {
        const ehNumerico = /^\d+$/.test(termoBusca);

        if (ehNumerico) {
          countQuery = countQuery.eq("numero_venda", parseInt(termoBusca));
          dataQuery = dataQuery.eq("numero_venda", parseInt(termoBusca));
        } else {
          const termos = termoBusca
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .split(/\s+/)
            .filter((t) => t.length > 0);

          let clientesQuery = supabase.from("clientes").select("id");

          termos.forEach((token) => {
            clientesQuery = clientesQuery.or(
              `nome.ilike.%${token}%,doc.ilike.%${token}%`,
            );
          });

          const { data: clientes, error: clientesError } = await clientesQuery;

          if (clientesError) {
            console.error(
              "Erro ao buscar clientes na devolução:",
              clientesError,
            );
          }

          const ids = (clientes || []).map((c) => c.id);

          if (ids.length > 0) {
            countQuery = countQuery.in("cliente_id", ids);
            dataQuery = dataQuery.in("cliente_id", ids);
          } else {
            countQuery = countQuery.eq("cliente_id", -1);
            dataQuery = dataQuery.eq("cliente_id", -1);
          }
        }
      }

      const [countResult, dataResult] = await Promise.all([
        countQuery,
        dataQuery,
      ]);

      if (countResult.error) throw countResult.error;
      if (dataResult.error) throw dataResult.error;

      setVendas((dataResult.data || []) as VendaCompleta[]);
      setTotalVendas(countResult.count || 0);
    } catch (error: any) {
      console.error("Erro ao carregar vendas:", error, {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirModal = (venda: VendaCompleta) => {
    if (!temPermissao("devolucoes.criar")) {
      toast.error("Você não tem permissão para processar devoluções");

      return;
    }
    setVendaSelecionada(venda);
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setVendaSelecionada(null);
    setModalAberto(false);
  };

  const handleDevolucaoProcessada = () => {
    carregarVendas(paginaAtual, busca);
    handleFecharModal();
    toast.success("Devolução processada com sucesso!");
  };

  const handleAbrirHistorico = (vendaId: string) => {
    setVendaHistorico(vendaId);
    setModalHistoricoAberto(true);
  };

  const handleFecharHistorico = () => {
    setVendaHistorico(null);
    setModalHistoricoAberto(false);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR");
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const calcularQuantidadeDevolvida = (venda: VendaCompleta) => {
    if (!venda.itens) return 0;

    return venda.itens.reduce(
      (total, item) => total + (item.devolvido || 0),
      0,
    );
  };

  const calcularQuantidadeTotal = (venda: VendaCompleta) => {
    if (!venda.itens) return 0;

    return venda.itens.reduce((total, item) => total + item.quantidade, 0);
  };

  const totalPaginas = Math.ceil(totalVendas / itensPorPagina);
  const devolucoesNaLista = vendas.filter(
    (venda) => calcularQuantidadeDevolvida(venda) > 0,
  );
  const devolucoesTotais = devolucoesNaLista.filter((venda) => {
    const qtdDevolvida = calcularQuantidadeDevolvida(venda);
    const qtdTotal = calcularQuantidadeTotal(venda);

    return qtdTotal > 0 && qtdDevolvida === qtdTotal;
  }).length;
  const valorEmDevolucoes = vendas.reduce((total, venda) => {
    const valorDevolvido =
      venda.devolucoes?.reduce(
        (subtotal, devolucao) => subtotal + Number(devolucao.valor_total || 0),
        0,
      ) || 0;

    return total + valorDevolvido;
  }, 0);

  if (loading || loadingPermissoes) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!temPermissao("devolucoes.visualizar")) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-danger mb-4">Acesso Negado</h1>
        <p className="text-default-500">
          Você não tem permissão para visualizar devoluções.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-5">
        <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <PackageX className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Operações de Pós-Venda
              </p>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Devoluções
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gerencie devoluções de vendas concluídas
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <KpiCard
            bg="bg-primary/5"
            color="text-primary"
            icon={<ShoppingBag className="w-4 h-4" />}
            iconBg="bg-primary/10"
            label="Vendas Elegíveis"
            value={totalVendas.toString()}
          />
          <KpiCard
            bg="bg-amber-50 dark:bg-amber-900/20"
            color="text-amber-600 dark:text-amber-400"
            icon={<PackageX className="w-4 h-4" />}
            iconBg="bg-amber-100 dark:bg-amber-900/40"
            label="Já Devolvidas"
            sub={`${devolucoesTotais} total`}
            value={devolucoesNaLista.length.toString()}
          />
          <KpiCard
            bg="bg-rose-50 dark:bg-rose-900/20"
            color="text-rose-600 dark:text-rose-400"
            icon={<TrendingUp className="w-4 h-4" />}
            iconBg="bg-rose-100 dark:bg-rose-900/40"
            label="Valor Devolvido"
            value={formatarMoeda(valorEmDevolucoes)}
          />
        </div>
      </div>

      {/* Busca */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-4">
        <p className="text-sm font-semibold text-gray-800 dark:text-white mb-1">
          Buscar venda para devolução
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Localize por número da venda, cliente ou documento.
        </p>
        <Input
          classNames={{
            input: "text-sm",
            inputWrapper:
              "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl",
          }}
          placeholder="Buscar por número da venda, cliente ou DOC..."
          size="sm"
          startContent={<Search className="w-4 h-4 text-gray-400" />}
          value={busca}
          variant="bordered"
          onChange={(e) => {
            setBusca(e.target.value);
            setPaginaAtual(1);
          }}
        />
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-gray-100 dark:border-zinc-800 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-gray-800 dark:text-white">
              Vendas concluídas com pagamento
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Mostrando {vendas.length} de {totalVendas} venda(s)
            </p>
          </div>
          {totalPaginas > 1 && (
            <div className="flex items-center gap-2">
              <Button
                className="rounded-xl text-xs"
                isDisabled={paginaAtual === 1}
                size="sm"
                variant="flat"
                onPress={() => handleMudarPagina(paginaAtual - 1)}
              >
                Anterior
              </Button>
              <span className="min-w-28 text-center text-xs font-medium text-slate-500 dark:text-zinc-400">
                Página {paginaAtual} de {totalPaginas}
              </span>
              <Button
                className="rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                isDisabled={paginaAtual === totalPaginas}
                size="sm"
                variant="flat"
                onPress={() => handleMudarPagina(paginaAtual + 1)}
              >
                Próxima
              </Button>
            </div>
          )}
        </div>
        <div className="px-2 py-2 lg:px-3">
          <Table
            aria-label="Tabela de vendas concluídas"
            classNames={{
              table: "min-h-[420px]",
              th: "bg-gray-50 dark:bg-zinc-800/50 text-gray-400 dark:text-gray-500 text-[10px] font-semibold uppercase tracking-wider",
              td: "py-3 text-xs text-gray-600 dark:text-gray-300",
              wrapper: "shadow-none bg-transparent",
              tr: "border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors",
            }}
          >
            <TableHeader>
              <TableColumn>VENDA</TableColumn>
              <TableColumn className="hidden md:table-cell">DATA</TableColumn>
              <TableColumn>CLIENTE</TableColumn>
              <TableColumn className="hidden lg:table-cell">LOJA</TableColumn>
              <TableColumn className="hidden xl:table-cell">ITENS</TableColumn>
              <TableColumn>VALOR</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>AÇÕES</TableColumn>
            </TableHeader>
            <TableBody
              emptyContent={
                <div className="py-12 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-zinc-800">
                    <PackageX className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nenhuma venda encontrada
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Ajuste os termos da busca para continuar.
                  </p>
                </div>
              }
            >
              {vendas.map((venda) => {
                const qtdDevolvida = calcularQuantidadeDevolvida(venda);
                const qtdTotal = calcularQuantidadeTotal(venda);
                const temDevolucao = qtdDevolvida > 0;

                return (
                  <TableRow key={venda.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-gray-800 dark:text-white">
                          #{venda.numero_venda}
                        </div>
                        <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                          {venda.status}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatarData(venda.criado_em)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-700 text-gray-500">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-xs font-medium text-gray-800 dark:text-white">
                            {venda.cliente?.nome || "Cliente não informado"}
                          </div>
                          {venda.cliente?.doc && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {venda.cliente.doc}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <Store className="w-3.5 h-3.5" />
                        {venda.loja?.nome || "Sem loja"}
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <div className="space-y-0.5">
                        <p className="text-xs font-medium text-gray-800 dark:text-white">
                          {qtdTotal} {qtdTotal === 1 ? "item" : "itens"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {temDevolucao
                            ? `${qtdDevolvida} devolvido(s)`
                            : "Sem movimentações de devolução"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold text-gray-800 dark:text-white">
                          {formatarMoeda(venda.valor_total)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Pago: {formatarMoeda(venda.valor_pago || 0)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {temDevolucao ? (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            qtdDevolvida === qtdTotal
                              ? "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                              : "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                          }`}
                        >
                          {qtdDevolvida === qtdTotal
                            ? "Devolução Total"
                            : "Devolução Parcial"}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-zinc-700">
                          Sem Devoluções
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            isIconOnly
                            className="rounded-lg"
                            size="sm"
                            variant="light"
                          >
                            <EllipsisVertical className="w-4 h-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Ações"
                          onAction={(key) => {
                            if (key === "processar") handleAbrirModal(venda);
                            else if (key === "historico")
                              handleAbrirHistorico(venda.id);
                          }}
                        >
                          <DropdownItem
                            key="processar"
                            startContent={<PackageX className="w-4 h-4" />}
                          >
                            Processar Devolução
                          </DropdownItem>
                          <DropdownItem
                            key="historico"
                            startContent={<History className="w-4 h-4" />}
                          >
                            Ver Histórico
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {vendaSelecionada && (
        <ModalDevolucao
          isOpen={modalAberto}
          venda={vendaSelecionada}
          onClose={handleFecharModal}
          onSuccess={handleDevolucaoProcessada}
        />
      )}

      {vendaHistorico && (
        <HistoricoDevolucoes
          isOpen={modalHistoricoAberto}
          vendaId={vendaHistorico}
          onClose={handleFecharHistorico}
        />
      )}
    </div>
  );
}

function KpiCard({
  icon,
  value,
  label,
  sub,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  // Props de cor mantidas por compatibilidade, porém ignoradas (visual sóbrio)
  color?: string;
  bg?: string;
  iconBg?: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
          {value}
        </p>
        <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider truncate">
          {label}
        </p>
        {sub && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}
