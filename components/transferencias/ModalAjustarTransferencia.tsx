"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface ItemAnalise {
  item_id: string;
  produto_id: string;
  produto_descricao: string;
  quantidade_solicitada: number;
  estoque_atual: number;
  saldo_disponivel: number;
  tem_problema: boolean;
  transferencias_conflitantes: Array<{
    id: string;
    de_para: string;
    quantidade: number;
    confirmado_por: string;
    confirmado_em: string;
  }>;
}

interface Props {
  isOpen: boolean;
  transferencia: { loja_origem: string; loja_destino: string } | null;
  itens: ItemAnalise[];
  processando: boolean;
  onClose: () => void;
  onConfirmar: (ajustes: Array<{ item_id: string; nova_quantidade: number }>) => void;
}

export function ModalAjustarTransferencia({
  isOpen,
  transferencia,
  itens,
  processando,
  onClose,
  onConfirmar,
}: Props) {
  const [ajustes, setAjustes] = useState<Record<string, number>>({});

  const getQuantidade = (item: ItemAnalise) => {
    if (item.tem_problema) {
      return ajustes[item.item_id] ?? Math.min(item.estoque_atual, item.quantidade_solicitada);
    }
    return item.quantidade_solicitada;
  };

  const itensComAjuste = itens.filter(
    (i) => getQuantidade(i) !== i.quantidade_solicitada,
  );

  const handleConfirmar = () => {
    const ajustesList = itens
      .filter((i) => i.tem_problema)
      .map((i) => ({
        item_id: i.item_id,
        nova_quantidade: getQuantidade(i),
      }));
    onConfirmar(ajustesList);
  };

  const hasError = itens.some(
    (i) => i.tem_problema && getQuantidade(i) > i.estoque_atual,
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      hideCloseButton={processando}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-warning">
            <ExclamationTriangleIcon className="w-6 h-6" />
            <span className="text-lg font-bold">
              Ajustar Quantidades da Transferência
            </span>
          </div>
          {transferencia && (
            <p className="text-sm text-default-500 font-normal">
              {transferencia.loja_origem} <ArrowRightIcon className="w-3 h-3 inline" /> {transferencia.loja_destino}
            </p>
          )}
        </ModalHeader>
        <ModalBody>
          {itens
            .filter((i) => i.tem_problema)
            .map((item) => (
              <div
                key={item.item_id}
                className="border border-danger/30 bg-danger/5 rounded-lg p-4 mb-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">
                      {item.produto_descricao}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-default-500">
                      <span>
                        Solicitado:{" "}
                        <strong className="text-default-700">
                          {item.quantidade_solicitada}
                        </strong>
                      </span>
                      <span>
                        Disponível:{" "}
                        <strong className="text-danger">
                          {item.estoque_atual}
                        </strong>
                      </span>
                    </div>
                  </div>
                  <div className="w-24">
                    <Input
                      size="sm"
                      type="number"
                      label="Nova qtd"
                      min={0}
                      max={item.estoque_atual}
                      value={String(getQuantidade(item))}
                      onValueChange={(v) =>
                        setAjustes((prev) => ({
                          ...prev,
                          [item.item_id]: Number(v),
                        }))
                      }
                    />
                  </div>
                </div>

                {item.transferencias_conflitantes.length > 0 && (
                  <>
                    <Divider className="my-2" />
                    <p className="text-xs text-default-500 mb-1 flex items-center gap-1">
                      <InformationCircleIcon className="w-3 h-3" />
                      Transferências que consumiram este estoque:
                    </p>
                    {item.transferencias_conflitantes.map((tc) => (
                      <div
                        key={tc.id}
                        className="flex items-center gap-2 text-xs bg-default-100 rounded px-2 py-1 mb-1"
                      >
                        <CheckCircleIcon className="w-3 h-3 text-success shrink-0" />
                        <span className="text-default-600">
                          {tc.de_para}
                        </span>
                        <Chip size="sm" variant="flat" color="warning">
                          {tc.quantidade} un
                        </Chip>
                        <span className="text-default-400 ml-auto">
                          {tc.confirmado_por}, {tc.confirmado_em}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            ))}

          {itens.filter((i) => !i.tem_problema).length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-success font-semibold mb-2 flex items-center gap-1">
                <CheckCircleIcon className="w-3 h-3" />
                Itens com estoque suficiente ({itens.filter((i) => !i.tem_problema).length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {itens
                  .filter((i) => !i.tem_problema)
                  .map((item) => (
                    <Chip
                      key={item.item_id}
                      size="sm"
                      variant="flat"
                      color="success"
                    >
                      {item.produto_descricao} ({item.quantidade_solicitada} un)
                    </Chip>
                  ))}
              </div>
            </div>
          )}

          {itensComAjuste.length > 0 && (
            <p className="text-xs text-warning mt-3">
              ⚠ {itensComAjuste.length} item(ns) terão a quantidade ajustada.
            </p>
          )}

          {hasError && (
            <p className="text-xs text-danger mt-1">
              Corrija os valores acima — nenhum item pode exceder o estoque disponível.
            </p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            variant="light"
            onPress={onClose}
            isDisabled={processando}
          >
            Cancelar Transferência
          </Button>
          <Button
            color="primary"
            onPress={handleConfirmar}
            isLoading={processando}
            isDisabled={hasError}
          >
            {itensComAjuste.length > 0
              ? "Confirmar com Ajustes"
              : "Confirmar Transferência"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
