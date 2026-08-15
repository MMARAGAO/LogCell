"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Card,
  CardBody,
  Divider,
  Chip,
  RadioGroup,
  Radio,
} from "@heroui/react";
import {
  RefreshCw,
  Package,
  AlertCircle,
  CreditCard,
  Wallet,
  Search,
  CheckCircle,
  Banknote,
  Smartphone,
} from "lucide-react";

import { useToast } from "@/components/Toast";
import { supabase } from "@/lib/supabaseClient";
import { movimentarEstoqueComHistorico } from "@/services/movimentacaoEstoqueService";

interface TrocarProdutoModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendaId: string;
  itemVendaId: string;
  produtoAtual: {
    id: string;
    nome: string;
    quantidade: number;
    preco_unitario: number;
  };
  lojaId: number;
  onTrocaRealizada: () => void;
}

interface ProdutoEstoque {
  id: string;
  descricao: string;
  marca?: string;
  categoria?: string;
  preco_venda: number;
  quantidade_disponivel: number;
  imagem_url?: string;
  codigo_fabricante?: string;
}

export function TrocarProdutoModal({
  isOpen,
  onClose,
  vendaId,
  itemVendaId,
  produtoAtual,
  lojaId,
  onTrocaRealizada,
}: TrocarProdutoModalProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [produtoNovoId, setProdutoNovoId] = useState<string>("");
  const [produtoNovo, setProdutoNovo] = useState<ProdutoEstoque | null>(null);
  const [quantidadeTroca, setQuantidadeTroca] = useState("1");
  const [quantidadeNovo, setQuantidadeNovo] = useState("1");
  const [busca, setBusca] = useState("");
  const [tipoReembolso, setTipoReembolso] = useState<"credito" | "sem_credito">(
    "credito",
  );
  const [formaPagamentoReembolso, setFormaPagamentoReembolso] =
    useState<string>("dinheiro");
  const [fotoAtual, setFotoAtual] = useState<string | null>(null);

  // Estados para o modal de quantidade
  const [showQuantidadeModal, setShowQuantidadeModal] = useState(false);
  const [produtoSelecionadoTemp, setProdutoSelecionadoTemp] =
    useState<ProdutoEstoque | null>(null);
  const [quantidadeTempNovo, setQuantidadeTempNovo] = useState("1");

  useEffect(() => {
    if (isOpen) {
      carregarProdutos();
      carregarFotoProdutoAtual();
      setQuantidadeTroca(produtoAtual.quantidade.toString());
    }
  }, [isOpen, lojaId]);

  const carregarFotoProdutoAtual = async () => {
    try {
      const { data } = await supabase
        .from("fotos_produtos")
        .select("url, is_principal")
        .eq("produto_id", produtoAtual.id)
        .order("is_principal", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setFotoAtual(data.url);
      }
    } catch (error) {
      // Não tem foto, tudo bem
      setFotoAtual(null);
    }
  };

  const carregarProdutos = async () => {
    setLoadingProdutos(true);
    try {
      // Buscar produtos com estoque disponível e fotos com paginação
      let allData: any[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from("produtos")
          .select(
            `
            id,
            descricao,
            marca,
            categoria,
            preco_venda,
            codigo_fabricante,
            ativo,
            estoque:estoque_lojas!inner(
              quantidade
            ),
            fotos:fotos_produtos(
              url,
              is_principal
            )
          `,
          )
          .eq("estoque.id_loja", lojaId)
          .eq("ativo", true)
          .gt("estoque.quantidade", 0)
          .order("descricao")
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) throw error;

        allData = [...allData, ...(data || [])];
        page++;
        hasMore = (data?.length || 0) === pageSize;
      }

      const data = allData;

      const produtosFormatados: ProdutoEstoque[] = (data || []).map(
        (produto: any) => {
          // Buscar foto principal ou primeira foto
          const fotos = Array.isArray(produto.fotos) ? produto.fotos : [];
          const fotoPrincipal =
            fotos.find((f: any) => f.is_principal)?.url || fotos[0]?.url;

          return {
            id: produto.id,
            descricao: produto.descricao,
            marca: produto.marca,
            categoria: produto.categoria,
            preco_venda: produto.preco_venda || 0,
            quantidade_disponivel: Array.isArray(produto.estoque)
              ? produto.estoque[0]?.quantidade || 0
              : produto.estoque?.quantidade || 0,
            imagem_url: fotoPrincipal,
            codigo_fabricante: produto.codigo_fabricante,
          };
        },
      );

      console.log("✅ Produtos carregados:", produtosFormatados.length);
      setProdutos(produtosFormatados);
    } catch (error) {
      console.error("❌ Erro ao carregar produtos:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoadingProdutos(false);
    }
  };

  const handleProdutoSelecionado = (produtoId: string | null) => {
    if (!produtoId) {
      setProdutoNovoId("");
      setProdutoNovo(null);
      setQuantidadeNovo("1");

      return;
    }

    const produto = produtos.find((p) => p.id === produtoId);

    if (produto) {
      // Abrir modal para selecionar quantidade
      setProdutoSelecionadoTemp(produto);
      setQuantidadeTempNovo("1");
      setShowQuantidadeModal(true);
    }
  };

  const confirmarSelecaoProduto = () => {
    if (produtoSelecionadoTemp) {
      setProdutoNovoId(produtoSelecionadoTemp.id);
      setProdutoNovo(produtoSelecionadoTemp);
      setQuantidadeNovo(quantidadeTempNovo);
      setShowQuantidadeModal(false);
      setProdutoSelecionadoTemp(null);
    }
  };

  const cancelarSelecaoProduto = () => {
    setShowQuantidadeModal(false);
    setProdutoSelecionadoTemp(null);
    setQuantidadeTempNovo("1");
  };

  const calcularDiferenca = () => {
    if (!produtoNovo) return 0;
    const qtdTroca = parseInt(quantidadeTroca) || 0;
    const qtdNovo = parseInt(quantidadeNovo) || 0;
    const valorAtual = produtoAtual.preco_unitario * qtdTroca;
    const valorNovo = produtoNovo.preco_venda * qtdNovo;
    const diferenca = valorNovo - valorAtual;

    console.log("💰 Cálculo de diferença:", {
      valorAtual,
      valorNovo,
      diferenca,
      qtdTroca,
      qtdNovo,
      produtoAtual: produtoAtual.preco_unitario,
      produtoNovo: produtoNovo.preco_venda,
    });

    return diferenca;
  };

  const realizarTroca = async () => {
    if (!produtoNovo) {
      toast.error("Selecione o produto para troca");

      return;
    }

    const qtd = parseInt(quantidadeTroca);
    const qtdNovo = parseInt(quantidadeNovo);

    if (qtd <= 0 || qtd > produtoAtual.quantidade) {
      toast.error("Quantidade inválida para troca");

      return;
    }

    if (qtdNovo <= 0) {
      toast.error("Quantidade do novo produto inválida");

      return;
    }

    if (qtdNovo > produtoNovo.quantidade_disponivel) {
      toast.error("Quantidade insuficiente em estoque do novo produto");

      return;
    }

    setLoading(true);
    try {
      console.log("🔄 Iniciando troca de produto...");
      const diferenca = calcularDiferenca();

      console.log("💰 Diferença calculada:", diferenca);

      // Obter usuário atual
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Usuário não autenticado");
      console.log("👤 Usuário autenticado:", user.id);

      // 1. Devolver o produto antigo ao estoque
      console.log("📦 Devolvendo produto ao estoque...");
      const { data: estoqueAtual } = await supabase
        .from("estoque_lojas")
        .select("id, quantidade")
        .eq("id_produto", produtoAtual.id)
        .eq("id_loja", lojaId)
        .single();

      if (estoqueAtual) {
        console.log("✅ Estoque atual encontrado:", estoqueAtual);
        await movimentarEstoqueComHistorico({
          produtoId: produtoAtual.id,
          lojaId,
          quantidadeDelta: qtd,
          tipoMovimentacao: "entrada",
          usuarioId: user.id,
          motivo: `Devolução por troca - Venda`,
        });
      }

      // 2. Baixar o novo produto do estoque
      console.log("📤 Retirando produto novo do estoque...");
      const { data: estoqueNovo, error: errorBuscarEstoque } = await supabase
        .from("estoque_lojas")
        .select("id, quantidade")
        .eq("id_produto", produtoNovo.id)
        .eq("id_loja", lojaId)
        .single();

      if (errorBuscarEstoque || !estoqueNovo) {
        throw new Error(
          `Produto "${produtoNovo.descricao}" não encontrado no estoque desta loja`,
        );
      }

      if (estoqueNovo.quantidade < qtdNovo) {
        throw new Error(
          `Estoque insuficiente! Disponível: ${estoqueNovo.quantidade} un. Necessário: ${qtdNovo} un.`,
        );
      }

      console.log("✅ Estoque novo encontrado:", estoqueNovo);
      await movimentarEstoqueComHistorico({
        produtoId: produtoNovo.id,
        lojaId,
        quantidadeDelta: -qtdNovo,
        tipoMovimentacao: "saida",
        usuarioId: user.id,
        motivo: `Troca de produto - Venda`,
      });

      // 3. Atualizar o item da venda
      console.log("✏️ Atualizando item da venda...");
      if (qtd === produtoAtual.quantidade) {
        // Troca total - atualizar o item existente
        console.log("🔄 Troca total - substituindo item");
        const { error: errorItem } = await supabase
          .from("itens_venda")
          .update({
            produto_id: produtoNovo.id,
            produto_nome: produtoNovo.descricao,
            produto_codigo: produtoNovo.id.substring(0, 8),
            preco_unitario: produtoNovo.preco_venda,
            subtotal: produtoNovo.preco_venda * qtdNovo,
            quantidade: qtdNovo,
          })
          .eq("id", itemVendaId);

        if (errorItem) throw errorItem;
      } else {
        // Troca parcial - diminuir quantidade do item antigo e adicionar novo item
        console.log("➗ Troca parcial - dividindo item");
        const { error: errorUpdateAntigo } = await supabase
          .from("itens_venda")
          .update({
            quantidade: produtoAtual.quantidade - qtd,
            subtotal:
              produtoAtual.preco_unitario * (produtoAtual.quantidade - qtd),
          })
          .eq("id", itemVendaId);

        if (errorUpdateAntigo) throw errorUpdateAntigo;

        // Adicionar novo item com o produto novo
        const { error: errorNovoItem } = await supabase
          .from("itens_venda")
          .insert({
            venda_id: vendaId,
            produto_id: produtoNovo.id,
            produto_nome: produtoNovo.descricao,
            produto_codigo: produtoNovo.id.substring(0, 8),
            quantidade: qtdNovo,
            preco_unitario: produtoNovo.preco_venda,
            subtotal: produtoNovo.preco_venda * qtdNovo,
          });

        if (errorNovoItem) throw errorNovoItem;
      }

      // 4. Recalcular total da venda
      console.log("🧮 Recalculando total da venda...");
      const { data: itensVenda } = await supabase
        .from("itens_venda")
        .select("subtotal")
        .eq("venda_id", vendaId);

      if (itensVenda) {
        const novoTotal = itensVenda.reduce(
          (sum, item) => sum + item.subtotal,
          0,
        );

        // Buscar valores atuais da venda
        const { data: vendaAtual } = await supabase
          .from("vendas")
          .select("valor_pago, saldo_devedor")
          .eq("id", vendaId)
          .single();

        if (!vendaAtual) throw new Error("Venda não encontrada");

        const updates: any = { valor_total: novoTotal };

        // Se houver diferença positiva, cliente deve pagar mais
        if (diferenca > 0) {
          updates.saldo_devedor = vendaAtual.saldo_devedor + diferenca;
          // Se ficou com saldo devedor, mudar status para "em_andamento"
          if (updates.saldo_devedor > 0) {
            updates.status = "em_andamento";
          }
        }

        // Se houver diferença negativa (reembolso), abater do valor pago
        if (diferenca < 0) {
          const valorReembolso = Math.abs(diferenca);

          updates.valor_pago = Math.max(
            0,
            vendaAtual.valor_pago - valorReembolso,
          );
          // Recalcular saldo devedor
          updates.saldo_devedor = novoTotal - updates.valor_pago;
          // Se ficou com saldo devedor, mudar status para "em_andamento"
          if (updates.saldo_devedor > 0) {
            updates.status = "em_andamento";
          }
          console.log("💰 Abatendo reembolso da venda:", {
            valorPagoAntigo: vendaAtual.valor_pago,
            valorReembolso,
            novoValorPago: updates.valor_pago,
            novoSaldoDevedor: updates.saldo_devedor,
          });
        }

        await supabase.from("vendas").update(updates).eq("id", vendaId);
      }

      // 5. Se houver diferença negativa (reembolso), processar crédito
      console.log("💳 Processando reembolso...", { diferenca, tipoReembolso });
      if (diferenca < 0 && tipoReembolso === "credito") {
        const { data: venda } = await supabase
          .from("vendas")
          .select("cliente_id")
          .eq("id", vendaId)
          .single();

        if (venda?.cliente_id) {
          const valorReembolso = Math.abs(diferenca);

          // Criar novo crédito para o cliente
          const { error: errorCriarCredito } = await supabase
            .from("creditos_cliente")
            .insert({
              cliente_id: venda.cliente_id,
              valor_total: valorReembolso,
              valor_utilizado: 0,
              saldo: valorReembolso,
              gerado_por: user.id,
              tipo: "adicao",
              motivo: `Reembolso de troca de produto - Venda`,
            });

          if (errorCriarCredito) {
            console.error("❌ Erro ao criar crédito:", errorCriarCredito);
            throw errorCriarCredito;
          }

          console.log("✅ Crédito criado com sucesso!");
        }
      }

      // 5b. Se houver diferença negativa e reembolso manual, registrar sangria no caixa
      if (diferenca < 0 && tipoReembolso === "sem_credito") {
        const valorReembolso = Math.abs(diferenca);

        // Buscar número da venda
        const { data: vendaInfo } = await supabase
          .from("vendas")
          .select("numero_venda")
          .eq("id", vendaId)
          .single();

        // Buscar caixa aberto da loja
        const { data: caixaAberto } = await supabase
          .from("caixas")
          .select("id")
          .eq("loja_id", lojaId)
          .eq("status", "aberto")
          .order("data_abertura", { ascending: false })
          .limit(1)
          .single();

        if (caixaAberto) {
          const formaTexto =
            formaPagamentoReembolso === "dinheiro"
              ? "dinheiro"
              : formaPagamentoReembolso === "pix"
                ? "PIX"
                : formaPagamentoReembolso === "transferencia"
                  ? "transferência"
                  : formaPagamentoReembolso === "cartao_debito"
                    ? "cartão de débito"
                    : formaPagamentoReembolso === "cartao_credito"
                      ? "cartão de crédito"
                      : formaPagamentoReembolso;

          const numeroVenda = vendaInfo?.numero_venda
            ? `V${String(vendaInfo.numero_venda).padStart(6, "0")}`
            : vendaId.substring(0, 8);

          const { error: errorSangria } = await supabase
            .from("sangrias_caixa")
            .insert({
              caixa_id: caixaAberto.id,
              venda_id: vendaId,
              valor: valorReembolso,
              motivo: `Reembolso de troca de produto (${formaTexto}) - Venda ${numeroVenda}`,
              realizado_por: user.id,
            });

          if (errorSangria) {
            console.error("❌ Erro ao registrar sangria:", errorSangria);
            throw errorSangria;
          }

          console.log("✅ Sangria registrada no caixa!");
        } else {
          console.warn(
            "⚠️ Nenhum caixa aberto encontrado. Sangria não registrada.",
          );
        }
      }

      // 6. Registrar a troca na tabela trocas_produtos
      console.log("📝 Registrando troca...");
      const dadosTroca: any = {
        venda_id: vendaId,
        item_venda_id: itemVendaId,
        produto_antigo_id: produtoAtual.id,
        produto_antigo_nome: produtoAtual.nome || "Produto sem nome",
        produto_antigo_preco: produtoAtual.preco_unitario,
        quantidade_trocada: qtd,
        produto_novo_id: produtoNovo.id,
        produto_novo_nome: produtoNovo.descricao || "Produto sem nome",
        produto_novo_preco: produtoNovo.preco_venda,
        diferenca_valor: diferenca,
        loja_id: lojaId,
        usuario_id: user?.id,
        criado_em: new Date().toISOString(),
      };

      // Adicionar informações de reembolso se houver diferença negativa
      if (diferenca < 0) {
        dadosTroca.tipo_reembolso =
          tipoReembolso === "credito" ? "credito" : "manual";
        if (tipoReembolso === "sem_credito") {
          dadosTroca.forma_pagamento_reembolso = formaPagamentoReembolso;
        }
      }

      const { error: errorTroca } = await supabase
        .from("trocas_produtos")
        .insert(dadosTroca);

      if (errorTroca) {
        console.error("Erro ao registrar troca:", errorTroca);
        // Não interrompe o processo se falhar apenas o registro
      }

      // 7. Registrar no histórico da venda
      let descricaoHistorico = `Produto trocado: ${produtoAtual.nome} → ${produtoNovo.descricao} (${qtd}un)`;

      if (diferenca > 0) {
        descricaoHistorico += ` - Diferença cobrada: R$ ${diferenca.toFixed(2)}`;
      } else if (diferenca < 0) {
        const formaReembolso =
          tipoReembolso === "credito"
            ? "em crédito"
            : `manual (${formaPagamentoReembolso})`;

        descricaoHistorico += ` - Reembolso ${formaReembolso}: R$ ${Math.abs(diferenca).toFixed(2)}`;
      }

      await supabase.from("historico_vendas").insert({
        venda_id: vendaId,
        tipo_acao: "edicao",
        descricao: descricaoHistorico,
        usuario_id: user.id,
      });

      toast.success("Troca realizada com sucesso!");
      onTrocaRealizada();
      handleClose();
    } catch (error: any) {
      console.error("❌ Erro ao realizar troca:", error);
      console.error("❌ Tipo do erro:", typeof error);
      console.error("❌ Detalhes:", JSON.stringify(error, null, 2));

      let mensagemErro = "Erro ao realizar troca";

      if (error?.message) {
        mensagemErro = error.message;
      } else if (error?.error_description) {
        mensagemErro = error.error_description;
      } else if (typeof error === "string") {
        mensagemErro = error;
      }

      toast.error(mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setProdutoNovoId("");
    setProdutoNovo(null);
    setQuantidadeTroca("1");
    setQuantidadeNovo("1");
    setBusca("");
    onClose();
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const produtosFiltrados = useMemo(() => {
    let resultado = produtos.filter((p) => p.id !== produtoAtual.id);

    if (busca) {
      const termoBusca = busca.toLowerCase();
      const palavras = termoBusca.split(/\s+/).filter((p) => p.length > 0);

      resultado = resultado.filter((produto) => {
        const textoCompleto = [
          produto.descricao,
          produto.marca || "",
          produto.categoria || "",
        ]
          .join(" ")
          .toLowerCase();

        return palavras.every((palavra) => textoCompleto.includes(palavra));
      });
    }

    return resultado;
  }, [produtos, busca, produtoAtual.id]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        scrollBehavior="inside"
        size="5xl"
        onClose={handleClose}
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Trocar Produto
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {/* Produto Atual */}
              <Card className="bg-default-100 dark:bg-default-50/10">
                <CardBody className="p-4">
                  <p className="text-xs text-default-600 mb-3 font-semibold">
                    PRODUTO ATUAL (será devolvido ao estoque)
                  </p>
                  <div className="flex items-start gap-3">
                    {/* Foto do produto atual */}
                    <div className="flex-shrink-0">
                      {fotoAtual ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-default-200">
                          <img
                            alt={produtoAtual.nome}
                            className="w-full h-full object-cover"
                            src={fotoAtual}
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-default-200 flex items-center justify-center">
                          <Package className="w-6 h-6 text-default-400" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="font-medium">{produtoAtual.nome}</p>
                        <p className="text-sm text-default-600">
                          Disponível na venda: {produtoAtual.quantidade}{" "}
                          unidade(s)
                        </p>
                        <p className="text-sm text-default-600">
                          Preço unitário:{" "}
                          {formatarMoeda(produtoAtual.preco_unitario)}
                        </p>
                      </div>

                      {/* Quantidade a trocar */}
                      {produtoAtual.quantidade > 1 && (
                        <div className="pt-2">
                          <Input
                            className="max-w-xs"
                            description={`De 1 até ${produtoAtual.quantidade} unidades`}
                            label="Quantidade a trocar"
                            max={produtoAtual.quantidade}
                            min="1"
                            size="sm"
                            type="number"
                            value={quantidadeTroca}
                            variant="bordered"
                            onValueChange={setQuantidadeTroca}
                          />
                        </div>
                      )}

                      {/* Total do produto atual */}
                      <div className="pt-1">
                        <p className="text-sm font-semibold text-default-700">
                          Total a trocar: {parseInt(quantidadeTroca || "0")} ×{" "}
                          {formatarMoeda(produtoAtual.preco_unitario)} ={" "}
                          {formatarMoeda(
                            produtoAtual.preco_unitario *
                              parseInt(quantidadeTroca || "0"),
                          )}
                        </p>
                      </div>
                    </div>

                    <Chip color="default" variant="flat">
                      Atual
                    </Chip>
                  </div>
                </CardBody>
              </Card>

              <Divider />

              {/* Buscar Novo Produto */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-default-500" />
                  <h3 className="text-lg font-semibold">
                    Selecionar Novo Produto
                  </h3>
                </div>

                <Input
                  placeholder="Buscar produto... (ex: bat i 11)"
                  startContent={<Search className="w-4 h-4 text-default-400" />}
                  value={busca}
                  variant="bordered"
                  onValueChange={setBusca}
                />

                {/* Grid de produtos */}
                {loadingProdutos ? (
                  <div className="text-center py-8">
                    <p className="text-default-500">Carregando produtos...</p>
                  </div>
                ) : produtosFiltrados.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-default-400 mx-auto mb-2" />
                    <p className="text-default-500">
                      {busca
                        ? "Nenhum produto encontrado"
                        : "Nenhum produto disponível"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[450px] overflow-y-auto pr-2">
                    {produtosFiltrados.map((produto) => (
                      <Card
                        key={produto.id}
                        isHoverable
                        isPressable
                        className={`transition-all ${
                          produtoNovoId === produto.id
                            ? "ring-2 ring-primary bg-primary-50 dark:bg-primary-900/20"
                            : "hover:shadow-lg"
                        }`}
                        onPress={() => handleProdutoSelecionado(produto.id)}
                      >
                        <CardBody className="p-3">
                          <div className="flex gap-3">
                            {/* Imagem do produto */}
                            <div className="flex-shrink-0">
                              {produto.imagem_url ? (
                                <div className="w-20 h-20 rounded-lg overflow-hidden bg-default-100">
                                  <img
                                    alt={produto.descricao}
                                    className="w-full h-full object-cover"
                                    src={produto.imagem_url}
                                  />
                                </div>
                              ) : (
                                <div className="w-20 h-20 rounded-lg bg-default-100 flex items-center justify-center">
                                  <Package className="w-8 h-8 text-default-400" />
                                </div>
                              )}
                            </div>

                            {/* Informações do produto */}
                            <div className="flex-1 min-w-0 space-y-1.5">
                              {/* Cabeçalho com nome e check */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm line-clamp-2 leading-tight">
                                    {produto.descricao}
                                  </p>
                                </div>
                                {produtoNovoId === produto.id && (
                                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                                )}
                              </div>

                              {/* Marca e Código */}
                              {(produto.marca || produto.codigo_fabricante) && (
                                <div className="flex items-center gap-1.5 text-xs text-default-500">
                                  {produto.marca && (
                                    <span className="truncate">
                                      {produto.marca}
                                    </span>
                                  )}
                                  {produto.marca &&
                                    produto.codigo_fabricante && <span>•</span>}
                                  {produto.codigo_fabricante && (
                                    <span className="truncate">
                                      Cód: {produto.codigo_fabricante}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Categoria */}
                              {produto.categoria && (
                                <Chip className="h-5" size="sm" variant="flat">
                                  {produto.categoria}
                                </Chip>
                              )}

                              {/* Preço e estoque */}
                              <div className="flex items-center justify-between pt-1">
                                <p className="text-base font-bold text-success">
                                  {formatarMoeda(produto.preco_venda)}
                                </p>
                                <Chip
                                  className="h-5"
                                  color={
                                    produto.quantidade_disponivel > 5
                                      ? "success"
                                      : produto.quantidade_disponivel > 0
                                        ? "warning"
                                        : "danger"
                                  }
                                  size="sm"
                                  variant="flat"
                                >
                                  Est: {produto.quantidade_disponivel}
                                </Chip>
                              </div>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Resumo da Troca */}
              {produtoNovo && (
                <>
                  <Divider />
                  <Card
                    className={
                      calcularDiferenca() > 0
                        ? "bg-warning-50 dark:bg-warning-900/20 border-2 border-warning"
                        : calcularDiferenca() < 0
                          ? "bg-success-50 dark:bg-success-900/20 border-2 border-success"
                          : "bg-default-100 dark:bg-default-50/10"
                    }
                  >
                    <CardBody className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-default-600" />
                        <p className="text-sm font-semibold text-default-700">
                          RESUMO DA TROCA
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Produto Atual */}
                        <div className="space-y-2">
                          <p className="text-xs text-default-500 font-semibold">
                            DEVOLVENDO AO ESTOQUE
                          </p>
                          <div className="flex gap-2">
                            {fotoAtual ? (
                              <div className="w-12 h-12 rounded overflow-hidden bg-default-200 flex-shrink-0">
                                <img
                                  alt={produtoAtual.nome}
                                  className="w-full h-full object-cover"
                                  src={fotoAtual}
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded bg-default-200 flex items-center justify-center flex-shrink-0">
                                <Package className="w-5 h-5 text-default-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm line-clamp-2">
                                {produtoAtual.nome}
                              </p>
                              <p className="text-xs text-default-600">
                                {parseInt(quantidadeTroca || "0")}un ×{" "}
                                {formatarMoeda(produtoAtual.preco_unitario)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-default-500">
                              Subtotal:
                            </span>
                            <p className="text-base font-bold">
                              {formatarMoeda(
                                produtoAtual.preco_unitario *
                                  parseInt(quantidadeTroca || "0"),
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Produto Novo */}
                        <div className="space-y-2">
                          <p className="text-xs text-default-500 font-semibold">
                            RETIRANDO DO ESTOQUE
                          </p>
                          <div className="flex gap-2">
                            {produtoNovo.imagem_url ? (
                              <div className="w-12 h-12 rounded overflow-hidden bg-default-200 flex-shrink-0">
                                <img
                                  alt={produtoNovo.descricao}
                                  className="w-full h-full object-cover"
                                  src={produtoNovo.imagem_url}
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded bg-default-200 flex items-center justify-center flex-shrink-0">
                                <Package className="w-5 h-5 text-default-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm line-clamp-2">
                                {produtoNovo.descricao}
                              </p>
                              <p className="text-xs text-default-600">
                                {parseInt(quantidadeNovo || "0")}un ×{" "}
                                {formatarMoeda(produtoNovo.preco_venda)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-default-500">
                              Subtotal:
                            </span>
                            <p className="text-base font-bold">
                              {formatarMoeda(
                                produtoNovo.preco_venda *
                                  parseInt(quantidadeNovo || "0"),
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Divider />

                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Diferença:</span>
                        <div className="flex items-center gap-2">
                          {calcularDiferenca() > 0 ? (
                            <>
                              <AlertCircle className="w-4 h-4 text-warning" />
                              <span className="font-bold text-warning text-lg">
                                + {formatarMoeda(Math.abs(calcularDiferenca()))}
                              </span>
                              <span className="text-xs text-default-500">
                                (cliente paga)
                              </span>
                            </>
                          ) : calcularDiferenca() < 0 ? (
                            <>
                              <span className="font-bold text-success text-lg">
                                - {formatarMoeda(Math.abs(calcularDiferenca()))}
                              </span>
                              <span className="text-xs text-default-500">
                                (reembolso)
                              </span>
                            </>
                          ) : (
                            <span className="font-bold text-default-600">
                              Sem diferença
                            </span>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Opção de Reembolso (quando diferença é negativa) */}
                  {calcularDiferenca() < 0 && (
                    <Card className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400">
                      <CardBody className="p-4 space-y-4">
                        <p className="text-sm font-semibold mb-3 text-default-700">
                          Como deseja processar o reembolso?
                        </p>
                        <RadioGroup
                          value={tipoReembolso}
                          onValueChange={(value) =>
                            setTipoReembolso(value as "credito" | "sem_credito")
                          }
                        >
                          <Radio
                            description="O cliente receberá crédito para usar em futuras compras"
                            value="credito"
                          >
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              <span>Gerar crédito para o cliente</span>
                            </div>
                          </Radio>
                          <Radio
                            description="Reembolso direto ao cliente (dinheiro, PIX, etc)"
                            value="sem_credito"
                          >
                            <div className="flex items-center gap-2">
                              <Wallet className="w-4 h-4" />
                              <span>Reembolso manual</span>
                            </div>
                          </Radio>
                        </RadioGroup>

                        {/* Forma de pagamento do reembolso manual */}
                        {tipoReembolso === "sem_credito" && (
                          <div className="pt-2 space-y-2">
                            <Divider />
                            <p className="text-sm font-semibold text-default-700">
                              Forma de pagamento do reembolso:
                            </p>
                            <RadioGroup
                              orientation="horizontal"
                              value={formaPagamentoReembolso}
                              onValueChange={setFormaPagamentoReembolso}
                            >
                              <Radio value="dinheiro">
                                <div className="flex items-center gap-1">
                                  <Banknote className="w-4 h-4" />
                                  <span className="text-sm">Dinheiro</span>
                                </div>
                              </Radio>
                              <Radio value="pix">
                                <div className="flex items-center gap-1">
                                  <Smartphone className="w-4 h-4" />
                                  <span className="text-sm">PIX</span>
                                </div>
                              </Radio>
                              <Radio value="transferencia">
                                <div className="flex items-center gap-1">
                                  <CreditCard className="w-4 h-4" />
                                  <span className="text-sm">Transferência</span>
                                </div>
                              </Radio>
                              <Radio value="cartao_debito">
                                <div className="flex items-center gap-1">
                                  <CreditCard className="w-4 h-4" />
                                  <span className="text-sm">Cartão Débito</span>
                                </div>
                              </Radio>
                              <Radio value="cartao_credito">
                                <div className="flex items-center gap-1">
                                  <CreditCard className="w-4 h-4" />
                                  <span className="text-sm">
                                    Cartão Crédito
                                  </span>
                                </div>
                              </Radio>
                            </RadioGroup>
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  )}
                </>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={handleClose}>
              Cancelar
            </Button>
            <Button
              color="primary"
              isDisabled={!produtoNovo}
              isLoading={loading}
              startContent={<RefreshCw className="w-4 h-4" />}
              onPress={realizarTroca}
            >
              Realizar Troca
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Seleção de Quantidade */}
      <Modal
        isOpen={showQuantidadeModal}
        size="sm"
        onClose={cancelarSelecaoProduto}
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              <span>Quantidade do Produto</span>
            </div>
          </ModalHeader>
          <ModalBody>
            {produtoSelecionadoTemp && (
              <div className="space-y-4">
                {/* Informações do produto */}
                <div className="flex gap-3 p-3 bg-default-100 rounded-lg">
                  {produtoSelecionadoTemp.imagem_url ? (
                    <div className="w-16 h-16 rounded overflow-hidden bg-default-200 flex-shrink-0">
                      <img
                        alt={produtoSelecionadoTemp.descricao}
                        className="w-full h-full object-cover"
                        src={produtoSelecionadoTemp.imagem_url}
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded bg-default-200 flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-default-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-sm line-clamp-2">
                      {produtoSelecionadoTemp.descricao}
                    </p>
                    <p className="text-sm text-success font-bold">
                      {formatarMoeda(produtoSelecionadoTemp.preco_venda)}
                    </p>
                    <Chip color="default" size="sm" variant="flat">
                      Estoque: {produtoSelecionadoTemp.quantidade_disponivel} un
                    </Chip>
                  </div>
                </div>

                {/* Input de quantidade */}
                <div className="space-y-2">
                  <label
                    className="text-sm font-semibold"
                    htmlFor="trocar-produto-quantidade"
                  >
                    Selecione a quantidade:
                  </label>
                  <Input
                    description={`Máximo: ${produtoSelecionadoTemp.quantidade_disponivel} unidades`}
                    id="trocar-produto-quantidade"
                    max={produtoSelecionadoTemp.quantidade_disponivel}
                    min="1"
                    size="lg"
                    type="number"
                    value={quantidadeTempNovo}
                    variant="bordered"
                    onValueChange={setQuantidadeTempNovo}
                  />
                </div>

                {/* Total */}
                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Total:</span>
                    <p className="text-xl font-bold text-primary">
                      {formatarMoeda(
                        produtoSelecionadoTemp.preco_venda *
                          parseInt(quantidadeTempNovo || "0"),
                      )}
                    </p>
                  </div>
                  <p className="text-xs text-default-500 mt-1">
                    {quantidadeTempNovo} ×{" "}
                    {formatarMoeda(produtoSelecionadoTemp.preco_venda)}
                  </p>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={cancelarSelecaoProduto}>
              Cancelar
            </Button>
            <Button
              color="primary"
              isDisabled={
                !quantidadeTempNovo ||
                parseInt(quantidadeTempNovo) <= 0 ||
                parseInt(quantidadeTempNovo) >
                  (produtoSelecionadoTemp?.quantidade_disponivel || 0)
              }
              onPress={confirmarSelecaoProduto}
            >
              Confirmar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
