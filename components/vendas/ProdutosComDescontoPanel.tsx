"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Divider,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
} from "@heroui/react";
import { Package, Percent, DollarSign, Edit2 } from "lucide-react";
import { usePermissoes } from "@/hooks/usePermissoes";
import { useToast } from "@/components/Toast";
import type { ItemCarrinho } from "@/types/vendas";

interface ProdutosComDescontoPanelProps {
  itens: ItemCarrinho[];
  onAplicarDesconto: (
    produtoId: string,
    tipo: "valor" | "porcentagem",
    valor: number
  ) => void;
}

export function ProdutosComDescontoPanel({
  itens,
  onAplicarDesconto,
}: ProdutosComDescontoPanelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<string | null>(
    null
  );
  const [tipoDesconto, setTipoDesconto] = useState<"valor" | "porcentagem">(
    "valor"
  );
  const [valorDesconto, setValorDesconto] = useState("");
  const [descontoMaximo, setDescontoMaximo] = useState<number>(100);
  const { temPermissao, getDescontoMaximo } = usePermissoes();
  const toast = useToast();

  // Carregar desconto máximo permitido
  useEffect(() => {
    const carregarDescontoMaximo = async () => {
      if (temPermissao("vendas.aplicar_desconto")) {
        const max = await getDescontoMaximo();
        setDescontoMaximo(max);
      }
    };

    if (modalOpen) {
      carregarDescontoMaximo();
    }
  }, [modalOpen, temPermissao, getDescontoMaximo]);

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleValorChange = (novoValor: string) => {
    // Permitir string vazia
    if (novoValor === "") {
      setValorDesconto("");
      return;
    }

    const valorNumerico = parseFloat(novoValor);

    // Se não for número válido, ignorar
    if (isNaN(valorNumerico)) {
      return;
    }

    const item = itens.find((i) => i.produto_id === produtoSelecionado);
    if (!item) {
      setValorDesconto(novoValor);
      return;
    }

    // Limitar a 2 casas decimais
    const valorFormatado = Math.round(valorNumerico * 100) / 100;

    // Se for percentual, limitar ao desconto máximo
    if (tipoDesconto === "porcentagem" && valorFormatado > descontoMaximo) {
      setValorDesconto(descontoMaximo.toString());
      return;
    }

    // Se for valor fixo, verificar se não excede o subtotal E se respeita o limite percentual
    if (tipoDesconto === "valor") {
      // Calcular o percentual equivalente e valor máximo permitido
      const percentualEquivalente = (valorFormatado / item.subtotal) * 100;
      const valorMaximoPermitido = (item.subtotal * descontoMaximo) / 100;

      // Limitar ao menor valor entre: limite percentual ou subtotal do item
      const valorLimite = Math.min(valorMaximoPermitido, item.subtotal);

      if (valorFormatado > valorLimite) {
        setValorDesconto(valorLimite.toFixed(2));
        return;
      }
    }

    // Garantir no máximo 2 casas decimais
    if (novoValor.includes(".")) {
      const partes = novoValor.split(".");
      if (partes[1] && partes[1].length > 2) {
        setValorDesconto(valorFormatado.toFixed(2));
        return;
      }
    }

    setValorDesconto(novoValor);
  };

  const handleAbrirModal = (produtoId: string) => {
    setProdutoSelecionado(produtoId);
    setTipoDesconto("valor");
    setValorDesconto("");
    setModalOpen(true);
  };

  const handleAplicarDesconto = () => {
    if (!produtoSelecionado || !valorDesconto) return;

    // Verificar permissão
    if (!temPermissao("vendas.aplicar_desconto")) {
      toast.error("Você não tem permissão para aplicar descontos");
      return;
    }

    const valor = parseFloat(valorDesconto);
    if (valor <= 0) {
      toast.error("Informe um valor válido");
      return;
    }

    const item = itens.find((i) => i.produto_id === produtoSelecionado);
    if (!item) return;

    // Validar desconto máximo
    if (tipoDesconto === "porcentagem") {
      if (valor > 100) {
        toast.error("Percentual não pode ser maior que 100%");
        return;
      }

      if (valor > descontoMaximo) {
        toast.error(`Seu desconto máximo permitido é ${descontoMaximo}%`);
        return;
      }
    } else {
      // Para desconto em valor, calcular percentual equivalente
      const percentualEquivalente = (valor / item.subtotal) * 100;
      if (percentualEquivalente > descontoMaximo) {
        const valorMaximoPermitido = (item.subtotal * descontoMaximo) / 100;
        toast.error(
          `Desconto máximo permitido: ${descontoMaximo}% (${formatarMoeda(valorMaximoPermitido)})`
        );
        return;
      }

      // Validar se desconto não é maior que subtotal
      if (valor > item.subtotal) {
        toast.error("Desconto não pode ser maior que o valor do item");
        return;
      }
    }

    onAplicarDesconto(produtoSelecionado, tipoDesconto, valor);
    setModalOpen(false);
    setValorDesconto("");
  };

  const calcularDescontoItem = (item: ItemCarrinho) => {
    if (!item.desconto) return 0;
    if (item.desconto.tipo === "valor") {
      return item.desconto.valor;
    }
    return (item.subtotal * item.desconto.valor) / 100;
  };

  const calcularSubtotalComDesconto = (item: ItemCarrinho) => {
    return item.subtotal - calcularDescontoItem(item);
  };

  const itemSelecionado = itens.find(
    (i) => i.produto_id === produtoSelecionado
  );

  return (
    <>
      <Card>
        <CardHeader className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Produtos da Venda</h3>
        </CardHeader>

        <Divider />

        <CardBody className="space-y-2">
          {itens.map((item) => {
            const descontoAplicado = calcularDescontoItem(item);
            const subtotalFinal = calcularSubtotalComDesconto(item);

            return (
              <div
                key={item.produto_id}
                className="flex items-center justify-between p-3 bg-default-100 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-semibold">{item.produto_nome}</p>
                  <p className="text-sm text-gray-600">
                    {item.quantidade}x {formatarMoeda(item.preco_unitario)} ={" "}
                    {formatarMoeda(item.subtotal)}
                  </p>
                  {descontoAplicado > 0 && (
                    <div className="mt-1 flex items-center gap-2">
                      <Chip size="sm" color="warning" variant="flat">
                        Desconto: {formatarMoeda(descontoAplicado)}
                      </Chip>
                      <span className="text-sm font-semibold text-success">
                        Total: {formatarMoeda(subtotalFinal)}
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  startContent={
                    descontoAplicado > 0 ? (
                      <Edit2 className="w-4 h-4" />
                    ) : (
                      <Percent className="w-4 h-4" />
                    )
                  }
                  onClick={() => handleAbrirModal(item.produto_id)}
                >
                  {descontoAplicado > 0 ? "Editar" : "Desconto"}
                </Button>
              </div>
            );
          })}
        </CardBody>
      </Card>

      {/* Modal de Desconto */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Aplicar Desconto no Produto</ModalHeader>
          <ModalBody className="space-y-4">
            {itemSelecionado && (
              <div className="bg-default-100 p-3 rounded-lg">
                <p className="font-semibold">{itemSelecionado.produto_nome}</p>
                <p className="text-sm text-default-500">
                  Subtotal: {formatarMoeda(itemSelecionado.subtotal)}
                </p>
              </div>
            )}

            {/* Mensagem de desconto máximo */}
            {descontoMaximo < 100 && (
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                <p className="text-sm text-warning-700">
                  <strong>Desconto máximo permitido:</strong> {descontoMaximo}%
                </p>
              </div>
            )}

            <Select
              label="Tipo de Desconto"
              selectedKeys={[tipoDesconto]}
              onChange={(e) =>
                setTipoDesconto(e.target.value as "valor" | "porcentagem")
              }
            >
              <SelectItem key="valor">Valor (R$)</SelectItem>
              <SelectItem key="porcentagem">Porcentagem (%)</SelectItem>
            </Select>

            <Input
              label={`Valor do Desconto${tipoDesconto === "porcentagem" ? " (%)" : ""}`}
              type="number"
              step="0.01"
              min="0"
              max={
                tipoDesconto === "porcentagem"
                  ? descontoMaximo
                  : itemSelecionado?.subtotal
              }
              value={valorDesconto}
              onChange={(e) => handleValorChange(e.target.value)}
              startContent={
                tipoDesconto === "valor" ? (
                  <DollarSign className="w-4 h-4 text-gray-500" />
                ) : (
                  <Percent className="w-4 h-4 text-gray-500" />
                )
              }
              description={
                tipoDesconto === "porcentagem"
                  ? `Digite o percentual de desconto (máx: ${descontoMaximo}%)`
                  : "Digite o valor fixo do desconto"
              }
            />

            {itemSelecionado && valorDesconto && (
              <div className="bg-success-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Novo Subtotal:</p>
                <p className="text-xl font-bold text-success">
                  {formatarMoeda(
                    itemSelecionado.subtotal -
                      (tipoDesconto === "valor"
                        ? parseFloat(valorDesconto)
                        : (itemSelecionado.subtotal *
                            parseFloat(valorDesconto)) /
                          100)
                  )}
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              color="primary"
              onPress={handleAplicarDesconto}
              isDisabled={!valorDesconto || parseFloat(valorDesconto) <= 0}
            >
              Aplicar Desconto
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
