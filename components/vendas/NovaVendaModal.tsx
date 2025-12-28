"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Input,
  Progress,
  Autocomplete,
  AutocompleteItem,
  Chip,
  Card,
  CardBody,
  Accordion,
  AccordionItem,
} from "@heroui/react";
import {
  User,
  Store,
  ShoppingCart,
  CreditCard,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  UserPlus,
} from "lucide-react";
import { ProdutoSearchGrid } from "./ProdutoSearchGrid";
import { CarrinhoVenda } from "./CarrinhoVenda";
import { PagamentosPanel } from "./PagamentosPanel";
import { DescontoModal } from "./DescontoModal";
import { CreditosClientePanel } from "./CreditosClientePanel";
import ClienteFormModal from "../clientes/ClienteFormModal";
import { DevolucoesService } from "@/services/devolucoesService";
import { CaixaService } from "@/services/caixaService";
import { useToast } from "@/components/Toast";
import { usePermissoes } from "@/hooks/usePermissoes";
import type {
  ItemCarrinho,
  PagamentoCarrinho,
  CreditoCliente,
  VendaCompleta,
} from "@/types/vendas";

interface NovaVendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmar: (dados: DadosVenda, vendaId?: string) => Promise<void>;
  clientes: Array<{ id: string; nome: string; doc?: string | null }>;
  lojas: Array<{ id: number; nome: string }>;
  produtos: Array<{
    id: string;
    nome: string;
    codigo: string;
    preco_venda: number;
    estoque_disponivel: number;
    categoria?: string;
  }>;
  creditosDisponiveis?: number;
  vendaParaEditar?: VendaCompleta | null;
  onClienteCriado?: () => void;
}

interface DadosVenda {
  cliente_id: string;
  loja_id: number;
  tipo: "normal" | "fiada";
  data_prevista_pagamento?: string;
  itens: ItemCarrinho[];
  pagamentos: PagamentoCarrinho[];
  desconto: {
    tipo: "valor" | "percentual";
    valor: number;
    motivo: string;
  } | null;
}

const STEPS = [
  { id: 1, name: "Dados Iniciais", icon: User },
  { id: 2, name: "Produtos", icon: ShoppingCart },
  { id: 3, name: "Pagamento", icon: CreditCard },
  { id: 4, name: "Confirmar", icon: CheckCircle },
];

