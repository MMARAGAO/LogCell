"use client";

import type { ItemCarrinho } from "@/types/vendas";

import { useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
} from "@heroui/react";
import { Trash2, Minus, Plus, X, Edit2 } from "lucide-react";

interface CarrinhoVendaProps {
  itens: ItemCarrinho[];
  onRemoverItem: (produtoId: string) => void;
  onAtualizarQuantidade: (produtoId: string, quantidade: number) => void;
  onAtualizarPreco?: (produtoId: string, novoPreco: number) => void;
  valorTotal: number;
  valorDesconto: number;
  onRemoverDescontoItem?: (produtoId: string) => void;
  onRemoverDescontoGeral?: () => void;
}

export function CarrinhoVenda({
  itens,
  onRemoverItem,
  onAtualizarQuantidade,
  onAtualizarPreco,
  valorTotal,
  valorDesconto,
  onRemoverDescontoItem,
  onRemoverDescontoGeral,
}: CarrinhoVendaProps) {
  const [quantidadesEditando, setQuantidadesEditando] = useState<
    Record<string, number>
  >({});
  const [precosEditando, setPrecosEditando] = useState<Record<string, number>>(
    {},
  );

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
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

  const handleQuantidadeChange = (produtoId: string, valor: string) => {
    const quantidade = parseInt(valor) || 0;

    setQuantidadesEditando({
      ...quantidadesEditando,
      [produtoId]: quantidade,
    });
  };

  const handlePrecoChange = (produtoId: string, valor: string) => {
    const preco = parseFloat(valor) || 0;

    setPrecosEditando({
      ...precosEditando,
      [produtoId]: preco,
    });
  };

  const handleConfirmarQuantidade = (produtoId: string) => {
    const quantidade = quantidadesEditando[produtoId];

    if (quantidade && quantidade > 0) {
      onAtualizarQuantidade(produtoId, quantidade);
    }
    const { [produtoId]: _, ...resto } = quantidadesEditando;

    setQuantidadesEditando(resto);
  };

  const handleConfirmarPreco = (produtoId: string) => {
    const preco = precosEditando[produtoId];

    if (preco && preco > 0 && onAtualizarPreco) {
      onAtualizarPreco(produtoId, preco);
    }
    const { [produtoId]: _, ...resto } = precosEditando;

    setPrecosEditando(resto);
  };

  const incrementarQuantidade = (item: ItemCarrinho) => {
    onAtualizarQuantidade(item.produto_id, item.quantidade + 1);
  };

  const decrementarQuantidade = (item: ItemCarrinho) => {
    if (item.quantidade > 1) {
      onAtualizarQuantidade(item.produto_id, item.quantidade - 1);
    }
  };

  if (itens.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum item no carrinho</p>
            <p className="text-sm mt-2">
              Adicione produtos para iniciar a venda
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="p-0">
        <Table removeWrapper aria-label="Carrinho de vendas">
          <TableHeader>
            <TableColumn>PRODUTO</TableColumn>
            <TableColumn>PREÇO UNIT.</TableColumn>
            <TableColumn>QUANTIDADE</TableColumn>
            <TableColumn>SUBTOTAL</TableColumn>
            <TableColumn> </TableColumn>
          </TableHeader>
          <TableBody>
            {itens.map((item) => {
              const editandoQuantidade =
                quantidadesEditando[item.produto_id] !== undefined;
              const editandoPreco =
                precosEditando[item.produto_id] !== undefined;

              return (
                <TableRow key={item.produto_id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.produto_nome}</p>
                      <p className="text-xs text-gray-500">
                        Cód: {item.produto_codigo}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {editandoPreco ? (
                      <div className="flex items-center gap-2">
                        <Input
                          className="w-28"
                          min="0.01"
                          size="sm"
                          startContent={
                            <span className="text-default-400 text-sm">R$</span>
                          }
                          step="0.01"
                          type="number"
                          value={precosEditando[item.produto_id].toString()}
                          onChange={(e) =>
                            handlePrecoChange(item.produto_id, e.target.value)
                          }
                        />
                        <Button
                          color="primary"
                          size="sm"
                          onClick={() => handleConfirmarPreco(item.produto_id)}
                        >
                          OK
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          onClick={() => {
                            const { [item.produto_id]: _, ...resto } =
                              precosEditando;

                            setPrecosEditando(resto);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{formatarMoeda(item.preco_unitario)}</span>
                        {onAtualizarPreco && (
                          <Button
                            isIconOnly
                            size="sm"
                            title="Editar preço"
                            variant="flat"
                            onClick={() =>
                              setPrecosEditando({
                                ...precosEditando,
                                [item.produto_id]: item.preco_unitario,
                              })
                            }
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editandoQuantidade ? (
                      <div className="flex items-center gap-2">
                        <Input
                          className="w-20"
                          min="1"
                          size="sm"
                          type="number"
                          value={quantidadesEditando[
                            item.produto_id
                          ].toString()}
                          onChange={(e) =>
                            handleQuantidadeChange(
                              item.produto_id,
                              e.target.value,
                            )
                          }
                        />
                        <Button
                          color="primary"
                          size="sm"
                          onClick={() =>
                            handleConfirmarQuantidade(item.produto_id)
                          }
                        >
                          OK
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="flat"
                          onClick={() => decrementarQuantidade(item)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <button
                          className="min-w-[40px] text-center cursor-pointer hover:text-primary"
                          type="button"
                          onClick={() =>
                            setQuantidadesEditando({
                              ...quantidadesEditando,
                              [item.produto_id]: item.quantidade,
                            })
                          }
                        >
                          {item.quantidade}
                        </button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="flat"
                          onClick={() => incrementarQuantidade(item)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-semibold">
                        {formatarMoeda(calcularSubtotalComDesconto(item))}
                      </span>
                      {item.desconto && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-success-50 rounded">
                          <span className="text-xs text-success-700">
                            Desc:{" "}
                            {item.desconto.tipo === "percentual"
                              ? `${item.desconto.valor}%`
                              : formatarMoeda(item.desconto.valor)}
                          </span>
                          {onRemoverDescontoItem && (
                            <Button
                              isIconOnly
                              className="h-5 w-5 min-w-5"
                              color="danger"
                              size="sm"
                              variant="light"
                              onClick={() =>
                                onRemoverDescontoItem(item.produto_id)
                              }
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      isIconOnly
                      color="danger"
                      size="sm"
                      variant="light"
                      onClick={() => onRemoverItem(item.produto_id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="p-4 border-t">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{formatarMoeda(valorTotal + valorDesconto)}</span>
            </div>
            {valorDesconto > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-success">Desconto Geral:</span>
                <div className="flex items-center gap-2">
                  <span className="text-success">
                    - {formatarMoeda(valorDesconto)}
                  </span>
                  {onRemoverDescontoGeral && (
                    <Button
                      isIconOnly
                      className="h-6 w-6 min-w-6"
                      color="danger"
                      size="sm"
                      variant="flat"
                      onClick={onRemoverDescontoGeral}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span>{formatarMoeda(valorTotal)}</span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
