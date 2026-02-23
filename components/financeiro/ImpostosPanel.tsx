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
import { ImpostoConta } from "@/services/financeiroService";
import {
  getImpostosConta,
  criarImpostoConta,
  atualizarImpostoConta,
  deletarImpostoConta,
} from "@/services/financeiroService";
import { useNotificacao } from "@/hooks/useNotificacao";

export function ImpostosPanel({
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
  const [impostos, setImpostos] = useState<ImpostoConta[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<ImpostoConta>>({
    tipo: "simples_nacional",
    status: "aberta",
  });

  const carregarImpostos = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const data = await getImpostosConta(
        undefined,
        undefined,
        lojaId,
        mes,
        ano,
        dataInicio,
        dataFim,
      );

      setImpostos(data);
    } catch (err: any) {
      const errorMsg = err?.message || "Erro ao carregar impostos";

      setLoadError(errorMsg);
      error(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarImpostos();
  }, [lojaId, mes, ano, dataInicio, dataFim]);

  const handleDeletar = async (id: string) => {
    try {
      await deletarImpostoConta(id);
      success("Imposto deletado");
      carregarImpostos();
    } catch (err) {
      error("Erro ao deletar imposto");
      console.error(err);
    }
  };

  const handleSalvar = async () => {
    try {
      if (!formData.descricao || !formData.valor) {
        error("Preencha todos os campos obrigatórios");

        return;
      }

      if (!lojaId) {
        error("Selecione uma loja específica para criar/editar impostos");

        return;
      }

      const dados = {
        ...formData,
        loja_id: lojaId,
      } as Omit<ImpostoConta, "id" | "criado_em" | "atualizado_em">;

      if (editingId) {
        await atualizarImpostoConta(editingId, dados);
        success("Imposto atualizado");
      } else {
        await criarImpostoConta(dados);
        success("Imposto criado");
      }

      setFormData({ tipo: "simples_nacional", status: "aberta" });
      setEditingId(null);
      carregarImpostos();
      onOpenChange();
    } catch (err) {
      error("Erro ao salvar imposto");
      console.error(err);
    }
  };

  const impostosAbertos = impostos.filter((i) => i.status === "aberta");
  const impostosPagos = impostos.filter((i) => i.status === "paga");
  const totalAberto = impostosAbertos.reduce(
    (acc, i) => acc + (i.valor || 0),
    0,
  );
  const totalPago = impostosPagos.reduce((acc, i) => acc + (i.valor || 0), 0);

  const tiposImpostos = {
    simples_nacional: "📊 Simples Nacional",
    icms: "🏪 ICMS",
    iss: "🏛️ ISS",
    das: "💼 DAS",
    irpj: "📋 IRPJ",
    csll: "📋 CSLL",
    outro: "📌 Outro",
  };

  return (
    <div className="space-y-4 rounded-lg border border-default-200 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Impostos e Tributos</h3>
        <Button
          color="primary"
          size="sm"
          onClick={() => {
            setEditingId(null);
            setFormData({ tipo: "simples_nacional", status: "aberta" });
            onOpen();
          }}
        >
          + Adicionar
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-2 rounded-lg bg-default-100 p-3">
        <div>
          <p className="text-xs text-default-500">Total Impostos</p>
          <p className="text-lg font-bold">{impostos.length}</p>
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
            {impostos.filter((i) => i.status === "vencida").length}
          </p>
        </div>
      </div>

      {loading && (
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center gap-3 py-8">
            <Spinner />
            <p className="text-sm text-default-500">Carregando impostos...</p>
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
          <TableBody emptyContent="Nenhum imposto registrado">
            {impostos.map((imposto) => (
              <TableRow key={imposto.id}>
                <TableCell>
                  <span className="text-xs">
                    {tiposImpostos[
                      imposto.tipo as keyof typeof tiposImpostos
                    ] || imposto.tipo}
                  </span>
                </TableCell>
                <TableCell>{imposto.descricao}</TableCell>
                <TableCell className="font-semibold">
                  {(imposto.valor || 0).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </TableCell>
                <TableCell>
                  {new Date(imposto.data_vencimento).toLocaleDateString(
                    "pt-BR",
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={`text-xs font-semibold capitalize ${
                      imposto.status === "paga"
                        ? "text-success"
                        : imposto.status === "vencida"
                          ? "text-danger"
                          : "text-warning"
                    }`}
                  >
                    {imposto.status === "paga"
                      ? "✓ Paga"
                      : imposto.status === "vencida"
                        ? "⚠ Vencida"
                        : "○ " + imposto.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button isIconOnly size="sm" variant="light">
                        <EllipsisVerticalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Acoes do imposto">
                      <DropdownItem
                        key="editar"
                        startContent={<PencilIcon className="h-4 w-4" />}
                        onPress={() => {
                          setEditingId(imposto.id || null);
                          setFormData({
                            tipo: imposto.tipo,
                            descricao: imposto.descricao || "",
                            valor: imposto.valor || 0,
                            data_vencimento: imposto.data_vencimento,
                            status: imposto.status || "aberta",
                            observacoes: imposto.observacoes || "",
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
                        onPress={() => handleDeletar(imposto.id || "")}
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
          <ModalHeader>Imposto/Tributo</ModalHeader>
          <ModalBody className="space-y-3">
            <Select
              label="Tipo de Imposto"
              selectedKeys={[formData.tipo || "simples_nacional"]}
              onSelectionChange={(keys) =>
                setFormData({
                  ...formData,
                  tipo: (keys as Set<string>).values().next().value as any,
                })
              }
            >
              <SelectItem key="simples_nacional">
                📊 Simples Nacional
              </SelectItem>
              <SelectItem key="icms">🏪 ICMS</SelectItem>
              <SelectItem key="iss">🏛️ ISS</SelectItem>
              <SelectItem key="das">💼 DAS</SelectItem>
              <SelectItem key="irpj">📋 IRPJ</SelectItem>
              <SelectItem key="csll">📋 CSLL</SelectItem>
              <SelectItem key="outro">📌 Outro</SelectItem>
            </Select>
            <Input
              label="Descrição"
              placeholder="Descrição do imposto"
              value={formData.descricao || ""}
              onValueChange={(value) =>
                setFormData({ ...formData, descricao: value })
              }
            />
            <Input
              label="Valor Base"
              startContent="R$"
              type="number"
              value={String(formData.valor || 0)}
              onValueChange={(value) =>
                setFormData({ ...formData, valor: Number(value) })
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
