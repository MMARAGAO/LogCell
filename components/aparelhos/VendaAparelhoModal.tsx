"use client";

import type { Aparelho } from "@/types/aparelhos";
import type { ResultadoSimulacaoTaxa } from "@/types/taxasCartao";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Divider,
  Chip,
  Card,
  CardBody,
} from "@heroui/react";
import {
  ShoppingBag,
  DollarSign,
  CreditCard,
  Calendar,
  User,
  Plus,
  Trash2,
  Repeat,
  X,
  Gift,
} from "lucide-react";

import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/components/Toast";
import { SimuladorTaxaCartao } from "@/components/vendas/SimuladorTaxaCartao";
import { formatarMoeda } from "@/lib/formatters";
import { supabase } from "@/lib/supabaseClient";
import { BrindesAparelhosService } from "@/services/brindesAparelhosService";

interface VendaAparelhoModalProps {
  aparelho: Aparelho;
  lojaId: number;
  lojaNome?: string;
  isOpen: boolean;
  onClose: (sucesso?: boolean) => void;
}

interface FormaPagamentoVenda {
  tipo:
    | "dinheiro"
    | "pix"
    | "cartao_credito"
    | "cartao_debito"
    | "transferencia"
    | "aparelho_troca";
  valor: number;
  parcelas?: number;
  data_pagamento: string;
}

interface AparelhoTroca {
  marca: string;
  modelo: string;
  cor: string;
  armazenamento: string;
  memoria_ram?: string;
  imei?: string;
  numero_serie?: string;
  saude_bateria: number;
  observacoes?: string;
  valor_avaliado: number;
  estado: "novo" | "seminovo" | "usado" | "recondicionado";
  condicao: "perfeito" | "bom" | "regular" | "ruim";
}

interface BrindeEstoqueItem {
  produto_id: string;
  descricao: string;
  quantidade: number;
  valor_custo_unitario: number;
}

interface BrindeItem {
  origem: "estoque" | "manual";
  produto_id?: string;
  descricao: string;
  quantidade: number;
  valor_custo: number;
}

const FORMAS_PAGAMENTO = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "pix", label: "PIX" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "cartao_debito", label: "Cartão de Débito" },
  { value: "transferencia", label: "Transferência" },
];

