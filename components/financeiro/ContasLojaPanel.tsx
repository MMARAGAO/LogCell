"use client";

import {
  Button,
  Card,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@heroui/react";
import { Switch } from "@heroui/switch";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import {
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { ContaLoja } from "@/services/financeiroService";
import {
  getContasLoja,
  criarContaLojaRecorrente,
  gerarContasLojaRecorrentes,
  criarContaLoja,
  deletarContaLoja,
  atualizarContaLoja,
} from "@/services/financeiroService";
import { useNotificacao } from "@/hooks/useNotificacao";

export function ContasLojaPanel({
  lojaId,
  mes,
  ano,
  dataInicio,
  dataFim,
}: {
  lojaId?: number;
  mes?: number;
  ano?: number;
  dataInicio?: string;
  dataFim?: string;
}) {
  const { success, error } = useNotificacao();
  const [contas, setContas] = useState<ContaLoja[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [recorrenteAtiva, setRecorrenteAtiva] = useState(false);
  const [recorrenciaDia, setRecorrenciaDia] = useState<number>(
    new Date().getDate(),
  );

  const [formData, setFormData] = useState<Partial<ContaLoja>>({
    tipo: "aluguel",
    status: "aberta",
  });

  const carregarContas = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      if (lojaId && mes && ano) {
        await gerarContasLojaRecorrentes(lojaId, mes, ano);
      }
      const data = await getContasLoja(
        lojaId,
        undefined,
        mes,
        ano,
        dataInicio,
        dataFim,
      );

      setContas(data);
    } catch (err: any) {
      const errorMsg = err?.message || "Erro ao carregar contas";

      setLoadError(errorMsg);
      error(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarContas();
  }, [lojaId, mes, ano, dataInicio, dataFim]);

  const handleSalvar = async () => {
    try {
      if (
        !formData.descricao ||
        !formData.valor ||
        (!recorrenteAtiva && !formData.data_vencimento)
      ) {
        error("Preencha todos os campos obrigatórios");

        return;
      }
      if (!lojaId) {
        error("Selecione uma loja específica para criar/editar contas");

        return;
      }
      const dados = {
        ...formData,
        loja_id: lojaId,
      } as Omit<ContaLoja, "id" | "criado_em" | "atualizado_em">;

      if (editingId) {
        await atualizarContaLoja(editingId, dados);
        success("Contada atualizada");
      } else if (recorrenteAtiva) {
        if (!mes || !ano) {
          error("Selecione um periodo valido para gerar a recorrencia");

          return;
        }

        await criarContaLojaRecorrente({
          loja_id: lojaId,
          descricao: formData.descricao,
          tipo: formData.tipo || "aluguel",
          valor: formData.valor,
          desconto: formData.desconto || 0,
          periodicidade: "mensal",
          dia_vencimento: recorrenciaDia,
          ativo: true,
          observacoes: formData.observacoes || undefined,
        });

        await gerarContasLojaRecorrentes(lojaId, mes, ano);
        success("Conta recorrente criada");
      } else {
        await criarContaLoja(dados);
        success("Conta criada");
      }

      setFormData({ tipo: "aluguel", status: "aberta" });
      setEditingId(null);
      setRecorrenteAtiva(false);
      carregarContas();
      onOpenChange();
    } catch (err) {
      error("Erro ao salvar conta");
      console.error(err);
    }
  };

  const handleDeletar = async (id: string) => {
    try {
      await deletarContaLoja(id);
      success("Conta deletada");
      carregarContas();
    } catch (err) {
      error("Erro ao deletar conta");
      console.error(err);
    }
  };

  const contasAbertas = contas.filter((c) => c.status === "aberta");
  const contasPagas = contas.filter((c) => c.status === "paga");
  const totalAberto = contasAbertas.reduce((acc, c) => acc + (c.valor || 0), 0);
  const totalPago = contasPagas.reduce((acc, c) => acc + (c.valor || 0), 0);

  const tiposContas = {
    aluguel: "🏪 Aluguel",
    internet: "📡 Internet",
    energia: "⚡ Energia",
    agua: "💧 Água",
    compras: "🛒 Compras",
    outro: "📋 Outro",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Contas da Loja</h3>
        <Button
          color="primary"
          size="sm"
          onClick={() => {
            setEditingId(null);
            setFormData({ tipo: "aluguel", status: "aberta" });
            setRecorrenteAtiva(false);
            setRecorrenciaDia(new Date().getDate());
            onOpen();
          }}
        >
          + Adicionar
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-2 rounded-lg bg-default-100 p-3">
        <div>
          <p className="text-xs text-default-500">Total Contas</p>
          <p className="text-lg font-bold">{contas.length}</p>
        </div>
        <div>
          <p className="text-xs text-default-500">Aberto</p>
          <p className="text-lg font-bold text-warning">
            {totalAberto.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>
        <div>
          <p className="text-xs text-default-500">Pago</p>
          <p className="text-lg font-bold text-success">
            {totalPago.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>
        <div>
          <p className="text-xs text-default-500">Vencidas</p>
          <p className="text-lg font-bold text-danger">
            {contas.filter((c) => c.status === "vencida").length}
          </p>
        </div>
      </div>

      {loading && (
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center gap-3 py-8">
            <Spinner />
            <p className="text-sm text-default-500">Carregando contas...</p>
          </div>
        </Card>
      )}

      {loadError && (
        <Card className="bg-danger/10 border border-danger p-4">
          <p className="text-sm text-danger font-semibold">❌ {loadError}</p>
          <p className="text-xs text-danger/70 mt-2">
            Verifique se a tabela existe no banco de dados
          </p>
        </Card>
      )}

      {!loading && (
        <Table isCompact removeWrapper>
          <TableHeader>
            <TableColumn>Tipo</TableColumn>
            <TableColumn>Descrição</TableColumn>
            <TableColumn>Valor</TableColumn>
            <TableColumn>Vencimento</TableColumn>
            <TableColumn>Status</TableColumn>
            <TableColumn>Ações</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Nenhuma conta registrada">
            {contas.map((conta) => (
              <TableRow key={conta.id}>
                <TableCell>
                  <span className="text-xs">
                    {tiposContas[conta.tipo as keyof typeof tiposContas] ||
                      conta.tipo}
                  </span>
                </TableCell>
                <TableCell>{conta.descricao}</TableCell>
                <TableCell className="font-semibold">
                  {(conta.valor || 0).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </TableCell>
                <TableCell>
                  {new Date(conta.data_vencimento).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell>
                  <span
                    className={`text-xs font-semibold capitalize ${
                      conta.status === "paga"
                        ? "text-success"
                        : conta.status === "vencida"
                          ? "text-danger"
                          : "text-warning"
                    }`}
                  >
                    {conta.status === "paga"
                      ? "✓ Paga"
                      : conta.status === "vencida"
                        ? "⚠ Vencida"
                        : "○ " + conta.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button isIconOnly size="sm" variant="light">
                        <EllipsisVerticalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Acoes da conta">
                      <DropdownItem
                        key="editar"
                        startContent={<PencilIcon className="h-4 w-4" />}
                        onPress={() => {
                          setEditingId(conta.id || null);
                          setFormData({
                            tipo: conta.tipo,
                            descricao: conta.descricao,
                            valor: conta.valor || 0,
                            data_vencimento: conta.data_vencimento,
                            status: conta.status,
                            observacoes: conta.observacoes || "",
                          });
                          setRecorrenteAtiva(false);
                          onOpen();
                        }}
                      >
                        Editar
                      </DropdownItem>
                      <DropdownItem
                        key="excluir"
                        className="text-danger"
                        color="danger"
                        startContent={<TrashIcon className="h-4 w-4" />}
                        onPress={() => handleDeletar(conta.id || "")}
                      >
                        Excluir
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>Conta da Loja</ModalHeader>
          <ModalBody className="space-y-3">
            <Select
              label="Tipo de Conta"
              selectedKeys={[formData.tipo || "aluguel"]}
              onSelectionChange={(keys) =>
                setFormData({
                  ...formData,
                  tipo: (keys as Set<string>).values().next().value as any,
                })
              }
            >
              <SelectItem key="aluguel">🏪 Aluguel</SelectItem>
              <SelectItem key="internet">📡 Internet</SelectItem>
              <SelectItem key="energia">⚡ Energia</SelectItem>
              <SelectItem key="agua">💧 Água</SelectItem>
              <SelectItem key="compras">🛒 Compras</SelectItem>
              <SelectItem key="outro">📋 Outro</SelectItem>
            </Select>
            <Input
              label="Descrição"
              placeholder="Descrição da conta"
              value={formData.descricao || ""}
              onValueChange={(value) =>
                setFormData({ ...formData, descricao: value })
              }
            />
            <Input
              label="Valor"
              startContent="R$"
              type="number"
              value={String(formData.valor || 0)}
              onValueChange={(value) =>
                setFormData({ ...formData, valor: Number(value) })
              }
            />
            <Input
              label="Desconto"
              startContent="R$"
              type="number"
              value={String(formData.desconto || 0)}
              onValueChange={(value) =>
                setFormData({ ...formData, desconto: Number(value) })
              }
            />
            <Input
              label="Data de Vencimento"
              type="date"
              value={formData.data_vencimento || ""}
              onValueChange={(value) => {
                setFormData({ ...formData, data_vencimento: value });
                if (recorrenteAtiva && value) {
                  const dia = Number(value.split("-")[2]);

                  if (!Number.isNaN(dia)) setRecorrenciaDia(dia);
                }
              }}
            />
            <Switch
              isDisabled={Boolean(editingId)}
              isSelected={recorrenteAtiva}
              onValueChange={setRecorrenteAtiva}
            >
              Conta recorrente
            </Switch>
            {recorrenteAtiva && (
              <Input
                label="Dia de vencimento (mensal)"
                max={31}
                min={1}
                type="number"
                value={String(recorrenciaDia)}
                onValueChange={(value) => setRecorrenciaDia(Number(value || 1))}
              />
            )}
            <Input
              label="Data de Pagamento"
              type="date"
              value={formData.data_pagamento || ""}
              onValueChange={(value) =>
                setFormData({ ...formData, data_pagamento: value })
              }
            />
            <Select
              label="Status"
              selectedKeys={[formData.status || "aberta"]}
              onSelectionChange={(keys) =>
                setFormData({
                  ...formData,
                  status: (keys as Set<string>).values().next().value as any,
                })
              }
            >
              <SelectItem key="aberta">Aberta</SelectItem>
              <SelectItem key="paga">Paga</SelectItem>
              <SelectItem key="vencida">Vencida</SelectItem>
              <SelectItem key="cancelada">Cancelada</SelectItem>
            </Select>
            <Input
              label="Observações"
              placeholder="Notas adicionais"
              value={formData.observacoes || ""}
              onValueChange={(value) =>
                setFormData({ ...formData, observacoes: value })
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button color="default" onPress={() => onOpenChange()}>
              Cancelar
            </Button>
            <Button color="primary" onPress={handleSalvar}>
              Salvar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
