import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { ClockIcon } from "@heroicons/react/24/outline";

import {
  getHistoricoProduto,
  HistoricoProduto,
} from "@/services/historicoProdutosService";

interface HistoricoProdutoModalProps {
  isOpen: boolean;
  onClose: () => void;
  produtoId: string;
  produtoNome: string;
}

const PAGE_SIZE = 50;

export function HistoricoProdutoModal({
  isOpen,
  onClose,
  produtoId,
  produtoNome,
}: HistoricoProdutoModalProps) {
  const [historico, setHistorico] = useState<HistoricoProduto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMais, setLoadingMais] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (isOpen && produtoId) {
      carregarHistorico();
    }
  }, [isOpen, produtoId]);

  async function carregarHistorico() {
    try {
      setLoading(true);
      const result = await getHistoricoProduto(produtoId, 0, PAGE_SIZE);

      setHistorico(result.data);
      setHasMore(result.hasMore);
      setTotal(result.total);
      setPage(0);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
    }
  }

  async function carregarMais() {
    try {
      setLoadingMais(true);
      const nextPage = page + 1;
      const result = await getHistoricoProduto(produtoId, nextPage, PAGE_SIZE);

      setHistorico((prev) => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.error("Erro ao carregar mais histórico:", error);
    } finally {
      setLoadingMais(false);
    }
  }

  const formatarCampo = (campo?: string) => {
    const campos: Record<string, string> = {
      descricao: "Descrição",
      grupo: "Grupo",
      categoria: "Categoria",
      codigo_fabricante: "Código do Fabricante",
      modelos: "Modelos",
      marca: "Marca",
      preco_compra: "Preço de Compra",
      preco_venda: "Preço de Venda",
      quantidade_minima: "Quantidade Mínima",
      ativo: "Status",
    };

    return campos[campo || ""] || campo || "-";
  };

  const formatarValor = (valor?: string) => {
    if (!valor || valor === "null") return "-";

    // Se for um JSON, tenta parsear
    try {
      const obj = JSON.parse(valor);

      if (typeof obj === "object") {
        return Object.entries(obj)
          .map(([k, v]) => `${formatarCampo(k)}: ${v || "-"}`)
          .join(", ");
      }
    } catch {
      // Não é JSON, retorna o valor normal
    }

    // Formatar valores booleanos
    if (valor === "true") return "Ativo";
    if (valor === "false") return "Inativo";

    return valor;
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="3xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5" />
            <span>Histórico do Produto</span>
          </div>
          <span className="text-sm font-normal text-default-500">
            {produtoNome}
          </span>
        </ModalHeader>

        <ModalBody>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" />
            </div>
          ) : historico.length === 0 ? (
            <div className="text-center py-8 text-default-400">
              <ClockIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma alteração registrada ainda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historico.map((item) => (
                <div
                  key={item.id}
                  className="border border-default-200 rounded-lg p-4 hover:bg-default-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Chip color="primary" size="sm" variant="flat">
                        Alteração
                      </Chip>
                      <span className="text-sm font-medium">
                        {formatarCampo(item.campo)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-default-400">
                        {formatarData(item.data_alteracao)}
                      </div>
                      {item.usuario_nome && (
                        <div className="text-xs text-default-500">
                          por {item.usuario_nome}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 space-y-1">
                    <div className="text-sm">
                      <span className="text-default-500">De:</span>{" "}
                      <span className="text-danger-500 line-through">
                        {formatarValor(item.valor_antigo)}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-default-500">Para:</span>{" "}
                      <span className="text-success-600 font-medium">
                        {formatarValor(item.valor_novo)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {hasMore && (
                <div className="text-center pt-2 pb-1">
                  <Button
                    color="primary"
                    isLoading={loadingMais}
                    size="sm"
                    variant="flat"
                    onPress={carregarMais}
                  >
                    Carregar mais ({historico.length} de {total})
                  </Button>
                </div>
              )}
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button color="default" variant="light" onPress={onClose}>
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
