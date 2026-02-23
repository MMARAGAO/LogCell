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
import { FolhaSalarial } from "@/services/financeiroService";
import { FuncionarioSelect } from "./FuncionarioSelect";
import {
  criarFolhaSalarial,
  deletarFolhaSalarial,
  getFolhasSalariais,
  atualizarFolhaSalarial,
} from "@/services/financeiroService";
import { useNotificacao } from "@/hooks/useNotificacao";

export function FolhaSalarialPanel({
  mes,
  ano,
  lojaId,
  dataInicio,
  dataFim,
}: {
  mes: number;
  ano: number;
  lojaId?: number;
  dataInicio?: string;
  dataFim?: string;
}) {
  const { success, error } = useNotificacao();
  const [folhas, setFolhas] = useState<FolhaSalarial[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<FolhaSalarial>>({
    mes,
    ano,
    status: "gerada",
    salario_base: 0,
    comissoes: 0,
    descontos: 0,
    vales: 0,
    bonificacoes: 0,
  });

  const carregarFolhas = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const data = await getFolhasSalariais(
        mes,
        ano,
        lojaId,
        dataInicio,
        dataFim,
      );

      setFolhas(data);
    } catch (err: any) {
      const errorMsg = err?.message || "Erro ao carregar folhas salariais";

      setLoadError(errorMsg);
      error(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarFolhas();
  }, [mes, ano, lojaId, dataInicio, dataFim]);

  const handleSalvar = async () => {
    try {
      if (!formData.funcionario_id) {
        error("Selecione um funcionário");

        return;
      }

      const totalLiquido =
        (formData.salario_base || 0) +
        (formData.comissoes || 0) +
        (formData.bonificacoes || 0) -
        (formData.descontos || 0) -
        (formData.vales || 0);

      const dados = {
        ...formData,
        total_liquido: totalLiquido,
        mes,
        ano,
        id_loja: lojaId,
      } as Omit<FolhaSalarial, "id" | "criado_em" | "atualizado_em">;

      if (editingId) {
        await atualizarFolhaSalarial(editingId, dados);
        success("Folha salarial atualizada");
      } else {
        await criarFolhaSalarial(dados);
        success("Folha salarial criada");
      }

      setFormData({
        mes,
        ano,
        status: "gerada",
        salario_base: 0,
        comissoes: 0,
        descontos: 0,
        vales: 0,
        bonificacoes: 0,
      });
      setEditingId(null);
      carregarFolhas();
      onOpenChange();
    } catch (err) {
      error("Erro ao salvar folha salarial");
      console.error(err);
    }
  };

  const handleDeletar = async (id: string) => {
    try {
      await deletarFolhaSalarial(id);
      success("Folha salarial deletada");
      carregarFolhas();
    } catch (err) {
      error("Erro ao deletar folha salarial");
      console.error(err);
    }
  };

  const totalLiquido =
    folhas.reduce((acc, f) => acc + (f.total_liquido || 0), 0) || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Folha Salarial</h3>
        <Button
          color="primary"
          size="sm"
          onClick={() => {
            setEditingId(null);
            setFormData({
              mes,
              ano,
              status: "gerada",
              salario_base: 0,
              comissoes: 0,
              descontos: 0,
              vales: 0,
              bonificacoes: 0,
            });
            onOpen();
          }}
        >
          + Adicionar
        </Button>
      </div>

      {loading && (
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center gap-3 py-8">
            <Spinner />
            <p className="text-sm text-default-500">
              Carregando folhas salariais...
            </p>
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

      {!loading && folhas.length > 0 && (
        <div className="grid grid-cols-3 gap-2 rounded-lg bg-default-100 p-3">
          <div>
            <p className="text-xs text-default-500">Total de Folhas</p>
            <p className="text-lg font-bold">{folhas.length}</p>
          </div>
          <div>
            <p className="text-xs text-default-500">Total Folha</p>
            <p className="text-lg font-bold">
              {totalLiquido.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-default-500">Pagas</p>
            <p className="text-lg font-bold">
              {folhas.filter((f) => f.status === "paga").length}
            </p>
          </div>
        </div>
      )}

      <Table isCompact removeWrapper>
        <TableHeader>
          <TableColumn>Funcionário</TableColumn>
          <TableColumn>Salário Base</TableColumn>
          <TableColumn>Comissões</TableColumn>
          <TableColumn>Total Líquido</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn>Ações</TableColumn>
        </TableHeader>
        <TableBody emptyContent="Nenhuma folha salarial registrada">
          {folhas.map((folha) => (
            <TableRow key={folha.id}>
              <TableCell>{folha.funcionario_nome || "Desconhecido"}</TableCell>
              <TableCell>
                {(folha.salario_base || 0).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </TableCell>
              <TableCell>
                {(folha.comissoes || 0).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </TableCell>
              <TableCell className="font-semibold">
                {(folha.total_liquido || 0).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </TableCell>
              <TableCell>
                <span className="text-xs font-semibold capitalize">
                  {folha.status === "paga" ? "✓ Paga" : "○ " + folha.status}
                </span>
              </TableCell>
              <TableCell>
                <Dropdown>
                  <DropdownTrigger>
                    <Button isIconOnly size="sm" variant="light">
                      <EllipsisVerticalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Acoes da folha">
                    <DropdownItem
                      key="editar"
                      startContent={<PencilIcon className="h-4 w-4" />}
                      onPress={() => {
                        setEditingId(folha.id || null);
                        setFormData({
                          funcionario_id: folha.funcionario_id,
                          salario_base: folha.salario_base || 0,
                          comissoes: folha.comissoes || 0,
                          bonificacoes: folha.bonificacoes || 0,
                          descontos: folha.descontos || 0,
                          vales: folha.vales || 0,
                          status: folha.status || "gerada",
                          data_pagamento: folha.data_pagamento || "",
                          observacoes: folha.observacoes || "",
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
                      onPress={() => handleDeletar(folha.id || "")}
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
          <ModalHeader>Folha Salarial</ModalHeader>
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
              label="Salário Base"
              startContent="R$"
              type="number"
              value={String(formData.salario_base || 0)}
              onValueChange={(value) =>
                setFormData({ ...formData, salario_base: Number(value) })
              }
            />
            <Input
              label="Comissões"
              startContent="R$"
              type="number"
              value={String(formData.comissoes || 0)}
              onValueChange={(value) =>
                setFormData({ ...formData, comissoes: Number(value) })
              }
            />
            <Input
              label="Bonificações"
              startContent="R$"
              type="number"
              value={String(formData.bonificacoes || 0)}
              onValueChange={(value) =>
                setFormData({ ...formData, bonificacoes: Number(value) })
              }
            />
            <Input
              label="Descontos"
              startContent="R$"
              type="number"
              value={String(formData.descontos || 0)}
              onValueChange={(value) =>
                setFormData({ ...formData, descontos: Number(value) })
              }
            />
            <Input
              label="Vales"
              startContent="R$"
              type="number"
              value={String(formData.vales || 0)}
              onValueChange={(value) =>
                setFormData({ ...formData, vales: Number(value) })
              }
            />
            <Select
              label="Status"
              selectedKeys={[formData.status || "gerada"]}
              onSelectionChange={(keys) =>
                setFormData({
                  ...formData,
                  status: (keys as Set<string>).values().next().value as any,
                })
              }
            >
              <SelectItem key="gerada">Gerada</SelectItem>
              <SelectItem key="paga">Paga</SelectItem>
              <SelectItem key="cancelada">Cancelada</SelectItem>
            </Select>
            <Input
              label="Data de Pagamento"
              type="date"
              value={formData.data_pagamento || ""}
              onValueChange={(value) =>
                setFormData({ ...formData, data_pagamento: value })
              }
            />
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
