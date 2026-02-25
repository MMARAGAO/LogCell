"use client";

import {
  Card,
  DateRangePicker,
  Select,
  SelectItem,
  Spinner,
  Tab,
  Tabs,
  CardBody,
} from "@heroui/react";
import { useLojaFilter } from "@/hooks/useLojaFilter";
import { usePermissoes } from "@/hooks/usePermissoes";
import { useEffect, useState } from "react";
import { getResumoFinanceiro } from "@/services/financeiroService";
import { LojasService } from "@/services/lojasService";
import type { Loja } from "@/types";
import {
  FolhaSalarialPanel,
  ContasLojaPanel,
  ValesPanel,
  RetiradasPessoaisPanel,
  ContasFornecedorPanel,
  ImpostosPanel,
  GestaoFuncionariosPanel,
  CentroCustosPanel,
  RelatoriosPanel,
} from "@/components/financeiro";
import { useNotificacao } from "@/hooks/useNotificacao";
import { parseDate, getLocalTimeZone, today } from "@internationalized/date";
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  BuildingLibraryIcon,
  UsersIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

export default function FinanceiroPage() {
  const { error } = useNotificacao();
  const { lojaId: defaultLojaId } = useLojaFilter();
  const { temPermissao, loading: loadingPermissoes } = usePermissoes();
  const [lojaId, setLojaId] = useState<number | null>(0); // 0 = todas as lojas
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loadingLojas, setLoadingLojas] = useState(false);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [resumo, setResumo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("folha");

  // Date Range Picker state
  const [dateRange, setDateRange] = useState<any>({
    start: parseDate(
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`,
    ),
    end: today(getLocalTimeZone()),
  });

  // Carregar lojas disponíveis
  useEffect(() => {
    const carregarLojas = async () => {
      setLoadingLojas(true);
      try {
        const data = await LojasService.getTodasLojas();

        setLojas(data);
        // Mantém "Todas as Lojas" pré-selecionado (lojaId = 0)
      } catch (err) {
        error("Erro ao carregar lojas");
        console.error(err);
      } finally {
        setLoadingLojas(false);
      }
    };

    carregarLojas();
  }, []);

  // Atualizar mes e ano quando o date range mudar
  useEffect(() => {
    if (dateRange?.start) {
      setMes(dateRange.start.month);
      setAno(dateRange.start.year);
    }
  }, [dateRange]);

  const carregarResumo = async () => {
    try {
      setLoading(true);
      const dataInicio = dateRange?.start
        ? `${dateRange.start.year}-${String(dateRange.start.month).padStart(2, "0")}-${String(dateRange.start.day).padStart(2, "0")}`
        : undefined;
      const dataFim = dateRange?.end
        ? `${dateRange.end.year}-${String(dateRange.end.month).padStart(2, "0")}-${String(dateRange.end.day).padStart(2, "0")}`
        : undefined;

      const data = await getResumoFinanceiro(
        mes,
        ano,
        lojaId && lojaId > 0 ? lojaId : undefined,
        dataInicio,
        dataFim,
      );

      setResumo(data);
    } catch (err) {
      error("Erro ao carregar resumo financeiro");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarResumo();
  }, [mes, ano, lojaId, dateRange]);

  const dataInicio = dateRange?.start
    ? `${dateRange.start.year}-${String(dateRange.start.month).padStart(2, "0")}-${String(dateRange.start.day).padStart(2, "0")}`
    : undefined;
  const dataFim = dateRange?.end
    ? `${dateRange.end.year}-${String(dateRange.end.month).padStart(2, "0")}-${String(dateRange.end.day).padStart(2, "0")}`
    : undefined;

  const menuItems = [
    { key: "folha", label: "Folha Salarial", icon: ClipboardDocumentListIcon },
    {
      key: "contas-lojas",
      label: "Contas das Lojas",
      icon: BuildingStorefrontIcon,
    },
    { key: "vales", label: "Vales de Funcionários", icon: CreditCardIcon },
    { key: "retiradas", label: "Retiradas Pessoais", icon: BanknotesIcon },
    {
      key: "fornecedores",
      label: "Contas Fornecedores",
      icon: BuildingOfficeIcon,
    },
    {
      key: "impostos",
      label: "Impostos e Tributos",
      icon: BuildingLibraryIcon,
    },
    { key: "funcionarios", label: "Gestão de Funcionários", icon: UsersIcon },
    { key: "custos", label: "Centro de Custos", icon: TagIcon },
    { key: "relatorios", label: "Relatórios Gerenciais", icon: ChartBarIcon },
  ];

  // Verificar permissões
  const podeVisualizar = temPermissao("financeiro.visualizar");
  const podeFolha = temPermissao("financeiro.folha");
  const podeContasLojas = temPermissao("financeiro.contas_lojas");
  const podeVales = temPermissao("financeiro.vales");
  const podeRetiradas = temPermissao("financeiro.retiradas");
  const podeFornecedores = temPermissao("financeiro.fornecedores");
  const podeImpostos = temPermissao("financeiro.impostos");
  const podeFuncionarios = temPermissao("financeiro.funcionarios");
  const podeCustos = temPermissao("financeiro.custos");
  const podeRelatorios = temPermissao("financeiro.relatorios");

  // Verificar loading primeiro
  if (loadingPermissoes) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  // Verificação de acesso
  if (!podeVisualizar) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-6">
          <CardBody>
            <p className="text-danger">
              Você não tem permissão para acessar o módulo financeiro.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CurrencyDollarIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Financeiro</h1>
          </div>
          <p className="text-default-500">
            Gestão completa de contas, impostos e folha de pagamento
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 items-end">
        {loadingLojas ? (
          <div className="flex items-center gap-2">
            <Spinner size="sm" />
            <span className="text-sm text-default-500">
              Carregando lojas...
            </span>
          </div>
        ) : (
          <>
            <Select
              className="max-w-xs"
              isDisabled={lojas.length === 0}
              label="Loja"
              selectedKeys={
                lojaId !== null ? new Set([String(lojaId)]) : new Set(["0"])
              }
              onSelectionChange={(keys) => {
                const value = (keys as Set<string>).values().next().value;

                if (value) setLojaId(Number(value));
              }}
            >
              {[
                <SelectItem key="0" textValue="Todas as Lojas">
                  <div className="flex items-center gap-2">
                    <ChartBarIcon className="h-4 w-4" />
                    <span className="font-semibold text-primary">
                      Todas as Lojas
                    </span>
                  </div>
                </SelectItem>,
                ...lojas.map((loja) => (
                  <SelectItem key={String(loja.id)} textValue={loja.nome}>
                    {loja.nome}
                  </SelectItem>
                )),
              ]}
            </Select>

            <DateRangePicker
              className="max-w-xs"
              granularity="day"
              label="Período"
              pageBehavior="visible"
              value={dateRange}
              visibleMonths={2}
              onChange={setDateRange}
            />
          </>
        )}
      </div>

      {/* Resumo Financeiro */}
      {resumo && (
        <Card className="bg-gradient-to-right from-primary/10 to-secondary/10 p-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-6">
            <div>
              <p className="text-xs text-default-600">Período</p>
              <p className="text-lg font-bold">{resumo.periodo}</p>
            </div>
            <div>
              <p className="text-xs text-default-600">Folha de Pagamento</p>
              <p className="text-lg font-bold text-success">
                {resumo.totalFolhas.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-default-600">Contas Lojas</p>
              <p className="text-lg font-bold">
                {resumo.totalContas.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-default-600">Impostos</p>
              <p className="text-lg font-bold text-warning">
                {resumo.totalImpostos.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-default-600">Retiradas</p>
              <p className="text-lg font-bold">
                {resumo.totalRetiradas.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-default-600">Total Despesas</p>
              <p className="text-lg font-bold text-danger">
                {resumo.totalDespesas.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Menu e Conteudo */}
      <div className="rounded-xl border border-default-200 bg-default-50 p-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {menuItems
            .filter((item) => {
              // Filtrar por permissão
              switch (item.key) {
                case "folha":
                  return podeFolha;
                case "contas-lojas":
                  return podeContasLojas;
                case "vales":
                  return podeVales;
                case "retiradas":
                  return podeRetiradas;
                case "fornecedores":
                  return podeFornecedores;
                case "impostos":
                  return podeImpostos;
                case "funcionarios":
                  return podeFuncionarios;
                case "custos":
                  return podeCustos;
                case "relatorios":
                  return podeRelatorios;
                default:
                  return true;
              }
            })
            .map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;

              return (
                <button
                  key={item.key}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-default-200 bg-default-100 text-default-700 hover:border-default-300"
                  }`}
                  type="button"
                  onClick={() => setActiveTab(item.key)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
        </div>

        <div className="mt-4">
          <Tabs
            aria-label="Financeiro"
            classNames={{
              tabList: "hidden",
              cursor: "hidden",
            }}
            color="primary"
            selectedKey={activeTab}
            variant="solid"
            onSelectionChange={(key) => setActiveTab(String(key))}
          >
            {podeFolha && (
              <Tab
                key="folha"
                title={
                  <div className="flex items-center gap-2">
                    <ClipboardDocumentListIcon className="h-4 w-4" />
                    <span>Folha Salarial</span>
                  </div>
                }
              >
                <FolhaSalarialPanel
                  ano={ano}
                  dataFim={dataFim}
                  dataInicio={dataInicio}
                  lojaId={lojaId && lojaId > 0 ? lojaId : undefined}
                  mes={mes}
                />
              </Tab>
            )}

            {podeContasLojas && (
              <Tab
                key="contas-lojas"
                title={
                  <div className="flex items-center gap-2">
                    <BuildingStorefrontIcon className="h-4 w-4" />
                    <span>Contas das Lojas</span>
                  </div>
                }
              >
                <ContasLojaPanel
                  ano={ano}
                  dataFim={dataFim}
                  dataInicio={dataInicio}
                  lojaId={lojaId && lojaId > 0 ? lojaId : undefined}
                  mes={mes}
                />
              </Tab>
            )}

            {podeVales && (
              <Tab
                key="vales"
                title={
                  <div className="flex items-center gap-2">
                    <CreditCardIcon className="h-4 w-4" />
                    <span>Vales de Funcionários</span>
                  </div>
                }
              >
                <ValesPanel
                  ano={ano}
                  dataFim={dataFim}
                  dataInicio={dataInicio}
                  mes={mes}
                />
              </Tab>
            )}

            {podeRetiradas && (
              <Tab
                key="retiradas"
                title={
                  <div className="flex items-center gap-2">
                    <BanknotesIcon className="h-4 w-4" />
                    <span>Retiradas Pessoais</span>
                  </div>
                }
              >
                <RetiradasPessoaisPanel
                  ano={ano}
                  dataFim={dataFim}
                  dataInicio={dataInicio}
                  mes={mes}
                />
              </Tab>
            )}

            {podeFornecedores && (
              <Tab
                key="fornecedores"
                title={
                  <div className="flex items-center gap-2">
                    <BuildingOfficeIcon className="h-4 w-4" />
                    <span>Contas Fornecedores</span>
                  </div>
                }
              >
                <ContasFornecedorPanel
                  ano={ano}
                  dataFim={dataFim}
                  dataInicio={dataInicio}
                  mes={mes}
                />
              </Tab>
            )}

            {podeImpostos && (
              <Tab
                key="impostos"
                title={
                  <div className="flex items-center gap-2">
                    <BuildingLibraryIcon className="h-4 w-4" />
                    <span>Impostos e Tributos</span>
                  </div>
                }
              >
                <ImpostosPanel
                  ano={ano}
                  dataFim={dataFim}
                  dataInicio={dataInicio}
                  lojaId={lojaId && lojaId > 0 ? lojaId : undefined}
                  mes={mes}
                />
              </Tab>
            )}

            {podeFuncionarios && (
              <Tab
                key="funcionarios"
                title={
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4" />
                    <span>Gestão de Funcionários</span>
                  </div>
                }
              >
                <GestaoFuncionariosPanel />
              </Tab>
            )}

            {podeCustos && (
              <Tab
                key="custos"
                title={
                  <div className="flex items-center gap-2">
                    <TagIcon className="h-4 w-4" />
                    <span>Centro de Custos</span>
                  </div>
                }
              >
                <CentroCustosPanel
                  ano={ano}
                  dataFim={dataFim}
                  dataInicio={dataInicio}
                  lojaId={lojaId && lojaId > 0 ? lojaId : undefined}
                  lojaNome={
                    lojaId && lojaId > 0
                      ? lojas.find((l) => l.id === lojaId)?.nome
                      : "Todas as Lojas"
                  }
                  mes={mes}
                />
              </Tab>
            )}

            {podeRelatorios && (
              <Tab
                key="relatorios"
                title={
                  <div className="flex items-center gap-2">
                    <ChartBarIcon className="h-4 w-4" />
                    <span>Relatórios Gerenciais</span>
                  </div>
                }
              >
                <RelatoriosPanel />
              </Tab>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