export function NovaVendaModal({
  isOpen,
  onClose,
  onConfirmar,
  clientes,
  lojas,
  produtos,
  creditosDisponiveis = 0,
  vendaParaEditar = null,
  onClienteCriado,
}: NovaVendaModalProps) {
  const toast = useToast();
  const { temPermissao, temAcessoLoja } = usePermissoes();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Dados da venda
  const [clienteSelecionado, setClienteSelecionado] = useState("");
  const [lojaSelecionada, setLojaSelecionada] = useState<number | null>(null);
  const [tipoVenda, setTipoVenda] = useState<"normal" | "fiada">("normal");
  const [dataPrevistaPagamento, setDataPrevistaPagamento] = useState("");

  // Itens e pagamentos
  const [itensCarrinho, setItensCarrinho] = useState<ItemCarrinho[]>([]);
  const [pagamentos, setPagamentos] = useState<PagamentoCarrinho[]>([]);
  const [valorDesconto, setValorDesconto] = useState(0);
  const [descontoInfo, setDescontoInfo] = useState<{
    tipo: "valor" | "percentual";
    valor: number;
    motivo: string;
  } | null>(null);

  // Rastrear alterações de estoque para reverter se necessário
  const [alteracoesEstoque, setAlteracoesEstoque] = useState<
    Array<{ produto_id: string; loja_id: number; quantidade: number }>
  >([]);

  // Modal de desconto
  const [descontoModalOpen, setDescontoModalOpen] = useState(false);
  const [descontoItemModalOpen, setDescontoItemModalOpen] = useState(false);
  const [produtoDescontoSelecionado, setProdutoDescontoSelecionado] = useState<
    string | null
  >(null);

  // Créditos do cliente
  const [creditosCliente, setCreditosCliente] = useState<CreditoCliente[]>([]);
  const [loadingCreditos, setLoadingCreditos] = useState(false);

  // Produtos com estoque da loja selecionada
  const [produtosComEstoque, setProdutosComEstoque] = useState<any[]>([]);

  // Paginação de produtos
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalProdutos, setTotalProdutos] = useState(0);
  const PRODUTOS_POR_PAGINA = 50;

  // Lojas com caixa aberto
  const [lojasComCaixaAberto, setLojasComCaixaAberto] = useState<Set<number>>(
    new Set()
  );
  const [loadingLojas, setLoadingLojas] = useState(false);

  // Modal de cadastro de cliente
  const [clienteModalOpen, setClienteModalOpen] = useState(false);

  // Função para calcular desconto de um item
  const calcularDescontoItem = (item: ItemCarrinho): number => {
    if (!item.desconto) return 0;

    if (item.desconto.tipo === "valor") {
      return item.desconto.valor;
    } else {
      return (item.subtotal * item.desconto.valor) / 100;
    }
  };

  // Verificar lojas com caixa aberto
  const verificarCaixasAbertos = async () => {
    setLoadingLojas(true);
    try {
      const lojasAbertas = new Set<number>();

      for (const loja of lojas) {
        const caixa = await CaixaService.buscarCaixaAberto(loja.id);
        if (caixa) {
          lojasAbertas.add(loja.id);
        }
      }

      setLojasComCaixaAberto(lojasAbertas);
    } catch (error) {
      console.error("Erro ao verificar caixas:", error);
    } finally {
      setLoadingLojas(false);
    }
  };

  // Calculos
  const descontosItens = itensCarrinho.reduce(
    (sum, item) => sum + calcularDescontoItem(item),
    0
  );
  const subtotalItens = itensCarrinho.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );
  const valorTotal = subtotalItens - descontosItens - valorDesconto;
  const valorPago = pagamentos.reduce((sum, pag) => sum + pag.valor, 0);
  const saldoDevedor = valorTotal - valorPago;

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const resetForm = () => {
    setCurrentStep(1);
    setClienteSelecionado("");
    setLojaSelecionada(null);
    setTipoVenda("normal");
    setDataPrevistaPagamento("");
    setItensCarrinho([]);
    setPagamentos([]);
    setValorDesconto(0);
    setDescontoInfo(null);
    setCreditosCliente([]);
  };

  // Verificar caixas abertos quando o modal abre
  useEffect(() => {
    if (isOpen) {
      verificarCaixasAbertos();
    }
  }, [isOpen]);

  // Carrega dados da venda para edição
  useEffect(() => {
    if (vendaParaEditar && isOpen) {
      setClienteSelecionado(vendaParaEditar.cliente_id);
      setLojaSelecionada(vendaParaEditar.loja_id);
      setTipoVenda(vendaParaEditar.tipo);
      setDataPrevistaPagamento(
        vendaParaEditar.data_prevista_pagamento
          ? new Date(vendaParaEditar.data_prevista_pagamento)
              .toISOString()
              .split("T")[0]
          : ""
      );

      // Carregar itens
      const itens: ItemCarrinho[] =
        vendaParaEditar.itens?.map((item: any) => ({
          produto_id: item.produto_id,
          produto_nome: item.produto_nome || "",
          produto_codigo: item.produto_codigo || "",
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          subtotal: item.subtotal,
          desconto:
            item.desconto_tipo && item.desconto_valor
              ? {
                  tipo: item.desconto_tipo as "valor" | "percentual",
                  valor: item.desconto_valor,
                  motivo: "Desconto aplicado",
                }
              : undefined,
        })) || [];
      setItensCarrinho(itens);

      // Carregar pagamentos
      const pags: PagamentoCarrinho[] =
        vendaParaEditar.pagamentos?.map((pag: any) => ({
          tipo_pagamento: pag.forma_pagamento || pag.tipo_pagamento,
          valor: pag.valor,
          data_pagamento: pag.data_pagamento || new Date().toISOString(),
          observacao: pag.observacoes || pag.observacao,
        })) || [];
      setPagamentos(pags);

      // Carregar desconto da venda
      if (vendaParaEditar.descontos && vendaParaEditar.descontos.length > 0) {
        const desc = vendaParaEditar.descontos[0];
        setDescontoInfo({
          tipo: desc.tipo === "percentual" ? "percentual" : "valor",
          valor: desc.valor,
          motivo: desc.motivo || "Desconto aplicado",
        });
      }

      // Ir direto para o passo 2 (produtos) se for edição
      setCurrentStep(2);
    }
  }, [vendaParaEditar, isOpen]);

  // Calcular valorDesconto quando descontoInfo mudar
  useEffect(() => {
    if (!descontoInfo) {
      setValorDesconto(0);
      return;
    }

    const subtotalItens = itensCarrinho.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
    const descontosItens = itensCarrinho.reduce(
      (sum, item) => sum + calcularDescontoItem(item),
      0
    );
    const baseCalculo = subtotalItens - descontosItens;

    if (descontoInfo.tipo === "percentual") {
      setValorDesconto((baseCalculo * descontoInfo.valor) / 100);
    } else {
      setValorDesconto(descontoInfo.valor);
    }
  }, [descontoInfo, itensCarrinho]);

  // Carrega créditos quando cliente é selecionado
  useEffect(() => {
    const carregarCreditos = async () => {
      if (!clienteSelecionado) {
        setCreditosCliente([]);
        return;
      }

      setLoadingCreditos(true);
      try {
        const creditos =
          await DevolucoesService.buscarCreditosCliente(clienteSelecionado);
        setCreditosCliente(creditos);
      } catch (error) {
        console.error("Erro ao carregar créditos:", error);
      } finally {
        setLoadingCreditos(false);
      }
    };

    carregarCreditos();
  }, [clienteSelecionado]);

  // Carrega estoque dos produtos quando loja é selecionada
  useEffect(() => {
    const carregarEstoque = async () => {
      if (!lojaSelecionada) {
        setProdutosComEstoque([]);
        return;
      }

      try {
        const { supabase } = await import("@/lib/supabaseClient");

        // Buscar TODOS os produtos com paginação (Supabase limita a 1000 por padrão)
        let allData: any[] = [];
        let page = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase
            .from("estoque_lojas")
            .select(
              `
              id_produto,
              quantidade,
              produtos:id_produto (
                id,
                descricao,
                codigo_fabricante,
                preco_venda,
                categoria,
                ativo
              )
            `
            )
            .eq("id_loja", lojaSelecionada)
            .range(page * pageSize, (page + 1) * pageSize - 1);

          if (error) throw error;

          allData = [...allData, ...(data || [])];
          page++;
          hasMore = (data?.length || 0) === pageSize;
        }

        // Mapear para o formato esperado
        const produtosAtualizados = allData
          .filter(
            (item: any) =>
              item.produtos &&
              item.produtos.ativo !== false &&
              item.quantidade > 0
          )
          .map((item: any) => ({
            id: item.produtos.id,
            nome: item.produtos.descricao,
            codigo: item.produtos.id.split("-")[0].toUpperCase(),
            preco_venda: item.produtos.preco_venda,
            categoria: item.produtos.categoria,
            estoque_disponivel: item.quantidade,
          }));

        setProdutosComEstoque(produtosAtualizados);
      } catch (error) {
        console.error("Erro ao carregar estoque:", error);
        setProdutosComEstoque([]);
      }
    };

    carregarEstoque();
  }, [lojaSelecionada]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Calcula estoque disponível considerando itens originais da venda em edição
  const calcularEstoqueDisponivel = (produtoId: string): number => {
    const produto = produtosComEstoque.find((p) => p.id === produtoId);
    const estoqueAtual = produto?.estoque_disponivel || 0;

    // Se não está editando, retorna o estoque atual
    if (!vendaParaEditar) {
      return estoqueAtual;
    }

    // Calcula quanto desse produto estava na venda original
    const quantidadeOriginal =
      vendaParaEditar.itens
        ?.filter((item: any) => item.produto_id === produtoId)
        .reduce((sum: number, item: any) => sum + item.quantidade, 0) || 0;

    // Estoque disponível = estoque atual + quantidade que estava na venda original
    return estoqueAtual + quantidadeOriginal;
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          clienteSelecionado &&
          lojaSelecionada &&
          (tipoVenda === "normal" || dataPrevistaPagamento)
        );
      case 2:
        return itensCarrinho.length > 0;
      case 3:
        // Pagamento agora é opcional
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirmar = async () => {
    setLoading(true);
    try {
      // Consolidar itens duplicados (agrupar por produto_id)
      const itensConsolidados = itensCarrinho.reduce((acc, item) => {
        const existente = acc.find((i) => i.produto_id === item.produto_id);
        if (existente) {
          existente.quantidade += item.quantidade;
          existente.subtotal += item.subtotal;
        } else {
          acc.push({ ...item });
        }
        return acc;
      }, [] as ItemCarrinho[]);

      await onConfirmar(
        {
          cliente_id: clienteSelecionado,
          loja_id: lojaSelecionada!,
          tipo: tipoVenda,
          data_prevista_pagamento: dataPrevistaPagamento || undefined,
          itens: itensConsolidados,
          pagamentos,
          desconto: descontoInfo,
        },
        vendaParaEditar?.id
      );

      handleClose();
    } catch (error) {
      console.error("Erro ao processar venda:", error);
    } finally {
      setLoading(false);
    }
  };

  const adicionarProdutoCarrinho = (produto: any) => {
    const itemExistente = itensCarrinho.find(
      (i) => i.produto_id === produto.id
    );

    // Valida estoque disponível
    const quantidadeAtual = itemExistente ? itemExistente.quantidade : 0;
    const novaQuantidade = quantidadeAtual + 1;
    const estoqueDisponivel = calcularEstoqueDisponivel(produto.id);

    if (novaQuantidade > estoqueDisponivel) {
      toast.error(
        `Estoque insuficiente! Disponível: ${estoqueDisponivel} unidade(s)`
      );
      return;
    }

    if (itemExistente) {
      setItensCarrinho(
        itensCarrinho.map((item) =>
          item.produto_id === produto.id
            ? {
                ...item,
                quantidade: item.quantidade + 1,
                subtotal: (item.quantidade + 1) * item.preco_unitario,
              }
            : item
        )
      );
    } else {
      const novoItem: ItemCarrinho = {
        produto_id: produto.id,
        produto_nome: produto.nome,
        produto_codigo: produto.codigo,
        quantidade: 1,
        preco_unitario: produto.preco_venda,
        subtotal: produto.preco_venda,
        estoque_disponivel: produto.estoque_disponivel,
      };
      setItensCarrinho([...itensCarrinho, novoItem]);
    }
  };

  const atualizarQuantidadeItem = (
    produtoId: string,
    novaQuantidade: number
  ) => {
    if (novaQuantidade < 1) return;

    const estoqueDisponivel = calcularEstoqueDisponivel(produtoId);

    // Valida estoque disponível
    if (novaQuantidade > estoqueDisponivel) {
      toast.error(
        `Estoque insuficiente! Disponível: ${estoqueDisponivel} unidade(s)`
      );
      return;
    }

    setItensCarrinho(
      itensCarrinho.map((item) =>
        item.produto_id === produtoId
          ? {
              ...item,
              quantidade: novaQuantidade,
              subtotal: novaQuantidade * item.preco_unitario,
            }
          : item
      )
    );
  };

  const atualizarPrecoItem = (produtoId: string, novoPreco: number) => {
    if (novoPreco <= 0) {
      toast.error("O preço deve ser maior que zero");
      return;
    }

    setItensCarrinho(
      itensCarrinho.map((item) =>
        item.produto_id === produtoId
          ? {
              ...item,
              preco_unitario: novoPreco,
              subtotal: item.quantidade * novoPreco,
            }
          : item
      )
    );
    toast.success("Preço atualizado com sucesso!");
  };

  const aplicarDescontoItem = (
    produtoId: string,
    tipo: "valor" | "percentual",
    valor: number
  ) => {
    // Limpar desconto geral ao aplicar desconto por item
    if (valorDesconto > 0) {
      setValorDesconto(0);
      setDescontoInfo(null);
      toast.info("Desconto geral removido ao aplicar desconto por item");
    }

    setItensCarrinho(
      itensCarrinho.map((item) =>
        item.produto_id === produtoId
          ? {
              ...item,
              desconto: { tipo, valor },
            }
          : item
      )
    );
  };

  const abrirDescontoItem = (produtoId: string) => {
    setProdutoDescontoSelecionado(produtoId);
    setDescontoItemModalOpen(true);
  };

  const abrirDescontoGeral = () => {
    // Verificar se há descontos por item
    const temDescontoPorItem = itensCarrinho.some((item) => item.desconto);
    if (temDescontoPorItem) {
      toast.warning(
        "Remova os descontos individuais dos produtos antes de aplicar desconto geral"
      );
      return;
    }
    setDescontoModalOpen(true);
  };

  const removerDescontoItem = (produtoId: string) => {
    setItensCarrinho(
      itensCarrinho.map((item) =>
        item.produto_id === produtoId
          ? {
              ...item,
              desconto: undefined,
            }
          : item
      )
    );
  };

  const removerDescontoGeral = () => {
    setValorDesconto(0);
    setDescontoInfo(null);
  };

  const clienteNome = clientes.find((c) => c.id === clienteSelecionado)?.nome;
  const lojaNome = lojas.find((l) => l.id === lojaSelecionada)?.nome;

  return (
    <React.Fragment>
      {toast.ToastComponent}
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        size="5xl"
        scrollBehavior="inside"
        isDismissable={false}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-3">
            <h2 className="text-2xl font-bold">
              {vendaParaEditar ? "Editar Venda" : "Nova Venda"}
            </h2>

            {/* Stepper */}
            <div className="w-full">
              <Progress
                value={(currentStep / 4) * 100}
                color="primary"
                className="mb-4"
              />
              <div className="flex justify-between">
                {STEPS.map((step) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;

                  return (
                    <div
                      key={step.id}
                      className={`flex flex-col items-center gap-2 ${
                        isActive
                          ? "text-primary"
                          : isCompleted
                            ? "text-success"
                            : "text-gray-400"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isActive
                            ? "bg-primary text-white"
                            : isCompleted
                              ? "bg-success text-white"
                              : "bg-gray-200"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium">{step.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </ModalHeader>

          <ModalBody>
            {/* Step 1: Dados Iniciais */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">
                  Informações da Venda
                </h3>

                <div className="flex gap-2 items-end">
                  <Autocomplete
                    label="Cliente *"
                    placeholder="Busque pelo nome, CPF ou CNPJ"
                    selectedKey={clienteSelecionado}
                    onSelectionChange={(key) =>
                      setClienteSelecionado(key as string)
                    }
                    allowsCustomValue={false}
                    defaultItems={clientes}
                    className="flex-1"
                    description={`${clientes.length} cliente${clientes.length !== 1 ? "s" : ""} disponível${clientes.length !== 1 ? "eis" : ""} para seleção`}
                  >
                    {(cliente) => (
                      <AutocompleteItem
                        key={cliente.id}
                        textValue={`${cliente.nome} ${cliente.doc || ""}`}
                      >
                        <div>
                          <div className="font-medium">{cliente.nome}</div>
                          {cliente.doc && (
                            <div className="text-xs text-default-500">
                              {cliente.doc}
                            </div>
                          )}
                        </div>
                      </AutocompleteItem>
                    )}
                  </Autocomplete>

                  <Button
                    color="primary"
                    variant="flat"
                    isIconOnly
                    onPress={() => setClienteModalOpen(true)}
                    aria-label="Cadastrar novo cliente"
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>

                <Select
                  label="Loja *"
                  placeholder="Selecione a loja"
                  selectedKeys={
                    lojaSelecionada ? [lojaSelecionada.toString()] : []
                  }
                  onChange={(e) => setLojaSelecionada(parseInt(e.target.value))}
                  isLoading={loadingLojas}
                  description={
                    lojasComCaixaAberto.size === 0
                      ? "Nenhuma loja com caixa aberto"
                      : "Selecione uma loja com caixa aberto"
                  }
                  disabledKeys={lojas
                    .filter((loja) => !lojasComCaixaAberto.has(loja.id))
                    .map((loja) => loja.id.toString())}
                >
                  {lojas
                    .filter((loja) =>
                      typeof temAcessoLoja === "function"
                        ? temAcessoLoja(loja.id)
                        : true
                    )
                    .map((loja) => (
                      <SelectItem
                        key={loja.id.toString()}
                        textValue={loja.nome}
                      >
                        <div className="flex justify-between items-center">
                          <span>{loja.nome}</span>
                          {!lojasComCaixaAberto.has(loja.id) && (
                            <Chip size="sm" color="danger" variant="flat">
                              Caixa Fechado
                            </Chip>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                </Select>

                <Select
                  label="Tipo de Venda *"
                  selectedKeys={[tipoVenda]}
                  onChange={(e) =>
                    setTipoVenda(e.target.value as "normal" | "fiada")
                  }
                >
                  <SelectItem key="normal">Venda Normal (À vista)</SelectItem>
                  <SelectItem key="fiada">Venda Fiada (A prazo)</SelectItem>
                </Select>

                {tipoVenda === "fiada" && (
                  <Input
                    type="date"
                    label="Data Prevista de Pagamento *"
                    value={dataPrevistaPagamento}
                    onChange={(e) => setDataPrevistaPagamento(e.target.value)}
                  />
                )}
              </div>
            )}

            {/* Step 2: Produtos */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Adicionar Produtos</h3>

                <ProdutoSearchGrid
                  produtos={produtosComEstoque}
                  onAdicionarProduto={adicionarProdutoCarrinho}
                />

                {itensCarrinho.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">Carrinho</h4>
                    <CarrinhoVenda
                      itens={itensCarrinho}
                      onRemoverItem={(id) =>
                        setItensCarrinho(
                          itensCarrinho.filter((i) => i.produto_id !== id)
                        )
                      }
                      onAtualizarQuantidade={atualizarQuantidadeItem}
                      onAtualizarPreco={atualizarPrecoItem}
                      valorTotal={valorTotal}
                      valorDesconto={valorDesconto}
                      onRemoverDescontoItem={removerDescontoItem}
                      onRemoverDescontoGeral={removerDescontoGeral}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Pagamento */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">
                  Formas de Pagamento
                </h3>

                <div className="bg-default-100 p-4 rounded-lg mb-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span>Subtotal dos itens:</span>
                      <span>{formatarMoeda(subtotalItens)}</span>
                    </div>
                    {descontosItens > 0 && (
                      <div className="flex justify-between items-center text-sm text-warning">
                        <span>Descontos nos itens:</span>
                        <span>- {formatarMoeda(descontosItens)}</span>
                      </div>
                    )}
                    {valorDesconto > 0 && (
                      <div className="flex justify-between items-center text-sm text-success">
                        <span>Desconto geral:</span>
                        <span>- {formatarMoeda(valorDesconto)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center border-t pt-2">
                      <span className="font-semibold">Valor Total:</span>
                      <span className="text-xl font-bold text-primary">
                        {formatarMoeda(valorTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Painel de Créditos do Cliente em Accordion */}
                {creditosCliente.length > 0 && (
                  <div className="mb-4">
                    <Accordion variant="bordered">
                      <AccordionItem
                        key="creditos"
                        aria-label="Créditos do Cliente"
                        title={
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              Créditos do Cliente
                            </span>
                            <Chip size="sm" color="success" variant="flat">
                              {creditosCliente.length}{" "}
                              {creditosCliente.length === 1
                                ? "crédito"
                                : "créditos"}
                            </Chip>
                          </div>
                        }
                      >
                        <CreditosClientePanel
                          clienteId={clienteSelecionado}
                          creditos={creditosCliente}
                        />
                      </AccordionItem>
                    </Accordion>
                  </div>
                )}

                <PagamentosPanel
                  pagamentos={pagamentos}
                  onAdicionarPagamento={(pag) =>
                    setPagamentos([...pagamentos, pag])
                  }
                  onRemoverPagamento={(idx) =>
                    setPagamentos(pagamentos.filter((_, i) => i !== idx))
                  }
                  onEditarPagamento={(idx, pag) =>
                    setPagamentos(
                      pagamentos.map((p, i) => (i === idx ? pag : p))
                    )
                  }
                  valorTotal={valorTotal}
                  valorPago={valorPago}
                  saldoDevedor={saldoDevedor}
                  creditosDisponiveis={creditosCliente.reduce(
                    (sum, c) => sum + c.saldo,
                    0
                  )}
                  subtotalItens={subtotalItens}
                  descontosItens={descontosItens}
                  descontoGeral={valorDesconto}
                  itens={itensCarrinho}
                  onAplicarDescontoGeral={
                    temPermissao("vendas.aplicar_desconto")
                      ? abrirDescontoGeral
                      : undefined
                  }
                  onAplicarDescontoItem={
                    temPermissao("vendas.aplicar_desconto")
                      ? abrirDescontoItem
                      : undefined
                  }
                  onAplicarDescontoRapido={
                    temPermissao("vendas.aplicar_desconto")
                      ? (tipo, valor, motivo) => {
                          // Limpar descontos individuais se houver
                          if (itensCarrinho.some((item) => item.desconto)) {
                            toast.warning(
                              "Descontos individuais foram removidos ao aplicar desconto geral"
                            );
                            setItensCarrinho(
                              itensCarrinho.map((item) => ({
                                ...item,
                                desconto: undefined,
                              }))
                            );
                          }
                          setDescontoInfo({ tipo, valor, motivo });
                          toast.success("Desconto aplicado com sucesso!");
                        }
                      : undefined
                  }
                  descontoAplicado={descontoInfo}
                />

                {/* Lista de itens com descontos */}
                {(descontosItens > 0 || valorDesconto > 0) && (
                  <Card>
                    <CardBody className="p-3">
                      <p className="text-sm font-semibold mb-2">
                        Descontos Aplicados:
                      </p>
                      <div className="space-y-2">
                        {itensCarrinho
                          .filter((item) => item.desconto)
                          .map((item) => (
                            <div
                              key={item.produto_id}
                              className="flex justify-between items-center text-sm bg-success-50 p-2 rounded"
                            >
                              <span className="text-success-700">
                                {item.produto_nome}:{" "}
                                {item.desconto?.tipo === "percentual"
                                  ? `${item.desconto.valor}%`
                                  : formatarMoeda(item.desconto?.valor || 0)}
                              </span>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="flat"
                                color="danger"
                                onClick={() =>
                                  removerDescontoItem(item.produto_id)
                                }
                              >
                                <span className="text-xs">X</span>
                              </Button>
                            </div>
                          ))}
                        {valorDesconto > 0 && (
                          <div className="flex justify-between items-center text-sm bg-success-50 p-2 rounded">
                            <span className="text-success-700">
                              Desconto Geral: {formatarMoeda(valorDesconto)}
                            </span>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="flat"
                              color="danger"
                              onClick={removerDescontoGeral}
                            >
                              <span className="text-xs">X</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                )}

                {saldoDevedor > 0 && (
                  <div className="bg-primary/10 border border-primary p-3 rounded-lg">
                    <p className="text-sm">
                      ℹ️ Você pode adicionar pagamentos agora ou depois que a
                      venda for criada.
                      {tipoVenda === "normal" && (
                        <span className="block mt-1 text-warning">
                          Para vendas normais, recomenda-se adicionar pelo menos
                          um pagamento.
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Confirmação */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Resumo da Venda</h3>

                <div className="space-y-4">
                  {/* Dados */}
                  <div className="bg-default-100 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Informações</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Cliente:</strong> {clienteNome}
                      </p>
                      <p>
                        <strong>Loja:</strong> {lojaNome}
                      </p>
                      <p>
                        <strong>Tipo:</strong>{" "}
                        {tipoVenda === "normal" ? "Normal" : "Fiada"}
                      </p>
                      {tipoVenda === "fiada" && dataPrevistaPagamento && (
                        <p>
                          <strong>Previsão Pagamento:</strong>{" "}
                          {new Date(dataPrevistaPagamento).toLocaleDateString(
                            "pt-BR"
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Itens */}
                  <div className="bg-default-100 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">
                      Produtos ({itensCarrinho.length} itens)
                    </h4>
                    <div className="space-y-1 text-sm max-h-40 overflow-y-auto">
                      {itensCarrinho.map((item) => (
                        <div
                          key={item.produto_id}
                          className="flex justify-between border-b pb-1"
                        >
                          <span>
                            {item.quantidade}x {item.produto_nome}
                          </span>
                          <span className="font-semibold">
                            {formatarMoeda(item.subtotal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pagamentos */}
                  <div className="bg-default-100 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">
                      Pagamentos ({pagamentos.length})
                    </h4>
                    <div className="space-y-1 text-sm">
                      {pagamentos.map((pag, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="capitalize">
                            {pag.tipo_pagamento.replace("_", " ")}
                          </span>
                          <span>{formatarMoeda(pag.valor)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totais */}
                  <div className="bg-primary/10 p-4 rounded-lg border-2 border-primary">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>{formatarMoeda(subtotalItens)}</span>
                      </div>
                      {descontosItens > 0 && (
                        <div className="flex justify-between text-sm text-warning">
                          <span>Descontos nos itens:</span>
                          <span>- {formatarMoeda(descontosItens)}</span>
                        </div>
                      )}
                      {valorDesconto > 0 && (
                        <div className="flex justify-between text-sm text-success">
                          <span>Desconto geral:</span>
                          <span>- {formatarMoeda(valorDesconto)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total:</span>
                        <span className="text-primary">
                          {formatarMoeda(valorTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Pago:</span>
                        <span className="text-success">
                          {formatarMoeda(valorPago)}
                        </span>
                      </div>
                      {saldoDevedor > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Saldo Devedor:</span>
                          <span className="text-danger">
                            {formatarMoeda(saldoDevedor)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="light" onClick={handleClose}>
              Cancelar
            </Button>
            {currentStep > 1 && (
              <Button
                variant="bordered"
                onClick={handleBack}
                startContent={<ArrowLeft className="w-4 h-4" />}
              >
                Voltar
              </Button>
            )}
            {currentStep < 4 ? (
              <Button
                color="primary"
                onClick={handleNext}
                isDisabled={!canProceed()}
                endContent={<ArrowRight className="w-4 h-4" />}
              >
                Próximo
              </Button>
            ) : (
              <Button
                color="success"
                onClick={handleConfirmar}
                isLoading={loading}
                startContent={<CheckCircle className="w-4 h-4" />}
              >
                {vendaParaEditar ? "Salvar Alterações" : "Finalizar Venda"}
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      <DescontoModal
        isOpen={descontoModalOpen}
        onClose={() => setDescontoModalOpen(false)}
        onAplicar={(tipo, valor, motivo) => {
          const subtotal = itensCarrinho.reduce(
            (sum, item) => sum + item.subtotal,
            0
          );
          const valorDesc = tipo === "valor" ? valor : (subtotal * valor) / 100;
          setValorDesconto(valorDesc);
          setDescontoInfo({ tipo, valor, motivo });
          setDescontoModalOpen(false);
        }}
        valorTotal={itensCarrinho.reduce((sum, item) => sum + item.subtotal, 0)}
      />

      {/* Modal de Desconto por Item */}
      {produtoDescontoSelecionado && (
        <DescontoModal
          isOpen={descontoItemModalOpen}
          onClose={() => {
            setDescontoItemModalOpen(false);
            setProdutoDescontoSelecionado(null);
          }}
          onAplicar={(tipo, valor, motivo) => {
            aplicarDescontoItem(produtoDescontoSelecionado, tipo, valor);
            setDescontoItemModalOpen(false);
            setProdutoDescontoSelecionado(null);
          }}
          valorTotal={
            itensCarrinho.find(
              (i) => i.produto_id === produtoDescontoSelecionado
            )?.subtotal || 0
          }
        />
      )}

      {/* Modal de Cadastro de Cliente */}
      <ClienteFormModal
        isOpen={clienteModalOpen}
        onClose={() => setClienteModalOpen(false)}
        onSuccess={() => {
          setClienteModalOpen(false);
          toast.success("Cliente cadastrado com sucesso!");
          if (onClienteCriado) {
            onClienteCriado();
          }
        }}
      />
    </React.Fragment>
  );
}
