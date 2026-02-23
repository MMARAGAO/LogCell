import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { useState, useEffect } from "react";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Card, CardBody } from "@heroui/card";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";

import { useToast } from "@/components/Toast";

interface Loja {
  id: number;
  nome: string;
}

interface EstoqueLojaData {
  id_produto: string;
  produto_descricao: string;
  id_loja: number;
  loja_nome: string;
  quantidade: number;
}

interface EstoqueLojaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    id_loja: number;
    quantidade: number;
    observacao?: string;
  }) => Promise<void>;
  produtoId: string;
  produtoNome: string;
  lojas: Loja[];
  estoques: EstoqueLojaData[];
}

interface LojaEstoque {
  lojaId: number;
  lojaNome: string;
  quantidadeAtual: number;
  ajuste: number;
  novaQuantidade: number;
}

export default function EstoqueLojaModal({
  isOpen,
  onClose,
  onSubmit,
  produtoId,
  produtoNome,
  lojas,
  estoques,
}: EstoqueLojaModalProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [observacao, setObservacao] = useState("");
  const [lojasEstoque, setLojasEstoque] = useState<LojaEstoque[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Inicializar o estado com todas as lojas
      const inicial = lojas.map((loja) => {
        const estoqueAtual = estoques.find((e) => e.id_loja === loja.id);

        return {
          lojaId: loja.id,
          lojaNome: loja.nome,
          quantidadeAtual: estoqueAtual?.quantidade || 0,
          ajuste: 0,
          novaQuantidade: estoqueAtual?.quantidade || 0,
        };
      });

      setLojasEstoque(inicial);
      setObservacao("");
    }
  }, [isOpen, lojas, estoques]);

  const handleAjusteChange = (lojaId: number, valor: number) => {
    setLojasEstoque((prev) =>
      prev.map((loja) => {
        if (loja.lojaId === lojaId) {
          const novoAjuste = isNaN(valor) ? 0 : valor;

          return {
            ...loja,
            ajuste: novoAjuste,
            novaQuantidade: loja.quantidadeAtual + novoAjuste,
          };
        }

        return loja;
      }),
    );
  };

  const handleSubmit = async () => {
    // Filtrar apenas lojas com ajustes diferentes de zero
    const lojasComAlteracao = lojasEstoque.filter((loja) => loja.ajuste !== 0);

    if (lojasComAlteracao.length === 0) {
      toast.warning("Nenhuma alteração foi feita");

      return;
    }

    setLoading(true);
    try {
      // Processar cada loja com alteração
      for (const loja of lojasComAlteracao) {
        await onSubmit({
          id_loja: loja.lojaId,
          quantidade: loja.novaQuantidade,
          observacao: observacao || undefined,
        });
      }
      toast.success(
        `Estoque atualizado em ${lojasComAlteracao.length} loja(s)`,
      );
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar estoque:", error);
      toast.error("Erro ao atualizar estoque. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const temAlteracao = lojasEstoque.some((loja) => loja.ajuste !== 0);

  return (
    <Modal
      isDismissable={!loading}
      isOpen={isOpen}
      scrollBehavior="inside"
      size="3xl"
      onClose={onClose}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <span>Gerenciar Estoque em Todas as Lojas</span>
          <span className="text-sm text-default-500 font-normal">
            {produtoNome}
          </span>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {/* Resumo de Estoque Total */}
            <Card className="bg-primary-50 dark:bg-primary-900/20">
              <CardBody className="py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">
                    Estoque Total Atual:
                  </span>
                  <Chip color="primary" size="lg" variant="flat">
                    {lojasEstoque.reduce(
                      (acc, loja) => acc + loja.quantidadeAtual,
                      0,
                    )}{" "}
                    unidades
                  </Chip>
                </div>
                {temAlteracao && (
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-primary-200 dark:border-primary-800">
                    <span className="text-sm font-semibold text-success">
                      Novo Total:
                    </span>
                    <Chip color="success" size="lg" variant="flat">
                      {lojasEstoque.reduce(
                        (acc, loja) => acc + loja.novaQuantidade,
                        0,
                      )}{" "}
                      unidades
                    </Chip>
                  </div>
                )}
              </CardBody>
            </Card>

            <Divider />

            {/* Lista de Lojas com Inputs */}
            <div className="space-y-3">
              <p className="text-sm font-semibold">
                Ajuste o estoque por loja:
              </p>
              {lojasEstoque.map((loja) => (
                <Card key={loja.lojaId} className="shadow-sm">
                  <CardBody className="py-3">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                      {/* Nome da Loja */}
                      <div className="md:col-span-1">
                        <p className="font-semibold text-sm">{loja.lojaNome}</p>
                      </div>

                      {/* Estoque Atual */}
                      <div className="flex flex-col">
                        <span className="text-xs text-default-500 mb-1">
                          Atual
                        </span>
                        <Chip
                          color={
                            loja.quantidadeAtual > 0 ? "success" : "danger"
                          }
                          size="sm"
                          variant="flat"
                        >
                          {loja.quantidadeAtual} un
                        </Chip>
                      </div>

                      {/* Input de Ajuste */}
                      <div className="md:col-span-2">
                        <Input
                          classNames={{
                            input:
                              loja.ajuste > 0
                                ? "text-success"
                                : loja.ajuste < 0
                                  ? "text-danger"
                                  : "",
                          }}
                          description={
                            loja.ajuste !== 0
                              ? `${loja.ajuste > 0 ? "+" : ""}${loja.ajuste} unidade(s)`
                              : undefined
                          }
                          label="Ajuste (+/-)"
                          placeholder="0"
                          size="sm"
                          startContent={
                            loja.ajuste > 0 ? (
                              <PlusIcon className="w-4 h-4 text-success" />
                            ) : loja.ajuste < 0 ? (
                              <MinusIcon className="w-4 h-4 text-danger" />
                            ) : null
                          }
                          type="number"
                          value={
                            loja.ajuste === 0 ? "" : loja.ajuste.toString()
                          }
                          variant="bordered"
                          onValueChange={(value) => {
                            const numero = parseInt(value) || 0;

                            handleAjusteChange(loja.lojaId, numero);
                          }}
                          onWheel={(e) => e.currentTarget.blur()}
                        />
                      </div>

                      {/* Nova Quantidade */}
                      <div className="flex flex-col">
                        <span className="text-xs text-default-500 mb-1">
                          Nova Qtd.
                        </span>
                        <Chip
                          className={
                            loja.novaQuantidade < 0
                              ? "bg-danger-100 text-danger"
                              : ""
                          }
                          color={
                            loja.novaQuantidade !== loja.quantidadeAtual
                              ? loja.novaQuantidade > loja.quantidadeAtual
                                ? "success"
                                : "warning"
                              : "default"
                          }
                          size="sm"
                          variant="flat"
                        >
                          {loja.novaQuantidade} un
                        </Chip>
                      </div>
                    </div>

                    {/* Aviso de estoque negativo */}
                    {loja.novaQuantidade < 0 && (
                      <div className="mt-2 text-xs text-danger">
                        ⚠️ Atenção: Estoque ficará negativo!
                      </div>
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>

            <Divider />

            {/* Observação */}
            <Textarea
              description="Esta observação será aplicada a todas as movimentações"
              label="Observação (opcional)"
              minRows={2}
              placeholder="Ex: Ajuste de inventário, entrada de nota fiscal, transferência entre lojas..."
              value={observacao}
              variant="bordered"
              onValueChange={setObservacao}
            />

            {/* Resumo de Alterações */}
            {temAlteracao && (
              <Card className="bg-warning-50 dark:bg-warning-900/20">
                <CardBody className="py-3">
                  <p className="text-sm font-semibold text-warning mb-2">
                    Resumo das alterações:
                  </p>
                  <div className="space-y-1">
                    {lojasEstoque
                      .filter((loja) => loja.ajuste !== 0)
                      .map((loja) => (
                        <div
                          key={loja.lojaId}
                          className="text-xs flex justify-between"
                        >
                          <span className="font-medium">{loja.lojaNome}:</span>
                          <span>
                            {loja.quantidadeAtual} →{" "}
                            <span
                              className={
                                loja.ajuste > 0
                                  ? "text-success font-semibold"
                                  : "text-danger font-semibold"
                              }
                            >
                              {loja.novaQuantidade}
                            </span>{" "}
                            ({loja.ajuste > 0 ? "+" : ""}
                            {loja.ajuste})
                          </span>
                        </div>
                      ))}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button isDisabled={loading} variant="light" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            color="primary"
            isDisabled={!temAlteracao}
            isLoading={loading}
            onPress={handleSubmit}
          >
            {loading
              ? "Atualizando..."
              : `Atualizar Estoque (${
                  lojasEstoque.filter((l) => l.ajuste !== 0).length
                } loja${lojasEstoque.filter((l) => l.ajuste !== 0).length !== 1 ? "s" : ""})`}
          </Button>
        </ModalFooter>
      </ModalContent>

      {/* Toast Component */}
      {toast.ToastComponent}
    </Modal>
  );
}
