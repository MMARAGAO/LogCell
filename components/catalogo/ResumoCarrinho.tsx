"use client";

import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Divider,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
} from "@heroui/react";
import {
  FaShoppingCart,
  FaTrash,
  FaMinus,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import { useCarrinho } from "@/contexts/CarrinhoContext";

interface ResumoCarrinhoProps {
  renderizar?: boolean;
}

export function ResumoCarrinho({ renderizar = true }: ResumoCarrinhoProps) {
  const {
    carrinho,
    removerItem,
    atualizarQuantidade,
    aplicarDesconto,
    limparCarrinho,
  } = useCarrinho();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [desconto, setDesconto] = React.useState("");

  const handleAplicarDesconto = () => {
    const descontoNum = parseFloat(desconto) || 0;
    if (descontoNum >= 0) {
      aplicarDesconto(descontoNum);
      setDesconto("");
    }
  };

  if (!renderizar || carrinho.itens.length === 0) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader className="flex gap-3 items-center">
          <FaShoppingCart />
          <div className="flex flex-col">
            <p className="text-lg font-semibold">Carrinho</p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="py-8">
          <div className="flex flex-col items-center justify-center space-y-3 py-8">
            <div className="text-4xl">🛒</div>
            <p className="text-center text-gray-500 dark:text-gray-400">
              Seu carrinho está vazio
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full max-w-sm sticky top-4">
        <CardHeader className="flex gap-3 items-center justify-between">
          <div className="flex gap-3 items-center">
            <FaShoppingCart />
            <div className="flex flex-col">
              <p className="text-lg font-semibold">Carrinho</p>
              <p className="text-sm text-gray-500">
                {carrinho.total_itens}{" "}
                {carrinho.total_itens === 1 ? "item" : "itens"}
              </p>
            </div>
          </div>
        </CardHeader>
        <Divider />

        <CardBody className="space-y-4 max-h-96 overflow-y-auto">
          {carrinho.itens.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 items-start border-b pb-3 last:border-b-0"
            >
              {/* Imagem do produto (se houver) */}
              {item.foto_principal && (
                <img
                  alt={item.produto_nome}
                  className="w-12 h-12 rounded object-cover flex-shrink-0"
                  src={item.foto_principal}
                />
              )}

              {/* Informações do produto */}
              <div className="flex-grow min-w-0">
                <p className="text-sm font-semibold truncate">
                  {item.produto_nome}
                </p>
                <p className="text-xs text-gray-500">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(item.preco_unitario)}
                </p>
              </div>

              {/* Quantidade */}
              <div className="flex items-center gap-2">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onClick={() =>
                    atualizarQuantidade(item.produto_id, item.quantidade - 1)
                  }
                >
                  <FaMinus size={12} />
                </Button>
                <span className="w-6 text-center text-sm font-semibold">
                  {item.quantidade}
                </span>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onClick={() =>
                    atualizarQuantidade(item.produto_id, item.quantidade + 1)
                  }
                >
                  <FaPlus size={12} />
                </Button>
              </div>

              {/* Remover */}
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="text-red-500"
                onClick={() => removerItem(item.produto_id)}
              >
                <FaTrash size={14} />
              </Button>
            </div>
          ))}
        </CardBody>

        <Divider />

        {/* Resumo totais */}
        <CardBody className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span className="font-semibold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(carrinho.subtotal)}
            </span>
          </div>

          {carrinho.desconto > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Desconto:</span>
              <span className="font-semibold">
                -{" "}
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(carrinho.desconto)}
              </span>
            </div>
          )}

          <Divider />

          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-green-600">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(carrinho.total)}
            </span>
          </div>
        </CardBody>

        <Divider />

        {/* Botões de ação */}
        <CardBody className="gap-3 pt-0">
          <Button
            color="primary"
            startContent={<FaShoppingCart />}
            className="w-full"
            onClick={onOpen}
          >
            Finalizar Compra
          </Button>
          <Button
            variant="bordered"
            startContent={<FaTimes />}
            onClick={limparCarrinho}
            className="w-full"
          >
            Limpar Carrinho
          </Button>
        </CardBody>
      </Card>

      {/* Modal de Checkout */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Resumo do Pedido
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  {/* Itens */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3">
                      Itens do Pedido
                    </h4>
                    <Table aria-label="Itens do carrinho">
                      <TableHeader>
                        <TableColumn>Produto</TableColumn>
                        <TableColumn align="end">Qtd</TableColumn>
                        <TableColumn align="end">Preço</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {carrinho.itens.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <p className="text-sm">{item.produto_nome}</p>
                            </TableCell>
                            <TableCell className="text-end">
                              {item.quantidade}
                            </TableCell>
                            <TableCell className="text-end">
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(item.subtotal)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Desconto */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">
                      Aplicar Desconto (R$)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={desconto}
                        onValueChange={setDesconto}
                        startContent="R$"
                        size="sm"
                      />
                      <Button
                        size="sm"
                        onClick={handleAplicarDesconto}
                        className="px-6"
                      >
                        Aplicar
                      </Button>
                    </div>
                  </div>

                  {/* Totais */}
                  <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(carrinho.subtotal)}
                      </span>
                    </div>
                    {carrinho.desconto > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Desconto:</span>
                        <span>
                          -{" "}
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(carrinho.desconto)}
                        </span>
                      </div>
                    )}
                    <Divider />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-green-600">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(carrinho.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button color="primary" onPress={onClose}>
                  Confirmar Pedido
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
