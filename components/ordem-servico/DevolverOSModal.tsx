"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  RadioGroup,
  Radio,
  Card,
  CardBody,
  Divider,
  Chip,
} from "@heroui/react";
import { AlertCircle, DollarSign, CreditCard, RefreshCw } from "lucide-react";
import type { OrdemServico } from "@/types/ordemServico";
import { formatarMoeda } from "@/lib/formatters";

interface DevolverOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  os: OrdemServico | null;
  onConfirm: (tipo: "reembolso" | "credito") => Promise<void>;
}

export default function DevolverOSModal({
  isOpen,
  onClose,
  os,
  onConfirm,
}: DevolverOSModalProps) {
  const [tipoDevolucao, setTipoDevolucao] = useState<"reembolso" | "credito">(
    "reembolso"
  );
  const [loading, setLoading] = useState(false);
  const [valorTotal, setValorTotal] = useState(0);
  const [pecas, setPecas] = useState<any[]>([]);

  useEffect(() => {
    if (os && isOpen) {
      carregarDadosOS();
    }
  }, [os, isOpen]);

  const carregarDadosOS = async () => {
    if (!os) return;

    try {
      const { supabase } = await import("@/lib/supabaseClient");

      // Carregar pagamentos
      const { data: pagamentos } = await supabase
        .from("ordem_servico_pagamentos")
        .select("valor")
        .eq("id_ordem_servico", os.id);

      const total = (pagamentos || []).reduce(
        (sum, pag) => sum + Number(pag.valor || 0),
        0
      );
      setValorTotal(total);

      // Carregar peças
      const { data: pecasData } = await supabase
        .from("ordem_servico_pecas")
        .select(
          `
          id,
          descricao_peca,
          quantidade,
          tipo_produto,
          estoque_baixado,
          produto:produtos(nome)
        `
        )
        .eq("id_ordem_servico", os.id);

      setPecas(pecasData || []);
    } catch (error) {
      console.error("Erro ao carregar dados da OS:", error);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(tipoDevolucao);
      onClose();
    } catch (error) {
      console.error("Erro ao devolver OS:", error);
    } finally {
      setLoading(false);
    }
  };

  const pecasEstoque = pecas.filter(
    (p) => p.tipo_produto === "estoque" && p.estoque_baixado
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      backdrop="blur"
      isDismissable={!loading}
      hideCloseButton={loading}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-warning" />
            <span>Devolver Ordem de Serviço</span>
          </div>
          <p className="text-sm text-default-500 font-normal">
            OS #{os?.numero_os} - {os?.cliente_nome}
          </p>
        </ModalHeader>

        <ModalBody>
          {/* Alerta */}
          <Card className="bg-warning-50 border-warning-200 border">
            <CardBody className="flex flex-row items-start gap-3 p-4">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-warning-800 font-medium">
                  Atenção: Esta ação não pode ser desfeita
                </p>
                <p className="text-xs text-warning-700 mt-1">
                  A devolução irá desfazer o serviço, devolver peças ao estoque
                  e processar o valor pago.
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Informações da OS */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Resumo da Devolução</h4>

            {/* Peças que retornarão ao estoque */}
            {pecasEstoque.length > 0 && (
              <Card>
                <CardBody className="p-3">
                  <p className="text-sm font-medium mb-2">
                    Peças que retornarão ao estoque:
                  </p>
                  <div className="space-y-1">
                    {pecasEstoque.map((peca) => (
                      <div
                        key={peca.id}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-default-600">
                          {peca.produto?.nome || peca.descricao_peca}
                        </span>
                        <Chip size="sm" variant="flat" color="success">
                          {peca.quantidade} un.
                        </Chip>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Valor total */}
            <Card>
              <CardBody className="p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Valor pago pelo cliente:
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {formatarMoeda(valorTotal)}
                  </span>
                </div>
              </CardBody>
            </Card>
          </div>

          <Divider className="my-2" />

          {/* Opções de devolução */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Como processar o valor?</h4>

            <RadioGroup
              value={tipoDevolucao}
              onValueChange={(value: string) =>
                setTipoDevolucao(value as "reembolso" | "credito")
              }
              isDisabled={loading}
            >
              <Card
                className={`cursor-pointer transition-all ${
                  tipoDevolucao === "reembolso"
                    ? "border-primary border-2"
                    : "border-default-200 border"
                }`}
                isPressable
                onPress={() => setTipoDevolucao("reembolso")}
              >
                <CardBody className="p-4">
                  <Radio value="reembolso" className="w-full">
                    <div className="flex items-start gap-3 w-full">
                      <DollarSign className="w-5 h-5 text-success mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">Reembolso em Dinheiro</p>
                        <p className="text-xs text-default-500 mt-1">
                          O valor de {formatarMoeda(valorTotal)} será devolvido
                          ao cliente em dinheiro. Será necessário retirar este
                          valor do caixa.
                        </p>
                      </div>
                    </div>
                  </Radio>
                </CardBody>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  tipoDevolucao === "credito"
                    ? "border-primary border-2"
                    : "border-default-200 border"
                }`}
                isPressable
                onPress={() => setTipoDevolucao("credito")}
              >
                <CardBody className="p-4">
                  <Radio value="credito" className="w-full">
                    <div className="flex items-start gap-3 w-full">
                      <CreditCard className="w-5 h-5 text-warning mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">Crédito para Cliente</p>
                        <p className="text-xs text-default-500 mt-1">
                          O valor de {formatarMoeda(valorTotal)} ficará
                          disponível como crédito para o cliente usar em futuras
                          compras ou serviços.
                        </p>
                      </div>
                    </div>
                  </Radio>
                </CardBody>
              </Card>
            </RadioGroup>
          </div>

          {/* Resumo do que será feito */}
          <Card className="bg-default-50">
            <CardBody className="p-3">
              <p className="text-xs font-medium text-default-700 mb-2">
                O que será feito:
              </p>
              <ul className="text-xs text-default-600 space-y-1 list-disc list-inside">
                {pecasEstoque.length > 0 && (
                  <li>
                    {pecasEstoque.length} peça(s) será(ão) devolvida(s) ao
                    estoque
                  </li>
                )}
                <li>Status da OS mudará para "Devolvida"</li>
                <li>Pagamentos serão removidos do registro da OS</li>
                {tipoDevolucao === "reembolso" && (
                  <li className="text-warning-700 font-medium">
                    Reembolso de {formatarMoeda(valorTotal)} será registrado
                  </li>
                )}
                {tipoDevolucao === "credito" && (
                  <li className="text-warning-700 font-medium">
                    Crédito de {formatarMoeda(valorTotal)} será gerado para o
                    cliente
                  </li>
                )}
              </ul>
            </CardBody>
          </Card>
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={loading}>
            Cancelar
          </Button>
          <Button
            color="warning"
            onPress={handleConfirm}
            isLoading={loading}
            startContent={!loading && <RefreshCw className="w-4 h-4" />}
          >
            Confirmar Devolução
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
