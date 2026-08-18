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
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { useState, useEffect, useMemo } from "react";

import { HistoricoEstoqueCompleto } from "@/types";
import { getHistoricoProduto } from "@/services/historicoEstoqueService";

interface HistoricoEstoqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  produtoId: string;
  produtoNome: string;
}

const PAGE_SIZE = 50;

type Filtro = "todos" | "reducoes" | "entradas";

export default function HistoricoEstoqueModal({
  isOpen,
  onClose,
  produtoId,
  produtoNome,
}: HistoricoEstoqueModalProps) {
  const [historico, setHistorico] = useState<HistoricoEstoqueCompleto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMais, setLoadingMais] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [filtro, setFiltro] = useState<Filtro>("todos");

  useEffect(() => {
    if (isOpen && produtoId) {
      carregarHistorico();
    }
  }, [isOpen, produtoId]);

  const carregarHistorico = async () => {
    setLoading(true);
    try {
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
  };

  const carregarMais = async () => {
    setLoadingMais(true);
    try {
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
  };

  const TIPOS_SAIDA = new Set([
    "venda",
    "saida",
    "quebra",
    "transferencia_saida",
    "ordem_servico",
  ]);
  const TIPOS_ENTRADA = new Set([
    "entrada",
    "devolucao_venda",
    "transferencia_entrada",
  ]);

  // Alguns registros antigos não têm quantidade_anterior/nova preenchidos
  // (ex.: troca de produto). Nesses casos, caímos em quantidade_alterada e,
  // por último, no total movimentado (`quantidade`) com sinal inferido pelo tipo.
  const getAlteracao = (item: HistoricoEstoqueCompleto) => {
    if (item.quantidade_anterior != null && item.quantidade_nova != null) {
      return item.quantidade_nova - item.quantidade_anterior;
    }

    if (item.quantidade_alterada != null) {
      return item.quantidade_alterada;
    }

    const quantidade = item.quantidade;

    if (quantidade != null) {
      if (TIPOS_SAIDA.has(item.tipo_movimentacao || "")) return -quantidade;
      if (TIPOS_ENTRADA.has(item.tipo_movimentacao || "")) return quantidade;
    }

    return undefined;
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

  const getTipoMovimentacao = (tipo?: string) => {
    const tipos: Record<
      string,
      {
        label: string;
        color: "success" | "danger" | "warning" | "primary" | "default";
      }
    > = {
      venda: { label: "Venda", color: "danger" },
      devolucao_venda: { label: "Devolução", color: "success" },
      entrada: { label: "Entrada", color: "success" },
      ajuste: { label: "Ajuste", color: "warning" },
      saida: { label: "Saída", color: "danger" },
      transferencia_saida: { label: "Transferência (Saída)", color: "danger" },
      transferencia_entrada: {
        label: "Transferência (Entrada)",
        color: "success",
      },
      ordem_servico: { label: "Ordem de Serviço", color: "primary" },
      quebra: { label: "Quebra", color: "danger" },
    };

    return (
      tipos[tipo || "ajuste"] || { label: tipo || "Ajuste", color: "default" }
    );
  };

  const historicoFiltrado = useMemo(() => {
    if (filtro === "todos") return historico;

    return historico.filter((item) => {
      const alteracao = getAlteracao(item);

      if (alteracao === undefined || alteracao === 0) return false;

      return filtro === "reducoes" ? alteracao < 0 : alteracao > 0;
    });
  }, [historico, filtro]);

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="5xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-2">
          <span>Histórico de Movimentações</span>
          <span className="text-sm text-default-500 font-normal">
            {produtoNome}
          </span>
          {historico.length > 0 && (
            <div className="flex gap-2">
              <Chip
                className="cursor-pointer"
                color={filtro === "todos" ? "primary" : "default"}
                size="sm"
                variant={filtro === "todos" ? "solid" : "flat"}
                onClick={() => setFiltro("todos")}
              >
                Todos
              </Chip>
              <Chip
                className="cursor-pointer"
                color={filtro === "reducoes" ? "danger" : "default"}
                size="sm"
                variant={filtro === "reducoes" ? "solid" : "flat"}
                onClick={() => setFiltro("reducoes")}
              >
                Só reduções
              </Chip>
              <Chip
                className="cursor-pointer"
                color={filtro === "entradas" ? "success" : "default"}
                size="sm"
                variant={filtro === "entradas" ? "solid" : "flat"}
                onClick={() => setFiltro("entradas")}
              >
                Só entradas
              </Chip>
            </div>
          )}
        </ModalHeader>
        <ModalBody>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" />
            </div>
          ) : historico.length > 0 ? (
            <div className="space-y-3">
              <Table
                removeWrapper
                aria-label="Histórico de movimentações de estoque"
              >
                <TableHeader>
                  <TableColumn>DATA</TableColumn>
                  <TableColumn>TIPO</TableColumn>
                  <TableColumn>QUANTIDADE</TableColumn>
                  <TableColumn>LOJA</TableColumn>
                  <TableColumn>MOTIVO / OBSERVAÇÃO</TableColumn>
                  <TableColumn>RESPONSÁVEL</TableColumn>
                </TableHeader>
                <TableBody
                  emptyContent="Nenhuma movimentação nesse filtro."
                  items={historicoFiltrado}
                >
                  {(item) => {
                    const tipo = getTipoMovimentacao(item.tipo_movimentacao);
                    const alteracao = getAlteracao(item);
                    const motivoTexto = item.venda_troca_numero
                      ? `Venda #${item.venda_troca_numero}${item.venda_troca_cliente ? ` - Cliente: ${item.venda_troca_cliente}` : ""}`
                      : item.motivo &&
                          item.observacao &&
                          item.motivo.trim() === item.observacao.trim()
                        ? item.motivo
                        : [item.motivo, item.observacao]
                            .filter(Boolean)
                            .join(" — ");

                    return (
                      <TableRow
                        key={item.id}
                        className={
                          alteracao !== undefined && alteracao < 0
                            ? "bg-danger-50/50"
                            : ""
                        }
                      >
                        <TableCell>
                          <span className="text-sm whitespace-nowrap">
                            {formatarData(item.criado_em)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Chip color={tipo.color} size="sm" variant="flat">
                            {tipo.label}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          {item.quantidade_anterior != null &&
                          item.quantidade_nova != null ? (
                            <span className="text-sm whitespace-nowrap">
                              {item.quantidade_anterior} →{" "}
                              {item.quantidade_nova}{" "}
                              {alteracao !== undefined && alteracao !== 0 && (
                                <span
                                  className={
                                    alteracao > 0
                                      ? "text-success font-semibold"
                                      : "text-danger font-semibold"
                                  }
                                >
                                  ({alteracao > 0 ? "+" : ""}
                                  {alteracao})
                                </span>
                              )}
                            </span>
                          ) : alteracao !== undefined && alteracao !== 0 ? (
                            <span
                              className={
                                alteracao > 0
                                  ? "text-success font-semibold text-sm"
                                  : "text-danger font-semibold text-sm"
                              }
                            >
                              {alteracao > 0 ? "+" : ""}
                              {alteracao}
                            </span>
                          ) : item.quantidade != null ? (
                            <span className="text-sm">
                              {item.quantidade} un.
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {item.loja_nome || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-default-600">
                            {motivoTexto || "-"}
                          </span>
                          {item.produto_troca_nome && (
                            <div className="text-xs text-default-500 mt-1">
                              {item.produto_troca_direcao === "entrada"
                                ? "Cliente devolveu: "
                                : "Cliente levou: "}
                              <span className="font-medium">
                                {item.produto_troca_nome}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-default-500">
                            {item.usuario_origem_nome
                              ? `${item.usuario_origem_nome} → ${item.usuario_nome || "Sistema"}`
                              : item.usuario_nome || "Sistema"}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  }}
                </TableBody>
              </Table>

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
          ) : (
            <div className="text-center py-8 text-default-500">
              <p>Nenhuma alteração registrada para este produto.</p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
