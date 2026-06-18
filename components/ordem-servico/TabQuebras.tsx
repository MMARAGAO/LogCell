"use client";

import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

import SectionCard from "./SectionCard";

interface TabQuebrasProps {
  quebras: any[];
  loadingQuebras: boolean;
  onRegistrar: () => void;
}

/**
 * Aba "Quebras" da OS (apresentacional).
 *
 * Botão de registrar (callback) + lista de quebras + total. Extraída da página
 * para reduzir o monólito; sem regras de negócio.
 */
export default function TabQuebras({
  quebras,
  loadingQuebras,
  onRegistrar,
}: TabQuebrasProps) {
  return (
    <div className="mt-6 space-y-6">
      {/* Botão de Registrar Quebra */}
      <SectionCard>
        <Button
          className="w-full"
          color="danger"
          size="lg"
          startContent={<ExclamationTriangleIcon className="w-5 h-5" />}
          variant="flat"
          onPress={onRegistrar}
        >
          Registrar Quebra/Perda de Peça
        </Button>
        <p className="text-xs text-center text-default-400 mt-3">
          Use apenas se uma peça quebrar ou for perdida durante o reparo
        </p>
      </SectionCard>

      {/* Lista de Quebras */}
      <SectionCard
        action={
          quebras.length > 0 ? (
            <Chip size="sm" variant="flat">
              {quebras.length} registro(s)
            </Chip>
          ) : undefined
        }
        icon={<ExclamationTriangleIcon className="w-4 h-4" />}
        title="Quebras Registradas"
      >
        {loadingQuebras ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : quebras.length === 0 ? (
          <div className="text-center py-16 text-default-400">
            <CheckCircleIcon className="w-20 h-20 mx-auto mb-4 opacity-30 text-success" />
            <p className="text-lg font-medium">Nenhuma quebra registrada</p>
            <p className="text-sm mt-2">
              Isso é ótimo! Mantenha o cuidado com as peças.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {quebras.map((quebra) => (
              <div
                key={quebra.id}
                className="p-4 rounded-lg border border-default-200/70 bg-content2 hover:bg-content3 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-lg">
                        {quebra.produtos?.descricao ||
                          "Produto não identificado"}
                      </span>
                      <Chip
                        color={quebra.aprovado ? "success" : "warning"}
                        size="sm"
                        variant="dot"
                      >
                        {quebra.aprovado ? "Aprovada" : "Pendente"}
                      </Chip>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-default-600">
                      <span className="font-medium">
                        Qtd: {quebra.quantidade}
                      </span>
                      <span>Tipo: {quebra.tipo_ocorrencia}</span>
                      <span>Resp.: {quebra.responsavel}</span>
                    </div>

                    {quebra.motivo && (
                      <p className="text-sm text-default-500 bg-default-100 dark:bg-default-50/10 p-2 rounded">
                        {quebra.motivo}
                      </p>
                    )}

                    <div className="text-xs text-default-400">
                      Registrado em{" "}
                      {new Date(quebra.criado_em).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {quebra.aprovado && quebra.aprovado_em && (
                        <span className="ml-2">
                          • Aprovado em{" "}
                          {new Date(quebra.aprovado_em).toLocaleDateString(
                            "pt-BR",
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold text-danger">
                      R$ {quebra.valor_total.toFixed(2)}
                    </div>
                    {quebra.descontar_tecnico && (
                      <Chip
                        className="mt-2"
                        color="danger"
                        size="sm"
                        variant="flat"
                      >
                        Será Descontado
                      </Chip>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Total */}
            {quebras.length > 1 && (
              <div className="pt-4 mt-2 border-t-2">
                <div className="flex justify-between items-center p-4 bg-danger-50 dark:bg-danger-900/20 rounded-lg">
                  <div>
                    <span className="text-lg font-semibold">
                      Total de Quebras:
                    </span>
                    <div className="flex gap-4 mt-1 text-sm text-default-600">
                      <span>
                        {quebras.filter((q) => !q.aprovado).length} pendente(s)
                      </span>
                      <span>
                        {quebras.filter((q) => q.aprovado).length} aprovada(s)
                      </span>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-danger">
                    R${" "}
                    {quebras
                      .reduce((sum, q) => sum + q.valor_total, 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
