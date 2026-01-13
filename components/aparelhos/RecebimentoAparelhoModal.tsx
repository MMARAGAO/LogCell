"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Select, SelectItem } from "@heroui/select";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/components/Toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { formatarMoeda } from "@/lib/formatters";
import { Aparelho } from "@/types/aparelhos";
import { Cliente } from "@/types/clientesTecnicos";
import { buscarClientes } from "@/services/clienteService";
import { criarPagamentoAparelho } from "@/services/pagamentoAparelhosService";
import { CadastroClienteModal } from "./CadastroClienteModal";

interface Pagamento {
  tipo: string;
  valor: number;
}

interface RecebimentoAparelhoModalProps {
  isOpen: boolean;
  onClose: (sucesso?: boolean) => void;
  aparelho: Aparelho;
}

const TIPOS_PAGAMENTO = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "pix", label: "PIX" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "cartao_debito", label: "Cartão de Débito" },
  { value: "transferencia", label: "Transferência" },
  { value: "boleto", label: "Boleto" },
];

export function RecebimentoAparelhoModal({
  isOpen,
  onClose,
  aparelho,
}: RecebimentoAparelhoModalProps) {
  const { showToast } = useToast();
  const { usuario } = useAuthContext();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<string>("");
  const [clienteBusca, setClienteBusca] = useState<string>("");
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [tipoPagamento, setTipoPagamento] = useState<string>("dinheiro");
  const [valorPagamento, setValorPagamento] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [cadastroClienteAberto, setCadastroClienteAberto] = useState(false);

  useEffect(() => {
    if (isOpen) {
      carregarClientes();
      setPagamentos([]);
      setClienteSelecionado("");
      setClienteBusca("");
      setValorPagamento("");
    }
  }, [isOpen]);

  async function carregarClientes() {
    try {
      const pageSize = 1000;
      let page = 1;
      const acumulado: Cliente[] = [];

      while (true) {
        const { data, error, count } = await buscarClientes({ page, pageSize });
        if (error) throw new Error(error);

        if (data && data.length > 0) {
          acumulado.push(...data);
        }

        const total = count || 0;
        if (!data || data.length < pageSize || acumulado.length >= total) {
          break;
        }

        // Evita loop infinito em caso de count inconsistente
        if (page >= 50) break;
        page += 1;
      }

      setClientes(acumulado);
    } catch (error: any) {
      console.error("Erro ao carregar clientes:", error);
      showToast(error.message || "Erro ao carregar clientes", "error");
    }
  }

  function adicionarPagamento() {
    if (!tipoPagamento || !valorPagamento) {
      showToast("Selecione tipo e valor do pagamento", "warning");
      return;
    }

    const valor = parseFloat(valorPagamento);
    if (valor <= 0) {
      showToast("Valor deve ser maior que zero", "warning");
      return;
    }

    const totalAtual = pagamentos.reduce((sum, p) => sum + p.valor, 0);
    if (totalAtual + valor > (aparelho.valor_venda || 0)) {
      showToast(
        `Total não pode ultrapassar ${formatarMoeda(aparelho.valor_venda || 0)}`,
        "warning"
      );
      return;
    }

    setPagamentos([...pagamentos, { tipo: tipoPagamento, valor }]);
    setValorPagamento("");
    setTipoPagamento("dinheiro");
  }

  function removerPagamento(index: number) {
    setPagamentos(pagamentos.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!clienteSelecionado) {
      showToast("Selecione um cliente", "warning");
      return;
    }

    if (pagamentos.length === 0) {
      showToast("Adicione pelo menos um pagamento", "warning");
      return;
    }

    const totalPago = pagamentos.reduce((sum, p) => sum + p.valor, 0);
    if (totalPago <= 0) {
      showToast("Valor total deve ser maior que zero", "warning");
      return;
    }

    try {
      setLoading(true);
      await criarPagamentoAparelho({
        aparelhoId: aparelho.id,
        clienteId: clienteSelecionado,
        valorVenda: aparelho.valor_venda || 0,
        pagamentos: pagamentos.map((p) => ({
          tipo_pagamento: p.tipo,
          valor: p.valor,
        })),
        usuarioId: usuario?.id || "",
      });

      showToast("Pagamento registrado com sucesso", "success");
      onClose(true);
    } catch (error: any) {
      console.error("Erro ao registrar pagamento:", error);
      showToast(error.message || "Erro ao registrar pagamento", "error");
    } finally {
      setLoading(false);
    }
  }

  const totalPago = pagamentos.reduce((sum, p) => sum + p.valor, 0);
  const saldoRestante = (aparelho.valor_venda || 0) - totalPago;

  return (
    <>
      <Modal isOpen={isOpen} onClose={() => onClose()} size="2xl">
        <ModalContent>
          <ModalHeader>
            Receber Pagamento - {aparelho.marca} {aparelho.modelo}
          </ModalHeader>
          <Divider />
          <ModalBody className="gap-4">
            {/* Aparelho Info */}
            <Card>
              <CardBody className="gap-2">
                <p className="text-sm text-default-500">Aparelho</p>
                <p className="font-semibold">
                  {aparelho.marca} {aparelho.modelo}
                </p>
                <p className="text-2xl font-bold text-success">
                  {formatarMoeda(aparelho.valor_venda || 0)}
                </p>
              </CardBody>
            </Card>

            {/* Seleção de Cliente */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold">Cliente</label>
                <Button
                  size="sm"
                  variant="light"
                  startContent={<PlusIcon className="w-4 h-4" />}
                  onPress={() => setCadastroClienteAberto(true)}
                >
                  Novo Cliente
                </Button>
              </div>
              <Autocomplete
                placeholder="Digite para buscar"
                defaultItems={clientes}
                inputValue={clienteBusca}
                onInputChange={setClienteBusca}
                selectedKey={clienteSelecionado}
                onSelectionChange={(key) =>
                  setClienteSelecionado((key as string) || "")
                }
                isClearable
              >
                {(item) => (
                  <AutocompleteItem key={item.id} textValue={item.nome}>
                    <div className="flex flex-col">
                      <span className="font-medium">{item.nome}</span>
                      {item.doc ? (
                        <span className="text-xs text-default-500">
                          {item.doc}
                        </span>
                      ) : null}
                    </div>
                  </AutocompleteItem>
                )}
              </Autocomplete>
            </div>

            {/* Adicionar Pagamentos */}
            <div className="space-y-3">
              <label className="text-sm font-semibold">
                Formas de Pagamento
              </label>
              <div className="flex gap-2">
                <Select
                  placeholder="Tipo"
                  selectedKeys={[tipoPagamento]}
                  onSelectionChange={(keys) =>
                    setTipoPagamento(Array.from(keys)[0] as string)
                  }
                  className="flex-1"
                >
                  {TIPOS_PAGAMENTO.map((tipo) => (
                    <SelectItem key={tipo.value}>{tipo.label}</SelectItem>
                  ))}
                </Select>
                <Input
                  type="number"
                  placeholder="Valor"
                  value={valorPagamento}
                  onValueChange={setValorPagamento}
                  className="flex-1"
                  startContent={
                    <span className="text-xs text-default-400">R$</span>
                  }
                />
                <Button isIconOnly color="primary" onPress={adicionarPagamento}>
                  <PlusIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Pagamentos Adicionados */}
            {pagamentos.length > 0 && (
              <Card>
                <CardHeader className="flex justify-between">
                  <span className="text-sm font-semibold">
                    Pagamentos Adicionados
                  </span>
                  <Chip size="sm" variant="flat">
                    {pagamentos.length}
                  </Chip>
                </CardHeader>
                <Divider />
                <CardBody>
                  <Table aria-label="Pagamentos adicionados">
                    <TableHeader>
                      <TableColumn>TIPO</TableColumn>
                      <TableColumn>VALOR</TableColumn>
                      <TableColumn className="w-12">AÇÃO</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {pagamentos.map((pag, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            {
                              TIPOS_PAGAMENTO.find((t) => t.value === pag.tipo)
                                ?.label
                            }
                          </TableCell>
                          <TableCell>{formatarMoeda(pag.valor)}</TableCell>
                          <TableCell>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              color="danger"
                              onPress={() => removerPagamento(idx)}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Resumo */}
                  <div className="mt-4 space-y-2 border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span>Total Pago:</span>
                      <span className="font-semibold text-success">
                        {formatarMoeda(totalPago)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Saldo Restante:</span>
                      <span
                        className={`font-semibold ${
                          saldoRestante > 0 ? "text-warning" : "text-success"
                        }`}
                      >
                        {formatarMoeda(saldoRestante)}
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </ModalBody>
          <Divider />
          <ModalFooter>
            <Button color="default" onPress={() => onClose()}>
              Cancelar
            </Button>
            <Button
              color="primary"
              onPress={handleSubmit}
              isLoading={loading}
              isDisabled={pagamentos.length === 0 || !clienteSelecionado}
            >
              Registrar Pagamento
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Cadastro Rápido */}
      <CadastroClienteModal
        isOpen={cadastroClienteAberto}
        onClose={async (cliente) => {
          setCadastroClienteAberto(false);
          if (cliente) {
            setClienteSelecionado(cliente.id);
            await carregarClientes();
          }
        }}
      />
    </>
  );
}
