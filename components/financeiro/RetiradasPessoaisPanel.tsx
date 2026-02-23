"use client";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
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
import { RetiradaPessoal } from "@/services/financeiroService";
import {
  getRetiradasPessoais,
  criarRetiradaPessoal,
  atualizarRetiradaPessoal,
  deletarRetiradaPessoal,
} from "@/services/financeiroService";
import { useAuth } from "@/hooks/useAuth";
import { useNotificacao } from "@/hooks/useNotificacao";

export function RetiradasPessoaisPanel({
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
  const { usuario: user } = useAuth();
  const [retiradas, setRetiradas] = useState<RetiradaPessoal[]>([]);
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<RetiradaPessoal>>({});

  const carregarRetiradas = async () => {
    try {
      setLoading(true);
      const data = await getRetiradasPessoais(
        undefined,
        mes,
        ano,
        dataInicio,
        dataFim,
      );

      setRetiradas(data);
    } catch (err) {
      error("Erro ao carregar retiradas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletarRetirada = async (id: string) => {
    try {
      await deletarRetiradaPessoal(id);
      success("Retirada deletada");
      carregarRetiradas();
    } catch (err) {
      error("Erro ao deletar retirada");
      console.error(err);
    }
  };

  useEffect(() => {
    carregarRetiradas();
  }, [mes, ano, dataInicio, dataFim]);

  const handleSalvar = async () => {
    try {
      if (!formData.valor || !user?.id) {
        error("Preencha todos os campos obrigatórios");

        return;
      }

      const dados = {
        usuario_id: user.id,
        valor: formData.valor,
        motivo: formData.motivo,
        data_retirada:
          formData.data_retirada || new Date().toISOString().split("T")[0],
        observacoes: formData.observacoes,
      } as Omit<RetiradaPessoal, "id" | "criado_em" | "atualizado_em">;

      if (editingId) {
        await atualizarRetiradaPessoal(editingId, dados);
        success("Retirada atualizada");
      } else {
        await criarRetiradaPessoal(dados);
        success("Retirada registrada");
      }

      setFormData({});
      setEditingId(null);
      carregarRetiradas();
      onOpenChange();
    } catch (err) {
      error("Erro ao salvar retirada");
      console.error(err);
    }
  };

  const totalRetiradas = retiradas.reduce((acc, r) => acc + (r.valor || 0), 0);

  return (
    <div className="space-y-4 rounded-lg border border-default-200 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Retiradas Pessoais</h3>
        <Button
          color="primary"
          size="sm"
          onClick={() => {
            setEditingId(null);
            setFormData({});
            onOpen();
          }}
        >
          + Adicionar
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-lg bg-default-100 p-3">
        <div>
          <p className="text-xs text-default-500">Total Retiradas</p>
          <p className="text-lg font-bold">{retiradas.length}</p>
        </div>
        <div>
          <p className="text-xs text-default-500">Valor Total</p>
          <p className="text-lg font-bold text-danger">
            {totalRetiradas.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>
        <div>
          <p className="text-xs text-default-500">Mês Atual</p>
          <p className="text-lg font-bold">
            {retiradas
              .filter(
                (r) =>
                  new Date(r.data_retirada).getMonth() ===
                  new Date().getMonth(),
              )
              .reduce((acc, r) => acc + (r.valor || 0), 0)
              .toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
          </p>
        </div>
      </div>

      <Table isCompact removeWrapper>
        <TableHeader>
          <TableColumn>Data</TableColumn>
          <TableColumn>Valor</TableColumn>
          <TableColumn>Motivo</TableColumn>
          <TableColumn>Observações</TableColumn>
          <TableColumn>Ações</TableColumn>
        </TableHeader>
        <TableBody emptyContent="Nenhuma retirada registrada">
          {retiradas.map((retirada) => (
            <TableRow key={retirada.id}>
              <TableCell>
                {new Date(retirada.data_retirada).toLocaleDateString("pt-BR")}
              </TableCell>
              <TableCell className="font-semibold">
                {(retirada.valor || 0).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </TableCell>
              <TableCell>{retirada.motivo || "-"}</TableCell>
              <TableCell className="text-xs text-default-500">
                {retirada.observacoes || "-"}
              </TableCell>
              <TableCell>
                <Dropdown>
                  <DropdownTrigger>
                    <Button isIconOnly size="sm" variant="light">
                      <EllipsisVerticalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Acoes da retirada">
                    <DropdownItem
                      key="editar"
                      startContent={<PencilIcon className="h-4 w-4" />}
                      onPress={() => {
                        setEditingId(retirada.id || null);
                        setFormData({
                          valor: retirada.valor || 0,
                          motivo: retirada.motivo || "",
                          data_retirada: retirada.data_retirada,
                          observacoes: retirada.observacoes || "",
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
                      onPress={() => handleDeletarRetirada(retirada.id || "")}
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
          <ModalHeader>Nova Retirada Pessoal</ModalHeader>
          <ModalBody className="space-y-3">
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
              label="Motivo"
              placeholder="Motivo da retirada"
              value={formData.motivo || ""}
              onValueChange={(value) =>
                setFormData({ ...formData, motivo: value })
              }
            />
            <Input
              label="Data da Retirada"
              type="date"
              value={formData.data_retirada || ""}
              onValueChange={(value) =>
                setFormData({ ...formData, data_retirada: value })
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
