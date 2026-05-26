"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Divider,
  Card,
  CardBody,
} from "@heroui/react";
import {
  X,
  ShoppingBag,
  DollarSign,
  Gift,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import { supabase } from "@/lib/supabaseClient";
import { formatarMoeda } from "@/lib/formatters";
import type { Aparelho } from "@/types/aparelhos";

interface DetalhesPagamentoAparelhoModalProps {
  isOpen: boolean;
  onClose: () => void;
  aparelho: Aparelho;
}

const TIPOS_PAGAMENTO_LABEL: Record<string, string> = {
  dinheiro: "Dinheiro",
  pix: "PIX",
  cartao_credito: "Cartão de Crédito",
  cartao_debito: "Cartão de Débito",
  transferencia: "Transferência",
  boleto: "Boleto",
};

export function DetalhesPagamentoAparelhoModal({
  isOpen,
  onClose,
  aparelho,
}: DetalhesPagamentoAparelhoModalProps) {
  const [venda, setVenda] = useState<any>(null);
  const [pagamentos, setPagamentos] = useState<any[]>([]);
  const [brindes, setBrindes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && aparelho.venda_id) {
      carregarDados();
    }
  }, [isOpen, aparelho.venda_id]);

  async function carregarDados() {
    setLoading(true);
    try {
      const [vendaRes, pagamentosRes, brindesRes] = await Promise.all([
        supabase
          .from("vendas")
          .select("*")
          .eq("id", aparelho.venda_id)
          .single(),
        supabase
          .from("pagamentos_venda")
          .select("*")
          .eq("venda_id", aparelho.venda_id)
          .order("criado_em"),
        supabase
          .from("brindes_aparelhos")
          .select("*")
          .eq("venda_id", aparelho.venda_id)
          .order("criado_em"),
      ]);

      if (vendaRes.error) throw vendaRes.error;
      setVenda(vendaRes.data);
      setPagamentos(pagamentosRes.data || []);
      setBrindes(brindesRes.data || []);
    } catch (err) {
      console.error("Erro ao carregar dados da venda:", err);
    } finally {
      setLoading(false);
    }
  }

  const totalPago = venda?.valor_pago || 0;
  const custoBrindes = brindes.reduce(
    (s: number, b: any) => s + Number(b.valor_custo || 0),
    0,
  );
  const lucro = totalPago - (aparelho.valor_compra || 0) - custoBrindes;

  return (
    <Modal isOpen={isOpen} size="2xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <span>Detalhes do Pagamento</span>
        </ModalHeader>
        <Divider />
        <ModalBody className="gap-4 py-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <p className="text-default-500">Carregando...</p>
            </div>
          ) : (
            <>
              {/* Dados do Aparelho */}
              <Card>
                <CardBody className="gap-1">
                  <p className="text-sm font-semibold">
                    {aparelho.marca} {aparelho.modelo}
                  </p>
                  {aparelho.imei && (
                    <p className="text-xs text-default-500">
                      IMEI: {aparelho.imei}
                    </p>
                  )}
                  {aparelho.numero_serie && (
                    <p className="text-xs text-default-500">
                      Nº Série: {aparelho.numero_serie}
                    </p>
                  )}
                  <div className="flex gap-4 mt-2 text-sm">
                    <span>
                      Venda:{" "}
                      <strong className="text-success">
                        {formatarMoeda(aparelho.valor_venda || 0)}
                      </strong>
                    </span>
                    <span>
                      Custo:{" "}
                      <strong className="text-danger">
                        {formatarMoeda(aparelho.valor_compra || 0)}
                      </strong>
                    </span>
                  </div>
                </CardBody>
              </Card>

              {/* Pagamentos */}
              {pagamentos.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold flex items-center gap-1">
                    <DollarSign className="w-4 h-4" /> Pagamentos
                  </p>
                  <div className="space-y-1">
                    {pagamentos.map((pag: any) => (
                      <div
                        key={pag.id}
                        className="flex items-center justify-between bg-default-50 p-2.5 rounded-lg text-sm"
                      >
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {TIPOS_PAGAMENTO_LABEL[pag.tipo_pagamento] ||
                                pag.tipo_pagamento}
                            </span>
                            {pag.parcelas > 1 && (
                              <Chip size="sm" variant="flat">
                                {pag.parcelas}x
                              </Chip>
                            )}
                          </div>
                          <div className="flex gap-3 text-[11px] text-default-500">
                            {pag.taxa_percentual && (
                              <span>
                                Taxa:{" "}
                                <strong className="text-danger">
                                  {Number(pag.taxa_percentual).toFixed(2)}%
                                </strong>
                              </span>
                            )}
                            {pag.liquido && (
                              <span>
                                Líquido:{" "}
                                <strong className="text-success">
                                  {formatarMoeda(Number(pag.liquido))}
                                </strong>
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="font-semibold">
                          {formatarMoeda(pag.valor)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Brindes */}
              {brindes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold flex items-center gap-1">
                    <Gift className="w-4 h-4" /> Brindes
                  </p>
                  <div className="space-y-1">
                    {brindes.map((b: any) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between bg-default-50 p-2 rounded-lg text-sm"
                      >
                        <span>{b.descricao}</span>
                        <span className="font-semibold text-danger">
                          - {formatarMoeda(Number(b.valor_custo))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Divider />

              {/* Resumo Financeiro */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Pago:</span>
                  <span className="font-semibold text-success">
                    {formatarMoeda(totalPago)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Saldo Devedor:</span>
                  <span
                    className={`font-semibold ${(venda?.saldo_devedor || 0) > 0 ? "text-warning" : "text-success"}`}
                  >
                    {formatarMoeda(venda?.saldo_devedor || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Status:</span>
                  <Chip
                    color={
                      venda?.status === "concluida" ? "success" : "warning"
                    }
                    size="sm"
                    variant="flat"
                  >
                    {venda?.status === "concluida"
                      ? "Concluída"
                      : "Em andamento"}
                  </Chip>
                </div>
                {custoBrindes > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Custo Brindes:</span>
                    <span className="font-semibold text-danger">
                      - {formatarMoeda(custoBrindes)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="font-medium flex items-center gap-1">
                    {lucro >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-success" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-danger" />
                    )}
                    Lucro na Venda
                  </span>
                  <span
                    className={`font-bold text-base ${
                      lucro >= 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {formatarMoeda(lucro)}
                  </span>
                </div>
              </div>
            </>
          )}
        </ModalBody>
        <Divider />
        <ModalFooter>
          <Button
            startContent={<X className="w-4 h-4" />}
            variant="light"
            onPress={onClose}
          >
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
