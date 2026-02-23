"use client";

import React, { useEffect, useState } from "react";
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
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
} from "@heroui/react";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import {
  EllipsisVerticalIcon,
  TrashIcon,
  PlusIcon,
  PencilIcon,
} from "@heroicons/react/24/solid";
import { FuncionarioSelect } from "./FuncionarioSelect";
import {
  getComissoes,
  criarComissao,
  atualizarComissao,
  deletarComissao,
  getDescontos,
  criarDesconto,
  atualizarDesconto,
  deletarDesconto,
  getBonificacoes,
  criarBonificacao,
  atualizarBonificacao,
  deletarBonificacao,
  getHistoricoFuncionario,
  type Comissao,
  type Desconto,
  type Bonificacao,
  type HistoricoFuncionario,
} from "@/services/financeiroService";
import { useNotificacao } from "@/hooks/useNotificacao";

interface FormComissao {
  tipo: string;
  valor: string;
  percentual: string;
  data_inicio: string;
  data_fim: string;
  observacoes: string;
}

interface FormDesconto {
  tipo: string;
  valor: string;
  percentual: string;
  motivo: string;
  observacoes: string;
}

interface FormBonificacao {
  tipo: string;
  valor: string;
  descricao: string;
  data_bonificacao: string;
  observacoes: string;
}

