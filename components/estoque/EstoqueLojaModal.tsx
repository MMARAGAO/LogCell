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
  const totalAtual = lojasEstoque.reduce((a, l) => a + l.quantidadeAtual, 0);
  const totalNovo = lojasEstoque.reduce((a, l) => a + l.novaQuantidade, 0);
  const algumNegativo = lojasEstoque.some((l) => l.novaQuantidade < 0);
  const lojasAlteradas = lojasEstoque.filter((l) => l.ajuste !== 0).length;

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
            {/* Estoque total */}
            <div className="flex items-center justify-between rounded-lg border border-default-200 bg-default-50 px-4 py-3 dark:border-default-100/20 dark:bg-default-100/5">
              <span className="text-sm font-medium text-default-600">
                Estoque total
              </span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-xl font-bold text-foreground">
                  {totalAtual}
                </span>
                {temAlteracao && (
                  <>
                    <span className="text-default-400">→</span>
                    <span
                      className={`text-xl font-bold ${
                        totalNovo >= totalAtual
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {totalNovo}
                    </span>
                  </>
                )}
                <span className="text-sm font-normal text-default-400">un</span>
              </div>
            </div>

            {/* Ajuste por loja */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-default-500">
                Ajuste por loja
              </p>
              <div className="overflow-hidden rounded-lg border border-default-200 dark:border-default-100/20">
                {lojasEstoque.map((loja, i) => (
                  <div
                    key={loja.lojaId}
                    className={`flex flex-wrap items-center gap-3 px-3 py-2.5 sm:flex-nowrap ${
                      i > 0
                        ? "border-t border-default-200 dark:border-default-100/20"
                        : ""
                    }`}
                  >
                    {/* Nome + atual */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {loja.lojaNome}
                      </p>
                      <p className="text-xs text-default-400">
                        Atual:{" "}
                        <span className="tabular-nums text-default-600">
                          {loja.quantidadeAtual}
                        </span>{" "}
                        un
                      </p>
                    </div>

                    {/* Stepper de ajuste */}
                    <div className="flex items-center gap-1">
                      <Button
                        isIconOnly
                        className="h-8 w-8 min-w-0"
                        size="sm"
                        variant="flat"
                        onPress={() =>
                          handleAjusteChange(loja.lojaId, loja.ajuste - 1)
                        }
                      >
                        <MinusIcon className="h-4 w-4" />
                      </Button>
                      <Input
                        aria-label={`Ajuste para ${loja.lojaNome}`}
                        className="w-16"
                        classNames={{ input: "text-center tabular-nums" }}
                        placeholder="0"
                        radius="md"
                        size="sm"
                        type="number"
                        value={loja.ajuste === 0 ? "" : loja.ajuste.toString()}
                        variant="bordered"
                        onValueChange={(value) =>
                          handleAjusteChange(loja.lojaId, parseInt(value) || 0)
                        }
                        onWheel={(e) => e.currentTarget.blur()}
                      />
                      <Button
                        isIconOnly
                        className="h-8 w-8 min-w-0"
                        size="sm"
                        variant="flat"
                        onPress={() =>
                          handleAjusteChange(loja.lojaId, loja.ajuste + 1)
                        }
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Nova quantidade */}
                    <div className="w-16 flex-shrink-0 text-right">
                      <p className="text-[10px] uppercase tracking-wide text-default-400">
                        Nova
                      </p>
                      <p
                        className={`text-sm font-bold tabular-nums ${
                          loja.novaQuantidade < 0
                            ? "text-rose-600 dark:text-rose-400"
                            : loja.ajuste === 0
                              ? "text-default-600"
                              : loja.ajuste > 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {loja.novaQuantidade}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {algumNegativo && (
                <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">
                  Atenção: uma ou mais lojas ficarão com estoque negativo.
                </p>
              )}
            </div>

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
              : `Atualizar Estoque${
                  lojasAlteradas > 0
                    ? ` (${lojasAlteradas} loja${lojasAlteradas !== 1 ? "s" : ""})`
                    : ""
                }`}
          </Button>
        </ModalFooter>
      </ModalContent>

      {/* Toast Component */}
      {toast.ToastComponent}
    </Modal>
  );
}
