"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Tabs, Tab } from "@heroui/tabs";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { Card, CardBody } from "@heroui/card";
import { UserPlus, Wrench, Package, Store, Trash2 } from "lucide-react";
import {
  OrdemServico,
  OrdemServicoFormData,
  OrdemServicoAparelhoFormData,
  StatusOS,
  PrioridadeOS,
  STATUS_OS_LABELS,
  PRIORIDADE_OS_LABELS,
} from "@/types/ordemServico";
import type { Cliente, Tecnico } from "@/types/clientesTecnicos";
import { buscarTodosClientesAtivos } from "@/lib/clienteHelpers";
import { buscarTecnicosAtivos } from "@/services/tecnicoService";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/Toast";

interface OrdemServicoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dados: OrdemServicoFormData) => Promise<void>;
  ordem?: OrdemServico | null;
  lojas: Array<{ id: number; nome: string }>;
}

export default function OrdemServicoFormModal({
  isOpen,
  onClose,
  onSubmit,
  ordem,
  lojas,
}: OrdemServicoFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [tabSelecionada, setTabSelecionada] = useState("cliente");
  const toast = useToast();

  // Listas
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingTecnicos, setLoadingTecnicos] = useState(false);

  // Cliente selecionado
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(
    null,
  );

  // Dados do Cliente (para quando não for cadastrado)
  const [clienteNome, setClienteNome] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [tipoCliente, setTipoCliente] = useState<
    "lojista" | "consumidor_final"
  >("consumidor_final");

  // Técnico selecionado
  const [tecnicoId, setTecnicoId] = useState<string | null>(null);

  // Dados do Equipamento
  const [equipamentoTipo, setEquipamentoTipo] = useState("");
  const [equipamentoMarca, setEquipamentoMarca] = useState("");
  const [equipamentoModelo, setEquipamentoModelo] = useState("");
  const [equipamentoNumeroSerie, setEquipamentoNumeroSerie] = useState("");
  const [equipamentoSenha, setEquipamentoSenha] = useState("");

  // Problema
  const [defeitoReclamado, setDefeitoReclamado] = useState("");
  const [estadoEquipamento, setEstadoEquipamento] = useState("");
  const [acessoriosEntregues, setAcessoriosEntregues] = useState("");

  // Serviço
  const [diagnostico, setDiagnostico] = useState("");
  const [servicoRealizado, setServicoRealizado] = useState("");
  const [observacoesTecnicas, setObservacoesTecnicas] = useState("");

  // Valores
  const [valorOrcamento, setValorOrcamento] = useState("");
  const [valorDesconto, setValorDesconto] = useState("");
  const [valorPago, setValorPago] = useState("");

  // Pagamentos
  const [pagamentos, setPagamentos] = useState<
    Array<{
      id?: string;
      data_pagamento: string;
      valor: number;
      forma_pagamento: string;
      observacao?: string;
    }>
  >([]);
  const [dataPagamento, setDataPagamento] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [valorPagamento, setValorPagamento] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("dinheiro");
  const [observacaoPagamento, setObservacaoPagamento] = useState("");

  // Prazos
  const [previsaoEntrega, setPrevisaoEntrega] = useState("");

  // Status
  const [status, setStatus] = useState<StatusOS>("aguardando");
  const [prioridade, setPrioridade] = useState<PrioridadeOS>("normal");

  // Múltiplos aparelhos
  const criarAparelhoVazio = (): Omit<
    OrdemServicoAparelhoFormData,
    "id_loja"
  > & { id_loja?: number } => ({
    equipamento_tipo: "",
    equipamento_marca: "",
    equipamento_modelo: "",
    equipamento_numero_serie: "",
    equipamento_imei: "",
    equipamento_senha: "",
    defeito_reclamado: "",
    estado_equipamento: "",
    acessorios_entregues: "",
    diagnostico: "",
    servico_realizado: "",
    observacoes_tecnicas: "",
    servicos: [] as Array<{ id?: string; descricao: string; valor: number }>,
  });

  const [aparelhos, setAparelhos] = useState<
    Array<
      ReturnType<typeof criarAparelhoVazio> & {
        id?: string;
        sequencia?: number;
        id_loja?: number;
      }
    >
  >([]);

  // Peças temporárias (antes de salvar a OS) - cada peça tem sua própria loja
  const [pecasTemp, setPecasTemp] = useState<any[]>([]);

  // Modal de adicionar peça
  const [modalPecaOpen, setModalPecaOpen] = useState(false);
  const [tipoPeca, setTipoPeca] = useState<"estoque" | "avulso">("estoque");
  const [idLojaPeca, setIdLojaPeca] = useState<number | null>(null);
  const [produtosEstoque, setProdutosEstoque] = useState<any[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null);
  const [idProdutoSelecionado, setIdProdutoSelecionado] = useState<
    string | null
  >(null);
  const [descricaoPeca, setDescricaoPeca] = useState("");
  const [qtdPeca, setQtdPeca] = useState("1");
  const [valorCustoPeca, setValorCustoPeca] = useState("");
  const [valorVendaPeca, setValorVendaPeca] = useState("");

  useEffect(() => {
    if (isOpen) {
      carregarClientes();
      carregarTecnicos();
    }

    if (ordem) {
      // Preencher form com dados da OS
      setClienteNome(ordem.cliente_nome || "");
      setClienteTelefone(ordem.cliente_telefone || "");
      setClienteEmail(ordem.cliente_email || "");
      setTipoCliente(ordem.tipo_cliente || "consumidor_final");

      setEquipamentoTipo(ordem.equipamento_tipo || "");
      setEquipamentoMarca(ordem.equipamento_marca || "");
      setEquipamentoModelo(ordem.equipamento_modelo || "");
      setEquipamentoNumeroSerie(ordem.equipamento_numero_serie || "");
      setEquipamentoSenha(ordem.equipamento_senha || "");

      setDefeitoReclamado(ordem.defeito_reclamado || "");
      setEstadoEquipamento(ordem.estado_equipamento || "");
      setAcessoriosEntregues(ordem.acessorios_entregues || "");

      setDiagnostico(ordem.diagnostico || "");
      setServicoRealizado(ordem.servico_realizado || "");
      setObservacoesTecnicas(ordem.observacoes_tecnicas || "");

      setValorOrcamento(ordem.valor_orcamento?.toString() || "");
      setValorDesconto(ordem.valor_desconto?.toString() || "0");
      setValorPago(ordem.valor_pago?.toString() || "0");

      setPrevisaoEntrega(
        ordem.previsao_entrega
          ? new Date(ordem.previsao_entrega).toISOString().split("T")[0]
          : "",
      );

      setStatus(ordem.status);
      setPrioridade(ordem.prioridade);
      setTecnicoId(ordem.tecnico_responsavel || null);

      if (ordem.aparelhos && ordem.aparelhos.length > 0) {
        setAparelhos(
          ordem.aparelhos.map((ap: any) => ({
            id: ap.id,
            sequencia: ap.sequencia,
            id_loja: ap.id_loja,
            equipamento_tipo: ap.equipamento_tipo || "",
            equipamento_marca: ap.equipamento_marca || "",
            equipamento_modelo: ap.equipamento_modelo || "",
            equipamento_numero_serie: ap.equipamento_numero_serie || "",
            equipamento_imei: ap.equipamento_imei || "",
            equipamento_senha: ap.equipamento_senha || "",
            defeito_reclamado: ap.defeito_reclamado || "",
            estado_equipamento: ap.estado_equipamento || "",
            acessorios_entregues: ap.acessorios_entregues || "",
            diagnostico: ap.diagnostico || "",
            observacoes_tecnicas: ap.observacoes_tecnicas || "",
            servico_realizado: ap.servico_realizado || "",
            servicos: (ap.servicos || []).map((s: any) => ({
              id: s.id,
              descricao: s.descricao,
              valor: Number(s.valor) || 0,
            })),
          })),
        );
      } else {
        setAparelhos([
          {
            ...criarAparelhoVazio(),
            id_loja: ordem.id_loja,
            equipamento_tipo: ordem.equipamento_tipo || "",
            equipamento_marca: ordem.equipamento_marca || "",
            equipamento_modelo: ordem.equipamento_modelo || "",
            equipamento_numero_serie: ordem.equipamento_numero_serie || "",
            equipamento_imei: ordem.equipamento_numero_serie || "",
            equipamento_senha: ordem.equipamento_senha || "",
            defeito_reclamado: ordem.defeito_reclamado || "",
            estado_equipamento: ordem.estado_equipamento || "",
            acessorios_entregues: ordem.acessorios_entregues || "",
            diagnostico: ordem.diagnostico || "",
            observacoes_tecnicas: ordem.observacoes_tecnicas || "",
            servicos: [],
          },
        ]);
      }

      // Carregar peças existentes da OS
      carregarPecasExistentes(ordem.id);

      // Carregar pagamentos existentes da OS
      carregarPagamentosExistentes(ordem.id);
    } else {
      limparForm();
      setAparelhos([criarAparelhoVazio()]);
    }
  }, [ordem, isOpen]);

  const carregarPecasExistentes = async (osId: string) => {
    try {
      const { supabase } = await import("@/lib/supabaseClient");

      const { data, error } = await supabase
        .from("ordem_servico_pecas")
        .select("*")
        .eq("id_ordem_servico", osId);

      if (error) {
        console.error("Erro ao carregar peças:", error);
        return;
      }

      // Converter para o formato de pecasTemp COM O ID
      const pecasFormatadas = (data || []).map((peca: any) => ({
        id: peca.id, // IMPORTANTE: guardar o ID para saber que é peça existente
        id_produto: peca.id_produto,
        id_loja: peca.id_loja, // IMPORTANTE: incluir id_loja das peças existentes
        tipo_produto: peca.tipo_produto,
        descricao_peca: peca.descricao_peca,
        quantidade: peca.quantidade,
        valor_custo: peca.valor_custo,
        valor_venda: peca.valor_venda,
      }));

      setPecasTemp(pecasFormatadas);
    } catch (error) {
      console.error("Erro ao carregar peças existentes:", error);
    }
  };

  const carregarPagamentosExistentes = async (osId: string) => {
    try {
      const { supabase } = await import("@/lib/supabaseClient");

      const { data, error } = await supabase
        .from("ordem_servico_pagamentos")
        .select("*")
        .eq("id_ordem_servico", osId)
        .order("data_pagamento", { ascending: false });

      if (error) {
        console.error("Erro ao carregar pagamentos:", error);
        return;
      }

      // Converter para o formato de pagamentos
      const pagamentosFormatados = (data || []).map((pag: any) => ({
        id: pag.id,
        data_pagamento: pag.data_pagamento,
        valor: pag.valor,
        forma_pagamento: pag.forma_pagamento,
        observacao: pag.observacao,
      }));

      setPagamentos(pagamentosFormatados);

      // Atualizar valor pago total
      const totalPago = pagamentosFormatados.reduce(
        (sum, p) => sum + p.valor,
        0,
      );
      setValorPago(totalPago.toString());
    } catch (error) {
      console.error("Erro ao carregar pagamentos existentes:", error);
    }
  };

  const carregarClientes = async () => {
    setLoadingClientes(true);
    try {
      const clientes = await buscarTodosClientesAtivos();
      setClientes(clientes);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      setClientes([]);
    } finally {
      setLoadingClientes(false);
    }
  };

  const carregarProdutosEstoque = async (lojaId: number) => {
    setLoadingProdutos(true);
    try {
      const { data, error } = await supabase
        .from("estoque_lojas")
        .select(
          `
          id,
          quantidade,
          produtos (
            id,
            descricao,
            marca,
            preco_compra,
            preco_venda
          ),
          lojas (
            id,
            nome
          )
        `,
        )
        .eq("id_loja", lojaId)
        .gt("quantidade", 0);

      if (error) throw error;

      const produtosFormatados =
        data?.map((item: any) => ({
          id: item.produtos.id,
          descricao: item.produtos.descricao,
          marca: item.produtos.marca,
          preco_compra: item.produtos.preco_compra || 0,
          preco_venda: item.produtos.preco_venda || 0,
          estoque_disponivel: item.quantidade,
          id_loja: lojaId,
          nome_loja: item.lojas.nome,
        })) || [];

      setProdutosEstoque(produtosFormatados);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoadingProdutos(false);
    }
  };

  const handleProdutoSelecionado = async (produtoId: string) => {
    if (!produtoId) return;

    setIdProdutoSelecionado(produtoId);
    // O ID é UUID (string), não precisa parseInt
    const produto = produtosEstoque.find((p) => p.id === produtoId);

    if (!produto) {
      console.error("Produto não encontrado no array produtosEstoque");
      return;
    }

    setProdutoSelecionado(produto);
    setDescricaoPeca(produto.descricao);

    // Preencher com os preços do banco de dados
    const precoCompra = produto.preco_compra || 0;
    const precoVenda = produto.preco_venda || 0;

    setValorCustoPeca(precoCompra.toString());
    setValorVendaPeca(precoVenda.toString());
  };

  const limparModalPeca = () => {
    setIdProdutoSelecionado(null);
    setProdutoSelecionado(null);
    setDescricaoPeca("");
    setQtdPeca("1");
    setValorCustoPeca("");
    setValorVendaPeca("");
    if (tipoPeca === "estoque") {
      setProdutosEstoque([]);
      setIdLojaPeca(null);
    }
  };

  const handleSalvarPeca = () => {
    if (tipoPeca === "estoque") {
      if (!idLojaPeca || !produtoSelecionado || !qtdPeca || !valorVendaPeca) {
        toast.showToast("Preencha todos os campos obrigatórios", "error");
        return;
      }

      const quantidade = parseInt(qtdPeca);
      if (quantidade > produtoSelecionado.estoque_disponivel) {
        toast.showToast(
          `Quantidade indisponível. Estoque: ${produtoSelecionado.estoque_disponivel}`,
          "error",
        );
        return;
      }

      const novaPeca = {
        tipo_produto: "estoque",
        id_produto: produtoSelecionado.id,
        id_loja: idLojaPeca,
        nome_loja: lojas.find((l) => l.id === idLojaPeca)?.nome,
        descricao_peca: produtoSelecionado.descricao,
        quantidade: quantidade,
        valor_custo: parseFloat(valorCustoPeca || "0"),
        valor_venda: parseFloat(valorVendaPeca),
      };

      setPecasTemp([...pecasTemp, novaPeca]);
    } else {
      // Peça avulsa
      if (!descricaoPeca || !qtdPeca || !valorVendaPeca) {
        toast.showToast("Preencha todos os campos obrigatórios", "error");
        return;
      }

      const novaPeca = {
        tipo_produto: "avulso",
        id_produto: null,
        id_loja: null,
        nome_loja: null,
        descricao_peca: descricaoPeca,
        quantidade: parseInt(qtdPeca),
        valor_custo: parseFloat(valorCustoPeca || "0"),
        valor_venda: parseFloat(valorVendaPeca),
      };

      setPecasTemp([...pecasTemp, novaPeca]);
    }

    setModalPecaOpen(false);
    limparModalPeca();
    toast.showToast("Peça adicionada!", "success");
  };

  const carregarTecnicos = async () => {
    setLoadingTecnicos(true);
    const { data } = await buscarTecnicosAtivos();
    setTecnicos(data || []);
    setLoadingTecnicos(false);
  };

  const handleClienteSelecionado = (id: string | null) => {
    setClienteId(id);
    const cliente = clientes.find((c) => c.id === id);
    setClienteSelecionado(cliente || null);

    if (cliente) {
      setClienteNome(cliente.nome);
      setClienteTelefone(cliente.telefone || "");
      setClienteEmail(cliente.email || "");
    }
  };

  const limparForm = () => {
    setClienteId(null);
    setClienteSelecionado(null);
    setClienteNome("");
    setClienteTelefone("");
    setClienteEmail("");
    setTipoCliente("consumidor_final");
    setPecasTemp([]);

    setEquipamentoTipo("");
    setEquipamentoMarca("");
    setEquipamentoModelo("");
    setEquipamentoNumeroSerie("");
    setEquipamentoSenha("");

    setDefeitoReclamado("");
    setEstadoEquipamento("");
    setAcessoriosEntregues("");

    setDiagnostico("");
    setServicoRealizado("");
    setObservacoesTecnicas("");
    setAparelhos([]);

    setValorOrcamento("");
    setValorDesconto("0");
    setValorPago("0");

    setPagamentos([]);
    setValorPagamento("");
    setObservacaoPagamento("");
    setDataPagamento(new Date().toISOString().split("T")[0]);

    setPrevisaoEntrega("");

    setStatus("aguardando");
    setPrioridade("normal");
    setTecnicoId(null);

    setTabSelecionada("cliente");
  };

  const calcularValorTotal = () => {
    const desconto = parseFloat(valorDesconto) || 0;

    if (aparelhos.length > 0) {
      const totalAparelhos = aparelhos.reduce((sum, ap) => {
        const totalServicos = (ap.servicos || []).reduce(
          (s, svc) => s + (Number(svc.valor) || 0),
          0,
        );
        return sum + totalServicos;
      }, 0);
      return totalAparelhos - desconto;
    }

    const orcamento = parseFloat(valorOrcamento) || 0;
    return orcamento - desconto;
  };

  const calcularCustosPecas = () => {
    let custoTotal = 0;
    let valorVendaTotal = 0;

    pecasTemp.forEach((peca) => {
      const custo = parseFloat(peca.valor_custo?.toString() || "0");
      const venda = parseFloat(peca.valor_venda?.toString() || "0");
      const quantidade = peca.quantidade || 0;

      custoTotal += custo * quantidade;
      valorVendaTotal += venda * quantidade;
    });

    return {
      custoTotal,
      valorVendaTotal,
      margemSugerida: valorVendaTotal - custoTotal,
      quantidadePecas: pecasTemp.length,
    };
  };

  const calcularTotalPago = () => {
    return pagamentos.reduce((total, pag) => total + pag.valor, 0);
  };

  const calcularSaldoRestante = () => {
    const total = calcularValorTotal();
    const pago = calcularTotalPago();
    return total - pago;
  };

  const adicionarPagamento = () => {
    const valor = parseFloat(valorPagamento);

    if (!valor || valor <= 0) {
      alert("Informe um valor válido para o pagamento");
      return;
    }

    if (!dataPagamento) {
      alert("Informe a data do pagamento");
      return;
    }

    const novosPagamentos = [
      ...pagamentos,
      {
        data_pagamento: dataPagamento,
        valor,
        forma_pagamento: formaPagamento,
        observacao: observacaoPagamento || undefined,
      },
    ];

    setPagamentos(novosPagamentos);

    // Atualizar valor pago total
    const totalPago = novosPagamentos.reduce((sum, p) => sum + p.valor, 0);
    setValorPago(totalPago.toString());

    // Limpar campos
    setValorPagamento("");
    setObservacaoPagamento("");
    setDataPagamento(new Date().toISOString().split("T")[0]);
  };

  const removerPagamento = (index: number) => {
    const novosPagamentos = pagamentos.filter((_, i) => i !== index);
    setPagamentos(novosPagamentos);

    // Atualizar valor pago total
    const totalPago = novosPagamentos.reduce((sum, p) => sum + p.valor, 0);
    setValorPago(totalPago.toString());
  };

  const handleSubmit = async () => {
    // Validações
    if (!clienteNome.trim()) {
      alert("Nome do cliente é obrigatório");
      setTabSelecionada("cliente");
      return;
    }

    if (aparelhos.length === 0) {
      alert("Adicione pelo menos um aparelho");
      setTabSelecionada("aparelhos");
      return;
    }

    for (let idx = 0; idx < aparelhos.length; idx++) {
      const ap = aparelhos[idx];
      if (!ap.equipamento_tipo.trim()) {
        alert(`Informe o tipo do aparelho #${idx + 1}`);
        setTabSelecionada("aparelhos");
        return;
      }
      if (!ap.defeito_reclamado.trim()) {
        alert(`Informe o defeito reclamado do aparelho #${idx + 1}`);
        setTabSelecionada("aparelhos");
        return;
      }
    }

    // Validar que todas as peças de estoque têm loja definida
    for (const peca of pecasTemp) {
      if (peca.tipo_produto === "estoque" && !peca.id_loja) {
        alert("Todas as peças do estoque devem ter uma loja definida");
        setTabSelecionada("pecas");
        return;
      }
    }

    setLoading(true);
    try {
      const { supabase } = await import("@/lib/supabaseClient");
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // VALIDAÇÃO: Verificar estoque disponível antes de salvar
      if (pecasTemp.length > 0) {
        for (const peca of pecasTemp) {
          if (peca.tipo_produto === "estoque" && peca.id_produto) {
            const { data: estoqueAtual } = await supabase
              .from("estoque_lojas")
              .select("quantidade, produtos(descricao)")
              .eq("id_produto", peca.id_produto)
              .eq("id_loja", peca.id_loja)
              .single();

            if (!estoqueAtual || estoqueAtual.quantidade < peca.quantidade) {
              const produtoNome =
                (estoqueAtual?.produtos as any)?.descricao ||
                peca.descricao_peca;
              alert(
                `Estoque insuficiente!\n\n` +
                  `Produto: ${produtoNome}\n` +
                  `Disponível: ${estoqueAtual?.quantidade || 0}\n` +
                  `Solicitado: ${peca.quantidade}\n\n` +
                  `Por favor, ajuste a quantidade ou remova a peça.`,
              );
              setLoading(false);
              return;
            }
          }
        }
      }

      // Determinar id_loja: usar a loja da primeira peça, ou a primeira loja disponível
      let idLojaOS: number | undefined = undefined;

      if (pecasTemp.length > 0) {
        // Pegar a loja da primeira peça
        idLojaOS = pecasTemp[0].id_loja;
      } else if (lojas.length > 0) {
        // Se não tem peças, usar a primeira loja disponível
        idLojaOS = lojas[0].id;
      }

      const aparelhoPrincipal = aparelhos[0];

      const totalAparelhos = aparelhos.reduce((sum, ap) => {
        const totalServicos = (ap.servicos || []).reduce(
          (s, svc) => s + (Number(svc.valor) || 0),
          0,
        );
        return sum + totalServicos;
      }, 0);

      const dados: OrdemServicoFormData = {
        cliente_nome: clienteNome,
        cliente_telefone: clienteTelefone || undefined,
        cliente_email: clienteEmail || undefined,
        tipo_cliente: tipoCliente,

        // Campos legados (preenchem a partir do primeiro aparelho)
        equipamento_tipo: aparelhoPrincipal.equipamento_tipo,
        equipamento_marca: aparelhoPrincipal.equipamento_marca || undefined,
        equipamento_modelo: aparelhoPrincipal.equipamento_modelo || undefined,
        equipamento_numero_serie:
          aparelhoPrincipal.equipamento_numero_serie ||
          aparelhoPrincipal.equipamento_imei ||
          undefined,
        equipamento_senha: aparelhoPrincipal.equipamento_senha || undefined,

        defeito_reclamado: aparelhoPrincipal.defeito_reclamado,
        estado_equipamento: aparelhoPrincipal.estado_equipamento || undefined,
        acessorios_entregues:
          aparelhoPrincipal.acessorios_entregues || undefined,

        diagnostico: aparelhoPrincipal.diagnostico || undefined,
        servico_realizado: aparelhoPrincipal.servico_realizado || undefined,
        observacoes_tecnicas:
          aparelhoPrincipal.observacoes_tecnicas || undefined,

        valor_orcamento: totalAparelhos,
        valor_desconto: valorDesconto ? parseFloat(valorDesconto) : 0,
        valor_total: calcularValorTotal(),
        valor_pago: valorPago ? parseFloat(valorPago) : 0,

        previsao_entrega: previsaoEntrega || undefined,

        status,
        prioridade,

        id_loja: idLojaOS, // Loja da primeira peça ou primeira loja disponível
        tecnico_responsavel: tecnicoId || undefined,

        aparelhos: aparelhos.map((ap, idx) => ({
          ...ap,
          id_loja: ap.id_loja || idLojaOS || lojas[0]?.id || 0,
          sequencia: ap.sequencia || idx + 1,
          servicos: (ap.servicos || []).map((svc) => ({
            ...svc,
            valor: Number(svc.valor) || 0,
          })),
        })),
      };

      // Criar/atualizar a OS
      await onSubmit(dados);

      // Processar peças (tanto para nova OS quanto para edição)
      if (pecasTemp.length > 0) {
        let osId: string;
        let osNumero: number;

        if (!ordem) {
          // Nova OS: buscar a última OS criada
          const { data: ultimaOS } = await supabase
            .from("ordem_servico")
            .select("id, numero_os")
            .order("criado_em", { ascending: false })
            .limit(1)
            .single();

          if (!ultimaOS) {
            throw new Error("Não foi possível encontrar a OS criada");
          }

          osId = ultimaOS.id;
          osNumero = ultimaOS.numero_os;
        } else {
          // Editando OS: usar o ID da OS atual e deletar peças antigas
          osId = ordem.id;
          osNumero = ordem.numero_os;

          // Deletar peças antigas (sem devolver ao estoque, pois são peças já usadas)
          await supabase
            .from("ordem_servico_pecas")
            .delete()
            .eq("id_ordem_servico", osId);
        }

        // Salvar peças e atualizar estoque
        for (const peca of pecasTemp) {
          // Verificar se a peça já foi salva anteriormente (editando)
          // Se sim, não baixar estoque novamente
          const ehPecaNova = !ordem || !peca.id;

          // Inserir peça na ordem_servico_pecas
          const { data: pecaInserida, error: errorPeca } = await supabase
            .from("ordem_servico_pecas")
            .insert({
              id_ordem_servico: osId,
              id_produto: peca.id_produto || null,
              id_loja: peca.id_loja,
              tipo_produto: peca.tipo_produto,
              descricao_peca: peca.descricao_peca,
              quantidade: peca.quantidade,
              valor_custo: peca.valor_custo,
              valor_venda: peca.valor_venda,
              valor_total: peca.quantidade * peca.valor_venda, // OBRIGATÓRIO
              criado_por: user?.id,
            })
            .select();

          if (errorPeca) {
            console.error("Erro ao inserir peça:", errorPeca);
          }

          // Se for do estoque E for peça nova, diminuir a quantidade e registrar histórico
          if (
            ehPecaNova &&
            peca.tipo_produto === "estoque" &&
            peca.id_produto
          ) {
            const { data: estoqueAtual } = await supabase
              .from("estoque_lojas")
              .select("quantidade")
              .eq("id_produto", peca.id_produto)
              .eq("id_loja", peca.id_loja)
              .single();

            if (estoqueAtual) {
              const quantidadeAnterior = estoqueAtual.quantidade;
              const novaQuantidade = quantidadeAnterior - peca.quantidade;

              // Atualizar estoque
              const { error: errorEstoque } = await supabase
                .from("estoque_lojas")
                .update({
                  quantidade: novaQuantidade,
                  atualizado_por: user?.id,
                })
                .eq("id_produto", peca.id_produto)
                .eq("id_loja", peca.id_loja);

              if (errorEstoque) {
                // Verifica se é erro de estoque negativo
                if (
                  errorEstoque.code === "23514" ||
                  errorEstoque.message?.includes(
                    "estoque_lojas_quantidade_check",
                  )
                ) {
                  throw new Error(
                    `Estoque insuficiente para ${peca.descricao_peca}. Disponível: ${estoqueAtual.quantidade}, Solicitado: ${peca.quantidade}`,
                  );
                }
                throw new Error(
                  `Erro ao atualizar estoque: ${errorEstoque.message}`,
                );
              }

              // Registrar histórico de movimentação
              const { error: errorHistorico } = await supabase
                .from("historico_estoque")
                .insert({
                  id_produto: peca.id_produto,
                  id_loja: peca.id_loja,
                  id_ordem_servico: osId,
                  tipo_movimentacao: "saida",
                  quantidade: peca.quantidade,
                  quantidade_anterior: quantidadeAnterior,
                  quantidade_nova: novaQuantidade,
                  motivo: `Utilizado na OS #${osNumero}`,
                  observacao: peca.descricao_peca,
                  usuario_id: user?.id,
                });

              if (errorHistorico) {
                console.error("Erro ao registrar histórico:", errorHistorico);
              }
            }
          }
        }
      }

      // Processar pagamentos (salvar na tabela ordem_servico_pagamentos)
      if (pagamentos.length > 0) {
        let osId: string;

        if (!ordem) {
          // Nova OS: buscar a última OS criada
          const { data: ultimaOS } = await supabase
            .from("ordem_servico")
            .select("id")
            .order("criado_em", { ascending: false })
            .limit(1)
            .single();

          if (!ultimaOS) {
            throw new Error("Não foi possível encontrar a OS criada");
          }

          osId = ultimaOS.id;
        } else {
          // Editando OS: usar o ID da OS atual
          osId = ordem.id;

          // Deletar pagamentos antigos (serão reinseridos)
          await supabase
            .from("ordem_servico_pagamentos")
            .delete()
            .eq("id_ordem_servico", osId);
        }

        // Inserir pagamentos na tabela
        for (const pagamento of pagamentos) {
          const { error: errorPagamento } = await supabase
            .from("ordem_servico_pagamentos")
            .insert({
              id_ordem_servico: osId,
              data_pagamento: pagamento.data_pagamento,
              valor: pagamento.valor,
              forma_pagamento: pagamento.forma_pagamento,
              observacao: pagamento.observacao || null,
              criado_por: user?.id,
            });

          if (errorPagamento) {
            console.error("Erro ao inserir pagamento:", errorPagamento);
          }
        }
      }

      limparForm();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar OS:", error);
      alert("Erro ao salvar ordem de serviço. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const tiposEquipamento = [
    "Celular",
    "Smartphone",
    "Tablet",
    "Notebook",
    "Computador",
    "Console",
    "Smartwatch",
    "Outros",
  ];

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="2xl"
        scrollBehavior="outside"
        isDismissable={!loading}
      >
        <ModalContent>
          <ModalHeader>
            {ordem ? `Editar OS #${ordem.numero_os}` : "Nova Ordem de Serviço"}
          </ModalHeader>

          <ModalBody>
            <Tabs
              selectedKey={tabSelecionada}
              onSelectionChange={(key) => setTabSelecionada(key as string)}
              color="primary"
              variant="underlined"
            >
              {/* ABA 1: CLIENTE */}
              <Tab key="cliente" title="1. Cliente">
                <div className="space-y-4 py-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-1">
                      Dados do Cliente
                    </h3>
                    <p className="text-sm text-default-500">
                      Identifique o cliente que está trazendo o equipamento
                    </p>
                  </div>

                  <Autocomplete
                    label="Buscar Cliente"
                    placeholder="Digite o nome ou telefone do cliente"
                    selectedKey={clienteId}
                    onSelectionChange={(key) =>
                      handleClienteSelecionado(key as string)
                    }
                    isLoading={loadingClientes}
                    variant="bordered"
                    startContent={<UserPlus className="w-4 h-4" />}
                    description={`${clientes.length} clientes disponíveis para seleção`}
                  >
                    {clientes.map((cliente) => (
                      <AutocompleteItem
                        key={cliente.id}
                        textValue={cliente.nome}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold">{cliente.nome}</span>
                          <span className="text-xs text-default-400">
                            {cliente.telefone}
                            {cliente.email && ` • ${cliente.email}`}
                          </span>
                        </div>
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>

                  {clienteSelecionado && (
                    <Chip color="success" variant="flat">
                      Cliente: {clienteSelecionado.nome}
                    </Chip>
                  )}

                  <Divider />

                  <Input
                    label="Nome do Cliente"
                    placeholder="Nome completo"
                    value={clienteNome}
                    onValueChange={setClienteNome}
                    isRequired
                    variant="bordered"
                    isReadOnly={!!clienteSelecionado}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Telefone"
                      placeholder="(00) 00000-0000"
                      value={clienteTelefone}
                      onValueChange={setClienteTelefone}
                      variant="bordered"
                      isReadOnly={!!clienteSelecionado}
                    />

                    <Input
                      label="E-mail"
                      type="email"
                      placeholder="cliente@email.com"
                      value={clienteEmail}
                      onValueChange={setClienteEmail}
                      variant="bordered"
                      isReadOnly={!!clienteSelecionado}
                    />
                  </div>

                  <Select
                    label="Tipo de Cliente"
                    placeholder="Selecione o tipo"
                    selectedKeys={[tipoCliente]}
                    onSelectionChange={(keys) =>
                      setTipoCliente(
                        Array.from(keys)[0] as "lojista" | "consumidor_final",
                      )
                    }
                    isRequired
                    variant="bordered"
                    description="Informe se o cliente é lojista ou consumidor final"
                  >
                    <SelectItem key="consumidor_final">
                      Consumidor Final
                    </SelectItem>
                    <SelectItem key="lojista">Lojista</SelectItem>
                  </Select>
                </div>
              </Tab>

              {/* ABA 2: APARELHOS (múltiplos) */}
              <Tab key="aparelhos" title="2. Aparelhos">
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">
                        Aparelhos da OS
                      </h3>
                      <p className="text-sm text-default-500">
                        Adicione um ou mais aparelhos, cada um com seus serviços
                        e valores
                      </p>
                    </div>
                    <Button
                      color="primary"
                      onPress={() =>
                        setAparelhos([...aparelhos, criarAparelhoVazio()])
                      }
                    >
                      Adicionar aparelho
                    </Button>
                  </div>

                  {aparelhos.length === 0 && (
                    <div className="text-default-500 text-sm">
                      Nenhum aparelho adicionado.
                    </div>
                  )}

                  {aparelhos.map((ap, idx) => (
                    <Card key={idx} className="border border-default-200">
                      <CardBody className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Chip color="primary" variant="flat">
                              Aparelho #{idx + 1}
                            </Chip>
                          </div>
                          <Button
                            size="sm"
                            color="danger"
                            variant="light"
                            onPress={() =>
                              setAparelhos(
                                aparelhos.filter((_, i) => i !== idx),
                              )
                            }
                          >
                            Remover
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Select
                            label="Tipo"
                            placeholder="Selecione"
                            selectedKeys={
                              ap.equipamento_tipo ? [ap.equipamento_tipo] : []
                            }
                            onSelectionChange={(keys) => {
                              const valor = Array.from(keys)[0] as string;
                              const copia = [...aparelhos];
                              copia[idx] = { ...ap, equipamento_tipo: valor };
                              setAparelhos(copia);
                            }}
                            isRequired
                            variant="bordered"
                          >
                            {tiposEquipamento.map((tipo) => (
                              <SelectItem key={tipo}>{tipo}</SelectItem>
                            ))}
                          </Select>

                          <Input
                            label="Marca"
                            value={ap.equipamento_marca || ""}
                            onValueChange={(v) => {
                              const copia = [...aparelhos];
                              copia[idx] = { ...ap, equipamento_marca: v };
                              setAparelhos(copia);
                            }}
                            variant="bordered"
                          />

                          <Input
                            label="Modelo"
                            value={ap.equipamento_modelo || ""}
                            onValueChange={(v) => {
                              const copia = [...aparelhos];
                              copia[idx] = { ...ap, equipamento_modelo: v };
                              setAparelhos(copia);
                            }}
                            variant="bordered"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Input
                            label="Número de Série / IMEI"
                            value={ap.equipamento_numero_serie || ""}
                            onValueChange={(v) => {
                              const copia = [...aparelhos];
                              copia[idx] = {
                                ...ap,
                                equipamento_numero_serie: v,
                                equipamento_imei: v,
                              };
                              setAparelhos(copia);
                            }}
                            variant="bordered"
                          />

                          <Input
                            label="Senha / PIN"
                            type="password"
                            value={ap.equipamento_senha || ""}
                            onValueChange={(v) => {
                              const copia = [...aparelhos];
                              copia[idx] = { ...ap, equipamento_senha: v };
                              setAparelhos(copia);
                            }}
                            variant="bordered"
                          />

                          <Input
                            label="Acessórios"
                            value={ap.acessorios_entregues || ""}
                            onValueChange={(v) => {
                              const copia = [...aparelhos];
                              copia[idx] = { ...ap, acessorios_entregues: v };
                              setAparelhos(copia);
                            }}
                            variant="bordered"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Textarea
                            label="Defeito Reclamado"
                            value={ap.defeito_reclamado}
                            onValueChange={(v) => {
                              const copia = [...aparelhos];
                              copia[idx] = { ...ap, defeito_reclamado: v };
                              setAparelhos(copia);
                            }}
                            isRequired
                            variant="bordered"
                            minRows={2}
                          />

                          <Textarea
                            label="Estado do Equipamento"
                            value={ap.estado_equipamento || ""}
                            onValueChange={(v) => {
                              const copia = [...aparelhos];
                              copia[idx] = { ...ap, estado_equipamento: v };
                              setAparelhos(copia);
                            }}
                            variant="bordered"
                            minRows={2}
                          />
                        </div>

                        <Textarea
                          label="Observações Técnicas / Diagnóstico"
                          value={ap.observacoes_tecnicas || ""}
                          onValueChange={(v) => {
                            const copia = [...aparelhos];
                            copia[idx] = {
                              ...ap,
                              observacoes_tecnicas: v,
                              diagnostico: v,
                            };
                            setAparelhos(copia);
                          }}
                          variant="bordered"
                          minRows={2}
                        />

                        <Divider />

                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">
                            Serviços deste aparelho
                          </h4>
                          <Button
                            size="sm"
                            variant="flat"
                            onPress={() => {
                              const copia = [...aparelhos];
                              const servicos = ap.servicos || [];
                              copia[idx] = {
                                ...ap,
                                servicos: [
                                  ...servicos,
                                  { descricao: "", valor: 0 },
                                ],
                              };
                              setAparelhos(copia);
                            }}
                          >
                            Adicionar serviço
                          </Button>
                        </div>

                        {(ap.servicos || []).length === 0 && (
                          <p className="text-default-500 text-sm">
                            Nenhum serviço adicionado.
                          </p>
                        )}

                        {(ap.servicos || []).map((svc, sIdx) => (
                          <div
                            key={sIdx}
                            className="grid grid-cols-1 md:grid-cols-[1fr,160px,80px] gap-3 items-end"
                          >
                            <Input
                              label="Descrição"
                              value={svc.descricao}
                              onValueChange={(v) => {
                                const copia = [...aparelhos];
                                const servicos = [...(ap.servicos || [])];
                                servicos[sIdx] = {
                                  ...servicos[sIdx],
                                  descricao: v,
                                };
                                copia[idx] = { ...ap, servicos };
                                setAparelhos(copia);
                              }}
                              variant="bordered"
                            />
                            <Input
                              label="Valor"
                              type="number"
                              startContent={
                                <span className="text-default-400">R$</span>
                              }
                              value={svc.valor?.toString() || "0"}
                              onValueChange={(v) => {
                                const copia = [...aparelhos];
                                const servicos = [...(ap.servicos || [])];
                                servicos[sIdx] = {
                                  ...servicos[sIdx],
                                  valor: parseFloat(v || "0") || 0,
                                };
                                copia[idx] = { ...ap, servicos };
                                setAparelhos(copia);
                              }}
                              variant="bordered"
                            />
                            <Button
                              size="sm"
                              color="danger"
                              variant="light"
                              onPress={() => {
                                const copia = [...aparelhos];
                                const servicos = [...(ap.servicos || [])];
                                servicos.splice(sIdx, 1);
                                copia[idx] = { ...ap, servicos };
                                setAparelhos(copia);
                              }}
                            >
                              Remover
                            </Button>
                          </div>
                        ))}

                        <div className="flex justify-between items-center p-3 bg-default-100 rounded-lg">
                          <span className="font-semibold">
                            Total do aparelho
                          </span>
                          <span className="text-lg font-bold text-primary">
                            R${" "}
                            {(ap.servicos || [])
                              .reduce(
                                (s, svc) => s + (Number(svc.valor) || 0),
                                0,
                              )
                              .toFixed(2)}
                          </span>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </Tab>

              {/* ABA 5: PEÇAS E PRODUTOS */}
              <Tab key="pecas" title="5. Peças">
                <div className="space-y-4 py-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-1">
                      Peças e Produtos Utilizados
                    </h3>
                    <p className="text-sm text-default-500">
                      Adicione peças do estoque de diferentes lojas ou peças
                      externas
                    </p>
                  </div>

                  <Button
                    color="primary"
                    startContent={<Package className="w-4 h-4" />}
                    onPress={() => setModalPecaOpen(true)}
                  >
                    Adicionar Peça
                  </Button>

                  {pecasTemp.length === 0 ? (
                    <div className="text-center py-8 text-default-400">
                      <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma peça adicionada</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pecasTemp.map((peca, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-default-100 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">
                                {peca.descricao_peca}
                              </span>
                              <Chip
                                size="sm"
                                variant="flat"
                                color={
                                  peca.tipo_produto === "estoque"
                                    ? "primary"
                                    : "warning"
                                }
                              >
                                {peca.tipo_produto === "estoque"
                                  ? "Estoque"
                                  : "Externa"}
                              </Chip>
                              {peca.nome_loja && (
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  color="default"
                                  startContent={<Store className="w-3 h-3" />}
                                >
                                  {peca.nome_loja}
                                </Chip>
                              )}
                            </div>
                            <div className="text-sm text-default-500 mt-1">
                              Qtd: {peca.quantidade} • Valor Unit: R${" "}
                              {peca.valor_venda.toFixed(2)} • Total: R${" "}
                              {(peca.quantidade * peca.valor_venda).toFixed(2)}
                            </div>
                          </div>
                          <Button
                            isIconOnly
                            size="sm"
                            color="danger"
                            variant="light"
                            onPress={() =>
                              setPecasTemp(
                                pecasTemp.filter((_, i) => i !== index),
                              )
                            }
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      ))}

                      <Divider className="my-4" />

                      <div className="flex justify-between items-center p-3 bg-success-50 dark:bg-success rounded-lg">
                        <span className="font-semibold">Total em Peças:</span>
                        <span className="text-xl font-bold text-success">
                          R${" "}
                          {pecasTemp
                            .reduce(
                              (acc, p) => acc + p.quantidade * p.valor_venda,
                              0,
                            )
                            .toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Tab>

              <Tab key="valores" title="6. Orçamento">
                <div className="space-y-4 py-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-1">
                      Valores e Condições de Orçamento
                    </h3>
                    <p className="text-sm text-default-500">
                      Defina os valores do orçamento e prazos
                    </p>
                  </div>

                  {/* Resumo de Custos das Peças */}
                  {pecasTemp.length > 0 && (
                    <Card className="bg-default-100 dark:bg-default-50/10">
                      <CardBody className="p-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Resumo de Custos das Peças
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-default-600">
                              Quantidade de peças:
                            </span>
                            <span className="font-medium">
                              {calcularCustosPecas().quantidadePecas}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-default-600">
                              Custo total das peças:
                            </span>
                            <span className="font-medium text-danger">
                              R$ {calcularCustosPecas().custoTotal.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-default-600">
                              Valor de venda das peças:
                            </span>
                            <span className="font-medium text-primary">
                              R${" "}
                              {calcularCustosPecas().valorVendaTotal.toFixed(2)}
                            </span>
                          </div>
                          <Divider className="my-2" />
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">
                              Margem das peças:
                            </span>
                            <span
                              className={`font-bold text-lg ${
                                calcularCustosPecas().margemSugerida >= 0
                                  ? "text-success"
                                  : "text-danger"
                              }`}
                            >
                              R${" "}
                              {calcularCustosPecas().margemSugerida.toFixed(2)}
                            </span>
                          </div>
                          <div className="mt-3 p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
                            <p className="text-xs text-warning-700 dark:text-warning-300">
                              💡 Dica: Adicione ao orçamento o custo da mão de
                              obra + margem desejada sobre as peças
                            </p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Valor do Orçamento"
                      type="number"
                      placeholder="0.00"
                      value={valorOrcamento}
                      onValueChange={setValorOrcamento}
                      variant="bordered"
                      startContent={
                        <span className="text-default-400">R$</span>
                      }
                    />

                    <Input
                      label="Desconto"
                      type="number"
                      placeholder="0.00"
                      value={valorDesconto}
                      onValueChange={setValorDesconto}
                      variant="bordered"
                      startContent={
                        <span className="text-default-400">R$</span>
                      }
                    />
                  </div>

                  <Divider />

                  <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">
                        Valor Total:
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        R$ {calcularValorTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Input
                    label="Previsão de Entrega"
                    type="date"
                    value={previsaoEntrega}
                    onValueChange={setPrevisaoEntrega}
                    variant="bordered"
                  />
                </div>
              </Tab>

              <Tab key="pagamento" title="7. Pagamento">
                <div className="space-y-4 py-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-1">
                      Registro de Pagamentos
                    </h3>
                    <p className="text-sm text-default-500">
                      Registre os pagamentos recebidos do cliente
                    </p>
                  </div>

                  {/* Resumo Financeiro */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-primary-50 dark:bg-primary-900/20">
                      <CardBody className="p-4">
                        <p className="text-xs text-default-600 mb-1">
                          Valor Total
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          R$ {calcularValorTotal().toFixed(2)}
                        </p>
                      </CardBody>
                    </Card>

                    <Card className="bg-success-50 dark:bg-success-900/20">
                      <CardBody className="p-4">
                        <p className="text-xs text-default-600 mb-1">
                          Total Pago
                        </p>
                        <p className="text-2xl font-bold text-success">
                          R$ {calcularTotalPago().toFixed(2)}
                        </p>
                      </CardBody>
                    </Card>

                    <Card
                      className={
                        calcularSaldoRestante() > 0
                          ? "bg-warning-50 dark:bg-warning-900/20"
                          : "bg-default-100 dark:bg-default-50/10"
                      }
                    >
                      <CardBody className="p-4">
                        <p className="text-xs text-default-600 mb-1">
                          Saldo Restante
                        </p>
                        <p
                          className={`text-2xl font-bold ${
                            calcularSaldoRestante() > 0
                              ? "text-warning"
                              : "text-default-600"
                          }`}
                        >
                          R$ {calcularSaldoRestante().toFixed(2)}
                        </p>
                      </CardBody>
                    </Card>
                  </div>

                  <Divider />

                  {/* Adicionar Novo Pagamento */}
                  <Card>
                    <CardBody className="p-4">
                      <h4 className="font-semibold mb-3">
                        Adicionar Novo Pagamento
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <Input
                          label="Data do Pagamento"
                          type="date"
                          value={dataPagamento}
                          onValueChange={setDataPagamento}
                          variant="bordered"
                        />

                        <Input
                          label="Valor"
                          type="number"
                          placeholder="0.00"
                          value={valorPagamento}
                          onValueChange={setValorPagamento}
                          variant="bordered"
                          startContent={
                            <span className="text-default-400">R$</span>
                          }
                        />

                        <Select
                          label="Forma de Pagamento"
                          selectedKeys={[formaPagamento]}
                          onSelectionChange={(keys) =>
                            setFormaPagamento(Array.from(keys)[0] as string)
                          }
                          variant="bordered"
                        >
                          <SelectItem key="dinheiro">Dinheiro</SelectItem>
                          <SelectItem key="cartao_credito">
                            Cartão de Crédito
                          </SelectItem>
                          <SelectItem key="cartao_debito">
                            Cartão de Débito
                          </SelectItem>
                          <SelectItem key="pix">PIX</SelectItem>
                          <SelectItem key="transferencia">
                            Transferência
                          </SelectItem>
                          <SelectItem key="cheque">Cheque</SelectItem>
                          <SelectItem key="credito_cliente">
                            Crédito do Cliente
                          </SelectItem>
                        </Select>

                        <Input
                          label="Observação (opcional)"
                          placeholder="Ex: Parcela 1/3"
                          value={observacaoPagamento}
                          onValueChange={setObservacaoPagamento}
                          variant="bordered"
                        />
                      </div>

                      <Button
                        color="primary"
                        onPress={adicionarPagamento}
                        className="w-full"
                      >
                        Adicionar Pagamento
                      </Button>
                    </CardBody>
                  </Card>

                  {/* Lista de Pagamentos */}
                  {pagamentos.length > 0 && (
                    <Card>
                      <CardBody className="p-4">
                        <h4 className="font-semibold mb-3">
                          Pagamentos Registrados
                        </h4>
                        <div className="space-y-3">
                          {pagamentos.map((pag, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-default-100 dark:bg-default-50/10 rounded-lg"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-success">
                                    R$ {pag.valor.toFixed(2)}
                                  </span>
                                  <Chip size="sm" variant="flat">
                                    {pag.forma_pagamento.replace("_", " ")}
                                  </Chip>
                                </div>
                                <p className="text-xs text-default-600">
                                  {new Date(
                                    pag.data_pagamento,
                                  ).toLocaleDateString("pt-BR")}
                                  {pag.observacao && ` - ${pag.observacao}`}
                                </p>
                              </div>
                              <Button
                                isIconOnly
                                size="sm"
                                color="danger"
                                variant="light"
                                onPress={() => removerPagamento(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardBody>
                    </Card>
                  )}
                </div>
              </Tab>

              <Tab key="outros" title="8. Finalizar">
                <div className="space-y-4 py-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-1">
                      Configurações Finais
                    </h3>
                    <p className="text-sm text-default-500">
                      Defina técnico, status e prioridade da OS
                    </p>
                  </div>

                  <Autocomplete
                    label="Técnico Responsável"
                    placeholder="Selecione o técnico"
                    selectedKey={tecnicoId}
                    onSelectionChange={(key) => setTecnicoId(key as string)}
                    isLoading={loadingTecnicos}
                    variant="bordered"
                    startContent={<Wrench className="w-4 h-4" />}
                  >
                    {tecnicos.map((tecnico) => (
                      <AutocompleteItem
                        key={tecnico.id}
                        textValue={tecnico.nome}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tecnico.cor_agenda }}
                          />
                          <span>{tecnico.nome}</span>
                        </div>
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Status"
                      selectedKeys={[status]}
                      onSelectionChange={(keys) =>
                        setStatus(Array.from(keys)[0] as StatusOS)
                      }
                      variant="bordered"
                    >
                      {Object.entries(STATUS_OS_LABELS).map(([key, label]) => (
                        <SelectItem key={key}>{label}</SelectItem>
                      ))}
                    </Select>

                    <Select
                      label="Prioridade"
                      selectedKeys={[prioridade]}
                      onSelectionChange={(keys) =>
                        setPrioridade(Array.from(keys)[0] as PrioridadeOS)
                      }
                      variant="bordered"
                    >
                      {Object.entries(PRIORIDADE_OS_LABELS).map(
                        ([key, label]) => (
                          <SelectItem key={key}>{label}</SelectItem>
                        ),
                      )}
                    </Select>
                  </div>
                </div>
              </Tab>
            </Tabs>
          </ModalBody>

          <ModalFooter>
            <Button variant="light" onPress={onClose} isDisabled={loading}>
              Cancelar
            </Button>
            <Button color="primary" onPress={handleSubmit} isLoading={loading}>
              {ordem ? "Atualizar" : "Criar"} OS
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal para adicionar peça */}
      <Modal
        isOpen={modalPecaOpen}
        onClose={() => {
          setModalPecaOpen(false);
          limparModalPeca();
        }}
        size="lg"
      >
        <ModalContent>
          <ModalHeader>Adicionar Peça/Produto</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Select
                label="Tipo de Peça"
                selectedKeys={[tipoPeca]}
                onSelectionChange={(keys) => {
                  setTipoPeca(Array.from(keys)[0] as "estoque" | "avulso");
                  limparModalPeca();
                }}
                variant="bordered"
                isRequired
                description="Escolha se vai usar peça do seu estoque ou se foi comprada externamente"
              >
                <SelectItem
                  key="estoque"
                  startContent={<Store className="w-4 h-4" />}
                >
                  Das Minhas Lojas (Estoque)
                </SelectItem>
                <SelectItem
                  key="avulso"
                  startContent={<Package className="w-4 h-4" />}
                >
                  Compra Externa (Avulsa)
                </SelectItem>
              </Select>

              <Divider />

              {tipoPeca === "estoque" ? (
                <>
                  <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg">
                    <p className="text-sm font-semibold mb-1">
                      Peça do Estoque
                    </p>
                    <p className="text-xs text-default-500">
                      Selecione de qual loja e qual produto será utilizado
                    </p>
                  </div>

                  <Select
                    label="Loja"
                    placeholder="Selecione a loja"
                    selectedKeys={idLojaPeca ? [idLojaPeca.toString()] : []}
                    onSelectionChange={(keys) => {
                      const lojaId = parseInt(Array.from(keys)[0] as string);
                      setIdLojaPeca(lojaId);
                      carregarProdutosEstoque(lojaId);
                      setIdProdutoSelecionado(null);
                      setProdutoSelecionado(null);
                    }}
                    isRequired
                    variant="bordered"
                    startContent={<Store className="w-4 h-4" />}
                  >
                    {lojas.map((loja) => (
                      <SelectItem key={loja.id.toString()}>
                        {loja.nome}
                      </SelectItem>
                    ))}
                  </Select>

                  <Autocomplete
                    label="Produto"
                    placeholder={
                      idLojaPeca
                        ? "Buscar produto no estoque (ex: i 16 pro)"
                        : "Selecione uma loja primeiro"
                    }
                    selectedKey={idProdutoSelecionado}
                    onSelectionChange={(key) =>
                      handleProdutoSelecionado(key as string)
                    }
                    isLoading={loadingProdutos}
                    isRequired
                    variant="bordered"
                    startContent={<Package className="w-4 h-4" />}
                    allowsCustomValue={false}
                    isDisabled={!idLojaPeca}
                    defaultFilter={(textValue, inputValue) => {
                      const normalizedInput = inputValue
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "");

                      const searchTerms = normalizedInput
                        .split(/\s+/)
                        .filter((term) => term.length > 0);

                      const produto = produtosEstoque.find(
                        (p) => p.descricao === textValue,
                      );
                      if (!produto) return false;

                      // Criar texto de busca combinando descrição e marca
                      const textoBusca =
                        `${produto.descricao || ""} ${produto.marca || ""}`
                          .toLowerCase()
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "");

                      return searchTerms.every((term) =>
                        textoBusca.includes(term),
                      );
                    }}
                  >
                    {produtosEstoque.map((produto) => (
                      <AutocompleteItem
                        key={produto.id}
                        textValue={produto.descricao}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold">
                            {produto.descricao}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-default-400">
                            {produto.marca && <span>{produto.marca}</span>}
                            {produto.marca && <span>•</span>}
                            <span>Estoque: {produto.estoque_disponivel}</span>
                          </div>
                        </div>
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>

                  {produtoSelecionado && (
                    <Chip color="success" variant="flat">
                      Disponível: {produtoSelecionado.estoque_disponivel}{" "}
                      unidades
                    </Chip>
                  )}
                </>
              ) : (
                <>
                  <div className="bg-warning-50 dark:bg-warning-900/20 p-3 rounded-lg">
                    <p className="text-sm font-semibold mb-1">Peça Externa</p>
                    <p className="text-xs text-default-500">
                      Informe os dados da peça comprada de fornecedor externo
                    </p>
                  </div>

                  <Input
                    label="Descrição"
                    placeholder="Ex: Bateria compatível comprada externamente"
                    value={descricaoPeca}
                    onValueChange={setDescricaoPeca}
                    isRequired
                    variant="bordered"
                  />
                </>
              )}

              <div className="grid grid-cols-3 gap-3">
                <Input
                  type="number"
                  label="Quantidade"
                  value={qtdPeca}
                  onValueChange={setQtdPeca}
                  min="1"
                  isRequired
                  variant="bordered"
                />
                <Input
                  type="number"
                  label="Valor Custo"
                  placeholder="0.00"
                  value={valorCustoPeca}
                  onValueChange={setValorCustoPeca}
                  startContent={<span className="text-default-400">R$</span>}
                  variant="bordered"
                />
                <Input
                  type="number"
                  label="Valor Venda"
                  placeholder="0.00"
                  value={valorVendaPeca}
                  onValueChange={setValorVendaPeca}
                  startContent={<span className="text-default-400">R$</span>}
                  isRequired
                  variant="bordered"
                />
              </div>

              <div className="flex justify-between items-center p-3 bg-default-100 rounded-lg">
                <span className="font-semibold">Total:</span>
                <span className="text-xl font-bold text-primary">
                  R${" "}
                  {(
                    (parseFloat(qtdPeca) || 0) *
                    (parseFloat(valorVendaPeca) || 0)
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setModalPecaOpen(false)}>
              Cancelar
            </Button>
            <Button color="primary" onPress={handleSalvarPeca}>
              Adicionar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {toast.ToastComponent}
    </>
  );
}
