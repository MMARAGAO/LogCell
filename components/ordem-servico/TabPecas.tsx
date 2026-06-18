"use client";

import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import {
  CubeIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import SectionCard from "./SectionCard";

interface TabPecasProps {
  pecas: any[];
  quebras: any[];
  loadingPecas: boolean;
}

/**
 * Aba "Peças" da OS (apresentacional, somente leitura).
 *
 * Agrupa as peças por produto/tipo, exibe quebras associadas e os totais.
 * Extraída da página para reduzir o monólito; sem regras de negócio.
 */
export default function TabPecas({
  pecas,
  quebras,
  loadingPecas,
}: TabPecasProps) {
  return (
    <div className="mt-6">
      <SectionCard
        icon={<CubeIcon className="w-4 h-4" />}
        title="Peças Associadas à OS"
      >
        {loadingPecas ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : pecas.length === 0 ? (
          <div className="text-center py-16 text-default-400">
            <CubeIcon className="w-20 h-20 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Nenhuma peça associada</p>
            <p className="text-sm mt-2">
              Ainda não foram adicionadas peças a esta OS
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {(() => {
              // Agrupar peças pelo id_produto e tipo_produto
              const pecasAgrupadas = pecas.reduce((acc: any[], peca) => {
                const chave = `${peca.id_produto || peca.descricao_peca}_${peca.tipo_produto}`;
                const existente = acc.find((p) => p.chave === chave);

                if (existente) {
                  // Somar quantidades
                  existente.quantidade += peca.quantidade;
                  existente.ids.push(peca.id);
                  // Manter o mais recente baixado/reservado
                  if (peca.estoque_baixado) {
                    existente.estoque_baixado = true;
                    existente.data_baixa_estoque = peca.data_baixa_estoque;
                  }
                  if (peca.estoque_reservado && !existente.estoque_baixado) {
                    existente.estoque_reservado = true;
                    existente.data_reserva_estoque = peca.data_reserva_estoque;
                  }
                } else {
                  acc.push({
                    ...peca,
                    chave,
                    ids: [peca.id],
                  });
                }

                return acc;
              }, []);

              return pecasAgrupadas.map((peca) => (
                <div
                  key={peca.chave}
                  className="p-4 rounded-lg border border-default-200/70 bg-content2 hover:bg-content3 transition-colors"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Tipo de Produto */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Chip color="default" size="sm" variant="flat">
                          {peca.tipo_produto === "estoque"
                            ? "Estoque"
                            : "Avulso/Externo"}
                        </Chip>
                        {peca.estoque_reservado && (
                          <Chip color="warning" size="sm" variant="dot">
                            Reservado
                          </Chip>
                        )}
                        {peca.estoque_baixado && (
                          <Chip
                            color="success"
                            size="sm"
                            startContent={<CheckIcon className="w-3 h-3" />}
                            variant="dot"
                          >
                            Baixado
                          </Chip>
                        )}
                      </div>

                      {/* Descrição */}
                      <div>
                        <p className="font-semibold text-lg">
                          {peca.tipo_produto === "estoque" && peca.produtos
                            ? peca.produtos.descricao
                            : peca.descricao_peca}
                        </p>
                        {peca.tipo_produto === "estoque" &&
                          peca.produtos?.codigo_barras && (
                            <p className="text-xs text-default-500 font-mono mt-1">
                              Código: {peca.produtos.codigo_barras}
                            </p>
                          )}
                      </div>

                      {/* Informações */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-default-600">
                        <span className="font-medium">
                          Qtd: {peca.quantidade}
                        </span>
                        <span>Custo Un.: R$ {peca.valor_custo.toFixed(2)}</span>
                        <span>Venda Un.: R$ {peca.valor_venda.toFixed(2)}</span>
                      </div>

                      {/* Datas */}
                      {(peca.data_reserva_estoque ||
                        peca.data_baixa_estoque) && (
                        <div className="text-xs text-default-400 space-y-1">
                          {peca.data_reserva_estoque && (
                            <p>
                              Reservado em:{" "}
                              {new Date(
                                peca.data_reserva_estoque,
                              ).toLocaleString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          )}
                          {peca.data_baixa_estoque && (
                            <p>
                              Baixado em:{" "}
                              {new Date(peca.data_baixa_estoque).toLocaleString(
                                "pt-BR",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Observação */}
                      {peca.observacao && (
                        <p className="text-sm text-default-500 bg-default-100 dark:bg-default-50/10 p-2 rounded">
                          Obs: {peca.observacao}
                        </p>
                      )}

                      {/* Quebras Associadas */}
                      {(() => {
                        const quebrasRelacionadas = quebras.filter(
                          (q) => q.id_produto === peca.id_produto,
                        );

                        if (quebrasRelacionadas.length > 0) {
                          const totalQuebrado = quebrasRelacionadas.reduce(
                            (sum, q) => sum + q.quantidade,
                            0,
                          );
                          const totalValor = quebrasRelacionadas.reduce(
                            (sum, q) => sum + (q.valor_total || 0),
                            0,
                          );

                          return (
                            <div className="mt-2 p-3 bg-danger-50 dark:bg-danger-900/20 border-l-3 border-danger rounded">
                              <div className="flex items-start gap-2">
                                <ExclamationTriangleIcon className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-semibold text-danger">
                                      Quebras Registradas
                                    </p>
                                    <Chip
                                      color="danger"
                                      size="sm"
                                      variant="flat"
                                    >
                                      {quebrasRelacionadas.length} registro(s)
                                    </Chip>
                                  </div>

                                  <div className="space-y-2">
                                    {quebrasRelacionadas.map((quebra) => (
                                      <div
                                        key={quebra.id}
                                        className="p-2 bg-default-100 rounded text-xs"
                                      >
                                        <div className="flex items-center gap-2 mb-1">
                                          <Chip
                                            color={
                                              quebra.aprovado
                                                ? "success"
                                                : "warning"
                                            }
                                            size="sm"
                                            variant="flat"
                                          >
                                            {quebra.aprovado
                                              ? "Aprovada"
                                              : "Pendente"}
                                          </Chip>
                                          <span className="font-semibold text-danger-700 dark:text-danger-300">
                                            Qtd: {quebra.quantidade}
                                          </span>
                                          <span className="text-default-500">
                                            Tipo:{" "}
                                            {quebra.tipo_ocorrencia || "quebra"}
                                          </span>
                                        </div>
                                        {quebra.responsavel && (
                                          <p className="text-default-600 dark:text-default-400 mb-1">
                                            <span className="font-medium">
                                              Resp.:
                                            </span>{" "}
                                            {quebra.responsavel}
                                          </p>
                                        )}
                                        <p className="text-default-600 dark:text-default-400">
                                          {quebra.motivo}
                                        </p>
                                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-default-200 dark:border-default-100">
                                          <span className="text-default-500">
                                            Registrado em{" "}
                                            {new Date(
                                              quebra.criado_em,
                                            ).toLocaleString("pt-BR", {
                                              day: "2-digit",
                                              month: "2-digit",
                                              year: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                            {quebra.aprovado_em &&
                                              ` • Aprovado em ${new Date(quebra.aprovado_em).toLocaleDateString("pt-BR")}`}
                                          </span>
                                          {quebra.valor_total > 0 && (
                                            <span className="font-semibold text-danger">
                                              R$ {quebra.valor_total.toFixed(2)}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {quebrasRelacionadas.length > 1 && (
                                    <div className="mt-2 pt-2 border-t border-danger-200 dark:border-danger-800 flex items-center justify-between text-xs font-semibold text-danger-700 dark:text-danger-300">
                                      <span>
                                        Total Quebrado: {totalQuebrado}{" "}
                                        unidade(s)
                                      </span>
                                      {totalValor > 0 && (
                                        <span>
                                          Total: R$ {totalValor.toFixed(2)}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return null;
                      })()}
                    </div>

                    {/* Valores Totais */}
                    <div className="text-right space-y-1">
                      <div>
                        <p className="text-xs text-default-500">Custo Total</p>
                        <p className="text-lg font-bold text-primary">
                          R$ {(peca.valor_custo * peca.quantidade).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-default-500">Venda Total</p>
                        <p className="text-base font-semibold text-success">
                          R$ {peca.valor_total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ));
            })()}

            {/* Totais Gerais */}
            {pecas.length > 1 && (
              <div className="pt-4 mt-2 border-t-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-default-100 dark:bg-default-50/10 rounded-lg">
                    <p className="text-sm text-default-600 mb-1">
                      Total de Itens
                    </p>
                    <p className="text-2xl font-bold">
                      {pecas.reduce((sum, p) => sum + p.quantidade, 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-default-100 dark:bg-default-50/10 rounded-lg">
                    <p className="text-sm text-default-600 mb-1">Custo Total</p>
                    <p className="text-2xl font-bold tabular-nums">
                      R${" "}
                      {pecas
                        .reduce(
                          (sum, p) => sum + p.valor_custo * p.quantidade,
                          0,
                        )
                        .toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-default-100 dark:bg-default-50/10 rounded-lg">
                    <p className="text-sm text-default-600 mb-1">Venda Total</p>
                    <p className="text-2xl font-bold tabular-nums">
                      R${" "}
                      {pecas
                        .reduce((sum, p) => sum + p.valor_total, 0)
                        .toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
