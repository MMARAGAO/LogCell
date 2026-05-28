"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, ButtonGroup } from "@heroui/button";
import { Input } from "@heroui/input";
import { Pagination } from "@heroui/pagination";
import { Select, SelectItem } from "@heroui/select";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Tabs, Tab } from "@heroui/tabs";
import { Divider } from "@heroui/divider";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import {
  CurrencyDollarIcon,
  ClockIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  DevicePhoneMobileIcon,
  FunnelIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PhoneIcon,
  UserIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  GiftIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { DollarSign, TrendingUp, ShoppingBag, PiggyBank, Coins, LayoutGrid, TableIcon, EllipsisVertical } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

import { formatarMoeda } from "@/lib/formatters";
import { useAuthContext } from "@/contexts/AuthContext";
import { usePermissoes } from "@/hooks/usePermissoes";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/components/Toast";
import { DetalhesAparelhoModal } from "@/components/aparelhos/DetalhesAparelhoModal";
import { RecebimentoAparelhoModal } from "@/components/aparelhos/RecebimentoAparelhoModal";
import { NovaVendaModal } from "@/components/aparelhos/NovaVendaModal";

const ITENS_POR_PAGINA = 12;
const TIPO_LABEL: Record<string, string> = {
  dinheiro: "Dinheiro",
  pix: "PIX",
  cartao_credito: "Cartão de Crédito",
  cartao_debito: "Cartão de Débito",
  transferencia: "Transferência",
  boleto: "Boleto",
  credito_cliente: "Crédito Cliente",
  troca_aparelho: "Troca",
};

type TrocaPendente = {
  localId: string;
  modelo: string;
  imei: string;
  condicao: string;
  bateria: string;
  cor: string;
  armazenamento: string;
  valor: number;
};

export default function VendasAparelhosPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { usuario } = useAuthContext();
  const { temPermissao } = usePermissoes();
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  const [vendas, setVendas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [debouncedBusca, setDebouncedBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<string>("");
  const [periodo, setPeriodo] = useState<string>("todas");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [selectedTab, setSelectedTab] = useState("todas");
  const [cancelando, setCancelando] = useState<string | null>(null);
  const [modoVisualizacao, setModoVisualizacao] = useState<"cards" | "tabela">("cards");

  const [modalDetalhes, setModalDetalhes] = useState<any>(null);
  const [modalPagamento, setModalPagamento] = useState<any>(null);
  const [modalNovaVenda, setModalNovaVenda] = useState(false);
  const [vendaParaEditar, setVendaParaEditar] = useState<any>(null);
  const [brindeModal, setBrindeModal] = useState<{ vendaId: string; aparelhoId: string } | null>(null);
  const [brindeDesc, setBrindeDesc] = useState("");
  const [brindeValor, setBrindeValor] = useState("");
  const [trocaModal, setTrocaModal] = useState<{ vendaId: string; aparelhoId: string } | null>(null);
  const [confirmDeleteTroca, setConfirmDeleteTroca] = useState<string | null>(null);
  const [salvandoTrocas, setSalvandoTrocas] = useState(false);
  const [trocaForm, setTrocaForm] = useState({ modelo: "", imei: "", condicao: "", bateria: "", cor: "", armazenamento: "", valor: 0 });
  const [trocaValorStr, setTrocaValorStr] = useState("");
  const [trocasPendentes, setTrocasPendentes] = useState<TrocaPendente[]>([]);

  // Carrega trocas existentes ao abrir o modal
  useEffect(() => {
    if (!trocaModal) { setTrocasPendentes([]); return; }
    const carregarTrocas = async () => {
      const pattern = `%"venda_id":"${trocaModal.vendaId}"%`;
      const { data } = await supabase
        .from("aparelhos")
        .select("id, modelo, imei, condicao, saude_bateria, cor, armazenamento, valor_venda, observacoes")
        .eq("marca", "Troca")
        .ilike("observacoes", pattern);
      if (data) {
        setTrocasPendentes(data.map((t: any) => {
          const obs = (() => { try { return JSON.parse(t.observacoes || "{}"); } catch { return {}; } })();
          return {
            localId: t.id?.toString?.() || crypto.randomUUID(),
            modelo: t.modelo || "",
            imei: t.imei || "",
            condicao: obs.condicao || t.condicao || "",
            bateria: t.saude_bateria?.toString() || "",
            cor: t.cor || "",
            armazenamento: t.armazenamento || "",
            valor: t.valor_venda || 0,
          };
        }));
      }
    };
    carregarTrocas();
  }, [trocaModal]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBusca(busca);
    }, 400);
    return () => clearTimeout(timer);
  }, [busca]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [debouncedBusca, periodo, dataInicio, dataFim, selectedTab]);

  useEffect(() => {
    carregarVendas();
  }, [debouncedBusca, periodo, dataInicio, dataFim, selectedTab, paginaAtual]);

  async function carregarVendas() {
    try {
      // Monta filtros
      const filtros: any[] = [["eq", "status", '"vendido"']];
      if (busca) {
        filtros.push(["or", `marca.ilike.%25${busca}%25,modelo.ilike.%25${busca}%25,imei.ilike.%25${busca}%25`]);
      }
      if (periodo === "hoje" || selectedTab === "hoje") {
        const h = new Date().toISOString().split("T")[0];
        filtros.push(["gte", "data_venda", `"${h}"`]);
        filtros.push(["lte", "data_venda", `"${h}T23:59:59"`]);
      } else if (periodo === "semana") {
        const inicio = new Date(); inicio.setDate(inicio.getDate() - inicio.getDay() + 1);
        filtros.push(["gte", "data_venda", `"${inicio.toISOString().split("T")[0]}"`]);
      } else if (periodo === "mes") {
        const mes = new Date().toISOString().slice(0, 7);
        filtros.push(["gte", "data_venda", `"${mes}-01"`]);
      } else if (periodo === "personalizado" && dataInicio) {
        filtros.push(["gte", "data_venda", `"${dataInicio}"`]);
        if (dataFim) filtros.push(["lte", "data_venda", `"${dataFim}T23:59:59"`]);
      }

      // Busca total de registros (para KPIs) - busca IDs de todas as vendas do periodo
      let allQuery = supabase.from("aparelhos").select("venda_id, data_venda, valor_venda, valor_compra").eq("status", "vendido").not("venda_id", "is", null);
      filtros.forEach((f) => { if (f[0] === "gte") allQuery = allQuery.gte(f[1], f[2].replace(/"/g, ""));
        else if (f[0] === "lte") allQuery = allQuery.lte(f[1], f[2].replace(/"/g, ""));
        else if (f[0] === "or") allQuery = allQuery.or(f[1].replace(/%25/g, "%")); });
      const { data: allData } = await allQuery;
      const totalRegistros = allData?.length || 0;

      // KPIs: calcula de todos os registros
      const hoje = new Date().toISOString().split("T")[0];
      const allVendasIds = Array.from(new Set(allData?.map((a: any) => a.venda_id).filter(Boolean) as string[]));
      const { data: allPagtos } = allVendasIds.length > 0 ? await supabase.from("pagamentos_venda")
        .select("venda_id, valor, liquido, tipo_pagamento").in("venda_id", allVendasIds) : { data: [] };
      const { data: allBrindes } = allVendasIds.length > 0 ? await supabase
        .from("brindes_aparelhos").select("venda_id, valor_custo").in("venda_id", allVendasIds) : { data: [] };
      const { data: allVendas } = allVendasIds.length > 0 ? await supabase
        .from("vendas").select("id, status").in("id", allVendasIds) : { data: [] };
      const allVendasStatus = new Map(allVendas?.map((v: any) => [v.id, v.status]));

      let totalPagos = 0, totalLucro = 0, totalQtd = 0, pendentes = 0, hojeCount = 0;
      const porTipo: Record<string, number> = {};
      const brindesTotal: Record<string, number> = {};
      allBrindes?.forEach((b: any) => { brindesTotal[b.venda_id] = (brindesTotal[b.venda_id] || 0) + (b.valor_custo || 0); });
      allPagtos?.forEach((p: any) => {
        const vid = p.venda_id; const val = p.liquido ?? p.valor;
        if (allVendasStatus.get(vid) === "cancelada") return;
        totalPagos += val;
        const tipo = p.tipo_pagamento || "outros";
        porTipo[tipo] = (porTipo[tipo] || 0) + val;
      });
      allData?.forEach((a: any) => {
        totalQtd++;
        const custoBrindes = brindesTotal[a.venda_id] || 0;
        const pagtoValor = allPagtos?.filter((p: any) => p.venda_id === a.venda_id).reduce((s: number, p: any) => s + (p.liquido ?? p.valor), 0) || 0;
        totalLucro += pagtoValor - (a.valor_compra || 0) - custoBrindes;
        if (allVendasStatus.get(a.venda_id) === "em_andamento") pendentes++;
        if (a.data_venda?.startsWith(hoje)) hojeCount++;
      });

      setKpis({ vendasHoje: hojeCount, pendentes, faturamento: totalPagos, lucroTotal: totalLucro, total: totalQtd, porTipo });

      // Paginação backend
      const totalPages = Math.ceil(totalRegistros / ITENS_POR_PAGINA);
      const pagina = Math.min(paginaAtual, totalPages || 1);
      const inicio = (pagina - 1) * ITENS_POR_PAGINA;
      setTotalPaginasBackend(totalPages);

      // Busca página atual com dados completos
      let query = supabase.from("aparelhos").select("*, loja:lojas(id, nome)").eq("status", "vendido").not("venda_id", "is", null);
      filtros.forEach((f) => {
        if (f[0] === "gte") query = query.gte(f[1], f[2].replace(/"/g, ""));
        else if (f[0] === "lte") query = query.lte(f[1], f[2].replace(/"/g, ""));
        else if (f[0] === "or") query = query.or(f[1].replace(/%25/g, "%"));
      });
      const { data: aparelhos } = await query.order("data_venda", { ascending: false }).range(inicio, inicio + ITENS_POR_PAGINA - 1);

      if (!aparelhos) { setVendas([]); setLoading(false); return; }

      const vendasIds = aparelhos.map((a) => a.venda_id).filter(Boolean) as string[];
      const vendasResult = vendasIds.length > 0 ? await supabase.from("vendas").select("id, numero_venda, cliente_id, status, valor_total, criado_em").in("id", vendasIds) : { data: [] };
      const pagamentosResult = vendasIds.length > 0 ? await supabase.from("pagamentos_venda").select("venda_id, tipo_pagamento, valor, liquido, taxa_percentual, parcelas, editado").in("venda_id", vendasIds) : { data: [] };
      const brindesResult = vendasIds.length > 0 ? await supabase.from("brindes_aparelhos").select("venda_id, descricao, valor_custo").in("venda_id", vendasIds) : { data: [] };
      const clienteIds = Array.from(new Set((vendasResult.data || []).map((v: any) => v.cliente_id).filter(Boolean) as string[]));
      const clientesResult = clienteIds.length > 0 ? await supabase.from("clientes").select("id, nome, telefone, doc").in("id", clienteIds) : { data: [] };

      const pagamentosPorVenda: Record<string, any[]> = {};
      (pagamentosResult.data || []).forEach((p: any) => { (pagamentosPorVenda[p.venda_id] ??= []).push(p); });
      const brindesPorVenda: Record<string, any[]> = {};
      (brindesResult.data || []).forEach((b: any) => { (brindesPorVenda[b.venda_id] ??= []).push(b); });
      const clientesMap = new Map((clientesResult.data || []).map((c: any) => [c.id, c]));
      const vendasMap = new Map((vendasResult.data || []).map((v: any) => [v.id, v]));

      setVendas(aparelhos.map((a) => {
        const venda = vendasMap.get(a.venda_id || "");
        const pagamentos = pagamentosPorVenda[a.venda_id || ""] || [];
        const brindes = brindesPorVenda[a.venda_id || ""] || [];
        const totalPago = pagamentos.reduce((s: number, p: any) => s + (p.liquido ?? p.valor), 0);
        const custoBrindes = brindes.reduce((s: number, b: any) => s + (b.valor_custo || 0), 0);
        return { ...a, pagamentos, brindes, pagamento_total: totalPago, pagamento_qtd: pagamentos.length, custo_brindes: custoBrindes, lucro: totalPago - (a.valor_compra || 0) - custoBrindes, venda, cliente: venda ? clientesMap.get(venda.cliente_id) : null };
      }));
    } catch (err) {
      console.error("Erro ao carregar vendas:", err);
      toast.error("Erro ao carregar vendas");
    } finally { setLoading(false); }
  }

  const [kpis, setKpis] = useState({ vendasHoje: 0, pendentes: 0, faturamento: 0, lucroTotal: 0, total: 0, porTipo: {} as Record<string, number> });
  const [totalPaginasBackend, setTotalPaginasBackend] = useState(0);
  const vendasPaginadas = vendas;

  async function handleCancelarVenda(v: any) {
    const conf = await confirm({
      title: "Cancelar Venda",
      message: `Tem certeza que deseja cancelar a venda #${v.venda?.numero_venda} de ${v.marca} ${v.modelo}?\n\nO aparelho voltará para o estoque e todos os pagamentos serão removidos.`,
      confirmText: "Cancelar Venda",
      cancelText: "Voltar",
      variant: "danger",
      confirmColor: "danger",
    });
    if (!conf) return;

    setCancelando(v.id);
    try {
      await supabase.from("pagamentos_venda").delete().eq("venda_id", v.venda_id);
      await supabase.from("aparelhos").update({ status: "disponivel", venda_id: null, data_venda: null }).eq("id", v.id);
      await supabase.from("vendas").update({ status: "cancelada", valor_pago: 0, saldo_devedor: 0 }).eq("id", v.venda_id);
      await supabase.from("historico_aparelhos").insert({
        aparelho_id: v.id, tipo_acao: "devolucao",
        descricao: `Venda #${v.venda?.numero_venda} cancelada — aparelho retornou ao estoque`,
        usuario_id: usuario?.id,
      });
      toast.success("Venda cancelada com sucesso");
      carregarVendas();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao cancelar venda");
    } finally {
      setCancelando(null);
    }
  }

  function exportarCSV() {
    const linhas = vendas.map((v) => [
      v.venda?.numero_venda || "",
      v.cliente?.nome || "",
      v.cliente?.telefone || "",
      `${v.marca || ""} ${v.modelo || ""}`,
      v.imei || "",
      v.valor_venda || 0,
      v.pagamento_total,
      (v.valor_venda || 0) - v.pagamento_total,
      v.venda?.status === "concluida" ? "Concluída" : "Pendente",
      v.data_venda ? new Date(v.data_venda).toLocaleDateString("pt-BR") : "",
    ]);

    const cabecalho = "Nº Venda,Cliente,Telefone,Aparelho,IMEI,Valor,Pago,Saldo,Status,Data";
    const csv = [cabecalho, ...linhas.map((l) => l.join(","))].join("\n");
    const bom = "\uFEFF" + csv;
    const blob = new Blob([bom], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vendas-aparelhos-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório exportado");
  }

  async function handleAdicionarBrinde() {
    if (!brindeModal || !brindeDesc) return;
    try {
      await supabase.from("brindes_aparelhos").insert({
        venda_id: brindeModal.vendaId,
        descricao: brindeDesc,
        valor_custo: parseFloat(brindeValor.replace(/[^0-9,]/g, "").replace(",", ".")) || 0,
        loja_id: 1,
        criado_por: usuario?.id,
      });
      toast.success("Brinde adicionado");
      setBrindeModal(null);
      setBrindeDesc("");
      setBrindeValor("");
      carregarVendas();
    } catch {
      toast.error("Erro ao adicionar brinde");
    }
  }

  async function abrirEditarVenda(v: any) {
    setVendaParaEditar(v);
    setModalNovaVenda(true);
  }

  function adicionarTrocaPendente() {
    if (!trocaForm.modelo) { toast.warning("Informe o modelo"); return; }
    setTrocasPendentes([...trocasPendentes, { localId: crypto.randomUUID(), ...trocaForm }]);
    setTrocaForm({ modelo: "", imei: "", condicao: "", bateria: "", cor: "", armazenamento: "", valor: 0 });
    setTrocaValorStr("");
  }

  async function salvarTodasTrocas(
    trocasParaSalvar: TrocaPendente[] = trocasPendentes,
    options?: { fecharModal?: boolean; successMessage?: string },
  ) {
    if (!trocaModal) return;
    const fecharModal = options?.fecharModal ?? true;
    const successMessage = options?.successMessage ?? `${trocasParaSalvar.length} troca(s) salva(s)!`;
    console.log("🔍 salvarTodasTrocas - vendaId:", trocaModal.vendaId);
    console.log("🔍 trocasPendentes:", JSON.stringify(trocasParaSalvar));
    setSalvandoTrocas(true);
    try {
      if (!usuario?.id) {
        throw new Error("Usuário não autenticado");
      }

      const response = await fetch("/api/vendas/trocas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vendaId: trocaModal.vendaId,
          usuarioId: usuario.id,
          trocas: trocasParaSalvar.map(({ localId, ...troca }) => troca),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Erro ao sincronizar trocas");
      }

      console.log("Troca salva:", result);
      toast.success(successMessage);
      setTrocasPendentes(trocasParaSalvar);
      if (fecharModal) {
        setTrocaModal(null);
        setTrocasPendentes([]);
        setTrocaForm({ modelo: "", imei: "", condicao: "", bateria: "", cor: "", armazenamento: "", valor: 0 });
        setTrocaValorStr("");
      }
      carregarVendas();
    } catch (e: any) {
      console.error("Erro ao salvar trocas:", e);
      toast.error(`Erro: ${e?.message || e?.error?.message || "desconhecido"}. Verifique o console.`);
    } finally {
      setSalvandoTrocas(false);
    }
  }

  function imprimirGarantia(v: any) {
    const win = window.open("", "_blank");
    if (!win) return;
    const garantiaDias = v.garantia_dias || 90;
    const dataVenda = v.data_venda ? new Date(v.data_venda).toLocaleDateString("pt-BR") : "";
    const dataFimGarantia = v.data_venda ? new Date(new Date(v.data_venda).getTime() + garantiaDias * 86400000).toLocaleDateString("pt-BR") : "";
    const usuarioNome = usuario?.nome || "Vendedor";
    win.document.write(`
      <html><head><title>Garantia - ${v.marca} ${v.modelo}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 700px; margin: 30px auto; padding: 20px; color: #333; line-height: 1.6; }
        h1 { text-align: center; font-size: 20px; margin-bottom: 5px; }
        .sub { text-align: center; font-size: 13px; color: #666; margin-bottom: 25px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .info { margin: 15px 0; font-size: 13px; }
        .info td { padding: 4px 8px; }
        .clausulas { margin: 15px 0; font-size: 12px; }
        .clausulas h3 { font-size: 14px; margin: 15px 0 5px; }
        .clausulas ul { margin: 5px 0; padding-left: 20px; }
        .clausulas li { margin-bottom: 3px; }
        .clausulas p { margin: 5px 0; }
        .assinatura { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ccc; font-size: 12px; }
        .footer { text-align: center; font-size: 11px; color: #999; margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd; }
      </style></head><body>
        <h1>🄻 LogCell — TERMO DE GARANTIA</h1>
        <p class="sub">Venda de Aparelho</p>
        <table class="info">
          <tr><td><strong>Cliente:</strong></td><td>${v.cliente?.nome || "—"}</td></tr>
          <tr><td><strong>Aparelho:</strong></td><td>${v.marca} ${v.modelo}</td></tr>
          <tr><td><strong>IMEI:</strong></td><td>${v.imei || "—"}</td></tr>
          <tr><td><strong>Data da Venda:</strong></td><td>${dataVenda}</td></tr>
          <tr><td><strong>Garantia:</strong></td><td>${garantiaDias} dias (até ${dataFimGarantia})</td></tr>
          <tr><td><strong>Vendedor:</strong></td><td>${usuarioNome}</td></tr>
        </table>
        <hr>
        <div class="clausulas">
          <h3>PRAZO DE GARANTIA</h3>
          <p>A garantia concedida pela AUTORIZADA CELL é de ${garantiaDias} dias, contados a partir da data da compra.</p>
          <h3>COBERTURA DA GARANTIA</h3>
          <p>A garantia cobre exclusivamente defeitos de funcionamento interno e de fabricação, desde que o aparelho seja utilizado em condições normais.</p>
          <h3>A GARANTIA NÃO COBRE</h3>
          <ul>
            <li>Danos causados por mau uso, quedas, impactos ou contato com líquidos</li>
            <li>Oxidação, umidade ou surtos de energia</li>
            <li>Instalação de software não autorizado</li>
            <li>Danos causados por assistência técnica não autorizada</li>
            <li>Problemas estéticos ou desgaste natural pelo uso</li>
            <li>Danos decorrentes de uso de acessórios inadequados</li>
            <li>Perda ou bloqueio de IMEI por qualquer motivo externo</li>
          </ul>
          <h3>TERMOS DE GARANTIA</h3>
          <p>(1) A garantia somente será válida mediante a apresentação deste termo de garantia.</p>
          <p>(2) A AUTORIZADA CELL oferece garantia conforme descrito neste documento, contada a partir da data de entrega do aparelho ao cliente.</p>
          <p>(3) Defeitos causados por mau uso, quedas, contato com líquidos, umidade, oxidação, curtos de energia ou instalação de software não autorizado serão excluídos da garantia.</p>
          <p>(4) Brindes não estão sujeitos à garantia e devem ser testados e conferidos no ato da entrega.</p>
          <p>(5) O cliente declara estar ciente de todas as informações e condições descritas neste documento.</p>
          <h3>CONDIÇÕES GERAIS</h3>
          <p>• Este termo comprova que a compra foi realizada junto à AUTORIZADA CELL.</p>
          <p>• Para acionar a garantia, é obrigatória a apresentação deste termo.</p>
          <p>• O prazo para análise do produto será informado no momento da solicitação.</p>
          <p>• Caso seja constatado mau uso, será apresentado orçamento para reparo.</p>
        </div>
        <div class="assinatura">
          <p>Declaro estar ciente e de acordo com todas as condições descritas neste termo.</p>
          <br>
          <p>Assinatura do Cliente: ______________________________________</p>
          <br>
          <p>Data: ${new Date().toLocaleDateString("pt-BR")}</p>
          <p>Vendedor Responsável: ${usuarioNome}</p>
        </div>
        <div class="footer">LogCell - ${new Date().toLocaleString("pt-BR")}</div>
        <script>window.print()</script>
      </body></html>
    `);
    win.document.close();
  }

  function imprimirRecibo(v: any) {
    const win = window.open("", "_blank");
    if (!win) return;
    const pagtoHTML = (v.pagamentos || []).map((p: any) =>
      `<tr><td>${TIPO_LABEL[p.tipo_pagamento] || p.tipo_pagamento}</td><td style="text-align:right">${formatarMoeda(p.liquido ?? p.valor)}</td></tr>`
    ).join("");
    const saldo = (v.valor_venda || 0) - v.pagamento_total;
    win.document.write(`
      <html><head><title>Recibo #${v.venda?.numero_venda}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 400px; margin: 40px auto; padding: 20px; color: #333; }
        h1 { text-align: center; font-size: 18px; margin-bottom: 5px; }
        .sub { text-align: center; font-size: 12px; color: #666; margin-bottom: 20px; }
        .info { margin: 15px 0; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        td, th { padding: 6px 0; font-size: 13px; }
        th { text-align: left; border-bottom: 1px solid #ddd; }
        .total { font-weight: bold; font-size: 15px; border-top: 2px solid #333; padding-top: 6px; }
        .footer { text-align: center; font-size: 11px; color: #999; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px; }
        .status { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; ${saldo <= 0 ? "background:#d1fae5;color:#065f46" : "background:#fed7aa;color:#9a3412"} }
      </style></head><body>
        <h1>🄻 LogCell</h1>
        <p class="sub">Comprovante de Venda</p>
        <div class="info">
          <strong>Venda #${v.venda?.numero_venda}</strong><br>
          Data: ${v.data_venda ? new Date(v.data_venda).toLocaleDateString("pt-BR") : ""}<br>
          Cliente: ${v.cliente?.nome || "—"}<br>
          ${v.cliente?.telefone ? `Tel: ${v.cliente.telefone}` : ""}
        </div>
        <hr>
        <div class="info"><strong>${v.marca} ${v.modelo}</strong>${v.imei ? `<br>IMEI: ${v.imei}` : ""}</div>
        <table>
          <tr><th>Pagamento</th><th style="text-align:right">Valor</th></tr>
          ${pagtoHTML}
          <tr class="total"><td>Total</td><td style="text-align:right">${formatarMoeda(v.valor_venda || 0)}</td></tr>
          <tr><td>Pago</td><td style="text-align:right">${formatarMoeda(v.pagamento_total)}</td></tr>
          <tr><td>Status</td><td style="text-align:right"><span class="status">${saldo <= 0 ? "Pago" : "Pendente"}</span></td></tr>
        </table>
        <div class="footer">LogCell - ${new Date().toLocaleString("pt-BR")}</div>
        <script>window.print()</script>
      </body></html>
    `);
    win.document.close();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Carregando vendas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-zinc-800 p-5">
        <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Vendas de Aparelhos</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie as vendas e pagamentos de aparelhos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button color="primary" className="rounded-xl text-xs font-medium" startContent={<ShoppingBag className="w-4 h-4" />} onPress={() => setModalNovaVenda(true)}>
              Nova Venda
            </Button>
            <Button color="primary" variant="flat" className="rounded-xl text-xs font-medium" startContent={<ArrowDownTrayIcon className="w-4 h-4" />} onPress={exportarCSV}>
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* KPIs */}
        {temPermissao("aparelhos.ver_dashboard") && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
            <KpiCard icon={<ShoppingBag className="w-4 h-4" />} value={kpis.vendasHoje.toString()} label="Vendas Hoje" color="text-primary" bg="bg-primary/5" iconBg="bg-primary/10" />
            <KpiCard icon={<ClockIcon className="w-4 h-4" />} value={kpis.pendentes.toString()} label="Pendentes" color="text-orange-600 dark:text-orange-400" bg="bg-orange-50 dark:bg-orange-900/20" iconBg="bg-orange-100 dark:bg-orange-900/40" />
            <KpiCard icon={<CheckCircleIcon className="w-4 h-4" />} value={kpis.total.toString()} label="Total" color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-900/20" iconBg="bg-emerald-100 dark:bg-emerald-900/40" />
            <KpiCard icon={<TrendingUp className="w-4 h-4" />} value={formatarMoeda(kpis.faturamento)} label="Faturamento" color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-900/20" iconBg="bg-blue-100 dark:bg-blue-900/40" />
            <KpiCard icon={<PiggyBank className="w-4 h-4" />} value={formatarMoeda(kpis.lucroTotal)} label="Lucro Total" color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-900/20" iconBg="bg-emerald-100 dark:bg-emerald-900/40" />
          </div>
        )}
        {Object.keys(kpis.porTipo).length > 0 && (
          <div className="flex flex-wrap gap-1.5 text-[10px] text-gray-500 dark:text-gray-400">
            {Object.entries(kpis.porTipo).map(([tipo, valor]) => (
              <span key={tipo} className="px-2 py-0.5 rounded-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                {TIPO_LABEL[tipo] || tipo}: <strong>{formatarMoeda(valor)}</strong>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Busca + Filtros */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-zinc-800 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input isClearable className="flex-1" placeholder="Buscar por modelo, IMEI, venda, cliente..." startContent={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />} value={busca} variant="bordered" classNames={{ input: "text-sm", inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700" }} onChange={(e) => setBusca(e.target.value)} onClear={() => setBusca("")} />
          <Button endContent={mostrarFiltros ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />} startContent={<FunnelIcon className="w-4 h-4" />} variant="flat" className="rounded-xl" onPress={() => setMostrarFiltros(!mostrarFiltros)}>
            {mostrarFiltros ? "Ocultar" : "Filtros"}
          </Button>
          <ButtonGroup>
            <Button isIconOnly color={modoVisualizacao === "cards" ? "primary" : "default"} variant={modoVisualizacao === "cards" ? "solid" : "flat"} className="rounded-l-xl" onPress={() => setModoVisualizacao("cards")}>
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button isIconOnly color={modoVisualizacao === "tabela" ? "primary" : "default"} variant={modoVisualizacao === "tabela" ? "solid" : "flat"} className="rounded-r-xl" onPress={() => setModoVisualizacao("tabela")}>
              <TableIcon className="w-4 h-4" />
            </Button>
          </ButtonGroup>
        </div>

        {mostrarFiltros && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <Select label="Status" labelPlacement="outside" placeholder="Todos" selectedKeys={statusFiltro ? [statusFiltro] : []} size="sm" variant="bordered" classNames={{ trigger: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700" }} onSelectionChange={(keys) => setStatusFiltro(Array.from(keys)[0] as string || "")}>
              <SelectItem key="">Todos</SelectItem>
              <SelectItem key="concluida">Concluída</SelectItem>
              <SelectItem key="pendente">Pendente</SelectItem>
            </Select>
            <Select label="Período" labelPlacement="outside" placeholder="Todos" selectedKeys={[periodo]} size="sm" variant="bordered" classNames={{ trigger: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700" }} onSelectionChange={(keys) => setPeriodo(Array.from(keys)[0] as string)}>
              <SelectItem key="todas">Todas</SelectItem>
              <SelectItem key="hoje">Hoje</SelectItem>
              <SelectItem key="semana">Esta Semana</SelectItem>
              <SelectItem key="mes">Este Mês</SelectItem>
              <SelectItem key="personalizado">Personalizado</SelectItem>
            </Select>
            {periodo === "personalizado" && (
              <>
                <Input label="Data Início" labelPlacement="outside" size="sm" type="date" variant="bordered" classNames={{ inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700" }} value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
                <Input label="Data Fim" labelPlacement="outside" size="sm" type="date" variant="bordered" classNames={{ inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700" }} value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
              </>
            )}
            <Button className="self-end rounded-xl" color="default" size="sm" variant="flat" onPress={() => { setBusca(""); setStatusFiltro(""); setPeriodo("todas"); setDataInicio(""); setDataFim(""); }}>
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs classNames={{ tabList: "gap-6 w-full relative rounded-none p-0 border-b border-gray-100 dark:border-zinc-800", cursor: "w-full bg-primary", tab: "max-w-fit px-0 h-10", tabContent: "group-data-[selected=true]:text-primary text-sm text-gray-500" }} color="primary" selectedKey={selectedTab} variant="underlined" onSelectionChange={(key) => setSelectedTab(key as string)}>
        <Tab key="todas" title={<div className="flex items-center gap-2"><DevicePhoneMobileIcon className="w-4 h-4" /><span>Todas</span><span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400">{vendas.length}</span></div>}>{renderList()}</Tab>
        <Tab key="hoje" title={<div className="flex items-center gap-2"><ClockIcon className="w-4 h-4" /><span>Hoje</span><span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">{kpis.vendasHoje}</span></div>}>{renderList()}</Tab>
        <Tab key="pendentes" title={<div className="flex items-center gap-2"><CurrencyDollarIcon className="w-4 h-4" /><span>Pendentes</span><span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">{kpis.pendentes}</span></div>}>{renderList()}</Tab>
      </Tabs>

      <ConfirmDialog />
      {modalDetalhes && <DetalhesAparelhoModal isOpen={!!modalDetalhes} aparelho={modalDetalhes} onClose={() => setModalDetalhes(null)} />}
      {modalPagamento && <RecebimentoAparelhoModal isOpen={!!modalPagamento} aparelho={modalPagamento} onClose={(sucesso) => { setModalPagamento(null); if (sucesso) carregarVendas(); }} />}
      <NovaVendaModal isOpen={modalNovaVenda} venda={vendaParaEditar} onClose={(sucesso) => { setModalNovaVenda(false); setVendaParaEditar(null); if (sucesso) carregarVendas(); }} />

      {/* Modal de Adicionar Brinde */}
      {brindeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setBrindeModal(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 p-5 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-zinc-800">
              <GiftIcon className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-gray-800 dark:text-white">Adicionar Brinde</span>
            </div>
            <div className="space-y-3">
              <Input label="Descrição" size="sm" variant="bordered" classNames={{ inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700" }} value={brindeDesc} onChange={(e) => setBrindeDesc(e.target.value)} />
              <Input label="Valor" size="sm" variant="bordered" classNames={{ inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700" }} startContent={<span className="text-xs text-gray-400">R$</span>} value={brindeValor} onChange={(e) => setBrindeValor(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <Button variant="flat" className="rounded-xl text-xs" onPress={() => setBrindeModal(null)}>Cancelar</Button>
              <Button color="primary" className="rounded-xl text-xs" onPress={handleAdicionarBrinde}>Adicionar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gerenciar Troca */}
      {trocaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { setTrocaModal(null); setTrocasPendentes([]); }}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 p-5 w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-zinc-800">
              <DevicePhoneMobileIcon className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-gray-800 dark:text-white">Adicionar Aparelho de Troca</span>
            </div>

            {/* Lista de trocas pendentes */}
            {trocasPendentes.length > 0 && (
              <div className="mb-4 space-y-1.5">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Trocas a salvar ({trocasPendentes.length})</p>
                {trocasPendentes.map((t) => (
                  <div key={t.localId} className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 text-xs">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-amber-800 dark:text-amber-300">{t.modelo}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-amber-600 dark:text-amber-400 mt-0.5">
                        {t.imei && <span className="font-mono">IMEI: {t.imei}</span>}
                        {t.condicao && <span>Cond.: {t.condicao}</span>}
                        {t.cor && <span>Cor: {t.cor}</span>}
                        {t.armazenamento && <span>Arm.: {t.armazenamento}</span>}
                        {t.bateria && <span>Bat.: {t.bateria}%</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-semibold text-amber-700 dark:text-amber-300">{formatarMoeda(t.valor)}</span>
                      <Button isIconOnly color="danger" size="sm" variant="light" className="rounded-lg" onPress={() => setConfirmDeleteTroca(t.localId)}>
                        <TrashIcon className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Formulário */}
            <div className="grid grid-cols-2 gap-3">
              <Input label="Modelo" size="sm" variant="bordered" classNames={{ inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700" }} value={trocaForm.modelo} onChange={(e) => setTrocaForm({ ...trocaForm, modelo: e.target.value })} />
              <Input label="IMEI" size="sm" variant="bordered" classNames={{ inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700" }} value={trocaForm.imei} onChange={(e) => setTrocaForm({ ...trocaForm, imei: e.target.value })} />
              <Input label="Condição" size="sm" variant="bordered" classNames={{ inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700" }} placeholder="Ex.: Bom, com marcas de uso" value={trocaForm.condicao} onChange={(e) => setTrocaForm({ ...trocaForm, condicao: e.target.value })} />
              <Input label="Bateria %" size="sm" variant="bordered" classNames={{ inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700" }} value={trocaForm.bateria} onChange={(e) => setTrocaForm({ ...trocaForm, bateria: e.target.value })} />
              <Input label="Cor" size="sm" variant="bordered" classNames={{ inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700" }} value={trocaForm.cor} onChange={(e) => setTrocaForm({ ...trocaForm, cor: e.target.value })} />
              <Input label="Armazenamento" size="sm" variant="bordered" classNames={{ inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700" }} value={trocaForm.armazenamento} onChange={(e) => setTrocaForm({ ...trocaForm, armazenamento: e.target.value })} />
              <Input label="Valor da Troca" size="sm" variant="bordered" classNames={{ inputWrapper: "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700" }} startContent={<span className="text-xs text-gray-400">R$</span>} value={trocaValorStr} onChange={(e) => setTrocaValorStr(e.target.value.replace(/[^0-9]/g, "") ? (() => { const v = parseInt(e.target.value.replace(/\D/g, "")) / 100; setTrocaForm({ ...trocaForm, valor: v }); return v.toLocaleString("pt-BR", { minimumFractionDigits: 2 }); })() : "")} />
            </div>
            <div className="flex justify-between gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <Button variant="flat" className="rounded-xl text-xs" onPress={() => { setTrocaModal(null); setTrocasPendentes([]); }}>Cancelar</Button>
              <div className="flex gap-2">
                <Button variant="flat" className="rounded-xl text-xs" onPress={adicionarTrocaPendente} isDisabled={!trocaForm.modelo}>
                  <PlusIcon className="w-3.5 h-3.5" /> Adicionar +1
                </Button>
                <Button
                  color="primary"
                  className="rounded-xl text-xs"
                  onPress={() => salvarTodasTrocas()}
                  isLoading={salvandoTrocas}
                  isDisabled={trocasPendentes.length === 0}
                >
                  {trocasPendentes.length > 0 ? `Salvar ${trocasPendentes.length} troca(s)` : "Confirmar"}
                </Button>
              </div>
            {/* Confirmacao de exclusao */}
            {confirmDeleteTroca !== null && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30" onClick={() => setConfirmDeleteTroca(null)}>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 p-5 w-full max-w-xs mx-4" onClick={(e) => e.stopPropagation()}>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Remover troca?</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">O aparelho de troca será removido desta venda.</p>
                  <div className="flex justify-end gap-2">
                    <Button variant="flat" className="rounded-xl text-xs" onPress={() => setConfirmDeleteTroca(null)} isDisabled={salvandoTrocas}>Cancelar</Button>
                    <Button color="danger" className="rounded-xl text-xs" isLoading={salvandoTrocas} onPress={async () => {
                      const trocaId = confirmDeleteTroca;
                      if (!trocaId) return;
                      const proximasTrocas = trocasPendentes.filter((troca) => troca.localId !== trocaId);
                      setConfirmDeleteTroca(null);
                      await salvarTodasTrocas(proximasTrocas, {
                        fecharModal: false,
                        successMessage: "Aparelho de troca removido com sucesso.",
                      });
                    }}>Remover</Button>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function renderList() {
    if (vendas.length === 0) {
      return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-zinc-800 p-12 text-center">
          <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma venda encontrada</p>
        </div>
      );
    }

    return (
      <>
        <div className="flex justify-between items-center text-xs text-gray-400 mb-4">
          <span>Mostrando {vendasPaginadas.length} de {kpis.total} venda{kpis.total !== 1 ? "s" : ""}</span>
          <span>Página {paginaAtual} de {totalPaginasBackend || 1}</span>
        </div>

        {modoVisualizacao === "cards" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {vendasPaginadas.map(renderCard)}
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
                    <th className="py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Venda</th>
                    <th className="py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Cliente</th>
                    <th className="py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Aparelho</th>
                    <th className="py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Valor</th>
                    <th className="py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Pago</th>
                    <th className="py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Data</th>
                    <th className="py-3 px-4 w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {vendasPaginadas.map((v) => {
                    const saldo = (v.valor_venda || 0) - (v.pagamento_total || 0);
                    return (
                      <tr key={v.id} className="border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="py-3 px-4 text-xs font-semibold text-gray-800 dark:text-white">#{v.venda?.numero_venda}</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{v.cliente?.nome || "—"}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{v.marca} {v.modelo}</td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-800 dark:text-white">{formatarMoeda(v.valor_venda || 0)}</td>
                        <td className="py-3 px-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">{formatarMoeda(v.pagamento_total)}</td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${saldo <= 0 ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" : "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800"}`}>
                            {saldo <= 0 ? "Concluída" : "Pendente"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-400">{v.data_venda ? new Date(v.data_venda).toLocaleDateString("pt-BR") : "—"}</td>
                        <td className="py-3 px-4">
                          <Dropdown>
                            <DropdownTrigger>
                              <Button isIconOnly size="sm" variant="light" className="rounded-lg">
                                <EllipsisVertical className="w-4 h-4" />
                              </Button>
                            </DropdownTrigger>
                             <DropdownMenu aria-label="Ações" onAction={(key) => {
                                if (key === "detalhes") setModalDetalhes(v);
                               else if (key === "imprimir") imprimirRecibo(v);
                               else if (key === "garantia") imprimirGarantia(v);
                               else if (key === "editar") abrirEditarVenda(v);
                               else if (key === "brinde") setBrindeModal({ vendaId: v.venda_id, aparelhoId: v.id });
                               else if (key === "troca") setTrocaModal({ vendaId: v.venda_id, aparelhoId: v.id });
                               else if (key === "pagamentos") setModalPagamento(v);
                               else if (key === "cancelar") handleCancelarVenda(v);
                             }}>
                              <DropdownItem key="detalhes" startContent={<DevicePhoneMobileIcon className="w-4 h-4" />}>Detalhes</DropdownItem>
                              <DropdownItem key="imprimir" startContent={<PrinterIcon className="w-4 h-4" />}>Imprimir Recibo</DropdownItem>
                              <DropdownItem key="garantia" startContent={<ShieldCheckIcon className="w-4 h-4" />}>Imprimir Garantia</DropdownItem>
                              <DropdownItem key="editar" startContent={<PencilIcon className="w-4 h-4" />}>Editar Venda</DropdownItem>
                              <DropdownItem key="brinde" startContent={<GiftIcon className="w-4 h-4" />}>Adicionar Brinde</DropdownItem>
                              <DropdownItem key="troca" startContent={<DevicePhoneMobileIcon className="w-4 h-4" />}>Gerenciar Troca</DropdownItem>
                              <DropdownItem key="pagamentos" startContent={<CurrencyDollarIcon className="w-4 h-4" />}>Gerenciar Pagamentos</DropdownItem>
                              <DropdownItem key="cancelar" className="text-danger" color="danger" startContent={<XCircleIcon className="w-4 h-4" />}>Cancelar Venda</DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {totalPaginasBackend > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination showControls color="primary" page={paginaAtual} size="lg" total={totalPaginasBackend} onChange={setPaginaAtual} />
          </div>
        )}
      </>
    );
  }

  function renderCard(v: any) {
    const saldo = (v.valor_venda || 0) - (v.pagamento_total || 0);
    const isQuitado = saldo <= 0;

    return (
      <div key={v.id} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-zinc-800 p-5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-shadow">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {v.venda && <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Venda #{v.venda.numero_venda}</span>}
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${isQuitado ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" : "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800"}`}>
                {isQuitado ? "Concluída" : "Pendente"}
              </span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{v.marca} {v.modelo}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{v.imei && <span className="font-mono">{v.imei}</span>}{v.data_venda && ` • ${new Date(v.data_venda).toLocaleDateString("pt-BR")}`}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{formatarMoeda(v.valor_venda || 0)}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Pago: {formatarMoeda(v.pagamento_total)}</p>
            {!isQuitado && <p className="text-xs text-orange-600 dark:text-orange-400">Saldo: {formatarMoeda(saldo)}</p>}
          </div>
        </div>

        {v.cliente && (
          <div className="flex items-center gap-3 mb-3 p-2.5 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-700 text-xs">
            <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center shrink-0">
              <UserIcon className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 dark:text-white truncate">{v.cliente.nome}</p>
              {v.cliente.telefone && <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1"><PhoneIcon className="w-3 h-3" />{v.cliente.telefone}</p>}
            </div>
            {v.cliente.doc && <span className="text-gray-400 dark:text-gray-500 font-mono">{v.cliente.doc}</span>}
          </div>
        )}

        {v.pagamentos?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {v.pagamentos.map((p: any, i: number) => (
              <span key={i} className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                p.tipo_pagamento === "dinheiro" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" :
                p.tipo_pagamento === "pix" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800" :
                p.tipo_pagamento === "cartao_credito" ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800" :
                p.tipo_pagamento === "troca_aparelho" ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800" :
                "bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-zinc-700"
              }`}>
                {TIPO_LABEL[p.tipo_pagamento] || p.tipo_pagamento}: {formatarMoeda(p.liquido ?? p.valor)}
                {p.editado && <span className="ml-0.5 opacity-60">✎</span>}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 text-[11px] mb-3">
          <span className="text-gray-400">Lucro:</span>
          <span className={`font-semibold ${(v.lucro || 0) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
            {formatarMoeda(v.lucro || 0)}
          </span>
          {v.custo_brindes > 0 && <span className="text-gray-400">(brindes: {formatarMoeda(v.custo_brindes)})</span>}
        </div>

        <Divider className="mb-3" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <DevicePhoneMobileIcon className="w-3.5 h-3.5" />
            <span>{v.armazenamento || ""}{v.memoria_ram ? ` • ${v.memoria_ram}` : ""}{v.cor ? ` • ${v.cor}` : ""}</span>
          </div>
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light" className="rounded-xl">
                <EllipsisVertical className="w-4 h-4" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Ações da venda" onAction={(key) => {
              if (key === "detalhes") setModalDetalhes(v);
              else if (key === "imprimir") imprimirRecibo(v);
              else if (key === "brinde") setBrindeModal({ vendaId: v.venda_id, aparelhoId: v.id });
                               else if (key === "troca") setTrocaModal({ vendaId: v.venda_id, aparelhoId: v.id });
                               else if (key === "pagamentos") setModalPagamento(v);
                               else if (key === "editar") abrirEditarVenda(v);
                               else if (key === "cancelar") handleCancelarVenda(v);
                             }}>
                               <DropdownItem key="detalhes" startContent={<DevicePhoneMobileIcon className="w-4 h-4" />}>Detalhes</DropdownItem>
                               <DropdownItem key="imprimir" startContent={<PrinterIcon className="w-4 h-4" />}>Imprimir Recibo</DropdownItem>
                               <DropdownItem key="editar" startContent={<PencilIcon className="w-4 h-4" />}>Editar Venda</DropdownItem>
                               <DropdownItem key="brinde" startContent={<GiftIcon className="w-4 h-4" />}>Adicionar Brinde</DropdownItem>
                              <DropdownItem key="troca" startContent={<DevicePhoneMobileIcon className="w-4 h-4" />}>Gerenciar Troca</DropdownItem>
                               <DropdownItem key="pagamentos" startContent={<CurrencyDollarIcon className="w-4 h-4" />}>Gerenciar Pagamentos</DropdownItem>
                               <DropdownItem key="cancelar" className="text-danger" color="danger" startContent={<XCircleIcon className="w-4 h-4" />}>Cancelar Venda</DropdownItem>
                             </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    );
  }
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