export function VendaAparelhoModal({
  aparelho,
  lojaId,
  lojaNome,
  isOpen,
  onClose,
}: VendaAparelhoModalProps) {
  const { usuario } = useAuthContext();
  const { showToast } = useToast();

  const [clienteNome, setClienteNome] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [valorVenda, setValorVenda] = useState(
    aparelho.valor_venda?.toString() || "0",
  );
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamentoVenda[]>(
    [],
  );
  const [loading, setLoading] = useState(false);

  // Aparelho em troca
  const [aparelhoTroca, setAparelhoTroca] = useState<AparelhoTroca | null>(
    null,
  );
  const [mostrarFormTroca, setMostrarFormTroca] = useState(false);

  // Brindes
  const [brindes, setBrindes] = useState<BrindeItem[]>([]);
  const [estoqueBrindes, setEstoqueBrindes] = useState<BrindeEstoqueItem[]>([]);
  const [origemBrinde, setOrigemBrinde] = useState<"estoque" | "manual">(
    "estoque",
  );
  const [produtoBrindeId, setProdutoBrindeId] = useState<string>("");
  const [quantidadeBrinde, setQuantidadeBrinde] = useState("1");
  const [descricaoBrinde, setDescricaoBrinde] = useState("");
  const [valorCustoBrinde, setValorCustoBrinde] = useState("");

  // Forma de pagamento que está sendo adicionada
  const [tipoPagamento, setTipoPagamento] = useState<string>("dinheiro");
  const [valorPagamento, setValorPagamento] = useState("");
  const [parcelasPagamento, setParcelasPagamento] = useState(1);
  const [dataPagamento, setDataPagamento] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [simulacaoAtual, setSimulacaoAtual] =
    useState<ResultadoSimulacaoTaxa | null>(null);

  useEffect(() => {
    const carregarEstoqueBrindes = async () => {
      if (!isOpen) return;
      try {
        const { data, error } = await supabase
          .from("estoque_lojas")
          .select(
            "id_produto, quantidade, produto:produtos(descricao, marca, preco_compra)",
          )
          .eq("id_loja", lojaId)
          .gt("quantidade", 0);

        if (error) throw error;

        const itens = (data || []).map((item: any) => ({
          produto_id: item.id_produto,
          descricao: `${item.produto?.descricao || "Produto"}`,
          quantidade: Number(item.quantidade || 0),
          valor_custo_unitario: Number(item.produto?.preco_compra || 0),
        }));

        setEstoqueBrindes(itens);
      } catch (error) {
        console.error("Erro ao carregar estoque para brindes:", error);
        setEstoqueBrindes([]);
      }
    };

    carregarEstoqueBrindes();
  }, [isOpen, lojaId]);

  const valorVendaNumerico = parseFloat(valorVenda) || 0;
  const valorCusto = aparelho.valor_compra || 0;
  const valorTroca = aparelhoTroca?.valor_avaliado || 0;
  const valorPago =
    formasPagamento.reduce((sum, f) => sum + f.valor, 0) + valorTroca;
  const saldoDevedor = valorVendaNumerico - valorPago;
  const custoBrindes = brindes.reduce((sum, b) => sum + b.valor_custo, 0);
  const brindesSemEstoque = brindes
    .filter((brinde) => brinde.origem === "estoque" && brinde.produto_id)
    .map((brinde) => {
      const estoque = estoqueBrindes.find(
        (item) => item.produto_id === brinde.produto_id,
      );
      const disponivel = estoque?.quantidade ?? 0;

      return {
        ...brinde,
        disponivel,
        ok: disponivel >= brinde.quantidade,
      };
    })
    .filter((brinde) => !brinde.ok);

  const handleAdicionarPagamento = () => {
    const valor = parseFloat(valorPagamento);

    if (!valor || valor <= 0) {
      showToast("Informe um valor válido", "error");

      return;
    }

    const novoPagamento: FormaPagamentoVenda = {
      tipo: tipoPagamento as any,
      valor,
      parcelas:
        tipoPagamento === "cartao_credito" ? parcelasPagamento : undefined,
      data_pagamento: dataPagamento,
    };

    setFormasPagamento([...formasPagamento, novoPagamento]);
    setValorPagamento("");
    setParcelasPagamento(1);
  };

  const handleRemoverPagamento = (index: number) => {
    setFormasPagamento(formasPagamento.filter((_, i) => i !== index));
  };

  const handleAdicionarBrinde = () => {
    if (origemBrinde === "estoque") {
      if (!produtoBrindeId) {
        showToast("Selecione um produto do estoque", "error");

        return;
      }

      const quantidade = Number(quantidadeBrinde || 0);

      if (!quantidade || quantidade <= 0) {
        showToast("Informe uma quantidade valida", "error");

        return;
      }

      const item = estoqueBrindes.find((p) => p.produto_id === produtoBrindeId);

      if (!item) {
        showToast("Produto nao encontrado no estoque", "error");

        return;
      }

      if (quantidade > item.quantidade) {
        showToast("Quantidade maior que o estoque", "error");

        return;
      }

      setBrindes((prev) => [
        ...prev,
        {
          origem: "estoque",
          produto_id: item.produto_id,
          descricao: item.descricao,
          quantidade,
          valor_custo: item.valor_custo_unitario * quantidade,
        },
      ]);
      setProdutoBrindeId("");
      setQuantidadeBrinde("1");

      return;
    }

    const valor = Number(valorCustoBrinde || 0);

    if (!descricaoBrinde.trim()) {
      showToast("Informe a descricao do brinde", "error");

      return;
    }
    if (!valor || valor <= 0) {
      showToast("Informe o custo do brinde", "error");

      return;
    }

    setBrindes((prev) => [
      ...prev,
      {
        origem: "manual",
        descricao: descricaoBrinde.trim(),
        quantidade: 1,
        valor_custo: valor,
      },
    ]);
    setDescricaoBrinde("");
    setValorCustoBrinde("");
  };

  const handleRemoverBrinde = (index: number) => {
    setBrindes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFinalizarVenda = async () => {
    if (!usuario) return;

    // Validações
    if (!clienteNome.trim()) {
      showToast("Informe o nome do cliente", "error");

      return;
    }

    if (valorVendaNumerico <= 0) {
      showToast("Informe um valor de venda válido", "error");

      return;
    }

    if (formasPagamento.length === 0) {
      showToast("Adicione pelo menos uma forma de pagamento", "error");

      return;
    }

    if (saldoDevedor > 0) {
      showToast(`Ainda falta pagar ${formatarMoeda(saldoDevedor)}`, "error");

      return;
    }

    const brindesEstoque = brindes.filter((b) => b.origem === "estoque");

    if (brindesEstoque.length > 0) {
      for (const brinde of brindesEstoque) {
        if (!brinde.produto_id) continue;
        const { data: estoqueAtual, error } = await supabase
          .from("estoque_lojas")
          .select("quantidade")
          .eq("id_produto", brinde.produto_id)
          .eq("id_loja", lojaId)
          .single();

        if (error) {
          showToast("Erro ao validar estoque de brindes", "error");

          return;
        }

        const quantidadeAtual = Number(estoqueAtual?.quantidade || 0);

        if (quantidadeAtual < brinde.quantidade) {
          showToast(
            `Estoque insuficiente para o brinde: ${brinde.descricao}`,
            "error",
          );

          return;
        }
      }
    }

    try {
      setLoading(true);

      // 1. Buscar cliente por telefone ou criar novo
      let clienteId: string;

      if (clienteTelefone && clienteTelefone.trim()) {
        const { data: clienteExistente } = await supabase
          .from("clientes")
          .select("id")
          .eq("telefone", clienteTelefone)
          .single();

        if (clienteExistente) {
          clienteId = clienteExistente.id;
        } else {
          // Criar novo cliente
          const { data: novoCliente, error: erroCliente } = await supabase
            .from("clientes")
            .insert({
              nome: clienteNome,
              telefone: clienteTelefone || null,
              id_loja: lojaId,
              ativo: true,
              criado_por: usuario.id,
              atualizado_por: usuario.id,
            })
            .select("id")
            .single();

          if (erroCliente) throw erroCliente;
          clienteId = novoCliente.id;
        }
      } else {
        // Cliente sem telefone - criar novo
        const { data: novoCliente, error: erroCliente } = await supabase
          .from("clientes")
          .insert({
            nome: clienteNome,
            id_loja: lojaId,
            ativo: true,
            criado_por: usuario.id,
            atualizado_por: usuario.id,
          })
          .select("id")
          .single();

        if (erroCliente) throw erroCliente;
        clienteId = novoCliente.id;
      }

      // 2. Gerar número da venda
      const { data: ultimaVenda } = await supabase
        .from("vendas")
        .select("numero_venda")
        .order("criado_em", { ascending: false })
        .limit(1)
        .single();

      const numeroVenda = ultimaVenda ? ultimaVenda.numero_venda + 1 : 1;

      // 3. Criar venda
      const { data: venda, error: erroVenda } = await supabase
        .from("vendas")
        .insert({
          numero_venda: numeroVenda,
          cliente_id: clienteId,
          loja_id: lojaId,
          vendedor_id: usuario.id,
          status: "concluida",
          tipo: "normal",
          valor_total: valorVendaNumerico,
          valor_pago: valorVendaNumerico,
          valor_desconto: 0,
          saldo_devedor: 0,
          observacoes:
            observacoes ||
            `Venda de aparelho: ${aparelho.marca} ${aparelho.modelo}`,
          finalizado_em: new Date().toISOString(),
          finalizado_por: usuario.id,
        })
        .select("id")
        .single();

      if (erroVenda) throw erroVenda;

      // 4. Cadastrar aparelho de troca no estoque (se houver)
      let aparelhoTrocaId: string | null = null;

      if (aparelhoTroca) {
        const { data: novoAparelho, error: erroAparelhoTroca } = await supabase
          .from("aparelhos")
          .insert({
            marca: aparelhoTroca.marca,
            modelo: aparelhoTroca.modelo,
            cor: aparelhoTroca.cor,
            armazenamento: aparelhoTroca.armazenamento,
            memoria_ram: aparelhoTroca.memoria_ram,
            imei: aparelhoTroca.imei || null,
            numero_serie: aparelhoTroca.numero_serie || null,
            saude_bateria: aparelhoTroca.saude_bateria,
            observacoes:
              aparelhoTroca.observacoes || "Aparelho recebido em troca",
            valor_compra: aparelhoTroca.valor_avaliado,
            valor_venda: null, // Será definido posteriormente
            estado: aparelhoTroca.estado,
            condicao: aparelhoTroca.condicao,
            status: "disponivel",
            loja_id: lojaId,
            criado_por: usuario.id,
          })
          .select("id")
          .single();

        if (erroAparelhoTroca) throw erroAparelhoTroca;
        aparelhoTrocaId = novoAparelho.id;
      }

      // 5. Registrar pagamentos
      for (const pagamento of formasPagamento) {
        const { error: erroPagamento } = await supabase
          .from("pagamentos_venda")
          .insert({
            venda_id: venda.id,
            tipo_pagamento: pagamento.tipo,
            valor: pagamento.valor,
            data_pagamento: new Date().toISOString(),
            criado_por: usuario.id,
            observacao:
              pagamento.tipo === "cartao_credito"
                ? `Crédito ${pagamento.parcelas}x`
                : undefined,
          });

        if (erroPagamento) throw erroPagamento;
      }

      // 6. Registrar troca como pagamento (se houver)
      if (aparelhoTroca && aparelhoTrocaId) {
        const { error: erroPagamentoTroca } = await supabase
          .from("pagamentos_venda")
          .insert({
            venda_id: venda.id,
            tipo_pagamento: "credito_cliente", // Usar tipo existente mais apropriado
            valor: aparelhoTroca.valor_avaliado,
            data_pagamento: new Date().toISOString(),
            criado_por: usuario.id,
            observacao: `Troca de aparelho: ${aparelhoTroca.marca} ${aparelhoTroca.modelo} - IMEI: ${aparelhoTroca.imei || aparelhoTroca.numero_serie || "N/A"}`,
          });

        if (erroPagamentoTroca) throw erroPagamentoTroca;
      }

      // 6.5 Registrar brindes e ajustar estoque (se houver)
      if (brindes.length > 0) {
        for (const brinde of brindes) {
          if (brinde.origem === "estoque" && brinde.produto_id) {
            const { data: estoqueAtual, error: erroEstoque } = await supabase
              .from("estoque_lojas")
              .select("quantidade")
              .eq("id_produto", brinde.produto_id)
              .eq("id_loja", lojaId)
              .single();

            if (erroEstoque) throw erroEstoque;

            const quantidadeAtual = Number(estoqueAtual?.quantidade || 0);

            if (quantidadeAtual < brinde.quantidade) {
              throw new Error("Estoque insuficiente para brinde");
            }

            const novaQuantidade = quantidadeAtual - brinde.quantidade;

            await supabase
              .from("estoque_lojas")
              .update({
                quantidade: novaQuantidade,
                atualizado_em: new Date().toISOString(),
                atualizado_por: usuario.id,
              })
              .eq("id_produto", brinde.produto_id)
              .eq("id_loja", lojaId);

            await supabase.from("historico_estoque").insert({
              id_produto: brinde.produto_id,
              id_loja: lojaId,
              quantidade_anterior: quantidadeAtual,
              quantidade_nova: novaQuantidade,
              quantidade_alterada: -brinde.quantidade,
              tipo_movimentacao: "brinde_aparelho",
              motivo: `Brinde na venda #${numeroVenda}`,
              usuario_id: usuario.id,
            });
          }

          await BrindesAparelhosService.registrarBrinde({
            loja_id: lojaId,
            venda_id: venda.id,
            descricao:
              brinde.origem === "estoque"
                ? `${brinde.descricao} x${brinde.quantidade}`
                : brinde.descricao,
            valor_custo: brinde.valor_custo,
            usuario_id: usuario.id,
          });
        }
      }

      // 7. Marcar aparelho como vendido
      const { error: erroAparelho } = await supabase
        .from("aparelhos")
        .update({
          status: "vendido",
          venda_id: venda.id,
          data_venda: new Date().toISOString(),
          atualizado_por: usuario.id,
          atualizado_em: new Date().toISOString(),
        })
        .eq("id", aparelho.id);

      if (erroAparelho) throw erroAparelho;

      showToast("Venda realizada com sucesso!", "success");
      onClose(true);
    } catch (error: any) {
      console.error("Erro ao finalizar venda:", error);
      showToast(error.message || "Erro ao finalizar venda", "error");
    } finally {
      setLoading(false);
    }
  };

  const getTipoPagamentoLabel = (tipo: string) => {
    return FORMAS_PAGAMENTO.find((f) => f.value === tipo)?.label || tipo;
  };

  return (
    <Modal
      isDismissable={!loading}
      isOpen={isOpen}
      scrollBehavior="inside"
      size="5xl"
      onClose={() => onClose(false)}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            <span>Vender Aparelho</span>
          </div>
          <p className="text-sm text-default-500 font-normal">
            {aparelho.marca} {aparelho.modelo} - {aparelho.armazenamento}
          </p>
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna Esquerda - Dados da Venda */}
            <div className="space-y-4">
              {/* Informações do Aparelho */}
              <Card>
                <CardBody className="gap-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    Aparelho
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-default-600">Marca/Modelo:</span>
                      <span className="font-medium">
                        {aparelho.marca} {aparelho.modelo}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-default-600">Armazenamento:</span>
                      <span className="font-medium">
                        {aparelho.armazenamento}
                      </span>
                    </div>
                    {aparelho.cor && (
                      <div className="flex justify-between">
                        <span className="text-default-600">Cor:</span>
                        <span className="font-medium">{aparelho.cor}</span>
                      </div>
                    )}
                    {aparelho.imei && (
                      <div className="flex justify-between">
                        <span className="text-default-600">IMEI:</span>
                        <span className="font-mono text-xs">
                          {aparelho.imei}
                        </span>
                      </div>
                    )}
                    {aparelho.saude_bateria && (
                      <div className="flex justify-between items-center">
                        <span className="text-default-600">Bateria:</span>
                        <Chip
                          color={
                            aparelho.saude_bateria >= 90
                              ? "success"
                              : aparelho.saude_bateria >= 70
                                ? "warning"
                                : "danger"
                          }
                          size="sm"
                          variant="flat"
                        >
                          {aparelho.saude_bateria}%
                        </Chip>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="gap-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Loja
                  </h3>
                  <Input
                    isDisabled
                    isReadOnly
                    label="Loja"
                    value={lojaNome || `Loja ${lojaId}`}
                    variant="bordered"
                  />
                </CardBody>
              </Card>

              {/* Dados do Cliente */}
              <Card>
                <CardBody className="gap-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Cliente
                  </h3>
                  <Input
                    isRequired
                    isDisabled={loading}
                    label="Nome do Cliente"
                    placeholder="Digite o nome completo"
                    value={clienteNome}
                    variant="bordered"
                    onValueChange={setClienteNome}
                  />
                  <Input
                    isDisabled={loading}
                    label="Telefone"
                    placeholder="(00) 00000-0000"
                    value={clienteTelefone}
                    variant="bordered"
                    onValueChange={setClienteTelefone}
                  />
                </CardBody>
              </Card>

              {/* Valor da Venda */}
              <Input
                isRequired
                isDisabled={loading}
                label="Valor da Venda"
                placeholder="0,00"
                startContent={
                  <DollarSign className="w-4 h-4 text-default-400" />
                }
                type="number"
                value={valorVenda}
                variant="bordered"
                onValueChange={setValorVenda}
              />

              {/* Brindes */}
              <Card>
                <CardBody className="gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Gift className="w-4 h-4" />
                      Brindes
                    </h3>
                    <Chip color="warning" size="sm" variant="flat">
                      Custo: {formatarMoeda(custoBrindes)}
                    </Chip>
                  </div>
                  {brindesSemEstoque.length > 0 ? (
                    <Card className="border border-danger/40 bg-danger/5">
                      <CardBody className="gap-2">
                        <p className="text-sm text-danger font-medium">
                          Brinde sem estoque suficiente:
                        </p>
                        {brindesSemEstoque.map((brinde, index) => (
                          <p
                            key={`${brinde.descricao}-${index}`}
                            className="text-xs text-danger"
                          >
                            {brinde.descricao} (Disp: {brinde.disponivel})
                          </p>
                        ))}
                      </CardBody>
                    </Card>
                  ) : null}

                  <Select
                    isDisabled={loading}
                    label="Origem"
                    selectedKeys={[origemBrinde]}
                    onChange={(e) =>
                      setOrigemBrinde(e.target.value as "estoque" | "manual")
                    }
                  >
                    <SelectItem key="estoque">Do estoque</SelectItem>
                    <SelectItem key="manual">Compra externa</SelectItem>
                  </Select>

                  {origemBrinde === "estoque" ? (
                    <div className="space-y-3">
                      <Select
                        isDisabled={loading}
                        label="Produto do estoque"
                        placeholder="Selecione um produto"
                        selectedKeys={produtoBrindeId ? [produtoBrindeId] : []}
                        onChange={(e) => setProdutoBrindeId(e.target.value)}
                      >
                        {estoqueBrindes.map((item) => (
                          <SelectItem key={item.produto_id}>
                            {item.descricao} (Disp: {item.quantidade})
                          </SelectItem>
                        ))}
                      </Select>
                      <Input
                        isDisabled={loading}
                        label="Quantidade"
                        type="number"
                        value={quantidadeBrinde}
                        onValueChange={setQuantidadeBrinde}
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Input
                        isDisabled={loading}
                        label="Descricao"
                        placeholder="Ex: pelicula, capa, acessorio"
                        value={descricaoBrinde}
                        onValueChange={setDescricaoBrinde}
                      />
                      <Input
                        isDisabled={loading}
                        label="Custo"
                        placeholder="0,00"
                        type="number"
                        value={valorCustoBrinde}
                        onValueChange={setValorCustoBrinde}
                      />
                    </div>
                  )}

                  <Button
                    color="secondary"
                    isDisabled={loading}
                    startContent={<Plus className="w-4 h-4" />}
                    variant="flat"
                    onPress={handleAdicionarBrinde}
                  >
                    Adicionar Brinde
                  </Button>

                  {brindes.length > 0 ? (
                    <div className="space-y-2">
                      {brindes.map((brinde, index) => (
                        <div
                          key={`${brinde.descricao}-${index}`}
                          className="flex items-center justify-between text-sm"
                        >
                          <div>
                            <span className="font-medium">
                              {brinde.descricao}
                            </span>
                            {brinde.quantidade > 1 ? (
                              <span className="text-default-500">
                                {` x${brinde.quantidade}`}
                              </span>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-2">
                            <span>{formatarMoeda(brinde.valor_custo)}</span>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => handleRemoverBrinde(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-default-500">
                      Nenhum brinde adicionado.
                    </p>
                  )}
                </CardBody>
              </Card>

              {/* Aparelho em Troca */}
              {!aparelhoTroca && !mostrarFormTroca && (
                <Button
                  color="secondary"
                  isDisabled={loading}
                  startContent={<Repeat className="w-4 h-4" />}
                  variant="bordered"
                  onPress={() => setMostrarFormTroca(true)}
                >
                  Adicionar Aparelho em Troca
                </Button>
              )}

              {mostrarFormTroca && !aparelhoTroca && (
                <Card className="border-2 border-secondary">
                  <CardBody className="gap-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Repeat className="w-4 h-4 text-secondary" />
                        Cadastrar Aparelho em Troca
                      </h3>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => setMostrarFormTroca(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        isRequired
                        id="troca-marca"
                        label="Marca"
                        placeholder="Ex: Apple, Samsung..."
                        size="sm"
                        variant="bordered"
                      />
                      <Input
                        isRequired
                        id="troca-modelo"
                        label="Modelo"
                        placeholder="Ex: iPhone 14, Galaxy S23..."
                        size="sm"
                        variant="bordered"
                      />
                      <Input
                        isRequired
                        id="troca-cor"
                        label="Cor"
                        placeholder="Ex: Preto, Branco..."
                        size="sm"
                        variant="bordered"
                      />
                      <Input
                        isRequired
                        id="troca-armazenamento"
                        label="Armazenamento (GB)"
                        placeholder="Ex: 128GB, 256GB..."
                        size="sm"
                        variant="bordered"
                      />
                      <Input
                        id="troca-ram"
                        label="RAM (opcional)"
                        placeholder="Ex: 8GB..."
                        size="sm"
                        variant="bordered"
                      />
                      <Input
                        id="troca-imei"
                        label="IMEI (opcional)"
                        placeholder="000000000000000"
                        size="sm"
                        variant="bordered"
                      />
                      <Select
                        isRequired
                        defaultSelectedKeys={["usado"]}
                        id="troca-estado"
                        label="Estado"
                        size="sm"
                        variant="bordered"
                      >
                        <SelectItem key="novo">Novo</SelectItem>
                        <SelectItem key="seminovo">Seminovo</SelectItem>
                        <SelectItem key="usado">Usado</SelectItem>
                        <SelectItem key="recondicionado">
                          Recondicionado
                        </SelectItem>
                      </Select>
                      <Select
                        isRequired
                        defaultSelectedKeys={["bom"]}
                        id="troca-condicao"
                        label="Condição"
                        size="sm"
                        variant="bordered"
                      >
                        <SelectItem key="perfeito">Perfeito</SelectItem>
                        <SelectItem key="bom">Bom</SelectItem>
                        <SelectItem key="regular">Regular</SelectItem>
                        <SelectItem key="ruim">Ruim</SelectItem>
                      </Select>
                      <Input
                        isRequired
                        id="troca-bateria"
                        label="Saúde da Bateria (%)"
                        max={100}
                        min={0}
                        placeholder="0-100"
                        size="sm"
                        type="number"
                        variant="bordered"
                      />
                      <Input
                        isRequired
                        id="troca-valor"
                        label="Valor Avaliado (R$)"
                        placeholder="0,00"
                        size="sm"
                        startContent={<DollarSign className="w-3 h-3" />}
                        type="number"
                        variant="bordered"
                      />
                    </div>

                    <Input
                      id="troca-obs"
                      label="Observações (opcional)"
                      placeholder="Detalhes sobre o aparelho..."
                      size="sm"
                      variant="bordered"
                    />

                    <Button
                      color="secondary"
                      startContent={<Plus className="w-4 h-4" />}
                      onPress={() => {
                        const marca = (
                          document.getElementById(
                            "troca-marca",
                          ) as HTMLInputElement
                        )?.value;
                        const modelo = (
                          document.getElementById(
                            "troca-modelo",
                          ) as HTMLInputElement
                        )?.value;
                        const cor = (
                          document.getElementById(
                            "troca-cor",
                          ) as HTMLInputElement
                        )?.value;
                        const armazenamento = (
                          document.getElementById(
                            "troca-armazenamento",
                          ) as HTMLInputElement
                        )?.value;
                        const ram = (
                          document.getElementById(
                            "troca-ram",
                          ) as HTMLInputElement
                        )?.value;
                        const imei = (
                          document.getElementById(
                            "troca-imei",
                          ) as HTMLInputElement
                        )?.value;
                        const estado = (
                          document.getElementById(
                            "troca-estado",
                          ) as HTMLSelectElement
                        )?.value;
                        const condicao = (
                          document.getElementById(
                            "troca-condicao",
                          ) as HTMLSelectElement
                        )?.value;
                        const bateria = parseInt(
                          (
                            document.getElementById(
                              "troca-bateria",
                            ) as HTMLInputElement
                          )?.value,
                        );
                        const valor = parseFloat(
                          (
                            document.getElementById(
                              "troca-valor",
                            ) as HTMLInputElement
                          )?.value,
                        );
                        const obs = (
                          document.getElementById(
                            "troca-obs",
                          ) as HTMLInputElement
                        )?.value;

                        if (
                          !marca ||
                          !modelo ||
                          !cor ||
                          !armazenamento ||
                          !estado ||
                          !condicao ||
                          !bateria ||
                          !valor
                        ) {
                          showToast(
                            "Preencha todos os campos obrigatórios",
                            "error",
                          );

                          return;
                        }

                        if (bateria < 0 || bateria > 100) {
                          showToast(
                            "Saúde da bateria deve estar entre 0% e 100%",
                            "error",
                          );

                          return;
                        }

                        setAparelhoTroca({
                          marca,
                          modelo,
                          cor,
                          armazenamento,
                          memoria_ram: ram || undefined,
                          imei: imei || undefined,
                          saude_bateria: bateria,
                          valor_avaliado: valor,
                          estado: estado as any,
                          condicao: condicao as any,
                          observacoes: obs || undefined,
                        });
                        setMostrarFormTroca(false);
                        showToast("Aparelho em troca adicionado!", "success");
                      }}
                    >
                      Adicionar Troca
                    </Button>
                  </CardBody>
                </Card>
              )}

              {aparelhoTroca && (
                <Card className="border-2 border-secondary bg-secondary/5">
                  <CardBody className="gap-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold flex items-center gap-2 text-secondary">
                        <Repeat className="w-4 h-4" />
                        Aparelho em Troca
                      </h3>
                      <Button
                        isIconOnly
                        color="danger"
                        size="sm"
                        variant="light"
                        onPress={() => {
                          setAparelhoTroca(null);
                          showToast("Aparelho em troca removido", "warning");
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-default-600">Modelo:</span>
                        <span className="font-medium">
                          {aparelhoTroca.marca} {aparelhoTroca.modelo}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-600">Armazenamento:</span>
                        <span className="font-medium">
                          {aparelhoTroca.armazenamento}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-600">Cor:</span>
                        <span className="font-medium">{aparelhoTroca.cor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-600">Bateria:</span>
                        <Chip
                          color={
                            aparelhoTroca.saude_bateria >= 80
                              ? "success"
                              : aparelhoTroca.saude_bateria >= 50
                                ? "warning"
                                : "danger"
                          }
                          size="sm"
                        >
                          {aparelhoTroca.saude_bateria}%
                        </Chip>
                      </div>
                      <div className="col-span-2 flex justify-between items-center pt-2 border-t border-secondary/30">
                        <span className="text-default-600 font-semibold">
                          Valor Avaliado:
                        </span>
                        <span className="font-bold text-lg text-secondary">
                          {formatarMoeda(aparelhoTroca.valor_avaliado)}
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Adicionar Forma de Pagamento */}
              <Card>
                <CardBody className="gap-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Adicionar Pagamento
                  </h3>

                  <Select
                    label="Forma de Pagamento"
                    selectedKeys={[tipoPagamento]}
                    size="sm"
                    variant="bordered"
                    onChange={(e) => setTipoPagamento(e.target.value)}
                  >
                    {FORMAS_PAGAMENTO.map((forma) => (
                      <SelectItem key={forma.value}>{forma.label}</SelectItem>
                    ))}
                  </Select>

                  <Input
                    label="Valor"
                    placeholder="0,00"
                    size="sm"
                    startContent={
                      <DollarSign className="w-4 h-4 text-default-400" />
                    }
                    type="number"
                    value={valorPagamento}
                    variant="bordered"
                    onValueChange={setValorPagamento}
                  />

                  {tipoPagamento === "cartao_credito" && (
                    <Select
                      label="Parcelas"
                      selectedKeys={[parcelasPagamento.toString()]}
                      size="sm"
                      variant="bordered"
                      onChange={(e) =>
                        setParcelasPagamento(parseInt(e.target.value))
                      }
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                        <SelectItem key={n.toString()}>
                          {n}x de{" "}
                          {formatarMoeda((parseFloat(valorPagamento) || 0) / n)}
                        </SelectItem>
                      ))}
                    </Select>
                  )}

                  <Input
                    label="Data do Pagamento"
                    size="sm"
                    startContent={
                      <Calendar className="w-4 h-4 text-default-400" />
                    }
                    type="date"
                    value={dataPagamento}
                    variant="bordered"
                    onValueChange={setDataPagamento}
                  />

                  <Button
                    color="success"
                    size="sm"
                    startContent={<Plus className="w-4 h-4" />}
                    onPress={handleAdicionarPagamento}
                  >
                    Adicionar Pagamento
                  </Button>
                </CardBody>
              </Card>

              {/* Pagamentos Adicionados */}
              {(formasPagamento.length > 0 || aparelhoTroca) && (
                <Card>
                  <CardBody className="gap-2">
                    <h3 className="font-semibold text-sm">
                      Resumo de Pagamentos
                    </h3>
                    {formasPagamento.map((pag, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-default-100 rounded-lg"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {getTipoPagamentoLabel(pag.tipo)}
                          </span>
                          <span className="text-xs text-default-500">
                            {pag.parcelas && pag.parcelas > 1
                              ? `${pag.parcelas}x de ${formatarMoeda(
                                  pag.valor / pag.parcelas,
                                )}`
                              : formatarMoeda(pag.valor)}
                          </span>
                        </div>
                        <Button
                          isIconOnly
                          color="danger"
                          size="sm"
                          variant="light"
                          onPress={() => handleRemoverPagamento(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}

                    <Divider className="my-2" />

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Total:</span>
                        <span className="font-bold">
                          {formatarMoeda(valorVendaNumerico)}
                        </span>
                      </div>
                      {aparelhoTroca && (
                        <div className="flex justify-between text-sm">
                          <span className="text-secondary">Troca:</span>
                          <span className="font-bold text-secondary">
                            - {formatarMoeda(valorTroca)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span>Pago (dinheiro/cartão):</span>
                        <span className="font-bold text-success">
                          {formatarMoeda(
                            formasPagamento.reduce(
                              (sum, f) => sum + f.valor,
                              0,
                            ),
                          )}
                        </span>
                      </div>
                      <Divider className="my-1" />
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold">Total Pago:</span>
                        <span className="font-bold text-success">
                          {formatarMoeda(valorPago)}
                        </span>
                      </div>
                      {saldoDevedor > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Falta:</span>
                          <span className="font-bold text-danger">
                            {formatarMoeda(saldoDevedor)}
                          </span>
                        </div>
                      )}
                      {saldoDevedor < 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Troco:</span>
                          <span className="font-bold text-primary">
                            {formatarMoeda(Math.abs(saldoDevedor))}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>

            {/* Coluna Direita - Simulador de Taxa */}
            <div className="space-y-4">
              <SimuladorTaxaCartao
                mostrarDetalhes={true}
                tipoProdutoPadrao="aparelho"
                valorCusto={valorCusto}
                valorVenda={valorVendaNumerico}
                onSimulacaoChange={setSimulacaoAtual}
              />
            </div>
          </div>

          {/* Observações */}
          <div className="mt-4">
            <Input
              disabled={loading}
              label="Observações (Opcional)"
              placeholder="Digite observações sobre a venda..."
              value={observacoes}
              onValueChange={setObservacoes}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            isDisabled={loading}
            variant="light"
            onPress={() => onClose(false)}
          >
            Cancelar
          </Button>
          <Button
            color="primary"
            isDisabled={loading || brindesSemEstoque.length > 0}
            isLoading={loading}
            startContent={!loading && <ShoppingBag className="w-4 h-4" />}
            onPress={handleFinalizarVenda}
          >
            Finalizar Venda
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
