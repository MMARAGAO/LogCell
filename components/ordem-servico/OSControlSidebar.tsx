"use client";

import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import {
  ClockIcon,
  VideoCameraIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";

import SectionCard from "./SectionCard";

interface OSControlSidebarProps {
  /** Status atual persistido da OS (ordem.status). */
  statusAtual: string;
  /** Status selecionado (controlado pelo componente pai). */
  novoStatus: string;
  onNovoStatusChange: (value: string) => void;
  ordemId: string;
  bancada: string;
  /** Bancadas já em uso por outras OS (não selecionáveis). */
  bancadasOcupadas?: string[];
  salvandoBancada: boolean;
  onBancadaChange: (value: string) => void;
  onCompartilhar: () => void;
}

/**
 * Sidebar de controles da OS (Status + Câmera ao Vivo).
 *
 * Apenas apresentacional: todo o estado e os handlers continuam no componente
 * de página. Extraído para a barra lateral persistente do layout "issue".
 */
export default function OSControlSidebar({
  statusAtual,
  novoStatus,
  onNovoStatusChange,
  ordemId,
  bancada,
  bancadasOcupadas = [],
  salvandoBancada,
  onBancadaChange,
  onCompartilhar,
}: OSControlSidebarProps) {
  const osConcluida = statusAtual === "concluido";
  // Não desabilitar a bancada já associada a esta OS
  const bancadasIndisponiveis = bancadasOcupadas.filter((b) => b !== bancada);

  return (
    <>
      {/* Status Update */}
      <SectionCard
        bodyClassName="space-y-4"
        icon={<ClockIcon className="w-4 h-4" />}
        title="Status"
      >
        <Select
          classNames={{
            trigger: "bg-default-100 border-default-200",
          }}
          isDisabled={osConcluida}
          label="Alterar status"
          labelPlacement="outside"
          placeholder="Selecione..."
          selectedKeys={[novoStatus]}
          size="md"
          variant="bordered"
          onChange={(e) => onNovoStatusChange(e.target.value)}
        >
          <SelectItem key="em_andamento">Em Andamento</SelectItem>
          <SelectItem key="em_diagnostico">Em Diagnóstico</SelectItem>
          <SelectItem key="aguardando_pecas">Aguardando Peças</SelectItem>
        </Select>
        <p className="text-[11px] text-default-500">
          Use a barra de ações no rodapé para salvar ou concluir.
        </p>
      </SectionCard>

      {/* Câmera */}
      <SectionCard
        className={bancada ? "border-emerald-200 dark:border-emerald-900" : ""}
        icon={<VideoCameraIcon className="w-4 h-4" />}
        title="Câmera ao Vivo"
      >
        {novoStatus === "em_andamento" || bancada ? (
          <div className="space-y-4">
            <Select
              classNames={{
                trigger: "bg-default-100 border-default-200",
              }}
              disabledKeys={bancadasIndisponiveis}
              isLoading={salvandoBancada}
              label="Bancada"
              labelPlacement="outside"
              placeholder="Selecione a bancada"
              selectedKeys={bancada ? [bancada] : []}
              size="md"
              variant="bordered"
              onChange={(e) => onBancadaChange(e.target.value)}
            >
              {[1, 2, 3, 4, 5].map((n) => {
                const key = `bancada-${n}`;
                const emUso = bancadasIndisponiveis.includes(key);

                return (
                  <SelectItem key={key} textValue={`Bancada ${n}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span>Bancada {n}</span>
                      {emUso && (
                        <span className="text-xs text-danger font-medium">
                          Em uso
                        </span>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </Select>

            {bancada && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      Bancada {bancada.replace("bancada-", "")} ativa
                    </p>
                    <p className="text-[11px] text-emerald-500">
                      Transmitindo ao vivo
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className="font-medium text-xs"
                    color="primary"
                    size="sm"
                    startContent={<VideoCameraIcon className="w-3.5 h-3.5" />}
                    variant="flat"
                    onPress={() =>
                      window.open(
                        `/ver-stream/${ordemId}`,
                        "_blank",
                        "noopener,noreferrer",
                      )
                    }
                  >
                    Ver ao Vivo
                  </Button>
                  <Button
                    className="font-medium text-xs"
                    color="success"
                    size="sm"
                    startContent={<ShareIcon className="w-3.5 h-3.5" />}
                    variant="solid"
                    onPress={onCompartilhar}
                  >
                    Compartilhar
                  </Button>
                </div>
                <p className="text-[11px] text-default-500 text-center">
                  Link copiável para enviar ao cliente
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="w-10 h-10 rounded-full bg-default-200 flex items-center justify-center mb-2">
              <VideoCameraIcon className="w-5 h-5 text-default-400" />
            </div>
            <p className="text-xs text-default-500 font-medium">
              Câmera disponível
            </p>
            <p className="text-[11px] text-default-500 mt-0.5">
              ao iniciar manutenção
            </p>
          </div>
        )}
      </SectionCard>
    </>
  );
}
