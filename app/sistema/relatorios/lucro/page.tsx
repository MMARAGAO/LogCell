"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Pagination } from "@heroui/pagination";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { createBrowserClient } from "@supabase/ssr";
import { TrendingUp, ShoppingBag, PiggyBank, DollarSign, Download } from "lucide-react";
import { CalendarIcon, FunnelIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

import { formatarMoeda } from "@/lib/formatters";
import { useAuthContext } from "@/contexts/AuthContext";

const ITENS_POR_PAGINA = 20;

export default function RelatorioLucroPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { usuario } = useAuthContext();

  const [dataInicio, setDataInicio] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [dataFim, setDataFim] = useState(() => new Date().toISOString().split("T")[0]);
  const [lojaFiltro, setLojaFiltro] = useState<string>("");
  const [vendedorFiltro, setVendedorFiltro] = useState<string>("");
  const [lojas, setLojas] = useState<any[]>([]);
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [dados, setDados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    carregarLojas();
    carregarVendedores();
  }, []);

  useEffect(() => {
    carregarDados();
  }, [dataInicio, dataFim, lojaFiltro, vendedorFiltro]);

  async function carregarLojas() {
    const { data } = await supabase.from("lojas").select("id, nome").order("nome");
    setLojas(data || []);
  }

  async function carregarVendedores() {
    const { data } = await supabase
      .from("usuarios")
      .select("id, nome")
      .eq("ativo", true)
      .order("nome");
    setVendedores(data || []);
  }

  async function carregarDados() {
    setLoading(true);
    try {
      let query = supabase
        .from("aparelhos")
        .select(`
          id, marca, modelo, imei, valor_venda, valor_compra, data_venda, loja_id, venda_id,
          venda:vendas!inner(vendedor_id, criado_em)
        `)
        .eq("status", "vendido")
        .not("venda_id", "is", null)
        .gte("data_venda", dataInicio)
        .lte("data_venda", dataFim);

      if (lojaFiltro) query = query.eq("loja_id", Number(lojaFiltro));
      if (vendedorFiltro) query = query.eq("venda.vendedor_id", vendedorFiltro);

      const { data: aparelhos } = await query.order("data_venda", { ascending: false });
      if (!aparelhos || aparelhos.length === 0) { setDados([]); setLoading(false); return; }

      const vendaIds = Array.from(new Set(aparelhos.map((a: any) => a.venda_id).filter(Boolean) as string[]));

      const [brindesData, taxasData, vendedoresData] = await Promise.all([
        supabase.from("brindes_aparelhos").select("venda_id, valor_custo").in("venda_id", vendaIds),
        supabase.from("pagamentos_venda").select("venda_id, valor, liquido").in("venda_id", vendaIds).in("tipo_pagamento", ["cartao_credito", "cartao_debito"]),
        supabase.from("usuarios").select("id, nome").in("id", Array.from(new Set(aparelhos.map((a: any) => a.venda?.vendedor_id).filter(Boolean) as string[]))),
      ]);

      const brindesPV: Record<string, number> = {};
      brindesData.data?.forEach((b: any) => { brindesPV[b.venda_id] = (brindesPV[b.venda_id] || 0) + (b.valor_custo || 0); });

      const taxasPV: Record<string, number> = {};
      taxasData.data?.forEach((p: any) => { const t = (p.valor || 0) - (p.liquido || 0); if (t > 0) taxasPV[p.venda_id] = (taxasPV[p.venda_id] || 0) + t; });

      const vendedoresMap = new Map(vendedoresData.data?.map((v: any) => [v.id, v.nome]));

      const lista = aparelhos.map((a: any) => {
        const custo = (a.valor_compra || 0) + (brindesPV[a.venda_id] || 0) + (taxasPV[a.venda_id] || 0);
        return {
          id: a.id,
          modelo: `${a.marca || ""} ${a.modelo || ""}`,
          imei: a.imei || "",
          valor_venda: a.valor_venda || 0,
          valor_compra: a.valor_compra || 0,
          brindes: brindesPV[a.venda_id] || 0,
          taxas: taxasPV[a.venda_id] || 0,
          lucro: (a.valor_venda || 0) - custo,
          data_venda: a.data_venda?.split("T")[0] || "",
          loja_id: a.loja_id,
          vendedor_nome: vendedoresMap.get(a.venda?.vendedor_id) || "—",
        };
      });

      setDados(lista);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const kpis = useMemo(() => {
    const totalBruto = dados.reduce((s, d) => s + d.valor_venda, 0);
    const totalLucro = dados.reduce((s, d) => s + d.lucro, 0);
    const totalCusto = dados.reduce((s, d) => s + d.valor_compra, 0);
    const totalTaxas = dados.reduce((s, d) => s + d.taxas, 0);
    const totalBrindes = dados.reduce((s, d) => s + d.brindes, 0);
    return { totalBruto, totalLucro, totalCusto, totalTaxas, totalBrindes, quantidade: dados.length, margem: totalBruto > 0 ? (totalLucro / totalBruto) * 100 : 0 };
  }, [dados]);

  const porVendedor = useMemo(() => {
    const map = new Map<string, { bruto: number; lucro: number; qtd: number }>();
    dados.forEach((d) => {
      if (!map.has(d.vendedor_nome)) map.set(d.vendedor_nome, { bruto: 0, lucro: 0, qtd: 0 });
      const v = map.get(d.vendedor_nome)!;
      v.bruto += d.valor_venda;
      v.lucro += d.lucro;
      v.qtd++;
    });
    return Array.from(map.entries()).sort((a, b) => b[1].lucro - a[1].lucro);
  }, [dados]);

  const totalPaginas = Math.ceil(dados.length / ITENS_POR_PAGINA);
  const inicio = (pagina - 1) * ITENS_POR_PAGINA;
  const dadosPagina = dados.slice(inicio, inicio + ITENS_POR_PAGINA);

  useEffect(() => { setPagina(1); }, [dataInicio, dataFim, lojaFiltro]);

  function exportarCSV() {
    const cabecalho = "Vendedor,Aparelho,IMEI,Data,Valor Bruto,Custo,Taxas,Brindes,Lucro";
    const linhas = dados.map((d) =>
      [d.vendedor_nome, d.modelo, d.imei, d.data_venda, d.valor_venda, d.valor_compra, d.taxas, d.brindes, d.lucro].join(",")
    );
    const csv = "\uFEFF" + [cabecalho, ...linhas].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-lucro-${dataInicio}-${dataFim}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-zinc-800 p-5">
        <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Relatório de Lucro</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Aparelhos vendidos — lucro real por vendedor e período</p>
            </div>
          </div>
          <Button color="primary" variant="flat" className="rounded-xl text-xs font-medium" startContent={<Download className="w-4 h-4" />} onPress={exportarCSV}>
            Exportar CSV
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 mb-5">
          <Input label="Data Início" size="sm" type="date" variant="bordered" classNames={{ inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 w-40" }} value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
          <Input label="Data Fim" size="sm" type="date" variant="bordered" classNames={{ inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 w-40" }} value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
          <Select label="Loja" size="sm" variant="bordered" classNames={{ trigger: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 w-48" }} selectedKeys={lojaFiltro ? [lojaFiltro] : []} onSelectionChange={(keys) => setLojaFiltro(Array.from(keys)[0] as string || "")}>
            {[{id: 0, nome: "Todas"}, ...lojas].map((l: any) => <SelectItem key={l.id === 0 ? "" : String(l.id)}>{l.nome}</SelectItem>)}
          </Select>
          <Select label="Vendedor" size="sm" variant="bordered" classNames={{ trigger: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 w-48" }} selectedKeys={vendedorFiltro ? [vendedorFiltro] : []} onSelectionChange={(keys) => setVendedorFiltro(Array.from(keys)[0] as string || "")}>
            {[{id: "0", nome: "Todos"}, ...vendedores].map((v: any) => <SelectItem key={v.id === "0" ? "" : v.id}>{v.nome}</SelectItem>)}
          </Select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <KpiCard icon={<ShoppingBag className="w-4 h-4" />} value={formatarMoeda(kpis.totalBruto)} label="Valor Bruto" color="text-blue-600" bg="bg-blue-50 dark:bg-blue-900/20" iconBg="bg-blue-100 dark:bg-blue-900/40" />
          <KpiCard icon={<PiggyBank className="w-4 h-4" />} value={formatarMoeda(kpis.totalLucro)} label="Lucro Líquido" color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-900/20" iconBg="bg-emerald-100 dark:bg-emerald-900/40" />
          <KpiCard icon={<DollarSign className="w-4 h-4" />} value={`${kpis.margem.toFixed(1)}%`} label="Margem Média" color="text-purple-600" bg="bg-purple-50 dark:bg-purple-900/20" iconBg="bg-purple-100 dark:bg-purple-900/40" />
          <KpiCard icon={<TrendingUp className="w-4 h-4" />} value={String(kpis.quantidade)} label="Aparelhos" color="text-indigo-600" bg="bg-indigo-50 dark:bg-indigo-900/20" iconBg="bg-indigo-100 dark:bg-indigo-900/40" />
          <KpiCard icon={<DollarSign className="w-4 h-4" />} value={formatarMoeda(kpis.totalCusto)} label="Custo Total" color="text-orange-600" bg="bg-orange-50 dark:bg-orange-900/20" iconBg="bg-orange-100 dark:bg-orange-900/40" />
        </div>
      </div>

      {/* Por Vendedor */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-zinc-800 p-5">
        <p className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Lucro por Vendedor</p>
        <div className="space-y-2">
          {porVendedor.map(([nome, v]) => (
            <div key={nome} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{nome}</p>
                <p className="text-xs text-gray-400">{v.qtd} aparelho(s)</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-emerald-600">{formatarMoeda(v.lucro)}</p>
                <p className="text-xs text-gray-400">{v.bruto > 0 ? ((v.lucro / v.bruto) * 100).toFixed(1) : 0}% margem</p>
              </div>
            </div>
          ))}
          {porVendedor.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Nenhum dado no período</p>}
        </div>
      </div>

      {/* Lista detalhada */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-zinc-800">
          <p className="text-sm font-semibold text-gray-800 dark:text-white">Detalhamento</p>
          <p className="text-xs text-gray-400 mt-0.5">Mostrando {dados.length} registro(s)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
                <th className="py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Vendedor</th>
                <th className="py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Aparelho</th>
                <th className="py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Data</th>
                <th className="py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-right">Bruto</th>
                <th className="py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-right">Custo</th>
                <th className="py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-right">Taxas</th>
                <th className="py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-right">Lucro</th>
              </tr>
            </thead>
            <tbody>
              {dadosPagina.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-sm text-gray-400">Nenhum registro encontrado</td></tr>
              ) : (
                dadosPagina.map((d) => (
                  <tr key={d.id} className="border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{d.vendedor_nome}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{d.modelo}{d.imei ? ` (${d.imei})` : ""}</td>
                    <td className="py-3 px-4 text-xs text-gray-400">{d.data_venda}</td>
                    <td className="py-3 px-4 text-sm text-right font-medium text-gray-800 dark:text-white">{formatarMoeda(d.valor_venda)}</td>
                    <td className="py-3 px-4 text-sm text-right text-gray-500">{formatarMoeda(d.valor_compra)}</td>
                    <td className="py-3 px-4 text-sm text-right text-red-500">{formatarMoeda(d.taxas)}</td>
                    <td className="py-3 px-4 text-sm text-right font-semibold text-emerald-600">{formatarMoeda(d.lucro)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPaginas > 1 && (
          <div className="flex justify-center py-4 border-t border-gray-100 dark:border-zinc-800">
            <Pagination showControls color="primary" page={pagina} size="lg" total={totalPaginas} onChange={setPagina} />
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({ icon, value, label, color, bg, iconBg }: { icon: React.ReactNode; value: string; label: string; color: string; bg: string; iconBg: string }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl ${bg}`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg} ${color}`}>{icon}</div>
      <div className="min-w-0">
        <p className={`text-sm font-bold truncate ${color}`}>{value}</p>
        <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}
