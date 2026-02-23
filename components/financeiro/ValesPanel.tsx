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
import { ValeFuncionario } from "@/services/financeiroService";
import { FuncionarioSelect } from "./FuncionarioSelect";
import {
  getValesFuncionario,
  criarValeFuncionario,
  atualizarValeFuncionario,
  deletarValeFuncionario,
} from "@/services/financeiroService";
import { useNotificacao } from "@/hooks/useNotificacao";

export function ValesPanel({
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
  const [vales, setVales] = useState<ValeFuncionario[]>([]);
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<ValeFuncionario>>({
    status: "solicitado",
  });

  const carregarVales = async () => {
    try {
      setLoading(true);
      const data = await getValesFuncionario(
        undefined,
        undefined,
        mes,
        ano,
        dataInicio,
        dataFim,
      );

      setVales(data);
    } catch (err) {
      error("Erro ao carregar vales");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletar = async (id: string) => {
    try {
      await deletarValeFuncionario(id);
      success("Vale deletado");
      carregarVales();
    } catch (err) {
      error("Erro ao deletar vale");
      console.error(err);
    }
  };

  useEffect(() => {
    carregarVales();
  }, [mes, ano, dataInicio, dataFim]);

  const handleSalvar = async () => {
    try {
      if (!formData.funcionario_id || !formData.valor) {
        error("Preencha todos os campos obrigatórios");

        return;
      }

      const dados = {
        ...formData,
        data_solicitacao:
          formData.data_solicitacao || new Date().toISOString().split("T")[0],
      } as Omit<ValeFuncionario, "id" | "criado_em" | "atualizado_em">;

      if (editingId) {
        await atualizarValeFuncionario(editingId, dados);
        success("Vale atualizado");
      } else {
        await criarValeFuncionario(dados);
        success("Vale criado");
      }

      setFormData({ status: "solicitado" });
      setEditingId(null);
      carregarVales();
      onOpenChange();
    } catch (err) {
      error("Erro ao salvar vale");
      console.error(err);
    }
  };

  const totalVales = vales.reduce((acc, v) => acc + (v.valor || 0), 0);
  const totalPagos = vales
    .filter((v) => v.status === "pago")
    .reduce((acc, v) => acc + (v.valor || 0), 0);

  return (
    <div className="space-y-4 rounded-lg border border-default-200 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Vales de Funcionários</h3>
        <Button
          color="primary"
          size="sm"
          onClick={() => {
            setEditingId(null);
            setFormData({ status: "solicitado" });
            onOpen();
          }}
        >
          + Adicionar
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-2 rounded-lg bg-default-100 p-3">
        <div>
          <p className="text-xs text-default-500">Total Vales</p>
          <p className="text-lg font-bold">{vales.length}</p>
        </div>
        <div>
          <p className="text-xs text-default-500">Aberto</p>
          <p className="text-lg font-bold text-warning">
            {(totalVales - totalPagos).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>
        <div>
          <p className="text-xs text-default-500">Pago</p>
          <p className="text-lg font-bold text-success">
            {totalPagos.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>
        <div>
          <p className="text-xs text-default-500">Total</p>
          <p className="text-lg font-bold">
            {totalVales.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>
      </div>

      <Table isCompact removeWrapper>
        <TableHeader>
          <TableColumn>Funcionário</TableColumn>
          <TableColumn>Descrição</TableColumn>
          <TableColumn>Valor</TableColumn>
          <TableColumn>Data Solicitação</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn>Ações</TableColumn>
        </TableHeader>
        <TableBody emptyContent="Nenhum vale registrado">
          {vales.map((vale) => (
            <TableRow key={vale.id}>
              <TableCell>{vale.funcionario_nome}</TableCell>
              <TableCell>{vale.descricao}</TableCell>
              <TableCell className="font-semibold">
                {(vale.valor || 0).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </TableCell>
              <TableCell>
                {new Date(vale.data_solicitacao).toLocaleDateString("pt-BR")}
              </TableCell>
              <TableCell>
                <span
                  className={`text-xs font-semibold capitalize ${
                    vale.status === "pago"
                      ? "text-success"
                      : vale.status === "cancelado"
                        ? "text-danger"
                        : "text-warning"
                  }`}
                >
                  {vale.status === "pago" ? "✓ Pago" : "○ " + vale.status}
                </span>
              </TableCell>
              <TableCell>
                <Dropdown>
                  <DropdownTrigger>
                    <Button isIconOnly size="sm" variant="light">
                      <EllipsisVerticalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Acoes do vale">
                    <DropdownItem
                      key="editar"
                      startContent={<PencilIcon className="h-4 w-4" />}
                      onPress={() => {
                        setEditingId(vale.id || null);
                        setFormData({
                          funcionario_id: vale.funcionario_id,
                          descricao: vale.descricao || "",
                          valor: vale.valor || 0,
                          data_solicitacao: vale.data_solicitacao,
                          data_pagamento: vale.data_pagamento || "",
                          status: vale.status || "solicitado",
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
                      onPress={() => handleDeletar(vale.id || "")}
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
          <ModalHeader>Vale de Funcionário</ModalHeader>
          <ModalBody className="space-y-3">
            <FuncionarioSelect
              required
              label="Funcionário"
              placeholder="Busque e selecione o funcionário"
              value={formData.funcionario_id || ""}
              onChange={(value) =>
                setFormData({ ...formData, funcionario_id: value })
              }
            />
            <Input
              label="Descrição"
              placeholder="Motivo do vale"
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
              label="Data de Pagamento"
              type="date"
              value={formData.data_pagamento || ""}
              onValueChange={(value) =>
                setFormData({ ...formData, data_pagamento: value })
              }
            />
            <Select
              label="Status"
              selectedKeys={[formData.status || "solicitado"]}
              onSelectionChange={(keys) =>
                setFormData({
                  ...formData,
                  status: (keys as Set<string>).values().next().value as any,
                })
              }
            >
              <SelectItem key="solicitado">Solicitado</SelectItem>
              <SelectItem key="aprovado">Aprovado</SelectItem>
              <SelectItem key="pago">Pago</SelectItem>
              <SelectItem key="cancelado">Cancelado</SelectItem>
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
