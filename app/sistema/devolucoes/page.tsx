"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Spinner,
} from "@heroui/react";
import { PackageX, Search, Calendar, User, Store, History } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { VendaCompleta } from "@/types/vendas";
import { ModalDevolucao } from "@/components/devolucoes/ModalDevolucao";
import { HistoricoDevolucoes } from "@/components/devolucoes/HistoricoDevolucoes";
import { usePermissoes } from "@/hooks/usePermissoes";
import { useLojaFilter } from "@/hooks/useLojaFilter";

export default function DevolucoesPage() {
  const { usuario } = useAuth();
  const { temPermissao, loading: loadingPermissoes } = usePermissoes();
  const { lojaId, podeVerTodasLojas } = useLojaFilter();

  const [vendas, setVendas] = useState<VendaCompleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTabela, setLoadingTabela] = useState(false);
  const [busca, setBusca] = useState("");
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
    cliente:clientes(id, nome, doc:doc, telefone),
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

  useEffect(() => {
    if (!loadingPermissoes) {
      carregarVendas(paginaAtual, busca);
    }
  }, [loadingPermissoes, lojaId, podeVerTodasLojas, paginaAtual, busca]);

  const carregarVendas = async (pagina: number, termoBusca: string) => {
    try {
      const isInitialLoad = vendas.length === 0;
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setLoadingTabela(true);
      }

      const offset = (pagina - 1) * itensPorPagina;

      let query = supabase
        .from("vendas")
        .select(selectVendas, { count: "exact" })
        .in("status", ["concluida", "devolvida"])
        .gt("valor_pago", 0)
        .order("criado_em", { ascending: false })
        .range(offset, offset + itensPorPagina - 1);

      if (lojaId !== null && !podeVerTodasLojas) {
        query = query.eq("loja_id", lojaId);
      }

      if (termoBusca) {
        const ehNumerico = /^\d+$/.test(termoBusca);
        if (ehNumerico) {
          query = query.eq("numero_venda", parseInt(termoBusca));
        } else {
          const { data: clientes } = await supabase
            .from("clientes")
            .select("id")
            .or(
              `nome.ilike.%${termoBusca}%,doc.ilike.%${termoBusca}%`,
            );

          const ids = (clientes || []).map((c) => c.id);

          if (ids.length > 0) {
            query = query.in("cliente_id", ids);
          } else {
            query = query.eq("cliente_id", -1);
          }
        }
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setVendas((data || []) as VendaCompleta[]);
      setTotalVendas(count || 0);
    } catch (error) {
      console.error("Erro ao carregar vendas:", error);
    } finally {
      setLoading(false);
      setLoadingTabela(false);
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <PackageX className="w-8 h-8 text-danger" />
          <h1 className="text-3xl font-bold">Devoluções</h1>
        </div>
        <p className="text-default-500">
          Processe devoluções de vendas concluídas
        </p>
      </div>

      <Card className="mb-6">
        <CardBody>
          <Input
            classNames={{
              input: "text-base",
            }}
            placeholder="Buscar por número da venda, cliente ou DOC..."
            size="lg"
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPaginaAtual(1);
            }}
          />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="relative">
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-default-500">
                Mostrando {vendas.length} de {totalVendas} venda(s)
              </p>
            </div>
            {totalPaginas > 1 && (
              <div className="flex gap-2 items-center">
                <Button
                  isDisabled={paginaAtual === 1}
                  size="sm"
                  variant="flat"
                  onPress={() => setPaginaAtual(paginaAtual - 1)}
                >
                  Anterior
                </Button>
                <span className="text-sm text-default-500">
                  Página {paginaAtual} de {totalPaginas}
                </span>
                <Button
                  isDisabled={paginaAtual === totalPaginas}
                  size="sm"
                  variant="flat"
                  onPress={() => setPaginaAtual(paginaAtual + 1)}
                >
                  Próxima
                </Button>
              </div>
            )}
          </div>

          {loadingTabela && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 rounded-lg">
              <Spinner size="lg" />
            </div>
          )}

          <Table aria-label="Tabela de vendas concluídas">
            <TableHeader>
              <TableColumn>VENDA</TableColumn>
              <TableColumn>DATA</TableColumn>
              <TableColumn>CLIENTE</TableColumn>
              <TableColumn>LOJA</TableColumn>
              <TableColumn>ITENS</TableColumn>
              <TableColumn>VALOR</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>AÇÕES</TableColumn>
            </TableHeader>
            <TableBody
              emptyContent={
                <div className="text-center py-8">
                  <PackageX className="w-12 h-12 text-default-300 mx-auto mb-2" />
                  <p className="text-default-500">Nenhuma venda encontrada</p>
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
                      <div className="font-semibold">#{venda.numero_venda}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-default-400" />
                        {formatarData(venda.criado_em)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-default-400" />
                        <div>
                          <div className="font-medium">
                            {venda.cliente?.nome}
                          </div>
                          {venda.cliente?.doc && (
                            <div className="text-xs text-default-500">
                              {venda.cliente.doc}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Store className="w-4 h-4 text-default-400" />
                        {venda.loja?.nome}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {qtdTotal} {qtdTotal === 1 ? "item" : "itens"}
                        {temDevolucao && (
                          <div className="text-xs text-danger">
                            {qtdDevolvida} devolvido(s)
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">
                        {formatarMoeda(venda.valor_total)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {temDevolucao ? (
                        <Chip
                          color={
                            qtdDevolvida === qtdTotal ? "danger" : "warning"
                          }
                          size="sm"
                          variant="flat"
                        >
                          {qtdDevolvida === qtdTotal
                            ? "Devolução Total"
                            : "Devolução Parcial"}
                        </Chip>
                      ) : (
                        <Chip color="success" size="sm" variant="flat">
                          Sem Devoluções
                        </Chip>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {temPermissao("devolucoes.criar") && (
                          <Button
                            color="danger"
                            size="sm"
                            startContent={<PackageX className="w-4 h-4" />}
                            variant="flat"
                            onPress={() => handleAbrirModal(venda)}
                          >
                            Processar Devolução
                          </Button>
                        )}
                        {temDevolucao && (
                          <Button
                            color="primary"
                            size="sm"
                            startContent={<History className="w-4 h-4" />}
                            variant="flat"
                            onPress={() => handleAbrirHistorico(venda.id)}
                          >
                            Histórico
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

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
