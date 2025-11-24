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
  Divider,
} from "@heroui/react";
import { Percent, DollarSign } from "lucide-react";
import { usePermissoes } from "@/hooks/usePermissoes";
import { useToast } from "@/components/Toast";

interface DescontoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAplicar: (
    tipo: "valor" | "porcentagem",
    valor: number,
    motivo: string
  ) => void;
  valorTotal: number;
}

export function DescontoModal({
  isOpen,
  onClose,
  onAplicar,
  valorTotal,
}: DescontoModalProps) {
  const [tipo, setTipo] = useState<"valor" | "porcentagem">("porcentagem");
  const [valor, setValor] = useState("");
  const [motivo, setMotivo] = useState("");
  const [descontoMaximo, setDescontoMaximo] = useState<number>(100);
  const { temPermissao, getDescontoMaximo } = usePermissoes();
  const toast = useToast();

  // Carregar desconto máximo permitido
  useEffect(() => {
    const carregarDescontoMaximo = async () => {
      if (temPermissao("vendas.aplicar_desconto")) {
        const max = await getDescontoMaximo();
        setDescontoMaximo(max);
      }
    };

    if (isOpen) {
      carregarDescontoMaximo();
    }
  }, [isOpen, temPermissao, getDescontoMaximo]);

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleValorChange = (novoValor: string) => {
    // Permitir string vazia
    if (novoValor === "") {
      setValor("");
      return;
    }

    // Validar formato numérico e limitar casas decimais
    const valorNumerico = parseFloat(novoValor);

    // Se não for número válido, ignorar
    if (isNaN(valorNumerico)) {
      return;
    }

    // Limitar a 2 casas decimais
    const valorFormatado = Math.round(valorNumerico * 100) / 100;

    // Se for percentual, limitar ao desconto máximo
    if (tipo === "porcentagem" && valorFormatado > descontoMaximo) {
      setValor(descontoMaximo.toString());
      return;
    }

    // Se for valor fixo, verificar se não excede o total E se respeita o limite percentual
    if (tipo === "valor") {
      // Calcular o percentual equivalente e valor máximo permitido
      const percentualEquivalente = (valorFormatado / valorTotal) * 100;
      const valorMaximoPermitido = (valorTotal * descontoMaximo) / 100;

      // Limitar ao menor valor entre: limite percentual ou total da venda
      const valorLimite = Math.min(valorMaximoPermitido, valorTotal);

      if (valorFormatado > valorLimite) {
        setValor(valorLimite.toFixed(2));
        return;
      }
    }

    // Garantir no máximo 2 casas decimais
    if (novoValor.includes(".")) {
      const partes = novoValor.split(".");
      if (partes[1] && partes[1].length > 2) {
        setValor(valorFormatado.toFixed(2));
        return;
      }
    }

    setValor(novoValor);
  };

  const calcularDesconto = () => {
    const valorNumerico = parseFloat(valor);
    if (!valorNumerico) return 0;

    if (tipo === "valor") {
      return valorNumerico;
    } else {
      return (valorTotal * valorNumerico) / 100;
    }
  };

  const handleAplicar = () => {
    // Verificar permissão
    if (!temPermissao("vendas.aplicar_desconto")) {
      toast.error("Você não tem permissão para aplicar descontos");
      return;
    }

    const valorNumerico = parseFloat(valor);
    if (!valorNumerico || valorNumerico <= 0) {
      toast.error("Informe um valor válido");
      return;
    }

    // Validar desconto máximo
    if (tipo === "porcentagem") {
      if (valorNumerico > 100) {
        toast.error("Percentual não pode ser maior que 100%");
        return;
      }

      if (valorNumerico > descontoMaximo) {
        toast.error(`Seu desconto máximo permitido é ${descontoMaximo}%`);
        return;
      }
    } else {
      // Para desconto em valor, calcular percentual equivalente
      const percentualEquivalente = (valorNumerico / valorTotal) * 100;
      if (percentualEquivalente > descontoMaximo) {
        const valorMaximoPermitido = (valorTotal * descontoMaximo) / 100;
        toast.error(
          `Desconto máximo permitido: ${descontoMaximo}% (${formatarMoeda(valorMaximoPermitido)})`
        );
        return;
      }
    }

    const valorDesconto = calcularDesconto();
    if (valorDesconto > valorTotal) {
      toast.error("Desconto não pode ser maior que o valor total");
      return;
    }

    if (!motivo.trim()) {
      toast.error("Informe o motivo do desconto");
      return;
    }

    onAplicar(tipo, valorNumerico, motivo);
    handleClose();
  };

  const handleClose = () => {
    setTipo("porcentagem");
    setValor("");
    setMotivo("");
    onClose();
  };

  const valorDesconto = calcularDesconto();
  const valorFinal = valorTotal - valorDesconto;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-success" />
            <span>Aplicar Desconto</span>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            {/* Tipo de desconto */}
            <Select
              label="Tipo de Desconto"
              selectedKeys={[tipo]}
              onChange={(e) =>
                setTipo(e.target.value as "valor" | "porcentagem")
              }
            >
              <SelectItem key="porcentagem">Percentual (%)</SelectItem>
              <SelectItem key="valor">Valor Fixo (R$)</SelectItem>
            </Select>

            {/* Mensagem de desconto máximo */}
            {descontoMaximo < 100 && (
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                <p className="text-sm text-warning-700">
                  <strong>Desconto máximo permitido:</strong> {descontoMaximo}%
                </p>
              </div>
            )}

            {/* Valor */}
            <Input
              label="Valor do Desconto"
              type="number"
              step="0.01"
              min="0"
              max={tipo === "porcentagem" ? descontoMaximo : valorTotal}
              value={valor}
              onChange={(e) => handleValorChange(e.target.value)}
              startContent={
                tipo === "porcentagem" ? (
                  <Percent className="w-4 h-4 text-gray-500" />
                ) : (
                  <DollarSign className="w-4 h-4 text-gray-500" />
                )
              }
              description={
                tipo === "porcentagem"
                  ? `Digite o percentual de desconto (máx: ${descontoMaximo}%)`
                  : "Digite o valor fixo do desconto"
              }
            />

            {/* Motivo */}
            <Input
              label="Motivo do Desconto"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex: Cliente fidelidade, promoção, etc."
            />

            <Divider />

            {/* Preview do desconto */}
            <div className="space-y-2 bg-default-100 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Valor Total:</span>
                <span className="font-semibold">
                  {formatarMoeda(valorTotal)}
                </span>
              </div>
              {valor && parseFloat(valor) > 0 && (
                <>
                  <div className="flex justify-between text-sm text-success">
                    <span>Desconto:</span>
                    <span className="font-semibold">
                      - {formatarMoeda(valorDesconto)}
                    </span>
                  </div>
                  <Divider />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Valor Final:</span>
                    <span className="text-primary">
                      {formatarMoeda(valorFinal)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            color="success"
            onClick={handleAplicar}
            isDisabled={!valor || !motivo.trim() || parseFloat(valor) <= 0}
          >
            Aplicar Desconto
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
