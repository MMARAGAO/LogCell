"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { useState, useEffect } from "react";
import { Calculator } from "lucide-react";

import { simularTaxaCartao } from "@/services/taxasCartaoService";
import { formatarMoeda } from "@/lib/formatters";

interface SimuladorTaxasModalProps {
  isOpen: boolean;
  onClose: () => void;
  lojaId?: number | null;
}

interface Resultado {
  taxa_percentual: number;
  valor_bruto: number; // o que o cliente paga
  valor_taxa: number; // taxa em R$
  valor_liquido: number; // o que a loja recebe
  parcelas: number;
}

export default function SimuladorTaxasModal({
  isOpen,
  onClose,
  lojaId,
}: SimuladorTaxasModalProps) {
  const [valor, setValor] = useState("");
  const [forma, setForma] = useState<"cartao_credito" | "cartao_debito">(
    "cartao_credito",
  );
  const [parcelas, setParcelas] = useState(1);
  const [taxaInclusa, setTaxaInclusa] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [calculando, setCalculando] = useState(false);

  // Resetar ao abrir
  useEffect(() => {
    if (isOpen) {
      setValor("");
      setForma("cartao_credito");
      setParcelas(1);
      setTaxaInclusa(false);
      setResultado(null);
    }
  }, [isOpen]);

  // Recalcular ao mudar qualquer parâmetro (com debounce)
  useEffect(() => {
    const valorNum = parseFloat(valor.replace(",", "."));

    if (!isOpen || !valorNum || valorNum <= 0) {
      setResultado(null);

      return;
    }

    setCalculando(true);
    const timer = setTimeout(async () => {
      try {
        const r = await simularTaxaCartao({
          valor_bruto: valorNum,
          tipo_produto: "aparelho",
          forma_pagamento: forma,
          parcelas: forma === "cartao_credito" ? parcelas : 1,
          loja_id: lojaId ?? undefined,
          taxa_inclusa: taxaInclusa,
        });

        setResultado({
          taxa_percentual: r.taxa_percentual,
          valor_bruto: r.valor_bruto,
          valor_taxa: r.valor_taxa,
          valor_liquido: r.valor_liquido,
          parcelas: r.parcelas,
        });
      } catch {
        setResultado(null);
      } finally {
        setCalculando(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [valor, forma, parcelas, taxaInclusa, lojaId, isOpen]);

  return (
    <Modal isOpen={isOpen} placement="center" size="lg" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Simulador de Taxas de Cartão
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Valor"
              labelPlacement="outside"
              placeholder="0,00"
              startContent={
                <span className="text-default-400 text-sm">R$</span>
              }
              type="number"
              value={valor}
              variant="bordered"
              onChange={(e) => setValor(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Forma de pagamento"
                labelPlacement="outside"
                selectedKeys={[forma]}
                variant="bordered"
                onChange={(e) =>
                  setForma(e.target.value as "cartao_credito" | "cartao_debito")
                }
              >
                <SelectItem key="cartao_credito">Cartão de Crédito</SelectItem>
                <SelectItem key="cartao_debito">Cartão de Débito</SelectItem>
              </Select>

              <Select
                isDisabled={forma !== "cartao_credito"}
                label="Parcelas"
                labelPlacement="outside"
                selectedKeys={[String(parcelas)]}
                variant="bordered"
                onChange={(e) => setParcelas(Number(e.target.value))}
              >
                {Array.from({ length: 18 }, (_, i) => i + 1).map((n) => (
                  <SelectItem key={String(n)}>{`${n}x`}</SelectItem>
                ))}
              </Select>
            </div>

            <Select
              description={
                taxaInclusa
                  ? "O valor digitado é o que o cliente paga; a loja absorve a taxa."
                  : "O valor digitado é o preço; a taxa é somada por cima ao cliente."
              }
              label="Modo da taxa"
              labelPlacement="outside"
              selectedKeys={[taxaInclusa ? "inclusa" : "aparte"]}
              variant="bordered"
              onChange={(e) => setTaxaInclusa(e.target.value === "inclusa")}
            >
              <SelectItem key="aparte">Taxa à parte (cliente paga)</SelectItem>
              <SelectItem key="inclusa">Taxa inclusa (loja absorve)</SelectItem>
            </Select>

            {/* Resultado */}
            {resultado && (
              <div className="rounded-xl border border-default-200/70 bg-default-50 dark:bg-default-100/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-default-500">
                    Taxa aplicada
                  </span>
                  <span className="text-sm font-semibold text-danger tabular-nums">
                    {resultado.taxa_percentual.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-default-500">Cliente paga</span>
                  <span className="text-base font-semibold text-foreground tabular-nums">
                    {formatarMoeda(resultado.valor_bruto)}
                  </span>
                </div>
                {resultado.parcelas > 1 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-default-500">Parcela</span>
                    <span className="text-sm font-medium text-default-600 tabular-nums">
                      {resultado.parcelas}x{" "}
                      {formatarMoeda(
                        resultado.valor_bruto / resultado.parcelas,
                      )}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-default-500">Taxa (R$)</span>
                  <span className="text-sm font-medium text-danger tabular-nums">
                    - {formatarMoeda(resultado.valor_taxa)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-default-200/70">
                  <span className="text-sm font-semibold text-default-700">
                    Você recebe (líquido)
                  </span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatarMoeda(resultado.valor_liquido)}
                  </span>
                </div>
              </div>
            )}

            {!resultado && (
              <p className="text-sm text-default-400 text-center py-4">
                {calculando
                  ? "Calculando..."
                  : "Digite um valor para simular a taxa."}
              </p>
            )}
          </div>
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