export default function GestaoFuncionariosPanel() {
  const [funcionarioId, setFuncionarioId] = useState<string>("");
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [ano, setAno] = useState<number>(new Date().getFullYear());

  // Histórico
  const [historico, setHistorico] = useState<HistoricoFuncionario | null>(null);

  // Comissões
  const [comissoes, setComissoes] = useState<Comissao[]>([]);
  const [showModalComissao, setShowModalComissao] = useState(false);
  const [editingComissao, setEditingComissao] = useState<Comissao | null>(null);
  const [formComissao, setFormComissao] = useState<FormComissao>({
    tipo: "lucro",
    valor: "",
    percentual: "",
    data_inicio: new Date().toISOString().split("T")[0],
    data_fim: "",
    observacoes: "",
  });

  // Descontos
  const [descontos, setDescontos] = useState<Desconto[]>([]);
  const [showModalDesconto, setShowModalDesconto] = useState(false);
  const [editingDesconto, setEditingDesconto] = useState<Desconto | null>(null);
  const [formDesconto, setFormDesconto] = useState<FormDesconto>({
    tipo: "faltas",
    valor: "",
    percentual: "",
    motivo: "",
    observacoes: "",
  });

  // Bonificações
  const [bonificacoes, setBonificacoes] = useState<Bonificacao[]>([]);
  const [showModalBonificacao, setShowModalBonificacao] = useState(false);
  const [editingBonificacao, setEditingBonificacao] =
    useState<Bonificacao | null>(null);
  const [formBonificacao, setFormBonificacao] = useState<FormBonificacao>({
    tipo: "desempenho",
    valor: "",
    descricao: "",
    data_bonificacao: new Date().toISOString().split("T")[0],
    observacoes: "",
  });

  const [loading, setLoading] = useState(false);
  const { success, error } = useNotificacao();

  // Carregar dados do funcionário
  const carregarDados = async () => {
    if (!funcionarioId) {
      setHistorico(null);
      setComissoes([]);
      setDescontos([]);
      setBonificacoes([]);

      return;
    }

    setLoading(true);
    try {
      const [hist, comis, desc, boni] = await Promise.all([
        getHistoricoFuncionario(funcionarioId, mes, ano),
        getComissoes(funcionarioId, mes, ano),
        getDescontos(funcionarioId, mes, ano),
        getBonificacoes(funcionarioId, mes, ano),
      ]);

      setHistorico(hist);
      setComissoes(comis);
      setDescontos(desc);
      setBonificacoes(boni);
    } catch (err) {
      error("Erro ao carregar dados do funcionário");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [funcionarioId, mes, ano]);

  // ============== COMISSÕES ==============

  const handleAdicionarComissao = async () => {
    if (!funcionarioId || !formComissao.valor) {
      error("Preencha os campos obrigatórios");

      return;
    }

    try {
      const novaComissao = {
        funcionario_id: funcionarioId,
        tipo: formComissao.tipo as "lucro" | "venda" | "performance" | "outro",
        valor: parseFloat(formComissao.valor),
        percentual: formComissao.percentual
          ? parseFloat(formComissao.percentual)
          : undefined,
        data_inicio: formComissao.data_inicio,
        data_fim: formComissao.data_fim || undefined,
        mes,
        ano,
        status: "pendente" as const,
        observacoes: formComissao.observacoes || undefined,
      };

      if (editingComissao?.id) {
        await atualizarComissao(editingComissao.id, novaComissao);
        success("Comissão atualizada com sucesso");
      } else {
        await criarComissao(novaComissao);
        success("Comissão criada com sucesso");
      }

      setShowModalComissao(false);
      setEditingComissao(null);
      setFormComissao({
        tipo: "lucro",
        valor: "",
        percentual: "",
        data_inicio: new Date().toISOString().split("T")[0],
        data_fim: "",
        observacoes: "",
      });
      carregarDados();
    } catch (err) {
      error("Erro ao salvar comissão");
      console.error(err);
    }
  };

  const handleEditarComissao = (comissao: Comissao) => {
    setEditingComissao(comissao);
    setFormComissao({
      tipo: comissao.tipo,
      valor: comissao.valor.toString(),
      percentual: comissao.percentual?.toString() || "",
      data_inicio: comissao.data_inicio,
      data_fim: comissao.data_fim || "",
      observacoes: comissao.observacoes || "",
    });
    setShowModalComissao(true);
  };

  const handleDeletarComissao = async (id: string) => {
    try {
      await deletarComissao(id);
      success("Comissão deletada com sucesso");
      carregarDados();
    } catch (err) {
      error("Erro ao deletar comissão");
      console.error(err);
    }
  };

  // ============== DESCONTOS ==============

  const handleAdicionarDesconto = async () => {
    if (!funcionarioId || !formDesconto.valor || !formDesconto.motivo) {
      error("Preencha os campos obrigatórios");

      return;
    }

    try {
      const novoDesconto = {
        funcionario_id: funcionarioId,
        tipo: formDesconto.tipo as
          | "faltas"
          | "atraso"
          | "adiantamento"
          | "outro",
        valor: parseFloat(formDesconto.valor),
        percentual: formDesconto.percentual
          ? parseFloat(formDesconto.percentual)
          : undefined,
        motivo: formDesconto.motivo,
        data_desconto: new Date().toISOString().split("T")[0],
        mes,
        ano,
        status: "pendente" as const,
        observacoes: formDesconto.observacoes || undefined,
      };

      if (editingDesconto?.id) {
        await atualizarDesconto(editingDesconto.id, novoDesconto);
        success("Desconto atualizado com sucesso");
      } else {
        await criarDesconto(novoDesconto);
        success("Desconto criado com sucesso");
      }

      setShowModalDesconto(false);
      setEditingDesconto(null);
      setFormDesconto({
        tipo: "faltas",
        valor: "",
        percentual: "",
        motivo: "",
        observacoes: "",
      });
      carregarDados();
    } catch (err) {
      error("Erro ao salvar desconto");
      console.error(err);
    }
  };

  const handleEditarDesconto = (desconto: Desconto) => {
    setEditingDesconto(desconto);
    setFormDesconto({
      tipo: desconto.tipo,
      valor: desconto.valor.toString(),
      percentual: desconto.percentual?.toString() || "",
      motivo: desconto.motivo,
      observacoes: desconto.observacoes || "",
    });
    setShowModalDesconto(true);
  };

  const handleDeletarDesconto = async (id: string) => {
    try {
      await deletarDesconto(id);
      success("Desconto deletado com sucesso");
      carregarDados();
    } catch (err) {
      error("Erro ao deletar desconto");
      console.error(err);
    }
  };

  // ============== BONIFICAÇÕES ==============

  const handleAdicionarBonificacao = async () => {
    if (!funcionarioId || !formBonificacao.valor) {
      error("Preencha os campos obrigatórios");

      return;
    }

    try {
      const novaBonificacao = {
        funcionario_id: funcionarioId,
        tipo: formBonificacao.tipo as
          | "desempenho"
          | "assiduidade"
          | "metas"
          | "outro",
        valor: parseFloat(formBonificacao.valor),
        descricao: formBonificacao.descricao,
        data_bonificacao: formBonificacao.data_bonificacao,
        mes,
        ano,
        status: "pendente" as const,
        observacoes: formBonificacao.observacoes || undefined,
      };

      if (editingBonificacao?.id) {
        await atualizarBonificacao(editingBonificacao.id, novaBonificacao);
        success("Bonificação atualizada com sucesso");
      } else {
        await criarBonificacao(novaBonificacao);
        success("Bonificação criada com sucesso");
      }

      setShowModalBonificacao(false);
      setEditingBonificacao(null);
      setFormBonificacao({
        tipo: "desempenho",
        valor: "",
        descricao: "",
        data_bonificacao: new Date().toISOString().split("T")[0],
        observacoes: "",
      });
      carregarDados();
    } catch (err) {
      error("Erro ao salvar bonificação");
      console.error(err);
    }
  };

  const handleEditarBonificacao = (bonificacao: Bonificacao) => {
    setEditingBonificacao(bonificacao);
    setFormBonificacao({
      tipo: bonificacao.tipo,
      valor: bonificacao.valor.toString(),
      descricao: bonificacao.descricao,
      data_bonificacao: bonificacao.data_bonificacao,
      observacoes: bonificacao.observacoes || "",
    });
    setShowModalBonificacao(true);
  };

  const handleDeletarBonificacao = async (id: string) => {
    try {
      await deletarBonificacao(id);
      success("Bonificação deletada com sucesso");
      carregarDados();
    } catch (err) {
      error("Erro ao deletar bonificação");
      console.error(err);
    }
  };

  // Formatador de moeda
  const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);

  if (loading && !historico) {
    return (
      <Card className="p-6">
        <div className="text-center">Carregando dados...</div>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Setor de Filtros */}
      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <FuncionarioSelect
            required
            label="Funcionário"
            placeholder="Busque e selecione o funcionário"
            value={funcionarioId}
            onChange={setFuncionarioId}
          />
          <Select
            label="Mês"
            selectedKeys={new Set([mes.toString()])}
            onSelectionChange={(keys) => {
              const value = (keys as Set<string>).values().next().value;

              if (value) setMes(parseInt(value));
            }}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <SelectItem
                key={m}
                textValue={new Date(2000, m - 1).toLocaleString("pt-BR", {
                  month: "long",
                })}
              >
                {new Date(2000, m - 1).toLocaleString("pt-BR", {
                  month: "long",
                })}
              </SelectItem>
            ))}
          </Select>
          <Select
            label="Ano"
            selectedKeys={new Set([ano.toString()])}
            onSelectionChange={(keys) => {
              const value = (keys as Set<string>).values().next().value;

              if (value) setAno(parseInt(value));
            }}
          >
            {Array.from(
              { length: 5 },
              (_, i) => new Date().getFullYear() - 2 + i,
            ).map((a) => (
              <SelectItem key={a} textValue={a.toString()}>
                {a}
              </SelectItem>
            ))}
          </Select>
          <Button
            color="primary"
            disabled={!funcionarioId}
            isLoading={loading}
            onClick={() => carregarDados()}
          >
            Atualizar
          </Button>
        </div>
      </Card>

      {/* Resumo Financeiro */}
      {historico && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Salário Base
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
              {formatarMoeda(historico.salario_base)}
            </p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/10">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Total Ganhos
            </p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-300">
              {formatarMoeda(historico.total_ganhos)}
            </p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-900/10">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Total Descontos
            </p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-300">
              {formatarMoeda(historico.total_descontos)}
            </p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-900/10">
            <p className="text-sm text-gray-600 dark:text-gray-300">Líquido</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">
              {formatarMoeda(historico.liquido)}
            </p>
          </Card>
        </div>
      )}

      {/* Abas com Comissões, Descontos e Bonificações */}
      {funcionarioId && (
        <Card className="p-4">
          <Tabs aria-label="Gestão de Funcionários">
            {/* ABA: COMISSÕES */}
            <Tab key="comissoes" title="💰 Comissões">
              <div className="space-y-4">
                {historico && (
                  <div className="grid gap-2 md:grid-cols-2">
                    <Card className="p-3 bg-blue-50 dark:bg-blue-900/20">
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        Total Comissões
                      </p>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-300">
                        {formatarMoeda(historico.comissoes_total)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {historico.comissoes_count} registros
                      </p>
                    </Card>
                  </div>
                )}
                <Button
                  color="primary"
                  startContent={<PlusIcon className="h-4 w-4" />}
                  onClick={() => {
                    setEditingComissao(null);
                    setFormComissao({
                      tipo: "lucro",
                      valor: "",
                      percentual: "",
                      data_inicio: new Date().toISOString().split("T")[0],
                      data_fim: "",
                      observacoes: "",
                    });
                    setShowModalComissao(true);
                  }}
                >
                  Adicionar Comissão
                </Button>
                <Table>
                  <TableHeader>
                    <TableColumn>Tipo</TableColumn>
                    <TableColumn>Valor</TableColumn>
                    <TableColumn>Percentual</TableColumn>
                    <TableColumn>Status</TableColumn>
                    <TableColumn>Ações</TableColumn>
                  </TableHeader>
                  <TableBody
                    emptyContent={
                      comissoes.length === 0
                        ? "Nenhuma comissão registrada"
                        : undefined
                    }
                  >
                    {comissoes.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="capitalize">{c.tipo}</TableCell>
                        <TableCell>{formatarMoeda(c.valor)}</TableCell>
                        <TableCell>
                          {c.percentual ? `${c.percentual}%` : "-"}
                        </TableCell>
                        <TableCell className="capitalize">
                          <span
                            className={`rounded px-2 py-1 text-xs font-bold ${
                              c.status === "paga"
                                ? "bg-green-200 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                                : c.status === "aprovada"
                                  ? "bg-blue-200 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                                  : c.status === "cancelada"
                                    ? "bg-red-200 text-red-800 dark:bg-red-900/40 dark:text-red-200"
                                    : "bg-yellow-200 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200"
                            }`}
                          >
                            {c.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Dropdown>
                            <DropdownTrigger>
                              <Button isIconOnly size="sm" variant="light">
                                <EllipsisVerticalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Acoes da comissao">
                              <DropdownItem
                                key="editar"
                                startContent={
                                  <PencilIcon className="h-4 w-4" />
                                }
                                onPress={() => handleEditarComissao(c)}
                              >
                                Editar
                              </DropdownItem>
                              <DropdownItem
                                key="excluir"
                                className="text-danger"
                                color="danger"
                                startContent={<TrashIcon className="h-4 w-4" />}
                                onPress={() => handleDeletarComissao(c.id!)}
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
              </div>
            </Tab>

            {/* ABA: DESCONTOS */}
            <Tab key="descontos" title="📉 Descontos">
              <div className="space-y-4">
                {historico && (
                  <div className="grid gap-2 md:grid-cols-2">
                    <Card className="p-3 bg-red-50 dark:bg-red-900/20">
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        Total Descontos
                      </p>
                      <p className="text-xl font-bold text-red-600 dark:text-red-300">
                        {formatarMoeda(historico.descontos_total)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {historico.descontos_count} registros
                      </p>
                    </Card>
                  </div>
                )}
                <Button
                  color="primary"
                  startContent={<PlusIcon className="h-4 w-4" />}
                  onClick={() => {
                    setEditingDesconto(null);
                    setFormDesconto({
                      tipo: "faltas",
                      valor: "",
                      percentual: "",
                      motivo: "",
                      observacoes: "",
                    });
                    setShowModalDesconto(true);
                  }}
                >
                  Adicionar Desconto
                </Button>
                <Table>
                  <TableHeader>
                    <TableColumn>Tipo</TableColumn>
                    <TableColumn>Valor</TableColumn>
                    <TableColumn>Motivo</TableColumn>
                    <TableColumn>Status</TableColumn>
                    <TableColumn>Ações</TableColumn>
                  </TableHeader>
                  <TableBody
                    emptyContent={
                      descontos.length === 0
                        ? "Nenhum desconto registrado"
                        : undefined
                    }
                  >
                    {descontos.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="capitalize">{d.tipo}</TableCell>
                        <TableCell>{formatarMoeda(d.valor)}</TableCell>
                        <TableCell className="text-xs">{d.motivo}</TableCell>
                        <TableCell className="capitalize">
                          <span
                            className={`rounded px-2 py-1 text-xs font-bold ${
                              d.status === "descontado"
                                ? "bg-green-200 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                                : d.status === "cancelado"
                                  ? "bg-red-200 text-red-800 dark:bg-red-900/40 dark:text-red-200"
                                  : "bg-yellow-200 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200"
                            }`}
                          >
                            {d.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Dropdown>
                            <DropdownTrigger>
                              <Button isIconOnly size="sm" variant="light">
                                <EllipsisVerticalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Acoes do desconto">
                              <DropdownItem
                                key="editar"
                                startContent={
                                  <PencilIcon className="h-4 w-4" />
                                }
                                onPress={() => handleEditarDesconto(d)}
                              >
                                Editar
                              </DropdownItem>
                              <DropdownItem
                                key="excluir"
                                className="text-danger"
                                color="danger"
                                startContent={<TrashIcon className="h-4 w-4" />}
                                onPress={() => handleDeletarDesconto(d.id!)}
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
              </div>
            </Tab>

            {/* ABA: BONIFICAÇÕES */}
            <Tab key="bonificacoes" title="🎁 Bonificações">
              <div className="space-y-4">
                {historico && (
                  <div className="grid gap-2 md:grid-cols-2">
                    <Card className="p-3 bg-purple-50 dark:bg-purple-900/20">
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        Total Bonificações
                      </p>
                      <p className="text-xl font-bold text-purple-600 dark:text-purple-300">
                        {formatarMoeda(historico.bonificacoes_total)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {historico.bonificacoes_count} registros
                      </p>
                    </Card>
                  </div>
                )}
                <Button
                  color="primary"
                  startContent={<PlusIcon className="h-4 w-4" />}
                  onClick={() => {
                    setEditingBonificacao(null);
                    setFormBonificacao({
                      tipo: "desempenho",
                      valor: "",
                      descricao: "",
                      data_bonificacao: new Date().toISOString().split("T")[0],
                      observacoes: "",
                    });
                    setShowModalBonificacao(true);
                  }}
                >
                  Adicionar Bonificação
                </Button>
                <Table>
                  <TableHeader>
                    <TableColumn>Tipo</TableColumn>
                    <TableColumn>Valor</TableColumn>
                    <TableColumn>Descrição</TableColumn>
                    <TableColumn>Status</TableColumn>
                    <TableColumn>Ações</TableColumn>
                  </TableHeader>
                  <TableBody
                    emptyContent={
                      bonificacoes.length === 0
                        ? "Nenhuma bonificação registrada"
                        : undefined
                    }
                  >
                    {bonificacoes.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="capitalize">{b.tipo}</TableCell>
                        <TableCell>{formatarMoeda(b.valor)}</TableCell>
                        <TableCell className="text-xs">{b.descricao}</TableCell>
                        <TableCell className="capitalize">
                          <span
                            className={`rounded px-2 py-1 text-xs font-bold ${
                              b.status === "paga"
                                ? "bg-green-200 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                                : b.status === "aprovada"
                                  ? "bg-blue-200 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                                  : b.status === "cancelada"
                                    ? "bg-red-200 text-red-800 dark:bg-red-900/40 dark:text-red-200"
                                    : "bg-yellow-200 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200"
                            }`}
                          >
                            {b.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Dropdown>
                            <DropdownTrigger>
                              <Button isIconOnly size="sm" variant="light">
                                <EllipsisVerticalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Acoes da bonificacao">
                              <DropdownItem
                                key="editar"
                                startContent={
                                  <PencilIcon className="h-4 w-4" />
                                }
                                onPress={() => handleEditarBonificacao(b)}
                              >
                                Editar
                              </DropdownItem>
                              <DropdownItem
                                key="excluir"
                                className="text-danger"
                                color="danger"
                                startContent={<TrashIcon className="h-4 w-4" />}
                                onPress={() => handleDeletarBonificacao(b.id!)}
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
              </div>
            </Tab>
          </Tabs>
        </Card>
      )}

      {/* MODAIS */}

      {/* Modal Comissão */}
      <Modal isOpen={showModalComissao} onOpenChange={setShowModalComissao}>
        <ModalContent>
          <ModalHeader>
            {editingComissao ? "Editar Comissão" : "Adicionar Comissão"}
          </ModalHeader>
          <ModalBody>
            <Select
              label="Tipo"
              selectedKeys={[formComissao.tipo]}
              onChange={(e) =>
                setFormComissao({ ...formComissao, tipo: e.target.value })
              }
            >
              <SelectItem key="lucro">Lucro</SelectItem>
              <SelectItem key="venda">Venda</SelectItem>
              <SelectItem key="performance">Performance</SelectItem>
              <SelectItem key="outro">Outro</SelectItem>
            </Select>
            <Input
              label="Valor (R$)"
              min="0"
              step="0.01"
              type="number"
              value={formComissao.valor}
              onChange={(e) =>
                setFormComissao({ ...formComissao, valor: e.target.value })
              }
            />
            <Input
              label="Percentual (%)"
              min="0"
              step="0.01"
              type="number"
              value={formComissao.percentual}
              onChange={(e) =>
                setFormComissao({ ...formComissao, percentual: e.target.value })
              }
            />
            <Input
              label="Data Início"
              type="date"
              value={formComissao.data_inicio}
              onChange={(e) =>
                setFormComissao({
                  ...formComissao,
                  data_inicio: e.target.value,
                })
              }
            />
            <Input
              label="Data Fim (opcional)"
              type="date"
              value={formComissao.data_fim}
              onChange={(e) =>
                setFormComissao({ ...formComissao, data_fim: e.target.value })
              }
            />
            <Input
              label="Observações"
              placeholder="Adicione observações..."
              value={formComissao.observacoes}
              onChange={(e) =>
                setFormComissao({
                  ...formComissao,
                  observacoes: e.target.value,
                })
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onClick={() => setShowModalComissao(false)}
            >
              Cancelar
            </Button>
            <Button color="primary" onClick={handleAdicionarComissao}>
              {editingComissao ? "Atualizar" : "Adicionar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Desconto */}
      <Modal isOpen={showModalDesconto} onOpenChange={setShowModalDesconto}>
        <ModalContent>
          <ModalHeader>
            {editingDesconto ? "Editar Desconto" : "Adicionar Desconto"}
          </ModalHeader>
          <ModalBody>
            <Select
              label="Tipo"
              selectedKeys={[formDesconto.tipo]}
              onChange={(e) =>
                setFormDesconto({ ...formDesconto, tipo: e.target.value })
              }
            >
              <SelectItem key="faltas">Faltas</SelectItem>
              <SelectItem key="atraso">Atraso</SelectItem>
              <SelectItem key="adiantamento">Adiantamento</SelectItem>
              <SelectItem key="outro">Outro</SelectItem>
            </Select>
            <Input
              label="Valor (R$)"
              min="0"
              step="0.01"
              type="number"
              value={formDesconto.valor}
              onChange={(e) =>
                setFormDesconto({ ...formDesconto, valor: e.target.value })
              }
            />
            <Input
              label="Percentual (%)"
              min="0"
              step="0.01"
              type="number"
              value={formDesconto.percentual}
              onChange={(e) =>
                setFormDesconto({ ...formDesconto, percentual: e.target.value })
              }
            />
            <Input
              label="Motivo"
              placeholder="Qual é o motivo do desconto?"
              value={formDesconto.motivo}
              onChange={(e) =>
                setFormDesconto({ ...formDesconto, motivo: e.target.value })
              }
            />
            <Input
              label="Observações"
              placeholder="Adicione observações..."
              value={formDesconto.observacoes}
              onChange={(e) =>
                setFormDesconto({
                  ...formDesconto,
                  observacoes: e.target.value,
                })
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onClick={() => setShowModalDesconto(false)}
            >
              Cancelar
            </Button>
            <Button color="primary" onClick={handleAdicionarDesconto}>
              {editingDesconto ? "Atualizar" : "Adicionar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Bonificação */}
      <Modal
        isOpen={showModalBonificacao}
        onOpenChange={setShowModalBonificacao}
      >
        <ModalContent>
          <ModalHeader>
            {editingBonificacao
              ? "Editar Bonificação"
              : "Adicionar Bonificação"}
          </ModalHeader>
          <ModalBody>
            <Select
              label="Tipo"
              selectedKeys={[formBonificacao.tipo]}
              onChange={(e) =>
                setFormBonificacao({ ...formBonificacao, tipo: e.target.value })
              }
            >
              <SelectItem key="desempenho">Desempenho</SelectItem>
              <SelectItem key="assiduidade">Assiduidade</SelectItem>
              <SelectItem key="metas">Metas</SelectItem>
              <SelectItem key="outro">Outro</SelectItem>
            </Select>
            <Input
              label="Valor (R$)"
              min="0"
              step="0.01"
              type="number"
              value={formBonificacao.valor}
              onChange={(e) =>
                setFormBonificacao({
                  ...formBonificacao,
                  valor: e.target.value,
                })
              }
            />
            <Input
              label="Descrição"
              placeholder="O que justifica essa bonificação?"
              value={formBonificacao.descricao}
              onChange={(e) =>
                setFormBonificacao({
                  ...formBonificacao,
                  descricao: e.target.value,
                })
              }
            />
            <Input
              label="Data da Bonificação"
              type="date"
              value={formBonificacao.data_bonificacao}
              onChange={(e) =>
                setFormBonificacao({
                  ...formBonificacao,
                  data_bonificacao: e.target.value,
                })
              }
            />
            <Input
              label="Observações"
              placeholder="Adicione observações..."
              value={formBonificacao.observacoes}
              onChange={(e) =>
                setFormBonificacao({
                  ...formBonificacao,
                  observacoes: e.target.value,
                })
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onClick={() => setShowModalBonificacao(false)}
            >
              Cancelar
            </Button>
            <Button color="primary" onClick={handleAdicionarBonificacao}>
              {editingBonificacao ? "Atualizar" : "Adicionar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
