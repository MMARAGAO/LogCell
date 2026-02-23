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
import {
  getCentroCustosTodos,
  getCentroCustosLoja,
  criarCentroCusto,
  atualizarCentroCusto,
  deletarCentroCusto,
  getAnaliseComPorTipo,
  getAnaliseCustoPorLoja,
  getAnaliseComparativa,
  type CentroCusto,
  type AnaliseCustoPorTipo,
  type AnaliseCustoPorLoja,
  type AnaliseComparativa,
} from "@/services/financeiroService";
import { useNotificacao } from "@/hooks/useNotificacao";

interface FormCusto {
  tipo: string;
  descricao: string;
  valor: string;
  data: string;
  categoria: string;
  observacoes: string;
}

export default function CentroCustosPanel({
  lojaId,
  lojaNome,
  mes: initialMes,
  ano: initialAno,
  dataInicio,
  dataFim,
}: {
  lojaId?: number;
  lojaNome?: string;
  mes?: number;
  ano?: number;
  dataInicio?: string;
  dataFim?: string;
}) {
  const defaultMes = initialMes ?? new Date().getMonth() + 1;
  const defaultAno = initialAno ?? new Date().getFullYear();
  const [mes, setMes] = useState<number>(defaultMes);
  const [ano, setAno] = useState<number>(defaultAno);

  // Custos
  const [custos, setCustos] = useState<CentroCusto[]>([]);
  const [showModalCusto, setShowModalCusto] = useState(false);
  const [editingCusto, setEditingCusto] = useState<CentroCusto | null>(null);
  const [formCusto, setFormCusto] = useState<FormCusto>({
    tipo: "estoque",
    descricao: "",
    valor: "",
    data: new Date().toISOString().split("T")[0],
    categoria: "",
    observacoes: "",
  });

  // Análises
  const [analisePortipo, setAnalisePortipo] = useState<AnaliseCustoPorTipo[]>(
    [],
  );
  const [analisePorLoja, setAnalisePorLoja] = useState<AnaliseCustoPorLoja[]>(
    [],
  );
  const [analiseComparativa, setAnaliseComparativa] =
    useState<AnaliseComparativa | null>(null);

  const [loading, setLoading] = useState(false);
  const { success, error } = useNotificacao();

  const lojaLabel = lojaId ? lojaNome || `#${lojaId}` : "Todas as Lojas";

  const buildAnalisePorTipo = (lista: CentroCusto[]) => {
    const resumo = new Map<
      string,
      { total: number; quantidade: number; valores: number[] }
    >();

    lista.forEach((custo) => {
      const existing = resumo.get(custo.tipo) || {
        total: 0,
        quantidade: 0,
        valores: [],
      };

      existing.total += custo.valor;
      existing.quantidade += 1;
      existing.valores.push(custo.valor);
      resumo.set(custo.tipo, existing);
    });

    const totalGeral = lista.reduce((acc, c) => acc + c.valor, 0);

    return Array.from(resumo.entries()).map(([tipo, data]) => ({
      tipo,
      total: data.total,
      quantidade: data.quantidade,
      percentual: totalGeral > 0 ? (data.total / totalGeral) * 100 : 0,
      media: data.quantidade > 0 ? data.total / data.quantidade : 0,
    }));
  };

  // Carregar dados
  const carregarDados = async () => {
    setLoading(true);
    try {
      if (lojaId) {
        const [custos, analiseT, analiseL, analiseC] = await Promise.all([
          getCentroCustosLoja(lojaId, mes, ano, dataInicio, dataFim),
          getAnaliseComPorTipo(lojaId, mes, ano, dataInicio, dataFim),
          getAnaliseCustoPorLoja(mes, ano, dataInicio, dataFim),
          getAnaliseComparativa(lojaId, mes, ano),
        ]);

        setCustos(custos);
        setAnalisePortipo(analiseT);
        setAnalisePorLoja(analiseL);
        setAnaliseComparativa(analiseC);

        return;
      }

      const [custosTodos, analiseL] = await Promise.all([
        getCentroCustosTodos(mes, ano, dataInicio, dataFim),
        getAnaliseCustoPorLoja(mes, ano, dataInicio, dataFim),
      ]);

      setCustos(custosTodos);
      setAnalisePortipo(buildAnalisePorTipo(custosTodos));
      setAnalisePorLoja(analiseL);
      setAnaliseComparativa(null);
    } catch (err) {
      error("Erro ao carregar dados de custos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [lojaId, mes, ano, dataInicio, dataFim]);

  // CRUD
  const handleAdicionarCusto = async () => {
    if (!lojaId || !formCusto.descricao || !formCusto.valor) {
      error("Preencha os campos obrigatórios");

      return;
    }

    try {
      const novoCusto = {
        loja_id: lojaId,
        tipo: formCusto.tipo as
          | "estoque"
          | "marketing"
          | "estrutura"
          | "pessoal"
          | "outro",
        descricao: formCusto.descricao,
        valor: parseFloat(formCusto.valor),
        data: formCusto.data,
        mes,
        ano,
        categoria: formCusto.categoria || undefined,
        observacoes: formCusto.observacoes || undefined,
      };

      if (editingCusto?.id) {
        await atualizarCentroCusto(editingCusto.id, novoCusto);
        success("Custo atualizado com sucesso");
      } else {
        await criarCentroCusto(novoCusto);
        success("Custo criado com sucesso");
      }

      setShowModalCusto(false);
      setEditingCusto(null);
      setFormCusto({
        tipo: "estoque",
        descricao: "",
        valor: "",
        data: new Date().toISOString().split("T")[0],
        categoria: "",
        observacoes: "",
      });
      carregarDados();
    } catch (err) {
      error("Erro ao salvar custo");
      console.error(err);
    }
  };

  const handleEditarCusto = (custo: CentroCusto) => {
    setEditingCusto(custo);
    setFormCusto({
      tipo: custo.tipo,
      descricao: custo.descricao,
      valor: custo.valor.toString(),
      data: custo.data,
      categoria: custo.categoria || "",
      observacoes: custo.observacoes || "",
    });
    setShowModalCusto(true);
  };

  const handleDeletarCusto = async (id: string) => {
    try {
      await deletarCentroCusto(id);
      success("Custo deletado com sucesso");
      carregarDados();
    } catch (err) {
      error("Erro ao deletar custo");
      console.error(err);
    }
  };

  const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);

  const getEmoji = (tipo: string) => {
    switch (tipo) {
      case "estoque":
        return "📦";
      case "marketing":
        return "📢";
      case "estrutura":
        return "🏢";
      case "pessoal":
        return "👥";
      default:
        return "💼";
    }
  };

  const getTotalCustos = () =>
    custos.reduce<number>((acc, c) => acc + c.valor, 0);
  const getTotalPorTipo = (tipo: string) =>
    custos
      .filter((c) => c.tipo === tipo)
      .reduce<number>((acc, c) => acc + c.valor, 0);

  return (
    <div className="w-full space-y-4">
      {/* Filtros */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-default-600">Loja:</span>
          <span className="rounded-lg bg-primary/10 px-3 py-2 text-sm font-bold text-primary">
            {lojaLabel}
          </span>
        </div>
      </Card>

      {/* Cards Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10">
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Total de Custos
          </p>
          <p className="text-[11px] text-default-500 dark:text-default-400">
            {lojaLabel}
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
            {formatarMoeda(getTotalCustos())}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {custos.length} registros
          </p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-900/10">
          <p className="text-xs text-gray-600 dark:text-gray-300">📦 Estoque</p>
          <p className="text-[11px] text-default-500 dark:text-default-400">
            {lojaLabel}
          </p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">
            {formatarMoeda(getTotalPorTipo("estoque"))}
          </p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-900/30 dark:to-pink-900/10">
          <p className="text-xs text-gray-600 dark:text-gray-300">
            📢 Marketing
          </p>
          <p className="text-[11px] text-default-500 dark:text-default-400">
            {lojaLabel}
          </p>
          <p className="text-2xl font-bold text-pink-600 dark:text-pink-300">
            {formatarMoeda(getTotalPorTipo("marketing"))}
          </p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/10">
          <p className="text-xs text-gray-600 dark:text-gray-300">
            🏢 Estrutura
          </p>
          <p className="text-[11px] text-default-500 dark:text-default-400">
            {lojaLabel}
          </p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-300">
            {formatarMoeda(getTotalPorTipo("estrutura"))}
          </p>
        </Card>
      </div>

      {/* Abas */}
      <Card className="p-4">
        <Tabs aria-label="Centro de Custos">
          {/* ABA: LISTA DE CUSTOS */}
          <Tab key="lista" title="📋 Lista de Custos">
            <div className="space-y-4">
              <Button
                color="primary"
                isDisabled={!lojaId}
                startContent={<PlusIcon className="h-4 w-4" />}
                onClick={() => {
                  setEditingCusto(null);
                  setFormCusto({
                    tipo: "estoque",
                    descricao: "",
                    valor: "",
                    data: new Date().toISOString().split("T")[0],
                    categoria: "",
                    observacoes: "",
                  });
                  setShowModalCusto(true);
                }}
              >
                Adicionar Custo
              </Button>

              {lojaId ? (
                <Table>
                  <TableHeader>
                    <TableColumn>Tipo</TableColumn>
                    <TableColumn>Descrição</TableColumn>
                    <TableColumn>Valor</TableColumn>
                    <TableColumn>Data</TableColumn>
                    <TableColumn>Categoria</TableColumn>
                    <TableColumn>Ações</TableColumn>
                  </TableHeader>
                  <TableBody
                    emptyContent={
                      custos.length === 0
                        ? "Nenhum custo registrado"
                        : undefined
                    }
                  >
                    {custos.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <span className="text-lg">{getEmoji(c.tipo)}</span>
                          <span className="capitalize ml-2">{c.tipo}</span>
                        </TableCell>
                        <TableCell className="text-sm">{c.descricao}</TableCell>
                        <TableCell className="font-semibold">
                          {formatarMoeda(c.valor)}
                        </TableCell>
                        <TableCell className="text-sm">{c.data}</TableCell>
                        <TableCell className="text-xs text-gray-500">
                          {c.categoria || "-"}
                        </TableCell>
                        <TableCell>
                          <Dropdown>
                            <DropdownTrigger>
                              <Button isIconOnly size="sm" variant="light">
                                <EllipsisVerticalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Acoes do custo">
                              <DropdownItem
                                key="editar"
                                startContent={
                                  <PencilIcon className="h-4 w-4" />
                                }
                                onPress={() => handleEditarCusto(c)}
                              >
                                Editar
                              </DropdownItem>
                              <DropdownItem
                                key="excluir"
                                className="text-danger"
                                color="danger"
                                startContent={<TrashIcon className="h-4 w-4" />}
                                onPress={() => handleDeletarCusto(c.id!)}
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
              ) : (
                <Table>
                  <TableHeader>
                    <TableColumn>Loja</TableColumn>
                    <TableColumn>Tipo</TableColumn>
                    <TableColumn>Descrição</TableColumn>
                    <TableColumn>Valor</TableColumn>
                    <TableColumn>Data</TableColumn>
                    <TableColumn>Categoria</TableColumn>
                    <TableColumn>Ações</TableColumn>
                  </TableHeader>
                  <TableBody
                    emptyContent={
                      custos.length === 0
                        ? "Nenhum custo registrado"
                        : undefined
                    }
                  >
                    {custos.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="text-sm">
                          {c.loja_nome || `#${c.loja_id}`}
                        </TableCell>
                        <TableCell>
                          <span className="text-lg">{getEmoji(c.tipo)}</span>
                          <span className="capitalize ml-2">{c.tipo}</span>
                        </TableCell>
                        <TableCell className="text-sm">{c.descricao}</TableCell>
                        <TableCell className="font-semibold">
                          {formatarMoeda(c.valor)}
                        </TableCell>
                        <TableCell className="text-sm">{c.data}</TableCell>
                        <TableCell className="text-xs text-gray-500">
                          {c.categoria || "-"}
                        </TableCell>
                        <TableCell>
                          <Dropdown>
                            <DropdownTrigger>
                              <Button isIconOnly size="sm" variant="light">
                                <EllipsisVerticalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Acoes do custo">
                              <DropdownItem
                                key="editar"
                                startContent={
                                  <PencilIcon className="h-4 w-4" />
                                }
                                onPress={() => handleEditarCusto(c)}
                              >
                                Editar
                              </DropdownItem>
                              <DropdownItem
                                key="excluir"
                                className="text-danger"
                                color="danger"
                                startContent={<TrashIcon className="h-4 w-4" />}
                                onPress={() => handleDeletarCusto(c.id!)}
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
            </div>
          </Tab>

          {/* ABA: ANÁLISE POR TIPO */}
          <Tab key="tipo" title="📊 Análise por Tipo">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {analisePortipo.map((analise) => (
                  <Card
                    key={analise.tipo}
                    className="p-4 border-l-4 border-l-primary"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-gray-600">
                          {getEmoji(analise.tipo)}{" "}
                          {analise.tipo.charAt(0).toUpperCase() +
                            analise.tipo.slice(1)}
                        </p>
                        <p className="text-2xl font-bold">
                          {formatarMoeda(analise.total)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {analise.percentual.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500">
                          {analise.quantidade} registros
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Média:</span>
                      <span className="font-semibold">
                        {formatarMoeda(analise.media)}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>

              {analisePortipo.length === 0 && (
                <Card className="p-4 text-center text-gray-500">
                  Nenhum dado disponível para análise
                </Card>
              )}
            </div>
          </Tab>

          {/* ABA: ANÁLISE POR LOJA */}
          <Tab key="loja" title="🏪 Análise por Loja">
            <div className="space-y-4">
              {analisePorLoja.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableColumn>Loja ID</TableColumn>
                    <TableColumn>Total</TableColumn>
                    <TableColumn>Registros</TableColumn>
                    <TableColumn>Percentual</TableColumn>
                    <TableColumn>Média</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {analisePorLoja.map((analise) => (
                      <TableRow key={analise.loja_id}>
                        <TableCell className="font-semibold">
                          {analise.loja_nome || "Desconhecida"}
                        </TableCell>
                        <TableCell className="font-bold text-primary">
                          {formatarMoeda(analise.total)}
                        </TableCell>
                        <TableCell>{analise.quantidade}</TableCell>
                        <TableCell>
                          <span className="rounded px-2 py-1 bg-primary/10 text-primary font-semibold text-sm">
                            {analise.percentual.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell>{formatarMoeda(analise.media)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Card className="p-4 text-center text-gray-500">
                  Nenhum dado disponível para análise
                </Card>
              )}
            </div>
          </Tab>

          {/* ABA: COMPARATIVO MÊS ANTERIOR */}
          <Tab key="comparativo" title="📈 Comparativo">
            <div className="space-y-4">
              {analiseComparativa && (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="p-4 bg-gradient-to-br from-blue-100 to-blue-50">
                      <p className="text-xs text-gray-600">Período Anterior</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatarMoeda(
                          analiseComparativa.periodo_anterior.total,
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(
                          analiseComparativa.periodo_anterior.ano,
                          analiseComparativa.periodo_anterior.mes - 1,
                        ).toLocaleString("pt-BR", {
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </Card>

                    <Card className="p-4 bg-gradient-to-br from-green-100 to-green-50">
                      <p className="text-xs text-gray-600">Período Atual</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatarMoeda(analiseComparativa.periodo_atual.total)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(
                          analiseComparativa.periodo_atual.ano,
                          analiseComparativa.periodo_atual.mes - 1,
                        ).toLocaleString("pt-BR", {
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </Card>
                  </div>

                  <Card
                    className={`p-4 ${
                      analiseComparativa.variacao > 0
                        ? "bg-gradient-to-br from-red-100 to-red-50"
                        : "bg-gradient-to-br from-green-100 to-green-50"
                    }`}
                  >
                    <p className="text-xs text-gray-600">Variação</p>
                    <div className="flex items-baseline gap-2">
                      <p
                        className={`text-3xl font-bold ${
                          analiseComparativa.variacao > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {analiseComparativa.variacao > 0 ? "+" : ""}
                        {formatarMoeda(analiseComparativa.variacao)}
                      </p>
                      <p
                        className={`text-xl font-bold ${
                          analiseComparativa.percentual_variacao > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        ({analiseComparativa.percentual_variacao > 0 ? "+" : ""}
                        {analiseComparativa.percentual_variacao.toFixed(1)}%)
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {analiseComparativa.variacao > 0
                        ? "❌ Custos aumentaram"
                        : "✅ Custos diminuíram"}
                    </p>
                  </Card>
                </>
              )}
            </div>
          </Tab>
        </Tabs>
      </Card>

      {/* Modal Custo */}
      <Modal isOpen={showModalCusto} onOpenChange={setShowModalCusto}>
        <ModalContent>
          <ModalHeader>
            {editingCusto ? "Editar Custo" : "Adicionar Custo"}
          </ModalHeader>
          <ModalBody>
            <Select
              label="Tipo"
              selectedKeys={[formCusto.tipo]}
              onChange={(e) =>
                setFormCusto({ ...formCusto, tipo: e.target.value })
              }
            >
              <SelectItem key="estoque">📦 Estoque</SelectItem>
              <SelectItem key="marketing">📢 Marketing</SelectItem>
              <SelectItem key="estrutura">🏢 Estrutura</SelectItem>
              <SelectItem key="pessoal">👥 Pessoal</SelectItem>
              <SelectItem key="outro">💼 Outro</SelectItem>
            </Select>
            <Input
              label="Descrição"
              placeholder="Descreva o custo"
              value={formCusto.descricao}
              onChange={(e) =>
                setFormCusto({ ...formCusto, descricao: e.target.value })
              }
            />
            <Input
              label="Valor (R$)"
              min="0"
              step="0.01"
              type="number"
              value={formCusto.valor}
              onChange={(e) =>
                setFormCusto({ ...formCusto, valor: e.target.value })
              }
            />
            <Input
              label="Data"
              type="date"
              value={formCusto.data}
              onChange={(e) =>
                setFormCusto({ ...formCusto, data: e.target.value })
              }
            />
            <Input
              label="Categoria (opcional)"
              placeholder="Ex: Suprimentos, Publicidade..."
              value={formCusto.categoria}
              onChange={(e) =>
                setFormCusto({ ...formCusto, categoria: e.target.value })
              }
            />
            <Input
              label="Observações"
              placeholder="Addmensagens..."
              value={formCusto.observacoes}
              onChange={(e) =>
                setFormCusto({ ...formCusto, observacoes: e.target.value })
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onClick={() => setShowModalCusto(false)}
            >
              Cancelar
            </Button>
            <Button
              color="primary"
              isLoading={loading}
              onClick={handleAdicionarCusto}
            >
              {editingCusto ? "Atualizar" : "Adicionar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
