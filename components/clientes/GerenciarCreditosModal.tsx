"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
  Divider,
  Chip,
} from "@heroui/react";
import { Wallet, Plus, Minus, AlertCircle, History } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/Toast";
import { HistoricoCreditosModal } from "./HistoricoCreditosModal";

interface GerenciarCreditosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clienteId: string;
  clienteNome: string;
  saldoAtual: number;
}

export function GerenciarCreditosModal({
  isOpen,
  onClose,
  onSuccess,
  clienteId,
  clienteNome,
  saldoAtual,
}: GerenciarCreditosModalProps) {
  const { usuario } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [tipo, setTipo] = useState<"adicionar" | "retirar">("adicionar");
  const [valor, setValor] = useState("");
  const [motivo, setMotivo] = useState("");
  const [modalHistoricoOpen, setModalHistoricoOpen] = useState(false);

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleSubmit = async () => {
    if (!usuario) {
      toast.error("Usuário não autenticado");
      return;
    }

    const valorNumerico = parseFloat(valor);
    if (!valorNumerico || valorNumerico <= 0) {
      toast.error("Informe um valor válido");
      return;
    }

    if (!motivo.trim()) {
      toast.error("Informe o motivo");
      return;
    }

    if (tipo === "retirar" && valorNumerico > saldoAtual) {
      toast.error("Valor a retirar não pode ser maior que o saldo disponível");
      return;
    }

    setLoading(true);

    try {
      const { supabase } = await import("@/lib/supabaseClient");

      if (tipo === "adicionar") {
        // Adiciona novo crédito
        const { error } = await supabase.from("creditos_cliente").insert({
          cliente_id: clienteId,
          tipo: "adicao",
          valor_total: valorNumerico,
          saldo: valorNumerico,
          valor_utilizado: 0,
          motivo: motivo,
          gerado_por: usuario.id,
        });

        if (error) throw error;
      } else {
        // Retirar crédito - cria um registro de retirada para aparecer no histórico
        const { error: errorRetirada } = await supabase
          .from("creditos_cliente")
          .insert({
            cliente_id: clienteId,
            tipo: "retirada",
            valor_total: valorNumerico, // Valor positivo, mas tipo retirada
            saldo: 0,
            valor_utilizado: valorNumerico,
            motivo: motivo,
            gerado_por: usuario.id,
          });

        if (errorRetirada) throw errorRetirada;

        // Busca créditos disponíveis e vai deduzindo (lógica FIFO)
        const { data: creditos, error: errorBuscar } = await supabase
          .from("creditos_cliente")
          .select("*")
          .eq("cliente_id", clienteId)
          .gt("saldo", 0)
          .order("criado_em", { ascending: true });

        if (errorBuscar) throw errorBuscar;

        let valorRestante = valorNumerico;

        for (const credito of creditos || []) {
          if (valorRestante <= 0) break;

          const valorARetirar = Math.min(valorRestante, credito.saldo);
          const novoSaldo = credito.saldo - valorARetirar;
          const novoValorUtilizado = credito.valor_utilizado + valorARetirar;

          const { error } = await supabase
            .from("creditos_cliente")
            .update({
              saldo: novoSaldo,
              valor_utilizado: novoValorUtilizado,
            })
            .eq("id", credito.id);

          if (error) throw error;

          valorRestante -= valorARetirar;
        }
      }

      toast.success(
        `Crédito ${tipo === "adicionar" ? "adicionado" : "retirado"} com sucesso!`
      );

      // Aguarda para o toast ser visível antes de fechar o modal
      setTimeout(() => {
        handleClose();
        onSuccess();
      }, 1500);
    } catch (error: any) {
      console.error("Erro ao gerenciar créditos:", error);
      toast.error(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setValor("");
    setMotivo("");
    setTipo("adicionar");
    onClose();
  };

  const novoSaldo =
    tipo === "adicionar"
      ? saldoAtual + (parseFloat(valor) || 0)
      : saldoAtual - (parseFloat(valor) || 0);

  return (
    <>
      {toast.ToastComponent}
      <Modal isOpen={isOpen} onClose={handleClose} size="2xl">
        <ModalContent>
          <ModalHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              <span>Gerenciar Créditos</span>
            </div>
            <Button
              size="sm"
              variant="flat"
              color="primary"
              startContent={<History className="w-4 h-4" />}
              onPress={() => setModalHistoricoOpen(true)}
            >
              Histórico
            </Button>
          </ModalHeader>

          <ModalBody>
            <div className="space-y-4">
              {/* Informações do Cliente */}
              <div className="bg-default-100 p-4 rounded-lg">
                <p className="text-sm text-default-600 mb-1">Cliente</p>
                <p className="font-semibold text-lg">{clienteNome}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-default-600">Saldo Atual:</span>
                  <span className="text-xl font-bold text-success">
                    {formatarMoeda(saldoAtual)}
                  </span>
                </div>
              </div>

              {/* Tipo de Operação */}
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  color={tipo === "adicionar" ? "success" : "default"}
                  variant={tipo === "adicionar" ? "solid" : "bordered"}
                  startContent={<Plus className="w-4 h-4" />}
                  onPress={() => setTipo("adicionar")}
                >
                  Adicionar Crédito
                </Button>
                <Button
                  className="flex-1"
                  color={tipo === "retirar" ? "danger" : "default"}
                  variant={tipo === "retirar" ? "solid" : "bordered"}
                  startContent={<Minus className="w-4 h-4" />}
                  onPress={() => setTipo("retirar")}
                >
                  Retirar Crédito
                </Button>
              </div>

              <Divider />

              {/* Valor */}
              <Input
                label="Valor"
                placeholder="0,00"
                type="number"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                startContent={<span className="text-default-400">R$</span>}
                description={
                  tipo === "retirar" && parseFloat(valor) > saldoAtual
                    ? "⚠️ Valor maior que saldo disponível"
                    : null
                }
              />

              {/* Motivo */}
              <Textarea
                label="Motivo *"
                placeholder={
                  tipo === "adicionar"
                    ? "Ex: Bonificação, promoção, cortesia..."
                    : "Ex: Ajuste, correção, solicitação do cliente..."
                }
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                minRows={2}
              />

              <Divider />

              {/* Preview do novo saldo */}
              <div className="bg-default-100 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-default-600">Saldo Atual:</span>
                  <span className="font-semibold">
                    {formatarMoeda(saldoAtual)}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-default-600">
                    {tipo === "adicionar" ? "Adicionar:" : "Retirar:"}
                  </span>
                  <span
                    className={`font-semibold ${tipo === "adicionar" ? "text-success" : "text-danger"}`}
                  >
                    {tipo === "adicionar" ? "+" : "-"}
                    {formatarMoeda(parseFloat(valor) || 0)}
                  </span>
                </div>
                <Divider className="my-2" />
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Novo Saldo:</span>
                  <span
                    className={`text-xl font-bold ${novoSaldo < 0 ? "text-danger" : "text-success"}`}
                  >
                    {formatarMoeda(Math.max(0, novoSaldo))}
                  </span>
                </div>
              </div>

              {/* Alertas */}
              {tipo === "retirar" && parseFloat(valor) > saldoAtual && (
                <div className="flex items-start gap-2 p-3 bg-danger-50 border border-danger-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-danger">
                    <p className="font-semibold mb-1">Atenção!</p>
                    <p>
                      O valor a retirar é maior que o saldo disponível. Por
                      favor, ajuste o valor.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ModalBody>

          <ModalFooter>
            <Button variant="light" onPress={handleClose}>
              Cancelar
            </Button>
            <Button
              color={tipo === "adicionar" ? "success" : "danger"}
              onPress={handleSubmit}
              isLoading={loading}
              isDisabled={
                !valor ||
                !motivo ||
                (tipo === "retirar" && parseFloat(valor) > saldoAtual)
              }
            >
              {tipo === "adicionar" ? "Adicionar Crédito" : "Retirar Crédito"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Histórico */}
      <HistoricoCreditosModal
        isOpen={modalHistoricoOpen}
        onClose={() => setModalHistoricoOpen(false)}
        clienteId={clienteId}
        clienteNome={clienteNome}
      />
    </>
  );
}
