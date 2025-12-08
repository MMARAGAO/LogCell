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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { VendaCompleta } from "@/types/vendas";
import { ModalDevolucao } from "@/components/devolucoes/ModalDevolucao";
import { HistoricoDevolucoes } from "@/components/devolucoes/HistoricoDevolucoes";
import { usePermissoes } from "@/hooks/usePermissoes";
import { useLojaFilter } from "@/hooks/useLojaFilter";
import { toast } from "sonner";

export default function DevolucoesPage() {
  const { usuario } = useAuth();
  const { temPermissao, loading: loadingPermissoes } = usePermissoes();
  const { lojaId, podeVerTodasLojas } = useLojaFilter();

  const [vendas, setVendas] = useState<VendaCompleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [buscandoVenda, setBuscandoVenda] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  const [paginaServidor, setPaginaServidor] = useState(0);
  const [temMaisVendas, setTemMaisVendas] = useState(true);
  const [totalVendas, setTotalVendas] = useState(0);
  const [vendaSelecionada, setVendaSelecionada] =
    useState<VendaCompleta | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [vendaHistorico, setVendaHistorico] = useState<string | null>(null);

  // Aguardar permissões serem carregadas antes de carregar vendas
  useEffect(() => {
    if (!loadingPermissoes) {
      carregarVendas();
    }
  }, [loadingPermissoes, lojaId, podeVerTodasLojas]);

  // Buscar venda específica por número quando digitar
  useEffect(() => {
    const timer = setTimeout(() => {
      if (busca && /^\d+$/.test(busca)) {
        buscarVendaPorNumero(parseInt(busca));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [busca]);

  const carregarVendas = async (pagina = 0, acumular = false) => {
    try {
      setLoading(true);
      const limite = 1000; // Limite máximo do Supabase
      const inicio = pagina * limite;

      let query = supabase
        .from("vendas")
        .select(
          `
          *,
          cliente:clientes(id, nome, cpf, telefone),
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
        `,
          { count: "exact" }
        )
        .eq("status", "concluida")
        .gt("valor_pago", 0) // Apenas vendas que já foram pagas
        .order("criado_em", { ascending: false })
        .range(inicio, inicio + limite - 1);

      // Aplicar filtro de loja se usuário não tiver acesso a todas
      if (lojaId !== null && !podeVerTodasLojas) {
        query = query.eq("loja_id", lojaId);
        console.log(`🏪 Filtrando devoluções da loja ${lojaId}`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      const vendasCarregadas = data as VendaCompleta[];

      if (acumular) {
        setVendas((prev) => [...prev, ...vendasCarregadas]);
      } else {
        setVendas(vendasCarregadas);
      }

      setTotalVendas(count || 0);
      const temMais = (count || 0) > inicio + limite;
      setTemMaisVendas(temMais);
      setPaginaServidor(pagina);

      // Carregar automaticamente próxima página se houver mais vendas
      if (temMais && vendasCarregadas.length === limite) {
        // Aguardar um pouco para não sobrecarregar
        setTimeout(() => {
          carregarVendas(pagina + 1, true);
        }, 100);
      }
    } catch (error) {
      console.error("Erro ao carregar vendas:", error);
    } finally {
      setLoading(false);
    }
  };

  const buscarVendaPorNumero = async (numeroVenda: number) => {
    try {
      setBuscandoVenda(true);

      let query = supabase
        .from("vendas")
        .select(
          `
          *,
          cliente:clientes(id, nome, cpf, telefone),
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
        `
        )
        .eq("numero_venda", numeroVenda)
        .eq("status", "concluida");

      // Aplicar filtro de loja se usuário não tiver acesso a todas
      if (lojaId !== null && !podeVerTodasLojas) {
        query = query.eq("loja_id", lojaId);
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === "PGRST116") {
          toast.error(
            `Venda #${numeroVenda} não encontrada ou não está concluída`
          );
        }
        console.error("Erro ao buscar venda:", error);
        return;
      }

      if (data) {
        // Adicionar venda encontrada ao topo da lista se não estiver lá
        setVendas((prevVendas) => {
          const exists = prevVendas.some((v) => v.numero_venda === numeroVenda);
          if (exists) {
            return prevVendas;
          }
          return [data as VendaCompleta, ...prevVendas];
        });
        toast.success(`Venda #${numeroVenda} encontrada!`);
      }
    } catch (error) {
      console.error("Erro ao buscar venda por número:", error);
    } finally {
      setBuscandoVenda(false);
    }
  };

  const vendasFiltradas = vendas.filter((venda) => {
    const termo = busca.toLowerCase();
    return (
      venda.numero_venda.toString().includes(termo) ||
      venda.cliente?.nome.toLowerCase().includes(termo) ||
      venda.cliente?.cpf?.includes(termo)
    );
  });

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
    // Recarregar vendas para atualizar os valores
    carregarVendas();
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
      0
    );
  };

  const calcularQuantidadeTotal = (venda: VendaCompleta) => {
    if (!venda.itens) return 0;
    return venda.itens.reduce((total, item) => total + item.quantidade, 0);
  };

  // Paginação no cliente
  const totalPaginasCliente = Math.ceil(
    vendasFiltradas.length / itensPorPagina
  );
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const vendasPaginadas = vendasFiltradas.slice(indiceInicio, indiceFim);

  // Reset página ao mudar busca
  useEffect(() => {
    setPaginaAtual(1);
  }, [busca]);

  // Verificar permissão de visualizar
  if (!loadingPermissoes && !temPermissao("devolucoes.visualizar")) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-danger mb-4">Acesso Negado</h1>
        <p className="text-default-500">
          Você não tem permissão para visualizar devoluções.
        </p>
      </div>
    );
  }

  if (loading || loadingPermissoes) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <PackageX className="w-8 h-8 text-danger" />
          <h1 className="text-3xl font-bold">Devoluções</h1>
        </div>
        <p className="text-default-500">
          Processe devoluções de vendas concluídas
        </p>
      </div>

      {/* Barra de busca */}
      <Card className="mb-6">
        <CardBody>
          <Input
            placeholder="Buscar por número da venda, cliente ou CPF..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            startContent={<Search className="w-4 h-4 text-default-400" />}
            size="lg"
            classNames={{
              input: "text-base",
            }}
          />
        </CardBody>
      </Card>

      {/* Tabela de vendas */}
      <Card>
        <CardBody>
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-default-500">
                Mostrando {vendasPaginadas.length} de {vendasFiltradas.length}{" "}
                venda(s)
                {loading && temMaisVendas && " (carregando mais...)"}
              </p>
              {totalVendas > vendas.length && (
                <p className="text-xs text-default-400">
                  Carregadas {vendas.length} de {totalVendas} vendas totais
                </p>
              )}
            </div>
            {totalPaginasCliente > 1 && (
              <div className="flex gap-2 items-center">
                <Button
                  size="sm"
                  variant="flat"
                  isDisabled={paginaAtual === 1}
                  onPress={() => setPaginaAtual(paginaAtual - 1)}
                >
                  Anterior
                </Button>
                <span className="text-sm text-default-500">
                  Página {paginaAtual} de {totalPaginasCliente}
                </span>
                <Button
                  size="sm"
                  variant="flat"
                  isDisabled={paginaAtual === totalPaginasCliente}
                  onPress={() => setPaginaAtual(paginaAtual + 1)}
                >
                  Próxima
                </Button>
              </div>
            )}
          </div>

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
              {vendasPaginadas.map((venda) => {
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
                          {venda.cliente?.cpf && (
                            <div className="text-xs text-default-500">
                              {venda.cliente.cpf}
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
                          variant="flat"
                          size="sm"
                        >
                          {qtdDevolvida === qtdTotal
                            ? "Devolução Total"
                            : "Devolução Parcial"}
                        </Chip>
                      ) : (
                        <Chip color="success" variant="flat" size="sm">
                          Sem Devoluções
                        </Chip>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {temPermissao("devolucoes.criar") && (
                          <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            onPress={() => handleAbrirModal(venda)}
                            startContent={<PackageX className="w-4 h-4" />}
                          >
                            Processar Devolução
                          </Button>
                        )}
                        {temDevolucao && (
                          <Button
                            size="sm"
                            color="primary"
                            variant="flat"
                            onPress={() => handleAbrirHistorico(venda.id)}
                            startContent={<History className="w-4 h-4" />}
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

      {/* Modal de Devolução */}
      {vendaSelecionada && (
        <ModalDevolucao
          isOpen={modalAberto}
          onClose={handleFecharModal}
          venda={vendaSelecionada}
          onSuccess={handleDevolucaoProcessada}
        />
      )}

      {/* Modal de Histórico */}
      {vendaHistorico && (
        <HistoricoDevolucoes
          isOpen={modalHistoricoAberto}
          onClose={handleFecharHistorico}
          vendaId={vendaHistorico}
        />
      )}
    </div>
  );
}
