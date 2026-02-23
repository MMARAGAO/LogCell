"use client";

import type { ItemCarrinho } from "@/types/vendas";

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
} from "@heroui/react";
import {
  Package,
  Percent,
  DollarSign,
  Edit2,
  TrendingDown,
  TrendingUp,
  Calculator,
  Info,
} from "lucide-react";

import { usePermissoes } from "@/hooks/usePermissoes";
import { useToast } from "@/components/Toast";

interface ProdutosComDescontoPanelProps {
  itens: ItemCarrinho[];
  onAplicarDesconto: (
    produtoId: string,
    tipo: "valor" | "percentual",
    valor: number,
  ) => void;
}

export function ProdutosComDescontoPanel({
  itens,
  onAplicarDesconto,
}: ProdutosComDescontoPanelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<string | null>(
    null,
  );
  const [tipoAjuste, setTipoAjuste] = useState<"desconto" | "acrescimo">(
    "desconto",
  );
  const [tipoDesconto, setTipoDesconto] = useState<"valor" | "percentual">(
    "valor",
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
    if (tipoDesconto === "percentual" && valorFormatado > descontoMaximo) {
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
    setTipoAjuste("desconto");
    setTipoDesconto("valor");
    setValorDesconto("");
    setModalOpen(true);
  };

  const handleAplicarDesconto = () => {
    if (!produtoSelecionado || !valorDesconto) return;

    // Verificar permissão
    if (!temPermissao("vendas.aplicar_desconto")) {
      toast.error("Você não tem permissão para aplicar descontos/acréscimos");

      return;
    }

    const valor = parseFloat(valorDesconto);

    if (valor <= 0) {
      toast.error("Informe um valor válido");

      return;
    }

    const item = itens.find((i) => i.produto_id === produtoSelecionado);

    if (!item) return;

    // Se for acréscimo, converter para valor negativo (internamente)
    const valorFinal = tipoAjuste === "acrescimo" ? -valor : valor;

    // Validar apenas se for desconto
    if (tipoAjuste === "desconto") {
      if (tipoDesconto === "percentual") {
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
            `Desconto máximo permitido: ${descontoMaximo}% (${formatarMoeda(valorMaximoPermitido)})`,
          );

          return;
        }

        // Validar se desconto não é maior que subtotal
        if (valor > item.subtotal) {
          toast.error("Desconto não pode ser maior que o valor do item");

          return;
        }
      }
    }

    onAplicarDesconto(produtoSelecionado, tipoDesconto, valorFinal);
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
    (i) => i.produto_id === produtoSelecionado,
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
            const temAjuste = item.desconto && item.desconto.valor !== 0;
            const isAcrescimo = descontoAplicado < 0;

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
                  {temAjuste && (
                    <div className="mt-1 flex items-center gap-2">
                      <Chip
                        color={isAcrescimo ? "primary" : "warning"}
                        size="sm"
                        variant="flat"
                      >
                        {isAcrescimo ? "Acréscimo" : "Desconto"}:{" "}
                        {formatarMoeda(Math.abs(descontoAplicado))}
                      </Chip>
                      <span
                        className={`text-sm font-semibold ${isAcrescimo ? "text-primary" : "text-success"}`}
                      >
                        Total: {formatarMoeda(subtotalFinal)}
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  color="primary"
                  size="sm"
                  startContent={
                    temAjuste ? (
                      <Edit2 className="w-4 h-4" />
                    ) : (
                      <Percent className="w-4 h-4" />
                    )
                  }
                  variant="flat"
                  onClick={() => handleAbrirModal(item.produto_id)}
                >
                  {temAjuste ? "Editar" : "Ajustar"}
                </Button>
              </div>
            );
          })}
        </CardBody>
      </Card>

      {/* Modal de Desconto/Acréscimo */}
      <Modal isOpen={modalOpen} size="2xl" onClose={() => setModalOpen(false)}>
        <ModalContent>
          <ModalHeader className="flex items-center gap-2 pb-2">
            <Calculator className="w-5 h-5 text-primary" />
            <span>Ajuste de Valor do Produto</span>
          </ModalHeader>
          <ModalBody className="space-y-5 py-6">
            {/* Informações do Produto */}
            {itemSelecionado && (
              <Card className="bg-gradient-to-br from-default-100 to-default-50">
                <CardBody className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">
                        {itemSelecionado.produto_nome}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-default-600">
                        <span>Qtd: {itemSelecionado.quantidade}</span>
                        <span>•</span>
                        <span>
                          Unit: {formatarMoeda(itemSelecionado.preco_unitario)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-default-500">Subtotal Atual</p>
                      <p className="text-2xl font-bold text-default-900">
                        {formatarMoeda(itemSelecionado.subtotal)}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            <Divider />

            {/* Seleção do Tipo de Ajuste */}
            <div className="grid grid-cols-2 gap-3">
              <Card
                isHoverable
                isPressable
                className={`cursor-pointer transition-all ${
                  tipoAjuste === "desconto"
                    ? "border-2 border-success bg-success-50/50"
                    : "border border-default-200"
                }`}
                onPress={() => setTipoAjuste("desconto")}
              >
                <CardBody className="p-4 text-center">
                  <TrendingDown
                    className={`w-8 h-8 mx-auto mb-2 ${
                      tipoAjuste === "desconto"
                        ? "text-success"
                        : "text-default-400"
                    }`}
                  />
                  <p className="font-semibold">Desconto</p>
                  <p className="text-xs text-default-500 mt-1">Reduzir valor</p>
                </CardBody>
              </Card>

              <Card
                isHoverable
                isPressable
                className={`cursor-pointer transition-all ${
                  tipoAjuste === "acrescimo"
                    ? "border-2 border-primary bg-primary-50/50"
                    : "border border-default-200"
                }`}
                onPress={() => setTipoAjuste("acrescimo")}
              >
                <CardBody className="p-4 text-center">
                  <TrendingUp
                    className={`w-8 h-8 mx-auto mb-2 ${
                      tipoAjuste === "acrescimo"
                        ? "text-primary"
                        : "text-default-400"
                    }`}
                  />
                  <p className="font-semibold">Acréscimo</p>
                  <p className="text-xs text-default-500 mt-1">
                    Aumentar valor
                  </p>
                </CardBody>
              </Card>
            </div>

            {/* Mensagem de desconto máximo (apenas para desconto) */}
            {tipoAjuste === "desconto" && descontoMaximo < 100 && (
              <div className="flex items-start gap-3 bg-warning-50 border border-warning-200 rounded-lg p-3">
                <Info className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-warning-700">
                    Limite de Desconto
                  </p>
                  <p className="text-xs text-warning-600 mt-1">
                    Seu perfil permite aplicar até{" "}
                    <strong>{descontoMaximo}%</strong> de desconto neste item.
                  </p>
                </div>
              </div>
            )}

            {/* Tipo de Cálculo */}
            <div className="grid grid-cols-2 gap-3">
              <Card
                isHoverable
                isPressable
                className={`cursor-pointer transition-all ${
                  tipoDesconto === "valor"
                    ? "border-2 border-default-900 bg-default-100"
                    : "border border-default-200"
                }`}
                onPress={() => setTipoDesconto("valor")}
              >
                <CardBody className="p-3 text-center">
                  <DollarSign
                    className={`w-6 h-6 mx-auto mb-1 ${
                      tipoDesconto === "valor"
                        ? "text-default-900"
                        : "text-default-400"
                    }`}
                  />
                  <p className="text-sm font-semibold">Valor Fixo</p>
                  <p className="text-xs text-default-500">Em reais (R$)</p>
                </CardBody>
              </Card>

              <Card
                isHoverable
                isPressable
                className={`cursor-pointer transition-all ${
                  tipoDesconto === "percentual"
                    ? "border-2 border-default-900 bg-default-100"
                    : "border border-default-200"
                }`}
                onPress={() => setTipoDesconto("percentual")}
              >
                <CardBody className="p-3 text-center">
                  <Percent
                    className={`w-6 h-6 mx-auto mb-1 ${
                      tipoDesconto === "percentual"
                        ? "text-default-900"
                        : "text-default-400"
                    }`}
                  />
                  <p className="text-sm font-semibold">Percentual</p>
                  <p className="text-xs text-default-500">Em porcentagem (%)</p>
                </CardBody>
              </Card>
            </div>

            {/* Input de Valor */}
            <Input
              classNames={{
                input: "text-lg font-semibold",
                inputWrapper:
                  tipoAjuste === "desconto"
                    ? "border-success-300 data-[hover=true]:border-success-400"
                    : "border-primary-300 data-[hover=true]:border-primary-400",
              }}
              endContent={
                tipoDesconto === "percentual" && (
                  <span className="text-default-400 text-sm">%</span>
                )
              }
              label={`Informe o ${tipoAjuste === "desconto" ? "desconto" : "acréscimo"}`}
              max={
                tipoAjuste === "desconto" && tipoDesconto === "percentual"
                  ? descontoMaximo
                  : tipoAjuste === "desconto" && tipoDesconto === "valor"
                    ? itemSelecionado?.subtotal
                    : undefined
              }
              min="0"
              placeholder={
                tipoDesconto === "percentual" ? "Ex: 10" : "Ex: 50.00"
              }
              size="lg"
              startContent={
                tipoDesconto === "valor" ? (
                  <div className="flex items-center">
                    <span className="text-default-500 font-semibold">R$</span>
                  </div>
                ) : (
                  <Percent className="w-4 h-4 text-default-500" />
                )
              }
              step="0.01"
              type="number"
              value={valorDesconto}
              variant="bordered"
              onChange={(e) => handleValorChange(e.target.value)}
            />

            {/* Preview do Resultado */}
            {itemSelecionado &&
              valorDesconto &&
              parseFloat(valorDesconto) > 0 && (
                <Card
                  className={`${
                    tipoAjuste === "desconto"
                      ? "bg-gradient-to-br from-success-50 to-success-100/50 border-2 border-success-200"
                      : "bg-gradient-to-br from-primary-50 to-primary-100/50 border-2 border-primary-200"
                  }`}
                >
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-default-600 font-medium">
                          {tipoAjuste === "desconto"
                            ? "Valor do Desconto"
                            : "Valor do Acréscimo"}
                        </p>
                        <p
                          className={`text-lg font-bold ${
                            tipoAjuste === "desconto"
                              ? "text-success-700"
                              : "text-primary-700"
                          }`}
                        >
                          {tipoAjuste === "desconto" ? "- " : "+ "}
                          {formatarMoeda(
                            tipoDesconto === "valor"
                              ? parseFloat(valorDesconto)
                              : (itemSelecionado.subtotal *
                                  parseFloat(valorDesconto)) /
                                  100,
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-default-600 font-medium">
                          Novo Subtotal
                        </p>
                        <p
                          className={`text-2xl font-bold ${
                            tipoAjuste === "desconto"
                              ? "text-success-700"
                              : "text-primary-700"
                          }`}
                        >
                          {formatarMoeda(
                            itemSelecionado.subtotal +
                              (tipoAjuste === "acrescimo" ? 1 : -1) *
                                (tipoDesconto === "valor"
                                  ? parseFloat(valorDesconto)
                                  : (itemSelecionado.subtotal *
                                      parseFloat(valorDesconto)) /
                                    100),
                          )}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}
          </ModalBody>
          <ModalFooter className="gap-2">
            <Button
              size="lg"
              variant="light"
              onPress={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="font-semibold"
              color={tipoAjuste === "desconto" ? "success" : "primary"}
              isDisabled={!valorDesconto || parseFloat(valorDesconto) <= 0}
              size="lg"
              startContent={
                tipoAjuste === "desconto" ? (
                  <TrendingDown className="w-5 h-5" />
                ) : (
                  <TrendingUp className="w-5 h-5" />
                )
              }
              onPress={handleAplicarDesconto}
            >
              Confirmar {tipoAjuste === "desconto" ? "Desconto" : "Acréscimo"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
