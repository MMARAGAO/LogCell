"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Button,
  Tooltip,
  Accordion,
  AccordionItem,
} from "@heroui/react";
import { Wallet, Clock, TrendingUp, History, Info } from "lucide-react";
import type { CreditoCliente } from "@/types/vendas";

interface CreditosClientePanelProps {
  clienteId: string;
  creditos: CreditoCliente[];
  onReload?: () => void;
}

export function CreditosClientePanel({
  clienteId,
  creditos,
  onReload,
}: CreditosClientePanelProps) {
  const [mostrarTodos, setMostrarTodos] = useState(false);

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const totalDisponivel = creditos.reduce((sum, c) => sum + c.saldo, 0);
  const totalUtilizado = creditos.reduce(
    (sum, c) => sum + c.valor_utilizado,
    0
  );

  // Mostra apenas os 5 últimos por padrão
  const creditosExibidos = mostrarTodos ? creditos : creditos.slice(0, 5);
  const temMais = creditos.length > 5;

  if (creditos.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">
            Cliente não possui créditos disponíveis
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Resumo de Créditos */}
      <Card className="bg-gradient-to-br from-success-50 to-success-100">
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Créditos Disponíveis</p>
              <p className="text-3xl font-bold text-success">
                {formatarMoeda(totalDisponivel)}
              </p>
            </div>
            <div className="bg-success-100 p-3 rounded-full">
              <Wallet className="w-8 h-8 text-success" />
            </div>
          </div>

          {totalUtilizado > 0 && (
            <div className="mt-4 pt-4 border-t border-success-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total já utilizado:</span>
                <span className="font-semibold text-gray-800">
                  {formatarMoeda(totalUtilizado)}
                </span>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Lista de Créditos */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <span className="font-semibold">Histórico de Créditos</span>
          <Chip size="sm" variant="flat" color="primary">
            {creditos.length}
          </Chip>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-3">
          <Accordion variant="splitted" selectionMode="multiple">
            {creditosExibidos.map((credito) => (
              <AccordionItem
                key={credito.id}
                aria-label={`Crédito ${credito.venda_origem_id ? "de venda" : ""}`}
                title={
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-success-100">
                        <TrendingUp className="w-4 h-4 text-success" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          {credito.criado_em && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatarData(credito.criado_em)}
                            </span>
                          )}
                          {credito.saldo > 0 && (
                            <Chip size="sm" color="success" variant="flat">
                              Disponível
                            </Chip>
                          )}
                        </div>
                        {credito.venda_origem_id && (
                          <p className="text-xs text-gray-600 mt-1">
                            Origem: Venda #{credito.venda_origem_id.slice(0, 8)}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="font-bold text-lg text-success">
                      {formatarMoeda(credito.saldo)}
                    </p>
                  </div>
                }
              >
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Valor Total</p>
                      <p className="font-semibold text-sm">
                        {formatarMoeda(credito.valor_total)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Utilizado</p>
                      <p className="font-semibold text-sm text-warning">
                        {formatarMoeda(credito.valor_utilizado)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Saldo</p>
                      <p className="font-semibold text-sm text-success">
                        {formatarMoeda(credito.saldo)}
                      </p>
                    </div>
                  </div>
                </div>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Botão Ver Mais / Ver Menos */}
          {temMais && (
            <div className="flex justify-center pt-2">
              <Button
                variant="flat"
                color="primary"
                size="sm"
                onPress={() => setMostrarTodos(!mostrarTodos)}
              >
                {mostrarTodos
                  ? "Ver menos"
                  : `Ver mais (${creditos.length - 5} ${creditos.length - 5 === 1 ? "registro" : "registros"})`}
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Dica de Uso */}
      <Card className="bg-primary/10 border border-primary">
        <CardBody className="py-3">
          <div className="flex gap-2">
            <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold mb-1">Como usar os créditos?</p>
              <p>
                Na etapa de pagamento, selecione "Crédito Cliente" como forma de
                pagamento. O sistema utilizará automaticamente os créditos
                disponíveis mais antigos primeiro.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
