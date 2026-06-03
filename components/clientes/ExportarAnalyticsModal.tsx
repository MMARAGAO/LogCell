"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Checkbox } from "@heroui/checkbox";
import { Spinner } from "@heroui/spinner";
import {
  Search,
  FileSpreadsheet,
  User,
  AlertCircle,
  CheckSquare,
  Square,
} from "lucide-react";

import { buscarClientes } from "@/services/clienteService";
import { exportarAnalyticsClientes } from "@/services/clienteExportService";
import { useToast } from "@/components/Toast";
import type { Cliente } from "@/types/clientesTecnicos";

interface ExportarAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportarAnalyticsModal({
  isOpen,
  onClose,
}: ExportarAnalyticsModalProps) {
  const toast = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [busca, setBusca] = useState("");
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  const carregarClientes = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await buscarClientes({
        busca: busca || undefined,
        pageSize: 200,
      });
      setClientes(data || []);
    } catch {
      toast.error("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  }, [busca]);

  useEffect(() => {
    if (isOpen) {
      setSelecionados(new Set());
      carregarClientes();
    }
  }, [isOpen, carregarClientes]);

  const toggleCliente = (id: string) => {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selecionarTodos = () => {
    setSelecionados(new Set(clientes.map((c) => c.id)));
  };

  const limparSelecao = () => {
    setSelecionados(new Set());
  };

  const todosSelecionados =
    clientes.length > 0 && selecionados.size === clientes.length;

  const handleExportar = async () => {
    if (selecionados.size === 0) return;
    setExportando(true);
    try {
      const selecionadosLista = clientes.filter((c) =>
        selecionados.has(c.id),
      );
      const blob = await exportarAnalyticsClientes(selecionadosLista);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-clientes-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Planilha exportada com sucesso!");
      onClose();
    } catch (err: any) {
      console.error("Erro ao exportar:", err);
      toast.error(err.message || "Erro ao exportar planilha");
    } finally {
      setExportando(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      size="2xl"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-3 border-b border-divider">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold">Exportar Analytics</p>
            <p className="text-sm text-default-500">
              Selecione os clientes para exportar os dados analíticos
            </p>
          </div>
        </ModalHeader>
        <ModalBody className="py-4 gap-4">
          <Input
            isClearable
            placeholder="Buscar cliente por nome, telefone ou CPF..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={busca}
            variant="bordered"
            onChange={(e) => setBusca(e.target.value)}
            onClear={() => setBusca("")}
          />

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {todosSelecionados ? (
                <Button
                  size="sm"
                  startContent={<Square className="w-4 h-4" />}
                  variant="flat"
                  onPress={limparSelecao}
                >
                  Limpar seleção
                </Button>
              ) : (
                <Button
                  size="sm"
                  startContent={<CheckSquare className="w-4 h-4" />}
                  variant="flat"
                  onPress={selecionarTodos}
                >
                  Selecionar todos
                </Button>
              )}
            </div>
            <Chip color="primary" size="sm" variant="flat">
              {selecionados.size} de {clientes.length} selecionado
              {selecionados.size !== 1 ? "s" : ""}
            </Chip>
          </div>

          <Divider />

          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner label="Carregando clientes..." />
            </div>
          ) : clientes.length === 0 ? (
            <div className="text-center py-8 text-default-500">
              <User className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Nenhum cliente encontrado</p>
            </div>
          ) : (
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {clientes.map((cliente) => {
                const selected = selecionados.has(cliente.id);
                return (
                  <div
                    key={cliente.id}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                      selected
                        ? "bg-primary/5 border-primary/30"
                        : "border-divider hover:bg-default-50"
                    }`}
                    onClick={() => toggleCliente(cliente.id)}
                  >
                    <Checkbox
                      isSelected={selected}
                      onValueChange={() => toggleCliente(cliente.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {cliente.nome}
                      </p>
                      {cliente.telefone && (
                        <p className="text-xs text-default-500">
                          {cliente.telefone}
                        </p>
                      )}
                    </div>
                    <Chip
                      color={cliente.ativo ? "success" : "danger"}
                      size="sm"
                      variant="flat"
                    >
                      {cliente.ativo ? "Ativo" : "Inativo"}
                    </Chip>
                  </div>
                );
              })}
            </div>
          )}
        </ModalBody>
        <ModalFooter className="border-t border-divider">
          <Button variant="flat" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            color="primary"
            isDisabled={selecionados.size === 0}
            isLoading={exportando}
            startContent={
              !exportando && <FileSpreadsheet className="w-4 h-4" />
            }
            onPress={handleExportar}
          >
            {exportando
              ? "Exportando..."
              : `Exportar ${selecionados.size} cliente${selecionados.size !== 1 ? "s" : ""}`}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
