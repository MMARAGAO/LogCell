"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Checkbox,
  Divider,
} from "@heroui/react";
import { RotateCcw } from "lucide-react";
import type { ItemVenda } from "@/types/vendas";

interface DevolucaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmar: (
    itens: Array<{ item_id: string; quantidade: number; motivo?: string }>,
    tipoCredito: "com_credito" | "sem_credito",
    motivoGeral: string
  ) => void;
  itensVenda: ItemVenda[];
}

export function DevolucaoModal({
  isOpen,
  onClose,
  onConfirmar,
  itensVenda,
}: DevolucaoModalProps) {
  const [itensSelecionados, setItensSelecionados] = useState<
    Record<string, { selecionado: boolean; quantidade: number; motivo: string }>
  >({});
  const [tipoCredito, setTipoCredito] = useState<"com_credito" | "sem_credito">(
    "sem_credito"
  );
  const [motivoGeral, setMotivoGeral] = useState("");

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleToggleItem = (itemId: string) => {
    const item = itensVenda.find((i) => i.id === itemId);
    if (!item) return;

    const quantidadeDisponivel = item.quantidade - item.devolvido;

    setItensSelecionados((prev) => ({
      ...prev,
      [itemId]: prev[itemId]?.selecionado
        ? { ...prev[itemId], selecionado: false }
        : {
            selecionado: true,
            quantidade: quantidadeDisponivel,
            motivo: "",
          },
    }));
  };

  const handleQuantidadeChange = (itemId: string, valor: string) => {
    const quantidade = parseInt(valor) || 0;
    const item = itensVenda.find((i) => i.id === itemId);
    if (!item) return;

    const quantidadeDisponivel = item.quantidade - item.devolvido;
    const quantidadeFinal = Math.min(
      Math.max(1, quantidade),
      quantidadeDisponivel
    );

    setItensSelecionados((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        quantidade: quantidadeFinal,
      },
    }));
  };

  const handleMotivoChange = (itemId: string, motivo: string) => {
    setItensSelecionados((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        motivo,
      },
    }));
  };

  const calcularValorDevolucao = () => {
    let total = 0;
    for (const [itemId, dados] of Object.entries(itensSelecionados)) {
      if (!dados.selecionado) continue;

      const item = itensVenda.find((i) => i.id === itemId);
      if (!item) continue;

      total += item.preco_unitario * dados.quantidade;
    }
    return total;
  };

  const handleConfirmar = () => {
    const itens = Object.entries(itensSelecionados)
      .filter(([_, dados]) => dados.selecionado)
      .map(([itemId, dados]) => ({
        item_id: itemId,
        quantidade: dados.quantidade,
        motivo: dados.motivo,
      }));

    if (itens.length === 0) {
      alert("Selecione pelo menos um item para devolução");
      return;
    }

    if (!motivoGeral.trim()) {
      alert("Informe o motivo geral da devolução");
      return;
    }

    onConfirmar(itens, tipoCredito, motivoGeral);
    handleClose();
  };

  const handleClose = () => {
    setItensSelecionados({});
    setTipoCredito("sem_credito");
    setMotivoGeral("");
    onClose();
  };

  const valorDevolucao = calcularValorDevolucao();
  const itensSelecionadosCount = Object.values(itensSelecionados).filter(
    (d) => d.selecionado
  ).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-warning" />
            <span>Registrar Devolução</span>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            {/* Tipo de crédito */}
            <Select
              label="Tipo de Devolução"
              selectedKeys={[tipoCredito]}
              onChange={(e) =>
                setTipoCredito(e.target.value as "com_credito" | "sem_credito")
              }
              description="Com crédito: gera saldo para o cliente usar em compras futuras. Sem crédito: devolução simples."
            >
              <SelectItem key="sem_credito">
                Sem Crédito (Devolução Simples)
              </SelectItem>
              <SelectItem key="com_credito">
                Com Crédito (Gerar saldo para o cliente)
              </SelectItem>
            </Select>

            {/* Motivo geral */}
            <Textarea
              label="Motivo da Devolução"
              value={motivoGeral}
              onChange={(e) => setMotivoGeral(e.target.value)}
              placeholder="Descreva o motivo da devolução..."
              minRows={2}
            />

            <Divider />

            {/* Lista de itens */}
            <div className="space-y-3">
              <p className="text-sm font-semibold">
                Selecione os itens para devolução:
              </p>

              {itensVenda.map((item) => {
                const quantidadeDisponivel = item.quantidade - item.devolvido;
                const itemData = item.id
                  ? itensSelecionados[item.id]
                  : undefined;
                const selecionado = itemData?.selecionado || false;

                if (quantidadeDisponivel <= 0 || !item.id) return null;

                return (
                  <div
                    key={item.id}
                    className={`p-4 border rounded-lg ${
                      selecionado
                        ? "border-primary bg-primary-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        isSelected={selecionado}
                        onChange={() => item.id && handleToggleItem(item.id)}
                      />

                      <div className="flex-1 space-y-2">
                        <div>
                          <p className="font-medium">
                            {item.produto?.nome ||
                              item.produto_nome ||
                              "Produto"}
                          </p>
                          <div className="flex gap-4 text-sm text-gray-600 mt-1">
                            <span>
                              Preço: {formatarMoeda(item.preco_unitario)}
                            </span>
                            <span>
                              Disponível para devolução: {quantidadeDisponivel}
                            </span>
                          </div>
                        </div>

                        {selecionado && itemData && (
                          <div className="space-y-2 pt-2">
                            <Input
                              label="Quantidade a devolver"
                              type="number"
                              min="1"
                              max={quantidadeDisponivel}
                              value={itemData.quantidade.toString()}
                              onChange={(e) =>
                                item.id &&
                                handleQuantidadeChange(item.id, e.target.value)
                              }
                              size="sm"
                            />
                            <Input
                              label="Motivo específico (opcional)"
                              value={itemData.motivo}
                              onChange={(e) =>
                                item.id &&
                                handleMotivoChange(item.id, e.target.value)
                              }
                              placeholder="Ex: Produto com defeito, cor errada..."
                              size="sm"
                            />
                            <p className="text-sm text-gray-600">
                              Subtotal devolução:{" "}
                              <span className="font-semibold">
                                {formatarMoeda(
                                  item.preco_unitario * itemData.quantidade
                                )}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {itensSelecionadosCount > 0 && (
              <>
                <Divider />
                <div className="bg-default-100 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Itens selecionados:</span>
                    <span className="font-semibold">
                      {itensSelecionadosCount}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Valor Total da Devolução:</span>
                    <span className="text-warning">
                      {formatarMoeda(valorDevolucao)}
                    </span>
                  </div>
                  {tipoCredito === "com_credito" && (
                    <p className="text-sm text-primary mt-2">
                      ✓ O cliente receberá R$ {valorDevolucao.toFixed(2)} em
                      créditos
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            color="warning"
            onClick={handleConfirmar}
            isDisabled={itensSelecionadosCount === 0 || !motivoGeral.trim()}
          >
            Confirmar Devolução
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
