"use client";

import type { DashboardAparelhosDados } from "@/types/dashboardAparelhos";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Spinner,
} from "@heroui/react";
import {
  Smartphone,
  TrendingUp,
  Wallet,
  Coins,
  Gift,
  Trophy,
  Users,
  Store,
} from "lucide-react";

import { supabase } from "@/lib/supabaseClient";
import { usePermissoes } from "@/hooks/usePermissoes";
import { DashboardAparelhosService } from "@/services/dashboardAparelhosService";
import { useToast } from "@/components/Toast";

interface Loja {
  id: number;
  nome: string;
}

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor || 0);

export default function DashboardAparelhosPage() {
  const hojeISO = useMemo(() => new Date().toISOString().split("T")[0], []);
  const primeiroDiaDoMes = useMemo(() => {
    const hoje = new Date();

    return new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      .toISOString()
      .split("T")[0];
  }, []);

  const {
    temPermissao,
    loading: loadingPermissoes,
    todasLojas,
    lojaId,
  } = usePermissoes();
  const { showToast } = useToast();

  const [dataInicio, setDataInicio] = useState(primeiroDiaDoMes);
  const [dataFim, setDataFim] = useState(hojeISO);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loadingLojas, setLoadingLojas] = useState(false);
  const [lojaSelecionada, setLojaSelecionada] = useState<string>("");
  const [dados, setDados] = useState<DashboardAparelhosDados | null>(null);
  const [loading, setLoading] = useState(true);

  const lojaIdFinal = todasLojas
    ? lojaSelecionada
      ? Number(lojaSelecionada)
      : null
    : lojaId;

  const lojaNomeSelecionada =
    lojas.find((loja) => loja.id === lojaIdFinal)?.nome ||
    (lojaIdFinal ? `Loja ${lojaIdFinal}` : "");

  useEffect(() => {
    const carregarLojas = async () => {
      if (!todasLojas) return;
      setLoadingLojas(true);
      try {
        const { data, error } = await supabase
          .from("lojas")
          .select("id, nome")
          .order("nome");

        if (error) throw error;
        setLojas(data || []);
      } catch (error) {
        console.error("Erro ao carregar lojas:", error);
        setLojas([]);
      } finally {
        setLoadingLojas(false);
      }
    };

    carregarLojas();
  }, [todasLojas]);

  useEffect(() => {
    if (!todasLojas) return;
    if (lojaSelecionada) return;
    if (!lojas.length) return;

    const lojaSalva = localStorage.getItem(
      "dashboardAparelhos.lojaSelecionada",
    );

    if (lojaSalva && lojas.some((loja) => loja.id.toString() === lojaSalva)) {
      setLojaSelecionada(lojaSalva);

      return;
    }

    if (lojas.length === 1) {
      setLojaSelecionada(lojas[0].id.toString());
    }
  }, [todasLojas, lojas, lojaSelecionada]);

  useEffect(() => {
    if (!todasLojas) return;
    if (!lojaSelecionada) return;
    localStorage.setItem("dashboardAparelhos.lojaSelecionada", lojaSelecionada);
  }, [todasLojas, lojaSelecionada]);

  useEffect(() => {
    if (!loadingPermissoes && !todasLojas && lojaId) {
      setLojaSelecionada(lojaId.toString());
    }
  }, [loadingPermissoes, todasLojas, lojaId]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const data = await DashboardAparelhosService.buscarDados({
        data_inicio: dataInicio || primeiroDiaDoMes,
        data_fim: dataFim || hojeISO,
        loja_id: lojaIdFinal || undefined,
      });

      setDados(data);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      showToast("Erro ao carregar dashboard", "error");
      setDados(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loadingPermissoes && temPermissao("dashboard.visualizar")) {
      carregarDados();
    }
  }, [loadingPermissoes, lojaIdFinal]);

  if (loadingPermissoes) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!temPermissao("dashboard.visualizar")) {
    return (
      <div className="p-6">
        <Card className="border-danger/30 bg-danger/5">
          <CardBody>
            <p className="text-danger">
              Voce nao tem permissao para visualizar este dashboard.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Smartphone className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Dashboard de Aparelhos</h1>
            <p className="text-sm text-default-500">
              Visao geral de vendas e desempenho
            </p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          {todasLojas ? (
            <Select
              className="w-full md:w-56"
              isDisabled={loadingLojas}
              label="Loja"
              placeholder={
                loadingLojas ? "Carregando lojas..." : "Selecione uma loja"
              }
              selectedKeys={lojaSelecionada ? [lojaSelecionada] : []}
              onChange={(e) => setLojaSelecionada(e.target.value)}
            >
              {lojas.map((loja) => (
                <SelectItem key={loja.id.toString()}>{loja.nome}</SelectItem>
              ))}
            </Select>
          ) : null}
          <Input
            label="Data inicio"
            type="date"
            value={dataInicio}
            onValueChange={setDataInicio}
          />
          <Input
            label="Data fim"
            type="date"
            value={dataFim}
            onValueChange={setDataFim}
          />
          <Button
            color="primary"
            isDisabled={loading || (todasLojas && !lojaIdFinal)}
            onPress={carregarDados}
          >
            Atualizar
          </Button>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardBody>
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          </CardBody>
        </Card>
      ) : !dados ? (
        <Card>
          <CardBody>
            <p className="text-center text-default-500">
              Nenhum dado encontrado para o periodo selecionado.
            </p>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-default-500">Venda total</p>
                  <h3 className="text-2xl font-bold">
                    {formatarMoeda(dados.total_vendas)}
                  </h3>
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-success" />
                <div>
                  <p className="text-sm text-default-500">Lucro total</p>
                  <h3 className="text-2xl font-bold">
                    {formatarMoeda(dados.lucro_total)}
                  </h3>
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="flex items-center gap-3">
                <Coins className="w-5 h-5 text-warning" />
                <div>
                  <p className="text-sm text-default-500">
                    Custo total aparelhos
                  </p>
                  <h3 className="text-2xl font-bold">
                    {formatarMoeda(dados.custo_total_aparelhos)}
                  </h3>
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="flex items-center gap-3">
                <Gift className="w-5 h-5 text-secondary" />
                <div>
                  <p className="text-sm text-default-500">Custo de brindes</p>
                  <h3 className="text-2xl font-bold">
                    {formatarMoeda(dados.custo_total_brindes)}
                  </h3>
                </div>
              </CardHeader>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Venda e lucro por vendedor</h3>
              </CardHeader>
              <CardBody>
                <Table aria-label="Vendas por vendedor">
                  <TableHeader>
                    <TableColumn>VENDEDOR</TableColumn>
                    <TableColumn>QTDE</TableColumn>
                    <TableColumn>VENDAS</TableColumn>
                    <TableColumn>LUCRO</TableColumn>
                    <TableColumn>MARGEM</TableColumn>
                  </TableHeader>
                  <TableBody
                    emptyContent="Sem dados"
                    items={dados.vendas_por_vendedor}
                  >
                    {(item) => (
                      <TableRow key={item.id || item.nome}>
                        <TableCell>{item.nome}</TableCell>
                        <TableCell>{item.quantidade}</TableCell>
                        <TableCell>
                          {formatarMoeda(item.total_vendas)}
                        </TableCell>
                        <TableCell>{formatarMoeda(item.lucro)}</TableCell>
                        <TableCell>
                          <Chip color="success" size="sm" variant="flat">
                            {Math.round(item.margem * 100)}%
                          </Chip>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-warning" />
                <h3 className="font-semibold">Top vendedores</h3>
              </CardHeader>
              <CardBody>
                <Table aria-label="Top vendedores">
                  <TableHeader>
                    <TableColumn>VENDEDOR</TableColumn>
                    <TableColumn>QTDE</TableColumn>
                    <TableColumn>VENDAS</TableColumn>
                    <TableColumn>LUCRO</TableColumn>
                  </TableHeader>
                  <TableBody
                    emptyContent="Sem dados"
                    items={dados.top_vendedores}
                  >
                    {(item) => (
                      <TableRow key={item.id || item.nome}>
                        <TableCell>{item.nome}</TableCell>
                        <TableCell>{item.quantidade}</TableCell>
                        <TableCell>
                          {formatarMoeda(item.total_vendas)}
                        </TableCell>
                        <TableCell>{formatarMoeda(item.lucro)}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Top clientes</h3>
              </CardHeader>
              <CardBody>
                <Table aria-label="Top clientes">
                  <TableHeader>
                    <TableColumn>CLIENTE</TableColumn>
                    <TableColumn>QTDE</TableColumn>
                    <TableColumn>VENDAS</TableColumn>
                  </TableHeader>
                  <TableBody
                    emptyContent="Sem dados"
                    items={dados.top_clientes}
                  >
                    {(item) => (
                      <TableRow key={item.id || item.nome}>
                        <TableCell>{item.nome}</TableCell>
                        <TableCell>{item.quantidade}</TableCell>
                        <TableCell>
                          {formatarMoeda(item.total_vendas)}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-secondary" />
                <h3 className="font-semibold">Top produtos (aparelhos)</h3>
              </CardHeader>
              <CardBody>
                <Table aria-label="Top produtos">
                  <TableHeader>
                    <TableColumn>PRODUTO</TableColumn>
                    <TableColumn>QTDE</TableColumn>
                    <TableColumn>VENDAS</TableColumn>
                    <TableColumn>LUCRO</TableColumn>
                  </TableHeader>
                  <TableBody
                    emptyContent="Sem dados"
                    items={dados.top_produtos}
                  >
                    {(item) => (
                      <TableRow key={item.nome}>
                        <TableCell>{item.nome}</TableCell>
                        <TableCell>{item.quantidade}</TableCell>
                        <TableCell>
                          {formatarMoeda(item.total_vendas)}
                        </TableCell>
                        <TableCell>{formatarMoeda(item.lucro)}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
