"use client";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@heroui/react";
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
import { ContaFornecedor } from "@/services/financeiroService";
import { FornecedorSelect } from "./FornecedorSelect";
import {
  getContasFornecedor,
  criarContaFornecedor,
  atualizarContaFornecedor,
  deletarContaFornecedor,
} from "@/services/financeiroService";
import { useNotificacao } from "@/hooks/useNotificacao";

export function ContasFornecedorPanel({
  mes,
  ano,
  dataInicio,
  dataFim,
}: {
  mes?: number;
  ano?: number;
  dataInicio?: string;
  dataFim?: string;
}) {
  const { success, error } = useNotificacao();
  const [contas, setContas] = useState<ContaFornecedor[]>([]);
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<ContaFornecedor>>({
    status: "aberta",
  });

  const carregarContas = async () => {
    try {
      setLoading(true);
      const data = await getContasFornecedor(
        undefined,
        undefined,
        mes,
        ano,
        dataInicio,
        dataFim,
      );

      setContas(data);
    } catch (err) {
      error("Erro ao carregar contas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletar = async (id: string) => {
    try {
      await deletarContaFornecedor(id);
      success("Conta deletada");
      carregarContas();
    } catch (err) {
      error("Erro ao deletar conta");
      console.error(err);
    }
  };

  useEffect(() => {
    carregarContas();
  }, [mes, ano, dataInicio, dataFim]);

  const handleSalvar = async () => {
    try {
      if (!formData.fornecedor_id || !formData.valor) {
        error("Preencha todos os campos obrigatórios");

        return;
      }

      const dados = {
        ...formData,
      } as Omit<ContaFornecedor, "id" | "criado_em" | "atualizado_em">;

      if (editingId) {
        await atualizarContaFornecedor(editingId, dados);
        success("Conta atualizada");
      } else {
        await criarContaFornecedor(dados);
        success("Conta criada");
      }

      setFormData({ status: "aberta" });
      setEditingId(null);
      carregarContas();
      onOpenChange();
    } catch (err) {
      error("Erro ao salvar conta");
      console.error(err);
    }
  };

  const conatasAbertas = contas.filter((c) => c.status === "aberta");
  const contasPagas = contas.filter((c) => c.status === "paga");
  const totalAberto = conatasAbertas.reduce(
    (acc, c) => acc + (c.valor || 0),
    0,
  );
  const totalPago = contasPagas.reduce((acc, c) => acc + (c.valor || 0), 0);

  return (
    <div className="space-y-4 rounded-lg border border-default-200 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Contas de Fornecedores</h3>
        <Button
          color="primary"
          size="sm"
          onClick={() => {
            setEditingId(null);
            setFormData({ status: "aberta" });
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

      <Table isCompact removeWrapper>
        <TableHeader>
          <TableColumn>Fornecedor</TableColumn>
          <TableColumn>Descrição</TableColumn>
          <TableColumn>Valor</TableColumn>
          <TableColumn>NF</TableColumn>
          <TableColumn>Vencimento</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn>Ações</TableColumn>
        </TableHeader>
        <TableBody emptyContent="Nenhuma conta registrada">
          {contas.map((conta) => (
            <TableRow key={conta.id}>
              <TableCell>{conta.fornecedor_nome}</TableCell>
              <TableCell>{conta.descricao}</TableCell>
              <TableCell className="font-semibold">
                {(conta.valor || 0).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </TableCell>
              <TableCell className="text-xs">
                {conta.numero_nf || "-"}
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
                          fornecedor_id: conta.fornecedor_id,
                          descricao: conta.descricao || "",
                          valor: conta.valor || 0,
                          numero_nf: conta.numero_nf || "",
                          data_vencimento: conta.data_vencimento,
                          status: conta.status || "aberta",
                          observacoes: conta.observacoes || "",
                        });
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

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>Conta de Fornecedor</ModalHeader>
          <ModalBody className="space-y-3">
            <FornecedorSelect
              required
              label="Fornecedor"
              placeholder="Busque e selecione o fornecedor"
              value={formData.fornecedor_id || ""}
              onChange={(value) =>
                setFormData({ ...formData, fornecedor_id: value })
              }
            />
            <Input
              label="Descrição"
              placeholder="Descrição da compra"
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
              label="Número NF"
              placeholder="Número da nota"
              value={formData.numero_nf || ""}
              onValueChange={(value) =>
                setFormData({ ...formData, numero_nf: value })
              }
            />
            <Input
              label="Juros"
              startContent="R$"
              type="number"
              value={String(formData.juros || 0)}
              onValueChange={(value) =>
                setFormData({ ...formData, juros: Number(value) })
              }
            />
            <Input
              label="Multa"
              startContent="R$"
              type="number"
              value={String(formData.multa || 0)}
              onValueChange={(value) =>
                setFormData({ ...formData, multa: Number(value) })
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
              onValueChange={(value) =>
                setFormData({ ...formData, data_vencimento: value })
              }
            />
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
